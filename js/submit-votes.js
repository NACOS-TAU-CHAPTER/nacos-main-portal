// Submit votes for candidates
// Handles vote submission for all categories

export async function submitVotes(formData) {
  const supabase = window.supabase;
  const fields = [
    'tech-innovator',
    'faculty-icon',
    'sportsman',
    'course-rep',
    'best-dressed-male',
    'best-dressed-female',
    'most-influential',
    'outstanding-executive',
    'most-popular',
    'programmer-of-the-year'
  ];

  try {
    for (const field of fields) {
      const candidate = formData.get(field)?.trim();
      const amount = parseInt(formData.get(field + '-amount'), 10) || 0;

      if (!candidate || amount < 1) {
        continue;
      }

      // normalize candidate for matching (trim only, keep original case for storage)
      const candidateNorm = candidate.trim();

      // try case-insensitive exact match to find existing record
      const { data: existingRows, error: checkError } = await supabase
        .from('votes')
        .select('id, vote_amount, candidate_name')
        .eq('category', field)
        .ilike('candidate_name', candidateNorm)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      const existing = existingRows?.[0];

      if (existing) {
        const newAmount = (existing.vote_amount || 0) + amount;
        const { error: updateError } = await supabase
          .from('votes')
          .update({ vote_amount: newAmount })
          .eq('id', existing.id);

        if (updateError) {
          throw updateError;
        }
        console.log(`Updated ${existing.candidate_name} (category=${field}) to ${newAmount}`);
      } else {
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{
            category: field,
            candidate_name: candidate,
            vote_amount: amount
          }]);

        if (insertError) {
          throw insertError;
        }
        console.log(`Inserted ${candidate} (category=${field}) = ${amount}`);
      }
    }

    return {
      success: true,
      message: 'Votes submitted successfully',
      redirect: 'index.html#evoting'
    };
  } catch (error) {
    console.error('Error submitting votes:', error);
    return {
      success: false,
      message: 'Error submitting votes: ' + (error.message || 'Unknown error')
    };
  }
}

export default submitVotes;
