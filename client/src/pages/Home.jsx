import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import {
  ArrowRight,
  CheckCircle,
  FileText,
  Briefcase,
  FolderKanban,
  BarChart2,
  Sparkles,
  MapPin,
  Zap,
  TrendingUp,
  Clock,
  ShieldCheck,
  Code,
  Layers,
  Bot,
  ChevronRight,
  XCircle,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobFilter, setJobFilter] = useState('all');
  const [showHint, setShowHint] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const sampleJobs = [
    {
      id: 1,
      title: 'Full Stack Web Developer',
      company: 'High-Growth Tech Startup',
      location: 'Bengaluru, Karnataka',
      type: 'bengaluru',
      salary: '₹8L – ₹14L PA',
      source: 'Internshala',
      match: 94,
      fresh: true,
      skills: ['React', 'Node.js', 'MongoDB'],
      missing: 'Docker',
    },
    {
      id: 2,
      title: 'Frontend Engineer (React.js)',
      company: 'Fintech Unicorn',
      location: 'Remote · India',
      type: 'remote',
      salary: '₹10L – ₹16L PA',
      source: 'Indeed India',
      match: 89,
      fresh: true,
      skills: ['JavaScript', 'Tailwind CSS', 'Redux'],
      missing: 'TypeScript',
    },
    {
      id: 3,
      title: 'Associate Software Engineer',
      company: 'Product Engineering Labs',
      location: 'Pune, Maharashtra',
      type: 'pune',
      salary: '₹6L – ₹10L PA',
      source: 'Internshala',
      match: 86,
      fresh: false,
      skills: ['Python', 'Django', 'SQL'],
      missing: 'Redis',
    },
  ];

  const filteredJobs =
    jobFilter === 'all'
      ? sampleJobs
      : sampleJobs.filter((j) => j.type === jobFilter || (jobFilter === 'fresh' && j.fresh));

  return (
    <div className="animate-fade-in bg-white">
      {/* ── Hero Section with Ambient Glow ── */}
      <section className="ambient-hero-bg border-b border-neutral-200/70 pt-16 pb-24 px-5 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Eyebrow Floating Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full ambient-glow-pill text-xs font-semibold text-neutral-800 mb-8 border border-primary-200 shadow-sm">
            <span className="pulse-dot" />
            <span className="text-neutral-600">Playwright Live Indian Job Crawler</span>
            <span className="text-neutral-300">·</span>
            <span className="text-primary-700 font-bold flex items-center gap-1">
              <Sparkles size={13} /> Gemini 3.1 Intelligence
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 max-w-4xl mx-auto leading-[1.08] mb-6">
            Stop applying in the dark.<br />
            <span className="text-gradient-accent">Get hired with real AI intelligence.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto mb-10 font-normal">
            CareerLens continuously scrapes fresh jobs from <strong>Internshala</strong> and <strong>Indeed India</strong> with a strict <strong>24-hour TTL</strong>.
            Gemini AI diagnoses your resume, closes keyword gaps, and rewrites bullet points for maximum recruiter impact.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <Link to="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="primary"
                icon={<ArrowRight size={17} />}
                iconPosition="right"
                className="w-full sm:w-auto shadow-lg shadow-primary-600/25 px-8 py-3.5 font-semibold text-base"
              >
                Upload Resume & Check Score
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-white/90 backdrop-blur-md border-neutral-300 text-neutral-800 hover:bg-neutral-50 px-7 py-3.5 font-semibold text-base"
              >
                Explore Live Jobs (50+ Active)
              </Button>
            </Link>
          </div>

          {/* Live Trust Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-neutral-200/80">
            {[
              {
                icon: <Zap size={16} className="text-amber-500" />,
                title: '50+ Jobs Scraped',
                subtitle: 'Real Indian listings today',
              },
              {
                icon: <Clock size={16} className="text-primary-600" />,
                title: '24-Hour TTL',
                subtitle: 'Zero stale or ghost jobs',
              },
              {
                icon: <Bot size={16} className="text-indigo-600" />,
                title: 'Gemini 3.1 ATS Engine',
                subtitle: 'Quantified bullet rewrites',
              },
              {
                icon: <ShieldCheck size={16} className="text-emerald-600" />,
                title: '100% Free Forever',
                subtitle: 'Built for students & freshers',
              },
            ].map(({ icon, title, subtitle }) => (
              <div
                key={title}
                className="bg-white/70 backdrop-blur-sm border border-neutral-200/60 rounded-xl p-3.5 flex items-center gap-3 text-left shadow-xs"
              >
                <div className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 leading-tight">{title}</p>
                  <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">{subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interactive Live Feature Sandbox (The WOW Piece) ── */}
      <section className="bg-neutral-900 text-white py-20 px-5 relative overflow-hidden">
        {/* Ambient background blur circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-950/80 border border-primary-800 text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Interactive Platform Sandbox
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Experience the core AI engines in action
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-xl mx-auto">
              Click through the tabs below to test our real-time India scraper, ATS diagnostic engine, and AI interview coach.
            </p>

            {/* Sandbox Tabs */}
            <div className="inline-flex items-center p-1 bg-neutral-800/80 rounded-xl border border-neutral-700/80 mt-8 gap-1">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'jobs'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Briefcase size={14} /> 1. Live India Job Matcher
              </button>
              <button
                onClick={() => setActiveTab('ats')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'ats'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText size={14} /> 2. Gemini ATS Scanner
              </button>
              <button
                onClick={() => setActiveTab('interview')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'interview'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Bot size={14} /> 3. AI Interview Coach
              </button>
            </div>
          </div>

          {/* Tab 1: Live Job Matcher Sandbox */}
          {activeTab === 'jobs' && (
            <div className="bg-neutral-800/90 border border-neutral-700 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-700/70 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="pulse-dot" />
                    <h3 className="text-base font-bold text-white">Live Job Match Feed (India Only)</h3>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Scraped via Playwright with 24-hour expiration · Showing automated candidate fit
                  </p>
                </div>
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 bg-neutral-900/80 p-1 rounded-lg border border-neutral-700 text-xs">
                  {['all', 'bengaluru', 'remote', 'fresh'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setJobFilter(f)}
                      className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                        jobFilter === f ? 'bg-primary-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Cards */}
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-neutral-900/90 border border-neutral-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary-500/50 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-bold text-white">{job.title}</span>
                        {job.fresh && (
                          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            NEW 24H
                          </span>
                        )}
                        <span className="text-[10px] font-medium bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full">
                          {job.source}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 flex items-center gap-2">
                        <span>{job.company}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {job.location}
                        </span>
                        <span>·</span>
                        <span className="text-amber-400 font-semibold">{job.salary}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        {job.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-medium bg-primary-950/80 text-primary-300 border border-primary-800/60 px-2 py-0.5 rounded-md"
                          >
                            ✓ {s}
                          </span>
                        ))}
                        <span className="text-[10px] font-medium bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded-md">
                          + Missing {job.missing}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-800">
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-400">{job.match}%</span>
                        <span className="text-[10px] text-neutral-400 block font-medium">Match Score</span>
                      </div>
                      <Link to="/register">
                        <Button size="xs" variant="primary" className="text-xs py-1 px-3">
                          Apply with 1-Click
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Gemini ATS Resume Scanner */}
          {activeTab === 'ats' && (
            <div className="bg-neutral-800/90 border border-neutral-700 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-neutral-700/70 mb-6">
                <div className="bg-neutral-900/90 border border-neutral-700 p-4 rounded-xl flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full border-4 border-primary-500 flex items-center justify-center shrink-0">
                    <span className="text-lg font-black text-white">82</span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">ATS Health Score</p>
                    <p className="text-sm font-bold text-white">Top 12% in India</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">Ready for Recruiter Screen</span>
                  </div>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-700 p-4 rounded-xl">
                  <p className="text-xs text-neutral-400 mb-1">Keywords Extracted</p>
                  <p className="text-xl font-bold text-white mb-1">14 Detected</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">React.js</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">Node.js</span>
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">REST API</span>
                  </div>
                </div>

                <div className="bg-neutral-900/90 border border-neutral-700 p-4 rounded-xl">
                  <p className="text-xs text-neutral-400 mb-1">Missing High-Impact Tags</p>
                  <p className="text-xl font-bold text-rose-400 mb-1">3 Critical Gaps</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">Docker</span>
                    <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">CI/CD</span>
                    <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">System Design</span>
                  </div>
                </div>
              </div>

              {/* Before & After Rewrite Demo */}
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Live Gemini 3.1 Rewrite Demonstration:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-900/80 border border-rose-900/50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold uppercase">
                      <XCircle size={14} /> Weak Resume Bullet (Before)
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                      "Built a job scraper using Playwright and saved data to database for users to view."
                    </p>
                    <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800">
                      ⚠️ Issue: Lacks measurable scope, passive verbs, zero production impact metrics.
                    </p>
                  </div>

                  <div className="bg-neutral-900/80 border border-emerald-800/60 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase">
                      <CheckCircle size={14} /> Gemini Quantified Rewrite (After)
                    </div>
                    <p className="text-xs text-emerald-200 leading-relaxed font-mono font-medium">
                      "Engineered an automated Playwright crawler indexing 500+ daily Indian job listings with 99% deduplication accuracy."
                    </p>
                    <p className="text-[11px] text-emerald-400/90 pt-2 border-t border-neutral-800 font-semibold">
                      ✓ Impact: Quantifies scale (500+ daily), highlights accuracy (99%), uses action verb (Engineered).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: AI Interview Coach */}
          {activeTab === 'interview' && (
            <div className="bg-neutral-800/90 border border-neutral-700 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-700">
                <div>
                  <span className="text-xs font-bold text-primary-400 uppercase tracking-wider">
                    Role: Full Stack Engineer (MERN)
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Automated Technical & Behavioral Interview Prep
                  </h3>
                </div>
                <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-full font-medium">
                  System Design & Concurrency
                </span>
              </div>

              <div className="bg-neutral-900/90 border border-neutral-700 p-5 rounded-xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-900/50 text-primary-400 font-bold flex items-center justify-center shrink-0 border border-primary-700">
                    Q1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white leading-snug">
                      "How would you design a distributed crawler to scrape hundreds of Indian job boards without triggering Cloudflare bot detection, and guarantee zero duplicates in MongoDB?"
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Targeted question generated based on your resume's backend scraper projects.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1.5"
                  >
                    {showHint ? 'Hide Answering Blueprint ▲' : 'Show Gemini Answering Blueprint ▼'}
                  </button>

                  {showHint && (
                    <div className="mt-3 p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-300 space-y-2 leading-relaxed animate-fade-in">
                      <p>
                        <strong>1. Bot Evasion:</strong> Discuss rotating user-agents, random delays, disabling webdriver navigator flags, and using stealth browser contexts.
                      </p>
                      <p>
                        <strong>2. Deduplication Strategy:</strong> Explain URL hashing (SHA-256) combined with compound unique MongoDB index on <code>(source, externalId)</code> with upsert.
                      </p>
                      <p>
                        <strong>3. TTL Expiry:</strong> Mention MongoDB 24h TTL index on <code>expiresAt</code> to keep memory lean.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── High-End Bento Grid Section ── */}
      <section className="bg-neutral-50/80 border-b border-neutral-200/80 py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-label">Engineered for Indian Tech Careers</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
              Why engineers choose CareerLens over stale boards
            </h2>
            <p className="text-sm text-neutral-500 mt-2.5">
              Built from scratch to eliminate dead job postings, blind ATS rejections, and disorganized applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: 2-col wide */}
            <div className="md:col-span-2 bento-card flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  <Zap size={20} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Playwright Multi-Board Scraper + 24-Hour TTL
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-xl">
                  Unlike traditional aggregators that show 6-month-old ghost listings, CareerLens crawls top Indian portals (Internshala, Indeed India, TimesJobs, Shine) every 6 hours and enforces an automatic 24-hour expiration rule. You only see active openings.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-6 border-t border-neutral-100">
                {[
                  { name: 'Internshala', status: 'Live Daily', color: 'text-sky-600' },
                  { name: 'Indeed India', status: 'Active Feed', color: 'text-blue-600' },
                  { name: 'TimesJobs', status: 'Scheduled', color: 'text-amber-600' },
                  { name: 'Shine.com', status: 'Scheduled', color: 'text-emerald-600' },
                ].map((s) => (
                  <div key={s.name} className="bg-neutral-50 rounded-lg p-2.5 text-left border border-neutral-200/60">
                    <p className="text-xs font-bold text-neutral-800">{s.name}</p>
                    <p className={`text-[10px] font-semibold ${s.color}`}>{s.status}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="bento-card flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Bot size={20} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Gemini 3.1 Flash ATS Diagnostic
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Real-time ATS parsing with structured JSON extraction. Discovers skills, assesses readability, and flags missing keywords before recruiters reject you.
                </p>
              </div>

              <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/60 mt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-neutral-700">Keyword Coverage</span>
                  <span className="text-primary-700">88%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full w-[88%]" />
                </div>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="bento-card flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <FolderKanban size={20} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  Application Kanban Pipeline
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Drag and drop applications across 6 stages: Saved → Applied → Phone Screen → Interview → Offer → Rejected. Never lose track of a follow-up.
                </p>
              </div>

              <div className="flex items-center gap-1.5 pt-4 text-xs font-semibold text-neutral-500">
                <span className="px-2 py-1 bg-neutral-100 rounded">Saved</span>
                <ChevronRight size={12} />
                <span className="px-2 py-1 bg-primary-50 text-primary-700 rounded">Interview</span>
                <ChevronRight size={12} />
                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded">Offer</span>
              </div>
            </div>

            {/* Bento Card 4: 2-col wide */}
            <div className="md:col-span-2 bento-card flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <BarChart2 size={20} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Indian Market Skill Demand Radar
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed max-w-xl">
                  Know what skills pay the highest and are in demand right now across Bengaluru, Hyderabad, Pune, and Delhi-NCR. Prioritize high-ROI frameworks that boost your interview call rate.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
                {['React.js', 'Node.js', 'TypeScript', 'Docker', 'AWS', 'Python', 'Next.js', 'RESTful APIs'].map(
                  (sk) => (
                    <span
                      key={sk}
                      className="text-xs font-semibold px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                    >
                      🔥 {sk} High Demand
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comparison Section: The Old Way vs CareerLens ── */}
      <section className="bg-white py-20 px-5 border-b border-neutral-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label">A Smarter Strategy</span>
            <h2 className="text-3xl font-extrabold text-neutral-900">
              Why blind applying on job boards fails
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-rose-800 flex items-center gap-2">
                <XCircle size={18} className="text-rose-600" /> The Traditional Way
              </h3>
              <ul className="space-y-3 text-xs text-neutral-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  Applying to 3-month old listings that have already been filled.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  Submitting resumes blindly without knowing ATS keyword match.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  Scattered applications in spreadsheets with missed interview dates.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  Generic bullet points without quantifiable engineering metrics.
                </li>
              </ul>
            </div>

            {/* The CareerLens Way */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" /> The CareerLens AI Advantage
              </h3>
              <ul className="space-y-3 text-xs text-neutral-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  Fresh Indian jobs with 24-hour TTL — you're among the first applicants.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  Instant ATS Score + missing keyword warning before submitting.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  Centralized Kanban tracker managing every phase of your job search.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  Gemini rewrites weak bullets into quantified business achievements.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Call to Action ── */}
      <section className="ambient-hero-bg py-24 px-5 relative">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold">
            <Sparkles size={13} /> Zero Cost · Ready in 30 Seconds
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-950 tracking-tight">
            Ready to land your dream role?
          </h2>
          <p className="text-neutral-600 text-base max-w-xl mx-auto">
            Join thousands of Indian engineering students and professionals using AI to accelerate their career search.
          </p>
          <div className="pt-2">
            <Link to="/register">
              <Button
                size="lg"
                variant="primary"
                icon={<ArrowRight size={18} />}
                iconPosition="right"
                className="shadow-xl shadow-primary-600/30 px-10 py-4 font-bold text-base"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-12 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-primary-600 flex items-center justify-center shadow-xs">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-extrabold text-neutral-900 text-sm tracking-tight">
              CareerLens<span className="text-primary-600">.ai</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 text-center sm:text-right">
            Designed for Indian engineers, students, and freshers. Automated Playwright Scrapers + Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
