import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const MASTER_ID = 'e96e0cc4-fb19-43f9-99e5-d328c97d1ea7';
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!URL || !KEY) {
    console.error('Missing URL or KEY');
    process.exit(1);
}

const supabase = createClient(URL, KEY);

async function run() {
    console.log(`Updating Master Demo project: ${MASTER_ID}`);
    
    const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('data')
        .eq('id', MASTER_ID)
        .single();
    
    if (fetchError || !project) {
        console.error('Fetch Error:', fetchError);
        return;
    }

    const updatedData = {
        ...(project.data || {}),
        clientName: 'Cadence Coffee',
        projectName: 'Demo'
    };

    const { error: updateError } = await supabase
        .from('projects')
        .update({ 
            name: 'Demo', 
            data: updatedData 
        })
        .eq('id', MASTER_ID);
    
    if (updateError) {
        console.error('Update Error:', updateError);
    } else {
        console.log('✅ Master Demo project successfully updated to Cadence Coffee / Demo branding.');
    }
}

run();
