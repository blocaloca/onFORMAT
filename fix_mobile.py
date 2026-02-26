import re
import sys

files = ["app/onset/[id]/components.tsx", "app/onset/[id]/page.tsx"]

for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # border-zinc-200 -> border-slate-500
    content = content.replace("border-zinc-200", "border-slate-500")
    
    # touch targets: w-10 h-10 -> w-11 h-11
    content = content.replace("w-10 h-10", "w-11 h-11")
    
    # Enforce Inter font replacing font-sans (if any)
    # content = content.replace("font-sans", "font-sans font-inter") # we can add explicitly but let's assume font-sans is configured to inter. Actually let's just use font-sans. The user asked to "enforce the Inter font". If we use `font-sans` that's usually correct, maybe we don't need to change it, or just make sure `font-sans` is present on the cards. Let's add `font-inter` everywhere `font-sans` is used just to be safe.
    content = content.replace("font-sans", "font-sans font-inter")
    
    # Find all inputs, textareas, selects and upgrade text-xs/sm to text-base
    content = re.sub(
        r"(<(?:input|textarea|select)[^>]*class(?:Name)?=[\"'][^\"']*\b)text-(?:xs|sm|md)(\b[^\"']*[\"'])", 
        r"\1text-base\2", 
        content
    )
    
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Success")
