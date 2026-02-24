import React from 'react'

function App() {
  return (
    <div className="bg-white font-display text-slate-900">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-primary text-3xl">database</span>
            <h1 className="font-logo text-2xl text-primary tracking-tight">DataVault</h1>
          </div>
          {/* Header Search Bar (480px) */}
          <div className="hidden md:flex flex-1 max-w-[480px]">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                className="w-full bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Search statistics, data points..."
                type="text"
              />
            </div>
          </div>
          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 shrink-0">
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="#">Topics</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="#">Statistics</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="#">Reports</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors" href="#">Infographics</a>
          </nav>
          {/* Auth Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-primary transition-colors">Login</button>
            <button className="bg-accent-orange hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-orange-500/20">
              Get full access
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden bg-white border-b border-slate-100">
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-[100px] -ml-24 -mb-24"></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
              Find the statistics you need
            </h2>
            <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
              Access over 1.2 million statistics across 80,000 verified sources and 170 industry verticals.
            </p>
            {/* Large Search Bar */}
            <div className="flex flex-col md:flex-row gap-2 max-w-2xl mx-auto bg-white p-2 rounded-xl shadow-xl border border-slate-200">
              <div className="flex-1 flex items-center px-4">
                <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
                <input
                  className="w-full border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 py-3"
                  placeholder="What data are you looking for today?"
                  type="text"
                />
              </div>
              <button className="bg-accent-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold transition-all">
                Search
              </button>
            </div>
            {/* Topic Tags */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <span className="text-slate-500 text-sm font-medium pt-1">Popular:</span>
              <a className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors border border-slate-200" href="#">GDP Growth</a>
              <a className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors border border-slate-200" href="#">Inflation 2024</a>
              <a className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors border border-slate-200" href="#">E-commerce</a>
              <a className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors border border-slate-200" href="#">AI Trends</a>
              <a className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors border border-slate-200" href="#">Sustainability</a>
            </div>
          </div>
        </section>

        {/* Stats Ticker */}
        <div className="bg-white text-slate-900 py-4 overflow-hidden border-b border-slate-100">
          <div className="ticker-scroll flex items-center">
            {/* Set 1 */}
            <div className="flex items-center gap-12 px-6">
              {[
                { label: 'Statistics', value: '1.2M+' },
                { label: 'Verified Sources', value: '80k+' },
                { label: 'Industries', value: '170+' },
                { label: 'Forecasts', value: '450k+' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-primary font-black text-xl">{stat.value}</span>
                  <span className="text-slate-500 text-sm uppercase tracking-widest font-bold">{stat.label}</span>
                </div>
              ))}
            </div>
            {/* Set 2 (Duplicated for infinite scroll) */}
            <div className="flex items-center gap-12 px-6">
              {[
                { label: 'Statistics', value: '1.2M+' },
                { label: 'Verified Sources', value: '80k+' },
                { label: 'Industries', value: '170+' },
                { label: 'Forecasts', value: '450k+' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-primary font-black text-xl">{stat.value}</span>
                  <span className="text-slate-500 text-sm uppercase tracking-widest font-bold">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Statistics Section */}
        <section className="max-w-[1440px] mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 mb-2">Featured Statistics</h3>
              <p className="text-slate-500">Most relevant data points trending this week</p>
            </div>
            <a className="text-primary font-bold flex items-center gap-1 hover:underline" href="#">
              View all data <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Stat Card 1 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-1 rounded">Economy</span>
                <span className="flex items-center gap-1 bg-premium-gold/10 text-premium-gold text-[10px] font-bold uppercase px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[12px] fill-1">workspace_premium</span> Premium
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-6 group-hover:text-primary transition-colors">Global GDP growth projections for 2024 by region</h4>
              <div className="h-24 flex items-end gap-1 mb-6">
                <div className="flex-1 bg-primary/20 rounded-t h-[40%]"></div>
                <div className="flex-1 bg-primary/40 rounded-t h-[65%]"></div>
                <div className="flex-1 bg-primary rounded-t h-[90%]"></div>
                <div className="flex-1 bg-primary/60 rounded-t h-[50%]"></div>
                <div className="flex-1 bg-primary/30 rounded-t h-[35%]"></div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> May 2024</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">database</span> IMF & World Bank</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-1 rounded">Technology</span>
                <span className="flex items-center gap-1 bg-premium-gold/10 text-premium-gold text-[10px] font-bold uppercase px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[12px] fill-1">workspace_premium</span> Premium
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-6 group-hover:text-primary transition-colors">Generative AI market size worldwide 2023-2030</h4>
              <div className="h-24 flex items-center">
                <svg className="w-full h-full" viewBox="0 0 200 60">
                  <path d="M0,50 Q25,48 50,40 T100,25 T150,15 T200,5" fill="none" stroke="#003399" strokeLinecap="round" strokeWidth="3"></path>
                  <path d="M0,50 Q25,48 50,40 T100,25 T150,15 T200,5 L200,60 L0,60 Z" fill="url(#grad1)" opacity="0.1"></path>
                  <defs>
                    <linearGradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#003399", stopOpacity: 1 }}></stop>
                      <stop offset="100%" style={{ stopColor: "#003399", stopOpacity: 0 }}></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4 mt-6">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> June 2024</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">database</span> Gartner Analysis</span>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-1 rounded">Sustainability</span>
                <span className="flex items-center gap-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase px-2 py-1 rounded">
                  Free
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-6 group-hover:text-primary transition-colors">Global share of renewable energy in total capacity</h4>
              <div className="h-24 flex items-center justify-center">
                <svg className="w-24 h-24" viewBox="0 0 36 36">
                  <path className="text-slate-200 stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
                  <path className="text-primary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3"></path>
                  <text className="text-[8px] font-black text-primary fill-current" textAnchor="middle" x="18" y="20.35">75%</text>
                </svg>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-4 mt-6">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> April 2024</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">database</span> IRENA Stats</span>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Topics Section */}
        <section className="bg-slate-50 py-20">
          <div className="max-w-[1440px] mx-auto px-6">
            <h3 className="text-3xl font-black text-slate-900 mb-12 text-center">Explore Popular Topics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { label: 'Economy', icon: 'payments' },
                { label: 'Technology', icon: 'memory' },
                { label: 'Health', icon: 'health_and_safety' },
                { label: 'Society', icon: 'groups' },
                { label: 'Environment', icon: 'eco' },
                { label: 'Commerce', icon: 'shopping_cart' },
              ].map((topic, i) => (
                <a key={topic.label} className="flex flex-col items-center p-6 bg-white rounded-xl hover:shadow-lg transition-all group border border-slate-200" href="#">
                  <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors text-3xl">{topic.icon}</span>
                  </div>
                  <span className="font-bold text-slate-800">{topic.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Latest Reports Section */}
        <section className="max-w-[1440px] mx-auto px-6 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 mb-2">Latest Industry Reports</h3>
              <p className="text-slate-500">Comprehensive analysis from leading research firms</p>
            </div>
            <a className="text-primary font-bold flex items-center gap-1 hover:underline" href="#">
              Browse all reports <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Global Retail Forecast 2025', desc: 'Digital Commerce Trends: A Global Outlook 2024-2025', icon: 'analytics', pages: 142 },
              { title: 'State of the Cloud Industry', desc: 'Enterprise Cloud Infrastructure & SaaS Spending Report', icon: 'cloud', pages: 89 },
              { title: 'Automation Index 2024', desc: 'Industrial Automation: Robotics & AI Integration Roadmap', icon: 'precision_manufacturing', pages: 215 },
              { title: 'EV Adoption Statistics', desc: 'Global Electric Vehicle Market Infrastructure & Policy 2024', icon: 'electric_car', pages: 56 },
            ].map((report, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-lg bg-slate-100 mb-4 overflow-hidden relative shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                    <p className="text-white text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">PDF • {report.pages} Pages</p>
                    <button className="bg-primary text-white text-xs font-bold py-2 rounded-md scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">Quick Preview</button>
                  </div>
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-primary to-blue-800">
                    <span className="material-symbols-outlined text-5xl text-white/20 mb-4">{report.icon}</span>
                    <div className="h-1 w-12 bg-accent-orange mb-4"></div>
                    <p className="text-white font-black leading-tight">{report.title}</p>
                  </div>
                </div>
                <h5 className="font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">{report.desc}</h5>
              </div>
            ))}
          </div>
        </section>

        {/* Premium CTA Section */}
        <section className="max-w-[1440px] mx-auto px-6 mb-20">
          <div className="bg-primary rounded-2xl p-12 relative overflow-hidden text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
              <svg height="100%" width="100%">
                <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"></path>
                </pattern>
                <rect fill="url(#grid)" height="100%" width="100%"></rect>
              </svg>
            </div>
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-4xl font-black text-white mb-6">Get unlimited access to all verified data</h3>
              <p className="text-blue-100 text-lg mb-8">
                Join 2.5 million professionals using DataVault to make better business decisions.
                Unlock forecasting tools, source downloads, and custom infographics.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button className="bg-accent-orange hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-orange-500/30">
                  Start free trial
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-xl font-black text-lg transition-all border border-white/30 backdrop-blur-sm">
                  View Pricing
                </button>
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              {[
                { value: '1M+', label: 'Charts' },
                { value: 'XLS', label: 'Downloads' },
                { value: 'API', label: 'Access' },
                { value: '24/7', label: 'Support' },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                  <p className="text-white font-black text-2xl mb-1">{item.value}</p>
                  <p className="text-blue-200 text-xs uppercase font-bold tracking-widest">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">database</span>
                <h4 className="font-logo text-xl text-primary">DataVault</h4>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                The world's most comprehensive platform for verified market intelligence and industrial statistics.
              </p>
              <div className="flex gap-4">
                <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
                <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">mail</span></a>
                <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h5 className="font-bold text-slate-900 mb-4">Platform</h5>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a className="hover:text-primary" href="#">Statistics Search</a></li>
                  <li><a className="hover:text-primary" href="#">Global Reports</a></li>
                  <li><a className="hover:text-primary" href="#">Forecasts</a></li>
                  <li><a className="hover:text-primary" href="#">Infographics</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-slate-900 mb-4">Company</h5>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a className="hover:text-primary" href="#">About Us</a></li>
                  <li><a className="hover:text-primary" href="#">Methodology</a></li>
                  <li><a className="hover:text-primary" href="#">Careers</a></li>
                  <li><a className="hover:text-primary" href="#">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-slate-900 mb-4">Legal</h5>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a className="hover:text-primary" href="#">Terms of Service</a></li>
                  <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
                  <li><a className="hover:text-primary" href="#">License Info</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 text-center text-xs text-slate-400">
            © 2024 DataVault Intelligence Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
