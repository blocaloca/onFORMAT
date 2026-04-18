import re

with open('app/onset/[id]/page.tsx', 'r') as f:
    content = f.read()

helper = """    const fetchFreshProject = async () => {
        const queryUrl = `/api/onset/project?id=${id}`;
        const res = await fetch(queryUrl, { cache: 'no-store' });
        if (!res.ok) throw new Error("Failed to fetch fresh project API");
        const json = await res.json();
        if (json.error || !json.data) throw new Error(json.error || "No project returned");
        return { data: json.data, error: null };
    };
"""

content = content.replace("    const saveProjectData = async (dataPayload: any) => {", helper + "\n    const saveProjectData = async (dataPayload: any) => {")

target1 = "const { data: fresh, error } = await supabase.from('projects').select('*').eq('id', id).single();"
target2 = "const { data: latest, error } = await supabase.from('projects').select('*').eq('id', id).single();"

content = content.replace(target1, "const { data: fresh, error } = await fetchFreshProject();")
content = content.replace(target2, "const { data: latest, error } = await fetchFreshProject();")

with open('app/onset/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Done")
