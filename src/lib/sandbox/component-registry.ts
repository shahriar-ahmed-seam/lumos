/**
 * Component Registry for AI-Generated Code
 * 
 * This registry defines all allowed components that AI can use.
 * It serves as the single source of truth for:
 * 1. Valid component names
 * 2. Import paths
 * 3. Dependencies available in Sandpack
 */

// ============================================
// LUCIDE ICONS - Complete list of allowed icons
// ============================================
export const LUCIDE_ICONS = [
  // Arrows & Navigation
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "ArrowUpRight", "ArrowUpLeft", "ArrowDownRight", "ArrowDownLeft",
  "ChevronUp", "ChevronDown", "ChevronLeft", "ChevronRight",
  "ChevronsUp", "ChevronsDown", "ChevronsLeft", "ChevronsRight",
  "MoveUp", "MoveDown", "MoveLeft", "MoveRight",
  
  // Actions
  "Plus", "Minus", "X", "Check", "Search", "Menu",
  "MoreHorizontal", "MoreVertical", "Grip", "GripVertical",
  "Copy", "Clipboard", "ClipboardCheck", "ClipboardList",
  "Download", "Upload", "Share", "Share2", "ExternalLink",
  "Link", "Link2", "Unlink", "Trash", "Trash2",
  "Edit", "Edit2", "Edit3", "Pencil", "PenTool",
  "Save", "SaveAll", "Undo", "Redo", "RotateCcw", "RotateCw",
  "RefreshCw", "RefreshCcw", "Repeat", "Shuffle",
  "ZoomIn", "ZoomOut", "Maximize", "Minimize", "Expand",
  
  // UI Elements
  "Home", "User", "Users", "UserPlus", "UserMinus", "UserCheck", "UserX",
  "Settings", "Settings2", "Sliders", "SlidersHorizontal",
  "Bell", "BellRing", "BellOff", "BellPlus",
  "Mail", "MailOpen", "Inbox", "Send", "MessageCircle", "MessageSquare",
  "Heart", "HeartOff", "ThumbsUp", "ThumbsDown",
  "Star", "StarOff", "StarHalf", "Bookmark", "BookmarkPlus",
  "Flag", "Award", "Trophy", "Medal", "Crown", "Gift",
  "Eye", "EyeOff", "Lock", "Unlock", "Key", "Shield", "ShieldCheck",
  
  // Media
  "Image", "ImagePlus", "ImageOff", "Camera", "CameraOff",
  "Video", "VideoOff", "Film", "Youtube", "Tv", "Monitor",
  "Music", "Music2", "Music3", "Music4", "Mic", "MicOff",
  "Volume", "Volume1", "Volume2", "VolumeX",
  "Play", "Pause", "PlayCircle", "PauseCircle",
  "SkipBack", "SkipForward", "Rewind", "FastForward",
  "Radio", "Podcast", "Headphones", "Speaker",
  
  // Files & Folders
  "File", "FileText", "FileCode", "FileJson", "FileImage",
  "FilePlus", "FileMinus", "FileCheck", "FileX",
  "Folder", "FolderOpen", "FolderPlus", "FolderMinus",
  "Archive", "Package", "Box", "Boxes",
  
  // Data & Charts
  "Activity", "BarChart", "BarChart2", "BarChart3", "BarChart4",
  "PieChart", "LineChart", "TrendingUp", "TrendingDown",
  "Percent", "Hash", "Binary", "Braces", "Brackets",
  "Database", "HardDrive", "Server", "Cloud", "CloudOff",
  
  // Time & Calendar
  "Calendar", "CalendarDays", "CalendarCheck", "CalendarPlus",
  "Clock", "Clock1", "Clock2", "Clock3", "Clock4",
  "Timer", "TimerOff", "Alarm", "AlarmClock", "Hourglass",
  
  // Location & Travel
  "MapPin", "Map", "Navigation", "Navigation2", "Compass",
  "Globe", "Globe2", "Earth", "Plane", "Car", "Train", "Ship",
  
  // Communication
  "Phone", "PhoneCall", "PhoneIncoming", "PhoneOutgoing", "PhoneMissed",
  "AtSign", "Hash", "Wifi", "WifiOff", "Bluetooth", "BluetoothOff",
  "Rss", "Radio", "Podcast", "Newspaper",
  
  // Weather & Nature
  "Sun", "Moon", "Cloud", "CloudRain", "CloudSnow", "CloudLightning",
  "CloudSun", "CloudMoon", "Sunrise", "Sunset",
  "Wind", "Droplet", "Droplets", "Snowflake", "Thermometer",
  "Umbrella", "Rainbow", "Leaf", "Trees", "Flower",
  
  // Tech & Code
  "Code", "Code2", "Terminal", "Command", "Cpu", "Chip",
  "Laptop", "Smartphone", "Tablet", "Watch", "Tv", "Monitor",
  "Mouse", "Keyboard", "Printer", "Scanner", "Webcam",
  "Wifi", "Bluetooth", "Usb", "Cable", "Plug", "Power",
  "Battery", "BatteryCharging", "BatteryFull", "BatteryLow",
  "Github", "Gitlab", "Figma", "Framer", "Chrome", "Firefox",
  
  // Status & Alerts
  "AlertCircle", "AlertTriangle", "AlertOctagon",
  "Info", "HelpCircle", "CircleHelp",
  "CheckCircle", "CheckCircle2", "XCircle", "XOctagon",
  "Ban", "Slash", "CircleSlash",
  "Loader", "Loader2", "LoaderCircle", "Hourglass",
  
  // Shapes & Symbols
  "Circle", "Square", "Triangle", "Pentagon", "Hexagon", "Octagon",
  "Diamond", "Sparkle", "Sparkles", "Stars", "Asterisk",
  "Flame", "Fire", "Zap", "Bolt", "Lightning",
  "Rocket", "Target", "Crosshair", "Aim",
  
  // Commerce
  "ShoppingCart", "ShoppingBag", "Store", "Storefront",
  "CreditCard", "Wallet", "Banknote", "Coins", "DollarSign",
  "Receipt", "Tag", "Tags", "Percent", "BadgePercent",
  
  // Layout
  "Layout", "LayoutGrid", "LayoutList", "LayoutDashboard",
  "Grid", "Grid2x2", "Grid3x3", "Columns", "Rows",
  "Sidebar", "PanelLeft", "PanelRight", "PanelTop", "PanelBottom",
  "Split", "Combine", "Merge", "GitMerge", "GitBranch",
  
  // Text & Typography
  "Type", "Bold", "Italic", "Underline", "Strikethrough",
  "AlignLeft", "AlignCenter", "AlignRight", "AlignJustify",
  "List", "ListOrdered", "ListTodo", "ListChecks",
  "Quote", "Pilcrow", "Heading1", "Heading2", "Heading3",
  
  // Social
  "Twitter", "Facebook", "Instagram", "Linkedin", "Youtube",
  "Twitch", "Dribbble", "Figma", "Slack", "Discord",
] as const;

export type LucideIconName = typeof LUCIDE_ICONS[number];

// ============================================
// AVAILABLE PACKAGES IN SANDPACK
// ============================================
export const SANDPACK_DEPENDENCIES = {
  // Core
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  
  // Icons
  "lucide-react": "latest",
  "react-icons": "^4.12.0",
  
  // Animation
  "framer-motion": "^10.16.0",
  "react-spring": "^9.7.0",
  
  // Charts
  "recharts": "^2.10.0",
  
  // Utilities
  "clsx": "^2.0.0",
  "classnames": "^2.3.0",
  "date-fns": "^2.30.0",
  
  // Forms
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0",
  
  // State
  "zustand": "^4.4.0",
  
  // HTTP
  "axios": "^1.6.0",
  
  // Radix UI (Shadcn foundation)
  "@radix-ui/react-accordion": "^1.1.0",
  "@radix-ui/react-alert-dialog": "^1.0.0",
  "@radix-ui/react-avatar": "^1.0.0",
  "@radix-ui/react-checkbox": "^1.0.0",
  "@radix-ui/react-dialog": "^1.0.0",
  "@radix-ui/react-dropdown-menu": "^2.0.0",
  "@radix-ui/react-hover-card": "^1.0.0",
  "@radix-ui/react-label": "^2.0.0",
  "@radix-ui/react-popover": "^1.0.0",
  "@radix-ui/react-progress": "^1.0.0",
  "@radix-ui/react-radio-group": "^1.1.0",
  "@radix-ui/react-scroll-area": "^1.0.0",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-separator": "^1.0.0",
  "@radix-ui/react-slider": "^1.1.0",
  "@radix-ui/react-slot": "^1.0.0",
  "@radix-ui/react-switch": "^1.0.0",
  "@radix-ui/react-tabs": "^1.0.0",
  "@radix-ui/react-toast": "^1.1.0",
  "@radix-ui/react-toggle": "^1.0.0",
  "@radix-ui/react-tooltip": "^1.0.0",
} as const;

// ============================================
// COMPONENT REGISTRY
// ============================================
export interface ComponentInfo {
  name: string;
  importPath: string;
  type: "icon" | "ui" | "utility" | "chart";
  description?: string;
}

// Map of component name -> import info
export const COMPONENT_REGISTRY: Record<string, ComponentInfo> = {};

// Register all Lucide icons
LUCIDE_ICONS.forEach(icon => {
  COMPONENT_REGISTRY[icon] = {
    name: icon,
    importPath: "lucide-react",
    type: "icon",
  };
});

// ============================================
// VALIDATION HELPERS
// ============================================
export function isValidIcon(name: string): boolean {
  return LUCIDE_ICONS.includes(name as LucideIconName);
}

export function getValidIconSuggestion(invalidName: string): string {
  // Simple fuzzy match - find closest icon name
  const lowerName = invalidName.toLowerCase();
  
  const match = LUCIDE_ICONS.find(icon => 
    icon.toLowerCase().includes(lowerName) || 
    lowerName.includes(icon.toLowerCase())
  );
  
  return match || "CircleHelp"; // Default fallback icon
}

export function getAllowedIconsList(): string {
  return LUCIDE_ICONS.join(", ");
}

// ============================================
// GENERATE IMPORT STATEMENT
// ============================================
export function generateLucideImport(usedIcons: string[]): string {
  const validIcons = usedIcons.filter(isValidIcon);
  if (validIcons.length === 0) return "";
  
  const uniqueIcons = [...new Set(validIcons)].sort();
  return `import { ${uniqueIcons.join(", ")} } from "lucide-react";`;
}

// ============================================
// SANDPACK FILES TEMPLATE
// ============================================
export function getSandpackSetupFiles() {
  return {
    "/styles.css": {
      code: `
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #0a0a0a;
  color: #fafafa;
  min-height: 100vh;
}
      `.trim(),
      hidden: true,
    },
    "/tailwind.config.js": {
      code: `
module.exports = {
  content: ["./**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#fafafa",
      },
    },
  },
  plugins: [],
};
      `.trim(),
      hidden: true,
    },
  };
}
