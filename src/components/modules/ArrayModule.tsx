import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Trash2, Search, ArrowUpDown, Shuffle, RotateCcw } from 'lucide-react';

export default function ArrayModule() {
  const { speed, addLog, setComplexity, setPseudocode, stepMode, waitForStep } = useApp();
  const [arr, setArr] = useState([38, 27, 43, 3, 9, 82, 10]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [idx, setIdx] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Access','O(1)','O(1)'],['Search','O(n)','O(1)'],['Insert','O(n)','O(n)'],['Delete','O(n)','O(n)'],['Sort','O(n log n)','O(log n)']]);
    setPseudocode(`// Insert at index\nfor i = n downto idx+1:\n  arr[i] = arr[i-1] ← shift right\narr[idx] = value\n\n// Linear Search\nfor i = 0 to n-1:\n  if arr[i] == target: return i\nreturn -1`);
  }, [setComplexity, setPseudocode]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const insert = async () => {
    const v = parseInt(val); let i = parseInt(idx);
    if (isNaN(v)) { addLog('Enter a number', 'warn'); return; }
    if (isNaN(i) || i < 0 || i > arr.length) i = arr.length;
    setBusy(true); addLog(`Insert ${v} at [${i}]`, 'success');
    for (let k = arr.length; k > i; k--) { setHl({ [k]: 'shift', [k - 1]: 'active' }); await wait(); }
    setHl({ [i]: 'found' });
    setArr(a => { const c = [...a]; c.splice(i, 0, v); return c; });
    await wait(); setHl({}); setBusy(false); setVal(''); setIdx('');
  };

  const remove = async () => {
    const i = parseInt(idx);
    if (isNaN(i) || i < 0 || i >= arr.length) { addLog('Invalid index', 'warn'); return; }
    setBusy(true); addLog(`Delete [${i}]`, 'warn');
    setHl({ [i]: 'active' }); await wait();
    for (let k = i; k < arr.length - 1; k++) { setHl({ [k]: 'shift', [k + 1]: 'active' }); await wait(); }
    setArr(a => a.filter((_, j) => j !== i)); setHl({}); setBusy(false); setIdx('');
  };

  const search = async () => {
    const v = parseInt(val);
    if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); addLog(`Searching for ${v}…`);
    for (let i = 0; i < arr.length; i++) {
      setHl({ [i]: 'active' }); await wait();
      if (arr[i] === v) { setHl({ [i]: 'found' }); addLog(`Found at [${i}]`, 'success'); await sleep(1200); setHl({}); setBusy(false); return; }
    }
    addLog('Not found', 'error'); setHl({}); setBusy(false);
  };

  const sort = async () => {
    setBusy(true); addLog('Bubble Sort…');
    const a = [...arr], n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setHl({ [j]: 'compare', [j + 1]: 'compare' }); await wait();
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setHl({ [j]: 'active', [j + 1]: 'active' }); setArr([...a]); await wait();
        }
      }
    }
    const d: Record<number, string> = {};
    for (let i = 0; i < n; i++) d[i] = 'sorted';
    setHl(d); addLog('Sorted!', 'success'); await sleep(1200); setHl({}); setBusy(false);
  };

  const barColor = (s?: string) => {
    if (s === 'active') return 'bg-gradient-to-t from-blue/80 to-blue shadow-[0_-4px_20px_rgba(108,140,255,0.25)]';
    if (s === 'compare') return 'bg-gradient-to-t from-yellow/70 to-yellow shadow-[0_-4px_20px_rgba(251,191,36,0.2)]';
    if (s === 'found') return 'bg-gradient-to-t from-green/70 to-green shadow-[0_-4px_24px_rgba(74,222,128,0.3)]';
    if (s === 'sorted') return 'bg-gradient-to-t from-cyan/60 to-cyan shadow-[0_-4px_16px_rgba(34,211,238,0.15)]';
    if (s === 'shift') return 'bg-gradient-to-t from-purple/70 to-purple shadow-[0_-4px_16px_rgba(167,139,250,0.2)]';
    return 'bg-gradient-to-t from-surface-high/80 to-surface-med/80 border border-border-faint';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-20" />
        <input placeholder="Index" value={idx} onChange={e => setIdx(e.target.value)} disabled={busy} className="input-field w-20" />
        <button onClick={insert} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Insert</button>
        <button onClick={remove} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><Trash2 className="w-3.5 h-3.5" />Delete</button>
        <button onClick={search} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Search className="w-3.5 h-3.5" />Search</button>
        <button onClick={sort} disabled={busy} className="pill-btn pill-orange text-[12px] py-2 px-3"><ArrowUpDown className="w-3.5 h-3.5" />Sort</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setArr(Array.from({ length: randInt(5, 12) }, () => randInt(1, 99))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setArr([38, 27, 43, 3, 9, 82, 10]); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>
      <div className="flex-1 flex items-end justify-center gap-2 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-hidden">
        {arr.map((v, i) => (
          <div key={`${i}-${v}`} className="flex flex-col items-center gap-1.5 anim-pop-in" style={{ animationDelay: `${i * 30}ms` }}>
            <div className={`viz-bar w-10 rounded-t-lg transition-all ${barColor(hl[i])}`} style={{ height: `${Math.max(v * 2.5, 20)}px` }}>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-mono text-text-light font-semibold">{v}</span>
            </div>
            <span className="text-[10px] text-text-ghost font-mono">{i}</span>
          </div>
        ))}
        {!arr.length && <span className="text-text-ghost text-sm font-display">Empty</span>}
      </div>
    </div>
  );
}
