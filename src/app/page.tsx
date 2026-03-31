import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(circle at 60% 80%, rgba(245,158,11,0.08) 0%, transparent 50%)"
        }} />
        <div className="relative max-w-3xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-indigo-200 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-indigo-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Aggregating events from multiple sources
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
            Find events that fit{" "}
            <span className="gradient-text">your schedule</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-3 max-w-xl mx-auto">
            Block out nap times, filter by age group, and discover
            what&apos;s happening near you.
          </p>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Built for busy parents who need events that actually work
            with their family&apos;s routine.
          </p>

          <SearchBar />

          <p className="mt-4 text-xs text-slate-400">
            Try &ldquo;Bloomington&rdquo; to see sample events, or enter any city/zip
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Why Btown Events?</h2>
          <p className="text-slate-500">The features that make event searching actually useful for families.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">
              Block Out Times
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Kids nap 12&ndash;2pm? Block it out and only see events
              before or after. Add as many blocked windows as you need.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">
              Age-Appropriate
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Enter your child&apos;s age and we auto-select matching
              groups. Toddler storytime? Teen game night? We&apos;ve got it.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">
              All Sources, One Place
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              No more checking five different websites. We pull from
              university calendars, tourism sites, and community boards.
            </p>
          </div>
        </div>
      </section>

      {/* Example scenario */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-5 text-sm font-medium text-amber-700">
            Real-world example
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            &ldquo;My toddlers nap 12&ndash;2pm. What can we do this weekend?&rdquo;
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto mb-6 leading-relaxed">
            Search your area, block out 12&ndash;2pm, select &ldquo;Toddler&rdquo; age group,
            and instantly see storytime at 10am, playground playdate at 3pm, and
            family nature walk at 9am. No scrolling through adult-only wine tastings
            or events right during nap time.
          </p>
          <a href="/events?city=Bloomington" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
            Try it with sample events
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
