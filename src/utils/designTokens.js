// Design System Tokens
// Consistent spacing, colors, typography, and component styling

export const spacing = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const borderRadius = {
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const typography = {
  heading: {
    '2xl': 'text-2xl font-heading font-bold',
    xl: 'text-xl font-heading font-bold',
    lg: 'text-lg font-heading font-semibold',
    base: 'text-base font-heading font-semibold',
  },
  body: {
    lg: 'text-lg',
    base: 'text-base',
    sm: 'text-sm',
    xs: 'text-xs',
  },
  subtitle: 'text-gray-500 dark:text-gray-400 text-sm',
};

export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Component-specific color mappings
export const componentColors = {
  scriptGenerator: {
    primary: 'indigo',
    gradient: 'from-indigo-600 to-indigo-700',
    light: 'indigo-100 dark:indigo-900/50',
    dark: 'indigo-600 dark:indigo-400',
    bg: 'indigo-500/5',
    hover: 'indigo-500/10',
  },
  scriptEditor: {
    primary: 'purple',
    gradient: 'from-purple-600 to-purple-700',
    light: 'purple-100 dark:purple-900/50',
    dark: 'purple-600 dark:purple-400',
    bg: 'purple-500/5',
    hover: 'purple-500/10',
  },
  imageGenerator: {
    primary: 'pink',
    gradient: 'from-pink-600 to-rose-600',
    light: 'pink-100 dark:pink-900/50',
    dark: 'pink-600 dark:pink-400',
    bg: 'pink-500/5',
    hover: 'pink-500/10',
  },
  voiceGenerator: {
    primary: 'green',
    gradient: 'from-green-600 to-teal-600',
    light: 'green-100 dark:green-900/50',
    dark: 'green-600 dark:green-400',
    bg: 'green-500/5',
    hover: 'green-500/10',
  },
  videoRenderer: {
    primary: 'orange',
    gradient: 'from-orange-600 to-amber-600',
    light: 'orange-100 dark:orange-900/50',
    dark: 'orange-600 dark:orange-400',
    bg: 'orange-500/5',
    hover: 'orange-500/10',
  },
};

// Standard component header structure
export const componentHeader = {
  iconContainer: 'w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm',
  title: 'text-2xl font-heading font-bold text-gray-900 dark:text-white',
  subtitle: 'text-gray-500 dark:text-gray-400 text-sm',
  spacing: 'mb-8',
};

// Standard button styles
export const buttonStyles = {
  primary: 'px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3',
  secondary: 'px-6 py-3 rounded-lg font-semibold text-base border transition-all',
  disabled: 'bg-gray-400 cursor-not-allowed shadow-none',
};

// Standard input styles
export const inputStyles = {
  base: 'w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-0 outline-none transition-all',
  textarea: 'w-full px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-offset-0 outline-none font-mono text-sm leading-relaxed resize-y shadow-sm',
};

