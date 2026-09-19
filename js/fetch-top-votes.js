import { supabase } from './db.js';

// Fetch total votes for each candidate
// Sums up votes across all categories for each candidate

export async function fetchTopVotes() {
  const { data: results, error } = await supabase
    .from('votes')
    .select('candidate_name, vote_amount');

  if (error) {
    console.error('Error fetching top votes:', error);
    return [];
  }

  const groupedData = {};
  for (const row of results || []) {
    groupedData[row.candidate_name] = (groupedData[row.candidate_name] || 0) + row.vote_amount;
  }

  return Object.entries(groupedData)
    .map(([name, total_votes]) => ({ candidate_name: name, total_votes }))
    .sort((a, b) => b.total_votes - a.total_votes);
}

export default fetchTopVotes;
