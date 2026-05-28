// Newsletter subscription handler
// Handles newsletter email subscriptions

export async function handleNewsletterSubscription(formData) {
  try {
    const email = formData.get('email');

    // Validate email
    if (!email) {
      return {
        success: false,
        message: 'Email is required'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address'
      };
    }

    // DATABASE: Add email to newsletter subscribers in Supabase
    // const { error } = await supabase
    //   .from('newsletter_subscribers')
    //   .insert([{
    //     email: email,
    //     subscribed_at: new Date().toISOString()
    //   }])
    //   .on('*', payload => {
    //     console.log('Newsletter subscriber added:', payload);
    //   });

    // if (error && error.code !== '23505') { // 23505 is unique constraint violation
    //   throw error;
    // }

    // DATABASE: Send confirmation email via Supabase Edge Functions or external service
    // const response = await fetch('/api/send-newsletter-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     email: email,
    //     type: 'subscription_confirmation'
    //   })
    // });

    console.log('Newsletter subscription ready for database integration:', {
      email: email,
      subscribed_at: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Thank you for subscribing to our newsletter!'
    };
  } catch (error) {
    console.error('Error handling newsletter subscription:', error);
    
    // Check if error is duplicate email
    if (error.code === '23505') {
      return {
        success: false,
        message: 'This email is already subscribed to our newsletter'
      };
    }

    return {
      success: false,
      message: 'Error subscribing to newsletter: ' + error.message
    };
  }
}

export default handleNewsletterSubscription;
