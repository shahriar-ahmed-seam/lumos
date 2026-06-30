import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lumos — AI React Component Generator",
  description:
    "Turn plain-English prompts into production-ready React + Tailwind components, rendered live in a secure sandbox. Powered by Groq, OpenAI, Anthropic, Gemini, and local Ollama.",
  keywords: [
    "AI component generator",
    "React",
    "Tailwind CSS",
    "Next.js",
    "code generation",
    "Groq",
    "Ollama",
  ],
  authors: [{ name: "Shahriar Ahmed" }],
  openGraph: {
    title: "Lumos — AI React Component Generator",
    description:
      "Describe your UI, watch it come to life. Production-ready React components from a prompt.",
    type: "website",
  },
};

// Check if Clerk is configured
const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-neutral-950 text-neutral-50`}>
        <ThemeProvider defaultTheme="dark" storageKey="loomos-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );

  // Only wrap with ClerkProvider if configured
  if (isClerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
