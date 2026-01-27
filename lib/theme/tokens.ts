export const tokens = {
    surface: {
        primary: "bg-white dark:bg-zinc-950",
        secondary: "bg-zinc-50 dark:bg-zinc-900",
        tertiary: "bg-zinc-100 dark:bg-zinc-800",
        overlay: "bg-white/80 dark:bg-black/80 backdrop-blur-sm",
        danger: "bg-red-50 dark:bg-red-900/10",
    },
    border: {
        subtle: "border-zinc-200 dark:border-zinc-800",
        default: "border-zinc-300 dark:border-zinc-700",
        focus: "border-black dark:border-white",
        danger: "border-red-200 dark:border-red-800",
    },
    text: {
        primary: "text-zinc-900 dark:text-zinc-100",
        secondary: "text-zinc-500 dark:text-zinc-400",
        tertiary: "text-zinc-400 dark:text-zinc-500",
        inverse: "text-white dark:text-black",
        accent: "text-emerald-600 dark:text-emerald-400",
        danger: "text-red-600 dark:text-red-400",
    },
    status: {
        development: "bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-800",
        pre_production: "bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-800",
        production: "bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-800",
        post: "bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-800",
        completed: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-800",
    },
    action: {
        primary: "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
        secondary: "bg-white text-black border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800",
        danger: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
        ghost: "bg-transparent hover:bg-zinc-100 text-zinc-600 dark:hover:bg-zinc-800 dark:text-zinc-400",
    }
} as const;

export type ThemeTokens = typeof tokens;
