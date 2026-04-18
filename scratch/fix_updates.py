import re

with open('app/onset/[id]/page.tsx', 'r') as f:
    content = f.read()

helper = """    const saveProjectData = async (dataPayload: any) => {
        const res = await fetch('/api/onset/project-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, data: dataPayload, email: userEmail })
        });
        if (!res.ok) throw new Error("Failed to save via API");
    };
"""

content = content.replace("    const handleUpdateDIT = async (newItem: any) => {", helper + "\n    const handleUpdateDIT = async (newItem: any) => {")

content = content.replace("await supabase.from('projects').update({ data: updatedProjectData }).eq('id', id);", "await saveProjectData(updatedProjectData);")
content = content.replace("await supabase.from('projects').update({ data: { ...latest.data, phases: updatedPhases } }).eq('id', id);", "await saveProjectData({ ...latest.data, phases: updatedPhases });")

with open('app/onset/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Done")
