require('dotenv').config();

async function runTests() {
  const url = 'http://localhost:5000';
  console.log('Testing APIs at', url);

  try {
    // 1. Login
    console.log('1. Logging in...');
    let res = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@vitbhopal.ac.in', password: 'char@5678' })
    });
    
    if (!res.ok) {
      console.log('Login failed', await res.text());
      return;
    }
    
    const { token, club } = await res.json();
    console.log('Logged in as', club.name);

    // Upgrade club to pro using supabase service key
    const { createClient } = require('@supabase/supabase-js');
    const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await supa.from('clubs').update({ plan: 'pro' }).eq('id', club.id);
    console.log('Upgraded club to pro plan.');

    // Login again to get new token
    res = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@vitbhopal.ac.in', password: 'char@5678' })
    });
    const auth = await res.json();
    const token2 = auth.token;
    
    // 2. Create Event (Sheet)
    console.log('\n2. Creating Sheet Event...');
    res = await fetch(`${url}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
      body: JSON.stringify({
        title: 'Test Sheet Event',
        registration_type: 'sheet',
        sheet_url: 'https://docs.google.com/spreadsheets/d/test',
        entry_fee: 0,
        form_fields: []
      })
    });
    
    if (!res.ok) {
      console.log('Create Sheet Event failed:', await res.text());
    } else {
      const event = await res.json();
      console.log('Created event response:', event);
      
      // 3. Get Event
      if (event.id) {
        console.log('\n3. Fetching Event...');
        res = await fetch(`${url}/events/${event.slug}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const fetched = await res.json();
        console.log('Fetched event registration_type:', fetched?.event?.registration_type);
        console.log('Fetched event sheet_url:', fetched?.event?.sheet_url);
      }
    }
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

runTests();
