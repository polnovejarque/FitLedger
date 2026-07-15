import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://akcukdithdgknxohyrmx.supabase.co';
const supabaseAnonKey = 'sb_publishable_pe6Lt0l8C8jxd-60kQ3jpQ_HODnzvWH';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    console.log("Checking profiles...");
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, plan, subscription_plan, first_name, last_name, role');

    if (error) {
      console.error("Profiles Error:", error);
    } else {
      console.log("Fetched profiles successfully. Count:", profiles?.length);
      console.log("Profiles list:", profiles);
    }
  } catch (err) {
    console.error("Runtime exception:", err);
  }
}

check();
