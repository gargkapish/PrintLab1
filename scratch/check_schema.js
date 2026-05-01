const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://fwtmaucsjhlxzwtvrbkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dG1hdWNzamhseHp3dHZyYmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNDg3MDcsImV4cCI6MjA5MjkyNDcwN30.yNWrEFi6cmNJgYLOoWnT6STpGs2pQ-XVm3KVWesB3GU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) console.error(error);
    else console.log('Columns:', Object.keys(data[0] || {}));
}
checkSchema();
