import { supabase } from './db.js';

// Get top candidates for all categories
// Returns top 10 candidates for each category

export async function getTopCandidates() {
  const categories = [
    'tech-innovator',
    'faculty-icon',
    'sportsman',
    'course-rep',
    'best-dressed-male',
    'best-dressed-female',
    'most-influential',
    'outstanding-executive',
    'most-popular'
  ];

  const allData = {};

  for (const category of categories) {
    const { data: candidates, error } = await supabase
      .from('votes')
      .select('candidate_name, vote_amount')
      .eq('category', category)
      .order('vote_amount', { ascending: false })
      .limit(10);

    if (error) {
      console.error(`Error fetching candidates for ${category}:`, error);
      allData[category] = [];
      continue;
    }

    allData[category] = candidates || [];
  }

  return allData;
}

export default getTopCandidates;
