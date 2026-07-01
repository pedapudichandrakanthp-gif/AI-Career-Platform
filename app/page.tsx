import Link from "next/link";
import { ArrowRight, BookOpen, Brain, FileText, Sparkles, Target } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative page-container max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
              <Sparkles size={16} />
              AI-Powered Government Exam Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display mb-6">
              Crack Government Exams with AI
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Your intelligent companion for government exam preparation. Get personalized study plans, eligibility checks, and AI-powered insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-all shadow-lg">
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link href="/jobs" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all backdrop-blur-sm">
                Browse Exams
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="page-container max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Comprehensive tools and resources to help you prepare for government exams efficiently.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Government Exams */}
          <div className="card p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
              <BookOpen size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Government Exams
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Browse and filter through thousands of government exams from SSC, Banking, Railway, UPSC, and State PSCs.
            </p>
            <Link href="/jobs" className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 hover:underline">
              Explore Exams
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* AI Eligibility */}
          <div className="card p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
              <Brain size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              AI Eligibility Check
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Instantly check your eligibility for any government exam based on age, qualification, category, and other criteria.
            </p>
            <Link href="/recommendations" className="text-purple-600 dark:text-purple-400 font-medium flex items-center gap-2 hover:underline">
              Check Eligibility
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Study Plans */}
          <div className="card p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <Target size={24} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Personalized Study Plans
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Get AI-generated study plans tailored to your exam type, available time, and preparation level.
            </p>
            <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
              Coming Soon
            </span>
          </div>

          {/* Previous Papers */}
          <div className="card p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
              <FileText size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Previous Year Papers
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Access previous year question papers with solutions to practice and understand exam patterns.
            </p>
            <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-2">
              Coming Soon
            </span>
          </div>

          {/* AI Exam Insights */}
          <div className="card p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-6">
              <Sparkles size={24} className="text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              AI Exam Insights
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Get AI-powered analysis of exam patterns, important topics, and recommended resources.
            </p>
            <Link href="/recommendations" className="text-pink-600 dark:text-pink-400 font-medium flex items-center gap-2 hover:underline">
              Get Insights
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Notifications */}
          <div className="card p-8 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
              <Sparkles size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              Smart Notifications
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Never miss important dates with automated notifications for exam deadlines, admit cards, and results.
            </p>
            <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-2 hover:underline">
              Enable Alerts
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="page-container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-display mb-6">
            Ready to Start Your Preparation?
          </h2>
          <p className="text-lg text-slate-300 mb-10">
            Join thousands of aspirants who are using AvsarGrid to crack their dream government exams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg">
              Create Free Account
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
