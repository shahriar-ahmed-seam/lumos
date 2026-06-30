"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Code2,
  Eye,
  GitBranch,
  ShieldCheck,
  Server,
  Wand2,
  MessagesSquare,
  Github,
} from "lucide-react";
import { HERO, SHOWCASE, CTA_BAND, PHOTO_CREDITS } from "@/lib/marketing/imagery";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Providers", href: "#providers" },
];

const FEATURES = [
  {
    icon: Eye,
    title: "Live preview, instantly",
    desc: "Watch your component render in a secure sandbox the moment the AI writes it. No copy-paste loop.",
  },
  {
    icon: MessagesSquare,
    title: "Conversational iteration",
    desc: "“Make the header sticky and add a dark variant.” Refine in plain English — Lumos edits in place.",
  },
  {
    icon: Code2,
    title: "Production-ready output",
    desc: "Clean React + Tailwind, sanitized and validated. Copy it straight into your codebase.",
  },
  {
    icon: GitBranch,
    title: "Version history",
    desc: "Every generation is saved. Jump back to any version of a component with one click.",
  },
  {
    icon: ShieldCheck,
    title: "Sandboxed & safe",
    desc: "Generated code is statically validated and run in an isolated sandbox — never on your machine.",
  },
  {
    icon: Server,
    title: "Bring your own model",
    desc: "Groq, OpenAI, Anthropic, Gemini, or fully local Ollama. Switch providers on the fly.",
  },
];

const STEPS = [
  {
    icon: Wand2,
    title: "Describe it",
    desc: "Type what you want in natural language — a pricing table, a dashboard card, a hero section.",
  },
  {
    icon: Sparkles,
    title: "Generate",
    desc: "Lumos picks the right model and streams clean, accessible React + Tailwind code in real time.",
  },
  {
    icon: GitBranch,
    title: "Iterate & ship",
    desc: "Preview, tweak with follow-up prompts, browse versions, then copy the code into your project.",
  },
];

const PROVIDERS = [
  { name: "Groq", note: "Free" },
  { name: "OpenAI", note: "GPT-4o" },
  { name: "Anthropic", note: "Claude" },
  { name: "Gemini", note: "Free" },
  { name: "Ollama", note: "Local" },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-50 overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-neutral-950/60 backdrop-blur-xl">
        <nav className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Lumos</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/shahriar-ahmed-seam/lumos"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:grid place-items-center w-9 h-9 rounded-lg border border-white/10 text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
              aria-label="GitHub repository"
            >
              <Github className="w-4.5 h-4.5" />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              Open Studio
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative min-h-screen flex items-center justify-center isolate">
        <Image
          src={HERO.url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover -z-10"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-950/70 via-neutral-950/40 to-neutral-950" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,10,0.55)_100%)]" />

        <div className="mx-auto max-w-4xl px-6 text-center pt-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-neutral-300 backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Multi-provider AI · Live sandbox preview
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={1}
            className="mt-7 text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
          >
            Describe your UI.
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent">
              Watch it come to life.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            className="mx-auto mt-6 max-w-2xl text-lg text-neutral-300/90"
          >
            Lumos turns plain-English prompts into production-ready React components —
            rendered live, refined conversationally, and ready to ship.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={3}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-medium text-neutral-900 shadow-2xl shadow-fuchsia-500/10 hover:bg-neutral-100 transition-all hover:scale-[1.02]"
            >
              Start creating — it&apos;s free
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-medium text-white backdrop-blur-md hover:bg-white/10 transition-colors"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={4}
            className="mt-8 text-sm text-neutral-400"
          >
            No credit card · Free Groq &amp; Gemini tiers · Run 100% local with Ollama
          </motion.p>
        </div>

        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />
      </section>

      <section id="providers" className="border-y border-white/5 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-center text-xs uppercase tracking-widest text-neutral-500">
            Works with the models you already trust
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {PROVIDERS.map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-neutral-400">
                <span className="text-lg font-semibold text-neutral-200">{p.name}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-neutral-500">
                  {p.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-28">
        <SectionHeading
          eyebrow="Everything you need"
          title="A studio built for shipping UI"
          subtitle="From first prompt to production code, Lumos keeps you in flow."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              custom={i}
              className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 transition-colors hover:border-white/20"
            >
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 ring-1 ring-white/10">
                <f.icon className="w-5 h-5 text-violet-300" />
              </span>
              <h3 className="mt-5 text-lg font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-white/5">
        <Image src={SHOWCASE.url} alt="" fill sizes="100vw" className="object-cover -z-10 opacity-30" />
        <div className="absolute inset-0 -z-10 bg-neutral-950/70" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-28 lg:grid-cols-2">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p className="text-sm font-medium text-violet-300">Prompt → Pixels</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
              See the result before you write a single line
            </h2>
            <p className="mt-5 text-neutral-300/90 leading-relaxed">
              Lumos renders every generation in an isolated Sandpack environment with Tailwind
              preloaded. Toggle between a live preview and the source, copy the code, or roll back
              to an earlier version — all without leaving the canvas.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-neutral-300">
              {["Real-time streaming output", "Preview / Code tabs", "One-click copy & version rollback"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="grid place-items-center w-5 h-5 rounded-full bg-green-500/20">
                      <Zap className="w-3 h-3 text-green-400" />
                    </span>
                    {item}
                  </li>
                )
              )}
            </ul>
            <Link
              href="/dashboard"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              Try it now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={1}
            className="rounded-2xl border border-white/10 bg-neutral-900/80 p-2 shadow-2xl backdrop-blur"
          >
            <div className="flex items-center gap-1.5 px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <span className="h-3 w-3 rounded-full bg-green-400/80" />
              <span className="ml-3 text-xs text-neutral-500">PricingCard.tsx</span>
            </div>
            <pre className="overflow-hidden rounded-xl bg-neutral-950 p-5 text-xs leading-relaxed text-neutral-300">
              <code>{`export function PricingCard() {
  return (
    <div className="rounded-2xl border
      border-white/10 bg-neutral-900 p-8">
      <h3 className="text-xl font-semibold">
        Pro
      </h3>
      <p className="mt-2 text-4xl font-bold">
        $29<span className="text-base
          text-neutral-400">/mo</span>
      </p>
      <button className="mt-6 w-full rounded-lg
        bg-violet-500 py-3 font-medium">
        Get started
      </button>
    </div>
  );
}`}</code>
            </pre>
          </motion.div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-6 py-28">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to component in three steps"
          subtitle="No setup, no boilerplate. Just describe and generate."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              custom={i}
              className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-7"
            >
              <span className="absolute right-6 top-6 text-5xl font-bold text-white/5">
                0{i + 1}
              </span>
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <s.icon className="w-6 h-6 text-white" />
              </span>
              <h3 className="mt-5 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <Image src={CTA_BAND.url} alt="" fill sizes="100vw" className="object-cover -z-10" />
        <div className="absolute inset-0 -z-10 bg-neutral-950/75" />
        <div className="mx-auto max-w-3xl px-6 py-28 text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-semibold tracking-tight"
          >
            Build your next component now
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={1}
            className="mx-auto mt-5 max-w-xl text-lg text-neutral-300"
          >
            Open the studio and ship your first AI-generated component in under a minute.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            custom={2}
            className="mt-9"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-medium text-neutral-900 hover:bg-neutral-200 transition-colors"
            >
              Launch Lumos Studio
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Lumos</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-neutral-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how" className="hover:text-white transition-colors">How it works</a>
              <Link href="/dashboard" className="hover:text-white transition-colors">Studio</Link>
              <a
                href="https://github.com/shahriar-ahmed-seam/lumos"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-neutral-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Lumos. Built with Next.js &amp; the Vercel AI SDK.</p>
            <p>
              Photography by{" "}
              {PHOTO_CREDITS.map((p, i) => (
                <span key={p.creditUrl}>
                  <a href={p.creditUrl} target="_blank" rel="noreferrer" className="hover:text-neutral-300 underline-offset-2 hover:underline">
                    {p.credit}
                  </a>
                  {i < PHOTO_CREDITS.length - 1 ? ", " : ""}
                </span>
              ))}{" "}
              on Unsplash.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="text-sm font-medium text-violet-300">{eyebrow}</p>
      <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-4 text-neutral-400">{subtitle}</p>
    </motion.div>
  );
}
