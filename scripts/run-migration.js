const { readFileSync, readFile } = require('fs')
const { resolve } = require('path')

const envFile = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const [k, ...v] = l.split('=')
    return [k.trim(), v.join('=').trim()]
  })
)

const ref = env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(\w+)\.supabase/)[1]

async function main() {
  // Try direct DB connection via psql or node-pg
  
  // Check if psql is available
  const { execSync } = require('child_process')
  try {
    execSync('psql --version', { stdio: 'pipe' })
    console.log('psql is available')

    const connString = `postgresql://postgres.${ref}:${encodeURIComponent(env.SUPABASE_SERVICE_ROLE_KEY)}@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`
    
    const sql = readFileSync(resolve(__dirname, '../supabase/migrations/001_newsletters.sql'), 'utf-8')
    
    console.log('Executing migration via psql...')
    execSync(`echo "${sql.replace(/"/g, '\\"').replace(/\$/g, '\\$')}" | psql "${connString}"`, { stdio: 'inherit', timeout: 30000 })
    console.log('Migration applied successfully!')
  } catch (e) {
    console.log('psql approach failed:', e.message)
    console.log('\nTrying node-postgres...')
    
    try {
      const { Client } = require('pg')
      const client = new Client({
        host: `aws-0-ap-northeast-2.pooler.supabase.com`,
        port: 6543,
        database: 'postgres',
        user: `postgres.${ref}`,
        password: env.SUPABASE_SERVICE_ROLE_KEY,
        ssl: { rejectUnauthorized: false }
      })
      
      await client.connect()
      console.log('Connected to database!')
      
      const sql = readFileSync(resolve(__dirname, '../supabase/migrations/001_newsletters.sql'), 'utf-8')
      await client.query(sql)
      console.log('Migration applied successfully!')
      await client.end()
    } catch (e2) {
      console.log('node-postgres failed:', e2.message)
      console.log('\n=== Manual step required ===')
      console.log('Go to: https://supabase.com/dashboard/project/' + ref + '/sql/new')
      console.log('And run the migration from supabase/migrations/001_newsletters.sql')
    }
  }
}

main()
