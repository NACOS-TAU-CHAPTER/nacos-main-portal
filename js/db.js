import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://ajstuebuqxiftylnzdoy.supabase.co";
const supabaseKey = "sb_publishable_IbEZwBvhZzrtHXJL52iwCA_TpNCWW5i";

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
