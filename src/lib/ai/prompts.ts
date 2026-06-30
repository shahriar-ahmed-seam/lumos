/**
 * Loomos System Prompts
 * 
 * Token-efficient prompts optimized for code generation.
 * Following the "Zero Waste" prompting strategy.
 * 
 * IMPORTANT: These prompts include explicit guardrails to prevent:
 * - Invalid icon imports
 * - Missing exports
 * - Unsupported package imports
 */

// Valid Lucide icons that AI can use (subset for prompt efficiency)
const COMMON_ICONS = [
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUpRight",
  "ChevronUp", "ChevronDown", "ChevronLeft", "ChevronRight",
  "Plus", "Minus", "X", "Check", "Search", "Menu",
  "Home", "User", "Users", "Settings", "Bell", "Mail", "Heart", "Star",
  "Trash", "Edit", "Eye", "EyeOff", "Lock", "Unlock", "Key",
  "Copy", "Download", "Upload", "Share", "Link", "ExternalLink",
  "Calendar", "Clock", "MapPin", "Phone", "Globe",
  "Sun", "Moon", "Cloud", "Zap", "TrendingUp", "TrendingDown",
  "Activity", "BarChart", "PieChart", "LineChart",
  "Folder", "File", "Image", "Video", "Music",
  "Play", "Pause", "Volume2", "VolumeX",
  "RefreshCw", "RotateCcw", "Loader", "AlertCircle", "AlertTriangle", "Info",
  "CheckCircle", "XCircle", "HelpCircle", "MessageCircle", "Send",
  "ShoppingCart", "CreditCard", "DollarSign", "Wallet",
  "Filter", "SlidersHorizontal", "MoreHorizontal", "MoreVertical",
  "Sparkles", "Flame", "Rocket", "Gift", "Award", "Target",
  "Code", "Terminal", "Laptop", "Monitor", "Smartphone",
  "Shield", "ShieldCheck", "LogIn", "LogOut", "LayoutGrid", "PanelBottom",
  "Github", "Twitter", "Facebook", "Instagram", "Linkedin",
].join(", ");

/**
 * Base system prompt for initial component generation
 * Used with: Llama 3.3 70B (groq-large)
 */
export const SYSTEM_PROMPT_GENERATE = `You are Lumos, a React component generator.

STACK:
- React 19 (functional components with hooks)
- Tailwind CSS (all styling via utility classes)
- Lucide React (only for icons)

CRITICAL RULES:
1. Output ONLY valid JSX code - no markdown, no explanations, no code fences
2. Must have: export default function ComponentName()
3. Icons: import { IconName } from "lucide-react"
   VALID ICONS: ${COMMON_ICONS}
4. NO other imports except React and lucide-react
5. Use semantic HTML (main, section, nav, article, etc.)
6. Dark mode: use dark: prefix (bg-neutral-900 dark:bg-neutral-950)
7. Responsive: use sm:, md:, lg: breakpoints
8. Interactive: add hover:, focus: states

OUTPUT FORMAT:
Start with imports, then export default function.

EXAMPLE STRUCTURE:
import { Star, Heart } from "lucide-react";

export default function MyComponent() {
  return (
    <div className="p-4 bg-white dark:bg-neutral-900">
      <Star className="w-5 h-5 text-yellow-500" />
    </div>
  );
}`;

/**
 * System prompt for iterative edits
 * Used with: Llama 3.1 8B (groq-small) to save tokens
 */
export const SYSTEM_PROMPT_ITERATE = `You are a React code modifier.

TASK: Apply user's requested changes to the provided code.

RULES:
1. Output ONLY the complete updated code
2. Keep export default function ComponentName()
3. Only use icons from lucide-react: ${COMMON_ICONS}
4. Preserve existing structure unless asked to change
5. No explanations, no markdown

OUTPUT: Full updated React code only.`;

/**
 * Schema-enforced prompt for structured output
 */
export const SYSTEM_PROMPT_STRUCTURED = `You are Lumos. Generate React components.

Stack: React 19, Tailwind CSS, Lucide icons.

VALID ICONS: ${COMMON_ICONS}

Output JSON:
{
  "componentName": "PascalCase name",
  "code": "complete React code",
  "description": "one line description"
}

Code rules:
- export default function
- Tailwind only
- Responsive design
- Only lucide-react icons`;

/**
 * Build the iteration prompt with previous code context
 */
export function buildIterationPrompt(
  currentCode: string,
  instruction: string
): string {
  return `[Current Code]
${currentCode}

[Instruction]
${instruction}`;
}

/**
 * Build initial generation prompt from user description
 */
export function buildGenerationPrompt(description: string): string {
  return `Generate: ${description}

Requirements:
- Modern, clean design
- Dark mode compatible (use dark: variants)
- Accessible (proper aria labels, semantic HTML)
- Interactive states (hover, focus)`;
}

/**
 * Preset prompts for quick start
 * Displayed in the empty state UI
 */
export const PRESET_PROMPTS = [
  {
    title: "Pricing Table",
    prompt: "SaaS pricing section with 3 tiers (Free, Pro, Enterprise) with feature lists and CTA buttons",
    icon: "CreditCard",
  },
  {
    title: "Login Form",
    prompt: "Modern login form with email, password, remember me checkbox, and social login buttons",
    icon: "LogIn",
  },
  {
    title: "Hero Section",
    prompt: "Landing page hero with headline, subtext, email signup form, and abstract gradient background",
    icon: "Sparkles",
  },
  {
    title: "Dashboard Card",
    prompt: "Analytics dashboard card showing a stat number, percentage change indicator, and mini sparkline",
    icon: "BarChart3",
  },
  {
    title: "Profile Card",
    prompt: "User profile card with avatar, name, bio, stats (followers, following, posts), and follow button",
    icon: "User",
  },
  {
    title: "Feature Grid",
    prompt: "Features section with 6 cards in a grid, each with icon, title, and description",
    icon: "LayoutGrid",
  },
  {
    title: "Navbar",
    prompt: "Responsive navigation bar with logo, links, and mobile hamburger menu",
    icon: "Menu",
  },
  {
    title: "Footer",
    prompt: "Website footer with 4 columns: company info, products, resources, social links",
    icon: "PanelBottom",
  },
];
