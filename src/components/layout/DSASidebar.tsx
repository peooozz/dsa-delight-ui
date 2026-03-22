import { useApp } from '@/context/AppContext';
import {
  LayoutGrid, Link2, Layers, AlignJustify,
  TreeDeciduous, Search, ArrowUpDown,
  Share2, Hash, BarChart3, Menu, X, Zap
} from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  array: LayoutGrid, linkedlist: Link2, stack: Layers, queue: AlignJustify,
  binarytree: TreeDeciduous, bst: Search, heap: ArrowUpDown,
  graph: Share2, hashtable: Hash, sorting: BarChart3,
};

const GROUPS = [
  { label: 'Linear', modules: ['array', 'stack'] },
  { label: 'Trees', modules: ['binarytree', 'bst', 'heap'] },
  { label: 'Advanced', modules: ['graph', 'hashtable', 'sorting'] },
];

export default function DSASidebar() {
  const { activeModule, setActiveModule, MODULE_META, sidebarOpen, setSidebarOpen, speed, setSpeed } = useApp();

  return (
    <>
      <button onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 z-50 p-2.5 rounded-xl bg-surface-med/80 backdrop-blur-md border border-border-faint text-text-white shadow-lg hover:bg-surface-high transition-colors">
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      <aside className={`fixed top-0 left-0 h-full z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} w-64 bg-surface-low/95 backdrop-blur-xl border-r border-border-faint flex flex-col`}>
        <div className="pt-20 px-4 pb-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6 px-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-display text-lg font-bold text-text-white tracking-tight">DSA Visualizer</span>
          </div>

          {GROUPS.map(g => (
            <div key={g.label} className="mb-4">
              <div className="text-[10px] font-display uppercase tracking-[0.2em] text-text-ghost px-3 mb-2">{g.label}</div>
              {g.modules.map(m => {
                const Icon = ICONS[m];
                const meta = MODULE_META[m];
                if (!meta) return null;
                const isActive = activeModule === m;
                return (
                  <button key={m} onClick={() => { setActiveModule(m); if (window.innerWidth < 768) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[13px] transition-all mb-0.5 ${isActive ? 'bg-primary/10 text-primary font-semibold shadow-[0_0_20px_rgba(108,140,255,0.08)]' : 'text-text-dim hover:text-text-white hover:bg-surface-high/50'}`}>
                    {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                    <span className="truncate">{meta.title}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border-faint">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-display uppercase tracking-[0.2em] text-text-ghost">Speed</span>
            <span className="text-[11px] font-mono text-primary">{((2100 - speed) / 600).toFixed(1)}x</span>
          </div>
          <input type="range" min="100" max="2000" value={2100 - speed} onChange={e => setSpeed(2100 - +e.target.value)}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-surface-highest
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer" />
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
