import { supabase } from './db.js';

// Fetch votes for a specific category
// Returns top candidates for a given voting category

const categories = {
  'tech-innovator': 'Tech Innovator of the year',
  'faculty-icon': 'Faculty Icon of the year',
  'sportsman': 'Sportsman of the Year',
  'course-rep': 'Best Course Representative',
  'best-dressed-male': 'Best Dressed Male of the Faculty',
  'best-dressed-female': 'Best Dressed Female of the Faculty',
  'best-lecturer': 'Best Lecturer of the year',
  'most-influential': 'Most Influential',
  'outstanding-executive': 'Outstanding Executive of the year',
  'most-popular': 'Most Popular Figure'
};

export async function fetchVotes(category = 'tech-innovator') {
  if (!Object.keys(categories).includes(category)) {
    category = 'tech-innovator';
  }

  const { data: candidates, error } = await supabase
    .from('votes')
    .select('candidate_name, vote_amount')
    .eq('category', category)
    .order('vote_amount', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching votes:', error);
    return {
      category: categories[category],
      categoryId: category,
      candidates: [],
      categories
    };
  }

  return {
    category: categories[category],
    categoryId: category,
    candidates: candidates || [],
    categories
  };
}

export default fetchVotes;
