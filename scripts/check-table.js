const { createClient } = require('@supabase/supabase-js')
const { readFileSync } = require('fs')
const { resolve } = require('path')

const envFile = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const [k, ...v] = l.split('=')
    return [k.trim(), v.join('=').trim()]
  })
)

async function main() {
  const svc = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  // Check if table exists via service role (bypasses RLS)
  console.log('Checking via service_role...')
  const { data: svcData, error: svcErr } = await svc.from('newsletters').select('id').limit(1)
  if (svcErr) {
    console.log('Service role ERROR:', svcErr.message)
  } else {
    console.log('Service role OK. Table exists.')
  }

  // Check via anon key (subject to RLS)
  console.log('\nChecking via anon key...')
  const { data: anonData, error: anonErr } = await anon.from('newsletters').select('id').limit(1)
  if (anonErr) {
    console.log('Anon ERROR:', anonErr.message)
  } else {
    console.log('Anon OK.')
  }

  // If service role works but anon doesn't, it's an RLS/schema cache issue
  if (!svcErr && anonErr) {
    console.log('\nTable exists but schema cache is stale for public role.')
    console.log('Fix: Go to Supabase Dashboard SQL Editor and run:')
    console.log('  NOTIFY pgrst, $$reload schema$$;')
  }

  // If both fail, table doesn't exist and needs to be created
  if (svcErr) {
    const ref = env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(\w+)\.supabase/)[1]
    console.log('\nTable does not exist.')
    console.log('Go to: https://supabase.com/dashboard/project/' + ref + '/sql/new')
    console.log('And run the migration from supabase/migrations/001_newsletters.sql')
  }
}

main()
