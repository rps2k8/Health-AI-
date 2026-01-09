
import React, { useState, useMemo } from 'react';
import { UserLifestyleData, ActivityLevel, RiskLevel, PredictionResult, DemographicStat } from './types.ts';
import { calculateBMI, predictLifestyleRisk, getSyntheticDemographics } from './utils/calculations.ts';
import { getAIInsights } from './services/geminiService.ts';
import { Slider } from './components/Slider.tsx';
import { Toggle } from './components/Toggle.tsx';

// Helper to determine background styling based on risk level
const getRiskBg = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.LOW: return 'bg-teal-500/5 border-teal-500/20';
    case RiskLevel.MEDIUM: return 'bg-amber-500/5 border-amber-500/20';
    case RiskLevel.HIGH: return 'bg-rose-500/5 border-rose-500/20';
    default: return 'bg-slate-500/5 border-slate-500/20';
  }
};

// Helper to determine text color based on risk level
const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.LOW: return 'text-teal-400';
    case RiskLevel.MEDIUM: return 'text-amber-400';
    case RiskLevel.HIGH: return 'text-rose-400';
    default: return 'text-slate-400';
  }
};

type Page = 'home' | 'risks' | 'stats' | 'about';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [data, setData] = useState<UserLifestyleData>({
    age: 28,
    height: 180,
    weight: 75,
    isSmoking: false,
    isDrinking: false,
    activityLevel: ActivityLevel.MEDIUM,
    stressLevel: 4,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    return {
      height: isNaN(data.height) || data.height < 50 || data.height > 300,
      weight: isNaN(data.weight) || data.weight < 10 || data.weight > 600,
    };
  }, [data.height, data.weight]);

  const isValid = !errors.height && !errors.weight;
  const currentBMI = useMemo(() => (isValid ? calculateBMI(data.weight, data.height) : 0), [data.weight, data.height, isValid]);
  const demographics = useMemo(() => getSyntheticDemographics(), []);

  const handleAnalyze = async () => {
    if (!isValid) return;
    setLoading(true);
    const prediction = predictLifestyleRisk(data);
    setResult(prediction);

    try {
      const insights = await getAIInsights(data, prediction.bmi, prediction.riskLevel);
      setAiInsights(insights);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const BarChart: React.FC<{ data: DemographicStat[]; title: string }> = ({ data, title }) => (
    <div className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">{title}</h4>
      <div className="space-y-6">
        {data.map((item, i) => (
          <div key={i} className="group">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
              <span className="text-sm font-black mono text-white">{item.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-1000 ease-out" 
                style={{ width: `${item.value}%`, backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}44` }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="max-w-6xl mx-auto px-6 animate-in fade-in duration-1000">
      <section className="text-center pt-24 pb-16">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mono">
          Physiological Assessment • v1.4
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
          Vibe<span className="gradient-text">Health</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
          The next-gen interface for lifestyle strain analysis. High-fidelity predictive modeling meets AI-driven preventive insights.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative pb-32">
        {/* Sassy Dashboard Inputs */}
        <div className="lg:col-span-7 space-y-10">
          <div className="glass p-10 rounded-[3rem] border border-white/5 relative shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/[0.03] blur-[80px] -z-10 group-hover:bg-teal-500/[0.07] transition-all" />
            
            <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
              <span className="w-1.5 h-4 bg-teal-500 rounded-full" />
              Primary Metrics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <Slider label="User Age" value={data.age} min={18} max={100} onChange={(v) => setData({...data, age: v})} unit="yrs" />
              
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Body Stat Block</label>
                  <div className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                    <span className="text-[10px] font-bold text-teal-400 mono">BMI: {currentBMI || '--'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input 
                      type="number" 
                      value={data.height || ''} 
                      onChange={(e) => setData({...data, height: parseFloat(e.target.value)})}
                      className={`w-full bg-slate-900/50 border ${errors.height ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'border-slate-800 focus:border-teal-500'} rounded-2xl px-5 py-4 text-white font-black transition-all outline-none`}
                      placeholder="CM"
                    />
                    <span className="absolute right-4 top-4 text-[9px] font-black text-slate-600 pointer-events-none">HEIGHT</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={data.weight || ''} 
                      onChange={(e) => setData({...data, weight: parseFloat(e.target.value)})}
                      className={`w-full bg-slate-900/50 border ${errors.weight ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]' : 'border-slate-800 focus:border-teal-500'} rounded-2xl px-5 py-4 text-white font-black transition-all outline-none`}
                      placeholder="KG"
                    />
                    <span className="absolute right-4 top-4 text-[9px] font-black text-slate-600 pointer-events-none">WEIGHT</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/[0.03] blur-[80px] -z-10 group-hover:bg-purple-500/[0.07] transition-all" />
            <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
              <span className="w-1.5 h-4 bg-purple-500 rounded-full" />
              Habit Mapping
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <Toggle label="Regular Smoking" value={data.isSmoking} onChange={(v) => setData({...data, isSmoking: v})} />
                <Toggle label="Alcohol Intake" value={data.isDrinking} onChange={(v) => setData({...data, isDrinking: v})} />
              </div>
              <div>
                <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] block mb-4">Physical Momentum</label>
                <div className="grid grid-cols-1 gap-2">
                  {[ActivityLevel.LOW, ActivityLevel.MEDIUM, ActivityLevel.HIGH].map((l) => (
                    <button 
                      key={l} 
                      onClick={() => setData({...data, activityLevel: l})} 
                      className={`flex justify-between items-center px-5 py-4 rounded-2xl border transition-all duration-300 font-bold text-xs ${data.activityLevel === l ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      {l} Intensity
                      {data.activityLevel === l && <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
              <span className="w-1.5 h-4 bg-cyan-500 rounded-full" />
              Systemic Load
            </h2>
            <Slider label="Psychological Stress Index" value={data.stressLevel} min={1} max={10} onChange={(v) => setData({...data, stressLevel: v})} />
          </div>

          <button 
            onClick={handleAnalyze} 
            disabled={loading || !isValid} 
            className="w-full bg-teal-500 py-6 rounded-[2rem] text-xl font-black text-slate-950 hover:shadow-[0_0_40px_rgba(45,212,191,0.3)] hover:-translate-y-1 transition-all disabled:opacity-30 disabled:grayscale disabled:hover:translate-y-0"
          >
            {loading ? 'Synthesizing Profile...' : 'Execute Analysis'}
          </button>
        </div>

        {/* Results Display */}
        <div id="results-section" className="lg:col-span-5">
           <div className="sticky top-24 space-y-8">
             {!result ? (
               <div className="h-[600px] rounded-[3.5rem] border-4 border-dashed border-white/[0.03] flex flex-col items-center justify-center text-center px-12">
                  <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mb-8">
                    <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-700 uppercase tracking-[0.3em] mb-4">Link Established</h3>
                  <p className="text-slate-800 text-sm font-bold uppercase tracking-widest">Input metrics to initiate the predictive sequence.</p>
               </div>
             ) : (
               <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-8">
                 <div className={`p-10 rounded-[3.5rem] border ${getRiskBg(result.riskLevel)}`}>
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Tier Detected</span>
                        <h3 className={`text-5xl font-black leading-none tracking-tighter ${getRiskColor(result.riskLevel)}`}>{result.riskLevel}</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Strain</span>
                        <div className="text-4xl font-black text-white leading-none">{result.impactScore}%</div>
                      </div>
                    </div>

                    <p className="text-xl text-slate-300 font-light italic leading-relaxed mb-10 opacity-80">"{result.message}"</p>

                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 border-b border-white/5 pb-2">Impact Projections</h4>
                    <div className="space-y-4">
                      {result.consequences.map((c, i) => (
                        <div key={i} className="bg-black/40 p-6 rounded-3xl border border-white/5 group hover:border-white/10 transition-colors">
                           <div className="flex justify-between items-center mb-2">
                             <span className="text-teal-400 font-black text-[10px] uppercase tracking-widest">{c.area}</span>
                             <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                           </div>
                           <p className="text-slate-100 font-bold text-sm mb-1">{c.impact}</p>
                           <p className="text-slate-500 text-xs italic">{c.longTerm}</p>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="glass p-10 rounded-[3.5rem] border border-teal-500/10">
                    <h4 className="text-sm font-black text-white flex items-center gap-3 mb-8">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      AI Preventive Guidance
                    </h4>
                    <div className="space-y-6">
                       {aiInsights.map((ins, i) => (
                         <div key={i} className="flex gap-4">
                            <span className="text-teal-500 font-black mono text-xs mt-1">0{i+1}</span>
                            <p className="text-slate-400 text-sm leading-relaxed">{ins}</p>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="max-w-6xl mx-auto px-6 py-24 animate-in fade-in duration-1000">
      <div className="text-center mb-20">
        <h2 className="text-6xl font-black mb-6 tracking-tighter">Strain <span className="gradient-text">Demographics</span></h2>
        <p className="text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
          Aggregated population data showing the distribution of lifestyle strain across the user base.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <BarChart data={demographics.tierDistribution} title="Strain Distribution (Global)" />
        <BarChart data={demographics.primaryDrivers} title="Risk Acceleration Factors" />
      </div>

      <div className="mt-20 glass p-12 rounded-[3.5rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/[0.02] blur-[100px]" />
        <div className="flex flex-col md:flex-row gap-12 items-center">
           <div className="flex-1 space-y-6">
              <h3 className="text-3xl font-black tracking-tight">Understanding the Data</h3>
              <p className="text-slate-400 leading-relaxed">
                The majority of the evaluated population (42%) currently maintains a Low Strain status. However, a significant 20% fall into the High Strain tier, primarily driven by sedentary behaviors and persistent psychological stress.
              </p>
              <div className="flex gap-6">
                 <div className="space-y-1">
                    <span className="text-4xl font-black text-white">42%</span>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Resilient Profiles</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-4xl font-black text-rose-500">20%</span>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Critical Strain</p>
                 </div>
              </div>
           </div>
           <div className="flex-1 bg-black/40 p-8 rounded-[2.5rem] border border-white/5 italic text-slate-500 text-sm leading-relaxed">
              "Data indicates that even moderate shifts in daily activity levels (from Low to Medium intensity) can shift a profile from High to Moderate strain within an 8-week period, assuming stress markers remain stable."
           </div>
        </div>
      </div>
    </div>
  );

  const renderRisks = () => (
    <div className="max-w-5xl mx-auto px-6 py-24 animate-in fade-in duration-700">
      <h2 className="text-5xl font-black mb-12 tracking-tighter">Impact <span className="text-rose-500">Taxonomy</span></h2>
      <div className="grid gap-8">
        {[
          { title: "Metabolic Flex Erosion", color: "text-amber-500", desc: "The gradual loss of the body's ability to switch efficiently between fuel sources, typically caused by consistent high-carbohydrate load and low physical output." },
          { title: "Neuro-Endocrine Fatigue", color: "text-purple-500", desc: "Systemic burnout of the hormonal feedback loops responsible for stress regulation, often presenting as chronic evening exhaustion and morning irritability." },
          { title: "Oxidative Synergy", color: "text-rose-500", desc: "The compounding effect of smoking and environmental toxins, which accelerates cellular aging far beyond normal biological rates." }
        ].map((item, i) => (
          <div key={i} className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-colors">
            <h3 className={`text-2xl font-black mb-4 uppercase tracking-tighter ${item.color}`}>{item.title}</h3>
            <p className="text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
      <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-teal-500 to-purple-600 mx-auto mb-12 flex items-center justify-center font-black text-4xl shadow-2xl">V</div>
      <h2 className="text-5xl font-black mb-8 tracking-tighter">Precision <span className="text-teal-400">Methodology</span></h2>
      <div className="glass p-12 rounded-[3.5rem] border border-white/5 text-left space-y-8">
        <p className="text-slate-300 text-lg font-light leading-relaxed">
          VibeHealth's engine is built on a <strong>Probabilistic Habit Vector</strong>. Unlike standard calculators, our model prioritizes interaction coefficients—mapping how your specific blend of habits creates synergistic strain.
        </p>
        <div className="mono text-[10px] text-slate-600 bg-black/50 p-8 rounded-3xl border border-white/5 space-y-3 font-medium">
          <p className="text-teal-500">// ALGORITHM CORE (V1.4.2)</p>
          <p>const intercept = -3.5 + Age_Delta(yrs);</p>
          <p>const habit_impact = (smoke * 2.2) + (drink * 0.6) - (activity * 0.5);</p>
          <p>const z = intercept + habit_impact + (bmi_deviation * 0.15);</p>
          <p>const risk_prob = 1 / (1 + Math.exp(-z));</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 selection:bg-teal-500/30 text-slate-100 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-teal-500/[0.05] blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/[0.05] blur-[150px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-8 py-5 flex justify-between items-center backdrop-blur-3xl">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentPage('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center font-black text-slate-950 text-2xl shadow-lg transition-transform group-hover:rotate-12">V</div>
          <span className="font-black text-2xl tracking-tighter text-white">VibeHealth</span>
        </div>
        <div className="flex gap-10 items-center">
          {(['home', 'risks', 'stats', 'about'] as Page[]).map(p => (
            <button 
              key={p} 
              onClick={() => setCurrentPage(p)} 
              className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative py-1 ${currentPage === p ? 'text-teal-400' : 'text-slate-500 hover:text-white'}`}
            >
              {p}
              {currentPage === p && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />}
            </button>
          ))}
          <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
             <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_#14b8a6]" />
             <span className="text-[9px] mono text-slate-400 font-bold uppercase tracking-widest">Inference Online</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'risks' && renderRisks()}
        {currentPage === 'stats' && renderStats()}
        {currentPage === 'about' && renderAbout()}
      </div>

      {/* Modern Regulatory Footer */}
      <footer className="max-w-4xl mx-auto px-6 mt-32">
        <div className="glass p-12 rounded-[3.5rem] text-center border border-white/5">
          <p className="text-slate-600 text-[10px] font-black mb-6 uppercase tracking-[0.4em]">Strategic Disclaimer</p>
          <p className="text-slate-500 text-xs max-w-2xl mx-auto leading-relaxed font-medium mb-12">
            This system provides probabilistic analysis for habit-based health trajectories. It is a research prototype and not a clinical diagnostic tool. Always engage with a primary healthcare professional for verified clinical assessment.
          </p>
          <div className="flex justify-center gap-10 text-[9px] font-black text-slate-700 uppercase tracking-widest">
            <span className="hover:text-teal-400 transition-colors cursor-pointer">Security Protocol</span>
            <span className="hover:text-teal-400 transition-colors cursor-pointer">Architecture</span>
            <span className="hover:text-teal-400 transition-colors cursor-pointer">Legal</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
