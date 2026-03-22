import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Activity, BookOpen, BookOpenText, Code2, SkipForward, ChevronDown } from 'lucide-react';

export default function InfoPanel() {
  const [tab, setTab] = useState('log');
  const [open, setOpen] = useState(false);
  const { logs, complexity, pseudocode, theory, stepMode, setStepMode, nextStep } = useApp();

  const tabs = [
    { id: 'log', label: 'Log', icon: Activity },
    { id: 'complexity', label: 'Complexity', icon: BookOpen },
    { id: 'pseudocode', label: 'Code', icon: Code2 },
    { id: 'theory', label: 'Theory', icon: BookOpenText },
  ];

  return (
    <div className="border-t border-border-faint bg-surface-low/50 flex-shrink-0">
      <div className="flex items-center justify-between px-2">
        <div className="flex">
          {tabs.map(t => {
            const I = t.icon;
            return (
              <button key={t.id} onClick={() => { setTab(t.id); if (!open) setOpen(true); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-display uppercase tracking-wider font-semibold relative transition-colors
                ${tab === t.id ? 'text-primary' : 'text-text-ghost hover:text-text-dim'}`}>
                <I className="w-3.5 h-3.5" />{t.label}
                {tab === t.id && open && <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 pr-2">
          <button onClick={() => setStepMode(!stepMode)}
            className={`pill-btn text-[10px] py-1.5 px-3 uppercase font-display tracking-wider ${stepMode ? 'pill-secondary' : 'pill-ghost'}`}>
            <SkipForward className="w-3 h-3" />Step
          </button>
          {stepMode && (
            <button onClick={nextStep} className="pill-btn pill-primary text-[10px] py-1.5 px-3 uppercase font-display tracking-wider">Next</button>
          )}
          <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg text-text-ghost hover:text-text-white hover:bg-surface-high/50 transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
      {open && (
        <div className="max-h-40 overflow-auto px-4 pb-3">
          {tab === 'log' && <LogView logs={logs} />}
          {tab === 'complexity' && <CxView rows={complexity} />}
          {tab === 'pseudocode' && <CodeView text={pseudocode} />}
          {tab === 'theory' && <TheoryView text={theory} />}
        </div>
      )}
    </div>
  );
}

function LogView({ logs }: { logs: { msg: string; type: string; id: number }[] }) {
  if (!logs.length) return <p className="text-[12px] text-text-ghost py-2">Run an operation to see logs…</p>;
  return (
    <div className="flex flex-col-reverse gap-1">
      {logs.map(e => (
        <div key={e.id} className={`text-[11px] font-mono py-1 px-2 rounded ${e.type === 'success' ? 'text-green' : e.type === 'error' ? 'text-red' : e.type === 'warn' ? 'text-yellow' : 'text-text-light'}`}>
          {e.msg}
        </div>
      ))}
    </div>
  );
}

function CxView({ rows }: { rows: string[][] }) {
  if (!rows.length) return <p className="text-[12px] text-text-ghost py-2">Select a module…</p>;
  const cx = (v: string) => {
    if (/O\(1\)/.test(v) && !/n/.test(v)) return 'cx-good';
    if (/log/.test(v)) return 'cx-ok';
    if (/n²|n\)/.test(v)) return 'cx-bad';
    return 'text-text-white bg-surface-lowest border border-border-faint';
  };
  return (
    <table className="w-full text-[11px] font-mono">
      <thead><tr className="text-text-ghost"><th className="text-left py-1 px-2">Operation</th><th className="text-left py-1 px-2">Time</th><th className="text-left py-1 px-2">Space</th></tr></thead>
      <tbody>
        {rows.map(([o, t, s], i) => (
          <tr key={i}><td className="py-1 px-2 text-text-light">{o}</td><td className={`py-1 px-2 rounded ${cx(t)}`}>{t}</td><td className={`py-1 px-2 rounded ${cx(s)}`}>{s}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

function CodeView({ text }: { text: string }) {
  if (!text) return <p className="text-[12px] text-text-ghost py-2">Select a module…</p>;
  return <pre className="text-[11px] font-mono text-text-light whitespace-pre-wrap leading-relaxed py-2">{text}</pre>;
}

function TheoryView({ text }: { text: string }) {
  if (!text) return <p className="text-[12px] text-text-ghost py-2">Select a module to see its theory…</p>;
  const lines = text.split('\n');
  return (
    <div className="py-2 space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith('## ')) return <h3 key={i} className="text-[14px] font-display font-bold text-text-white mt-3 mb-1">{trimmed.slice(3)}</h3>;
        if (trimmed.startsWith('### ')) return <h4 key={i} className="text-[12px] font-display font-semibold text-primary mt-2 mb-1">{trimmed.slice(4)}</h4>;
        if (trimmed.startsWith('| ')) {
          const cells = trimmed.split('|').filter(c => c.trim()).map(c => c.trim());
          if (cells.every(c => /^[-:]+$/.test(c))) return null;
          const isHeader = i + 1 < lines.length && /^\|[\s-:|]+\|$/.test(lines[i + 1]?.trim() || '');
          return (
            <div key={i} className={`flex gap-4 px-2 py-1 rounded text-[11px] font-mono ${isHeader ? 'text-text-ghost font-semibold border-b border-border-faint' : 'text-text-light'}`}>
              {cells.map((c, ci) => <span key={ci} className="flex-1">{c.replace(/\*\*/g, '')}</span>)}
            </div>
          );
        }
        if (trimmed.startsWith('- ')) return <p key={i} className="text-[11px] text-text-light leading-relaxed pl-3 before:content-['•'] before:text-primary before:mr-2">{trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, '$1')}</p>;
        if (trimmed.startsWith('```')) return null;
        if (trimmed.startsWith('`') && trimmed.endsWith('`')) return <pre key={i} className="text-[10px] font-mono text-accent bg-surface-med/50 rounded px-2 py-1">{trimmed.slice(1, -1)}</pre>;
        return <p key={i} className="text-[11px] text-text-dim leading-relaxed">{trimmed.replace(/\*\*([^*]+)\*\*/g, '$1')}</p>;
      })}
    </div>
  );
}
