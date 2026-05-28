import { supabase } from './db.js';

// Fetch top candidates per category
// Returns one top candidate for each voting category

export async function fetchTopPerCategory() {
  const categories = {
    'tech-innovator': 'Tech Innovator',
    'faculty-icon': 'Faculty Icon',
    'sportsman': 'Sportsman',
    'course-rep': 'Course Rep',
    'best-dressed-male': 'Best Dressed Male',
    'best-dressed-female': 'Best Dressed Female',
    'most-influential': 'Most Influential',
    'outstanding-executive': 'Outstanding Executive',
    'most-popular': 'Most Popular'
  };

  const { data: results, error } = await supabase
    .from('votes')
    .select('category, candidate_name, vote_amount')
    .order('category', { ascending: true })
    .order('vote_amount', { ascending: false });

  if (error) {
    console.error('Error fetching top candidates per category:', error);
  }

  const topByCategory = {};
  for (const row of results || []) {
    if (!topByCategory[row.category]) {
      topByCategory[row.category] = row;
    }
  }

  return Object.entries(categories).map(([categoryId, categoryLabel]) => {
    const top = topByCategory[categoryId];
    return {
      category: categoryLabel,
      candidate_name: top?.candidate_name ?? 'No votes yet',
      votes: top?.vote_amount ?? 0
    };
  });
}

export default fetchTopPerCategory;
