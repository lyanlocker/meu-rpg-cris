import {createClient} from '@supabase/supabase-js';
// Public client configuration. Access to records is enforced by Supabase RLS.
// Environment variables can override these defaults for another environment.
const url=process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://isxmkpyohauzpobrqeiw.supabase.co';
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_AZx2nJiHoBZ5NvLsC3V1zQ_9pbZ1mlu';
export const db=createClient(url,key);
