exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Supabase configuration not found' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'Invalid JSON payload' })
    };
  }

  const votes = Array.isArray(payload.votes) ? payload.votes : [];
  if (!votes.length) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'No votes provided' })
    };
  }

  const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal'
  };

  try {
    for (const vote of votes) {
      const category = String(vote.category || '').trim();
      const candidateName = String(vote.candidate_name || '').trim();
      const voteAmount = Number(vote.vote_amount) || 0;

      if (!category || !candidateName || voteAmount < 1) {
        continue;
      }

      const queryParams = `category=eq.${encodeURIComponent(category)}&candidate_name=eq.${encodeURIComponent(candidateName)}`;
      const selectUrl = `${SUPABASE_URL}/rest/v1/votes?select=id,vote_amount&${queryParams}`;
      const selectResponse = await fetch(selectUrl, { headers });

      if (!selectResponse.ok) {
        const errorText = await selectResponse.text();
        throw new Error(`Supabase select failed: ${selectResponse.status} ${errorText}`);
      }

      const existingRows = await selectResponse.json();
      const existing = existingRows?.[0];

      if (existing) {
        const updateUrl = `${SUPABASE_URL}/rest/v1/votes?id=eq.${existing.id}`;
        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ vote_amount: existing.vote_amount + voteAmount })
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Supabase update failed: ${updateResponse.status} ${errorText}`);
        }
      } else {
        const insertUrl = `${SUPABASE_URL}/rest/v1/votes`;
        const insertResponse = await fetch(insertUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify([{ category, candidate_name: candidateName, vote_amount: voteAmount }])
        });

        if (!insertResponse.ok) {
          const errorText = await insertResponse.text();
          throw new Error(`Supabase insert failed: ${insertResponse.status} ${errorText}`);
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Votes submitted successfully' })
    };
  } catch (error) {
    console.error('Votes function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message || 'Vote submission error' })
    };
  }
};
