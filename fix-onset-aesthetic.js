const fs = require('fs');

const fileComponent = '/Users/davidcasteel/Desktop/creative-os-fixed/app/onset/[id]/components.tsx';
let content = fs.readFileSync(fileComponent, 'utf8');

// 1. ModuleCards (Main panels for sections like ScriptView, CallSheetView widgets)
// Usually "bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-xl p-6 shadow-2xl"
content = content.replace(/bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-xl/g, 'bg-zinc-50 border border-zinc-200/80 shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,1)] rounded-xl');

// Another common "card" wrapper
content = content.replace(/bg-zinc-900 border border-zinc-700 rounded-xl p-4/g, 'bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,1)]');

// 2. Recessed Data Wells
// For inputs: "bg-zinc-950 border border-zinc-800"
content = content.replace(/bg-zinc-950 border border-zinc-800/g, 'bg-zinc-100 shadow-inner border border-zinc-200 rounded-md');

// For crew list / schedule blocks: "bg-zinc-900 p-4 rounded-lg border border-zinc-800" or similar
content = content.replace(/bg-zinc-900 p-4 rounded-xl border border-zinc-800/g, 'bg-zinc-100 shadow-inner border border-zinc-200 rounded-md p-4');
content = content.replace(/bg-zinc-900 p-4 rounded-lg border border-zinc-800/g, 'bg-zinc-100 shadow-inner border border-zinc-200 rounded-md p-4');
content = content.replace(/bg-zinc-900 p-3 rounded-lg border border-zinc-800/g, 'bg-zinc-100 shadow-inner border border-zinc-200 rounded-md p-3');
content = content.replace(/bg-zinc-900 p-3 rounded-sm border-l-2/g, 'bg-zinc-100 shadow-inner border border-zinc-200 rounded-sm border-l-2');
content = content.replace(/bg-zinc-900 p-6 border-l-4/g, 'bg-zinc-100 shadow-inner border border-zinc-200 p-6 border-l-4'); // shotlist cards
content = content.replace(/bg-zinc-900 border border-zinc-800/g, 'bg-zinc-100 shadow-inner border border-zinc-200');

// Fix text colors inside the components
content = content.replace(/text-white/g, 'text-zinc-950');
content = content.replace(/text-zinc-400/g, 'text-zinc-500');
content = content.replace(/text-zinc-300/g, 'text-zinc-600');
content = content.replace(/text-zinc-500/g, 'text-zinc-500'); // No change
// Placeholder text
content = content.replace(/placeholder:text-zinc-600/g, 'placeholder:text-zinc-400');

// 3. Status Jewels - Live indicator no transparency
// In Header from page.tsx (Wait, that's later)
// ABC unit badges, etc. For example bg-emerald-500/20 text-emerald-500
content = content.replace(/bg-emerald-500\/20 text-emerald-500/g, 'bg-emerald-500 text-white shadow-sm border border-emerald-600');
content = content.replace(/text-emerald-500/g, 'text-emerald-600');

// Save back
fs.writeFileSync(fileComponent, content, 'utf8');
console.log("Updated components.tsx");

