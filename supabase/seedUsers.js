import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Tenant IDs must match the values in seed.sql
const TENANTS = {
  alpha: 'tenant-alpha',
  bravo: 'tenant-bravo',
};

const alphaPassword = process.env.SEED_ALPHA_PASSWORD;
const bravoPassword = process.env.SEED_BRAVO_PASSWORD;

if (!alphaPassword || !bravoPassword) {
  console.error('Missing SEED_ALPHA_PASSWORD or SEED_BRAVO_PASSWORD environment variables.');
  process.exit(1);
}

const USERS = [
  { email: 'admin@alpha.com', password: alphaPassword, full_name: 'Alice Alpha', tenant_id: TENANTS.alpha },
  { email: 'user@alpha.com', password: alphaPassword, full_name: 'Victor Alpha', tenant_id: TENANTS.alpha },
  { email: 'admin@bravo.com', password: bravoPassword, full_name: 'Bruno Bravo', tenant_id: TENANTS.bravo },
  { email: 'user@bravo.com', password: bravoPassword, full_name: 'Valeria Bravo', tenant_id: TENANTS.bravo },
];

async function upsertUser(user) {
  // Try to create; if already exists, fetch the existing user instead
  const { data: created, error } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: { full_name: user.full_name },
  });

  if (!error) {
    return created.user;
  }

  if (error.message.includes('already been registered') || error.message.includes('already registered')) {
    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error(`Failed to list users:`, listError.message);
      return null;
    }
    const existing = list.users.find((u) => u.email === user.email);
    if (existing) {
      console.log(`User ${user.email} already exists — reusing.`);
      return existing;
    }
  }

  console.error(`Failed to upsert user ${user.email}:`, error.message);
  return null;
}

async function upsertProfile(userId, tenantId, fullName) {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    tenant_id: tenantId,
    full_name: fullName,
  }, { onConflict: 'id' });

  if (error) {
    console.error(`Failed to upsert profile for user ${userId}:`, error.message);
  }
}

async function seed() {
  for (const user of USERS) {
    const authUser = await upsertUser(user);
    if (authUser?.id) {
      await upsertProfile(authUser.id, user.tenant_id, user.full_name);
      console.log(`Seeded ${user.email} → tenant ${user.tenant_id}`);
    }
  }
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
