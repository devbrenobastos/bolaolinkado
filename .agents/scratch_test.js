import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uvzomlyjbermvggnqgno.supabase.co';
const supabaseKey = 'sb_publishable_D-QzGHmz_BA7lcLQPNtbAQ_gzNjVvLK';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data: matches, error: err1 } = await supabase.from('matches').select('*').limit(5);
    console.log('Matches:', matches, 'Error:', err1);
    
    const { data: pools, error: err2 } = await supabase.from('pools').select('*').limit(5);
    console.log('Pools:', pools, 'Error:', err2);
  } catch (e) {
    console.error(e);
  }
}

test();
