export async function dedupeVotes() {
  const supabase = window.supabase;
  if (!supabase) {
    console.error('supabase client not found on window.supabase');
    return { success: false, message: 'supabase client not available' };
  }

  try {
    const { data, error } = await supabase
      .from('votes')
      .select('id, category, candidate_name, vote_amount');

    if (error) {
      console.error('Error fetching votes for dedupe:', error);
      return { success: false, message: error.message };
    }

    const groups = {};

    // group by normalized category + candidate_name
    data.forEach((row) => {
      const key = `${row.category}||${(row.candidate_name || '').trim().toLowerCase()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    const actions = [];

    for (const key of Object.keys(groups)) {
      const rows = groups[key];
      if (rows.length <= 1) continue;

      // sum votes
      const total = rows.reduce((s, r) => s + (r.vote_amount || 0), 0);

      // choose keeper row (lowest id)
      rows.sort((a, b) => a.id - b.id);
      const keeper = rows[0];
      const toDelete = rows.slice(1).map(r => r.id);

      // Update keeper to total
      const { error: updateError } = await supabase
        .from('votes')
        .update({ vote_amount: total })
        .eq('id', keeper.id);

      if (updateError) {
        console.error('Failed to update keeper row', keeper.id, updateError);
        actions.push({ key, keeper: keeper.id, updated: false, error: updateError.message });
        continue;
      }

      // Delete duplicate rows
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .in('id', toDelete);

      if (deleteError) {
        console.error('Failed to delete duplicate rows', toDelete, deleteError);
        actions.push({ key, keeper: keeper.id, deleted: false, error: deleteError.message });
        continue;
      }

      console.log(`Dedupe: kept id=${keeper.id} sum=${total}, removed ids=[${toDelete.join(',')}]`);
      actions.push({ key, keeper: keeper.id, total, removed: toDelete });
    }

    return { success: true, actions };
  } catch (err) {
    console.error('Unexpected error in dedupeVotes:', err);
    return { success: false, message: err.message };
  }
}

export default dedupeVotes;
