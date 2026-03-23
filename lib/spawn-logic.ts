import { createClient } from '@supabase/supabase-js'

// --- SPAWN CONFIGURATION ---
// The Founder should update this ID with the actual "MASTER DEMO" Project ID
export const MASTER_DEMO_PROJECT_ID = 'e96e0cc4-fb19-43f9-99e5-d328c97d1ea7'; // Provided ID
export const FOUNDER_EMAIL = 'casteelio@gmail.com';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Always use service role client for cloning to bypass RLS and see all projects
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Clones the Master Demo project for a new user upon signup.
 * Implements "Spawn-on-Signup" logic.
 */
export async function spawnDemoForUser(newUserId: string, newUserEmail: string) {
    console.log(`🚀 Spawning Demo Project for user: ${newUserEmail} (${newUserId})`);

    try {
        // 1. Fetch the Master Project
        const { data: masterProject, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', MASTER_DEMO_PROJECT_ID)
            .single();

        if (projectError || !masterProject) {
            console.warn('⚠️ Master Demo Project not found. Skipping clone. ID:', MASTER_DEMO_PROJECT_ID);
            return { error: 'Master project not found' };
        }

        // 2. Clone the Project
        const { data: clonedProject, error: cloneError } = await supabase
            .from('projects')
            .insert({
                user_id: newUserId,
                name: 'Demo', // Renamed as requested
                product_type: masterProject.product_type,
                data: {
                    ...(masterProject.data || {}),
                    clientName: 'Cadence Coffee' // Updated as requested
                },
                current_version: 1,
                is_demo: true,
                is_template: true, // Mark it as template-spawned
                permission_lock: 'read_only', // Enforce read-only for new user
            })
            .select()
            .single();

        if (cloneError || !clonedProject) {
            console.error('❌ Failed to clone project record:', cloneError);
            return { error: 'Failed to clone project' };
        }

        console.log(`✅ Cloned Project Record Created: ${clonedProject.id}`);

        // 3. Clone Documents
        const { data: masterDocs, error: docsError } = await supabase
            .from('documents')
            .select('*')
            .eq('project_id', MASTER_DEMO_PROJECT_ID);

        if (docsError) {
            console.error('❌ Error fetching master documents:', docsError);
        } else if (masterDocs && masterDocs.length > 0) {
            const docsToInsert = masterDocs.map(doc => {
                // Remove ID and timestamps to let Supabase re-generate
                const { id, created_at, updated_at, ...rest } = doc;
                return {
                    ...rest,
                    project_id: clonedProject.id,
                };
            });

            const { error: insertDocsError } = await supabase
                .from('documents')
                .insert(docsToInsert);

            if (insertDocsError) {
                console.error('❌ Error inserting cloned documents:', insertDocsError);
            } else {
                console.log(`✅ Cloned ${docsToInsert.length} documents.`);
            }
        }

        // 4. Clone Messages (Chat history for continuity)
        const { data: masterMsgs, error: msgsError } = await supabase
            .from('messages')
            .select('*')
            .eq('project_id', MASTER_DEMO_PROJECT_ID);

        if (msgsError) {
            console.error('❌ Error fetching master messages:', msgsError);
        } else if (masterMsgs && masterMsgs.length > 0) {
            const msgsToInsert = masterMsgs.map(msg => {
                const { id, created_at, updated_at, ...rest } = msg;
                return {
                    ...rest,
                    project_id: clonedProject.id,
                    user_id: newUserId, // Messages now belong to the new user in their clone
                };
            });

            const { error: insertMsgsError } = await supabase
                .from('messages')
                .insert(msgsToInsert);

            if (insertMsgsError) {
                console.error('❌ Error inserting cloned messages:', insertMsgsError);
            } else {
                console.log(`✅ Cloned ${msgsToInsert.length} messages.`);
            }
        }

        console.log(`🎉 Spawn-on-Signup Complete for ${newUserEmail}`);
        return { success: true, projectId: clonedProject.id };

    } catch (err: any) {
        console.error('🚨 Unexpected error during spawn-on-signup:', err);
        return { error: err.message };
    }
}
