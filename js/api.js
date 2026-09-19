// API Wrapper Module
// Provides a unified interface for calling server-side functions

import fetchTopPerCategory from './fetch-top-per-category.js';
import fetchTopVotes from './fetch-top-votes.js';
import fetchVotes from './fetch-votes.js';
import getTopCandidates from './get-top-candidates.js';
import submitVotes from './submit-votes.js';
import handleContactForm from './contact.js';
import handleNewsletterSubscription from './newsletter.js';

export const api = {
  // Vote related endpoints
  fetchTopPerCategory,
  fetchTopVotes,
  fetchVotes,
  getTopCandidates,
  submitVotes,
  
  // Form endpoints
  handleContactForm,
  handleNewsletterSubscription
};

// Fallback: In case functions are called via fetch API paths
export async function handleApiCall(endpoint, method, data) {
  switch(endpoint) {
    case '/api/votes/top-per-category':
      return fetchTopPerCategory();
    
    case '/api/votes/top':
      return fetchTopVotes();
    
    case '/api/votes':
      const category = new URLSearchParams(data).get('category') || 'tech-innovator';
      return fetchVotes(category);
    
    case '/api/candidates/top':
      return getTopCandidates();
    
    case '/api/votes/submit':
      return submitVotes(new FormData(data));
    
    case '/api/contact/send':
      return handleContactForm(new FormData(data));
    
    case '/api/newsletter/subscribe':
      return handleNewsletterSubscription(new FormData(data));
    
    default:
      return { success: false, message: 'Endpoint not found' };
  }
}

export default api;
