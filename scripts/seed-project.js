
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('--- SEEDING DEBUG PROJECT ---');

    // 1. Get a user (or create dummy)
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error('Error listing users:', usersError);
        return;
    }

    if (!users || users.length === 0) {
        console.error('No users found in Auth. Sign up in the app first.');
        return;
    }

    const targetUser = users[0];
    console.log(`Targeting User: ${targetUser.email} (${targetUser.id})`);

    // 2. Ensure Profile
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: targetUser.id,
        email: targetUser.email,
        subscription_status: 'active'
    });
    if (profileError) console.error('Profile Upsert Error:', profileError);
    else console.log('Profile ensured.');

    // 3. Create Project
    const newProject = {
        user_id: targetUser.id,
        name: 'DEBUG PROJECT ' + new Date().toISOString(),
        product_type: 'LuxPixPro',
        current_version: 1,
        data: {
            activePhase: 'DEVELOPMENT',
            activeTool: 'brief',
            phases: {
                DEVELOPMENT: { locked: false, drafts: {} },
                PRE_PRODUCTION: { locked: false, drafts: {} },
                ON_SET: { locked: false, drafts: {} },
                POST: { locked: false, drafts: {} }
            }
        }
    };

    const { data, error } = await supabase.from('projects').insert(newProject).select().single();

    if (error) {
        console.error('PROJECT CREATION FAILED:', error);
    } else {
        console.log('SUCCESS! Project created:', data.id);
        console.log('Go to your dashboard and refresh. You should see "DEBUG PROJECT".');
    }
}

seed();
