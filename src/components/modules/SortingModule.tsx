import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Play, Shuffle, RotateCcw } from 'lucide-react';

const ALGOS = ['Bubble', 'Insertion', 'Merge', 'Quick'] as const;

export default function SortingModule() {
  const { speed, addLog, setComplexity, setPseudocode, stepMode, waitForStep } = useApp();
  const [arr, setArr] = useState(() => Array.from({ length: 24 }, () => randInt(5, 95)));
  const [hl, setHl] = useState<Record<number, string>>({});
  const [algo, setAlgo] = useState<string>('Bubble');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const cx: Record<string, string[][]> = {
      Bubble: [['Best','O(n)','O(1)'],['Avg','O(n²)','O(1)'],['Worst','O(n²)','O(1)']],
      Insertion: [['Best','O(n)','O(1)'],['Avg','O(n²)','O(1)'],['Worst','O(n²)','O(1)']],
      Merge: [['Best','O(n log n)','O(n)'],['Avg','O(n log n)','O(n)'],['Worst','O(n log n)','O(n)']],
      Quick: [['Best','O(n log n)','O(log n)'],['Avg','O(n log n)','O(log n)'],['Worst','O(n²)','O(n)']],
    };
    setComplexity(cx[algo]);
    const ps: Record<string, string> = {
      Bubble: `for i = 0 to n-1:\n  for j = 0 to n-i-2:\n    if arr[j] > arr[j+1]: swap`,
      Insertion: `for i = 1 to n-1:\n  key = arr[i]; j = i-1\n  while j >= 0 and arr[j] > key:\n    shift right; j--\n  arr[j+1] = key`,
      Merge: `MERGE-SORT(l, r):\n  if l < r:\n    mid = (l+r)/2\n    SORT(l, mid); SORT(mid+1, r)\n    MERGE(l, mid, r)`,
      Quick: `QUICK-SORT(lo, hi):\n  if lo < hi:\n    pi = PARTITION(lo, hi)\n    SORT(lo, pi-1)\n    SORT(pi+1, hi)`,
    };
    setPseudocode(ps[algo]);
  }, [algo, setComplexity, setPseudocode]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const done = (n: number) => {
    const s: Record<number, string> = {};
    for (let i = 0; i < n; i++) s[i] = 'sorted';
    setHl(s);
  };

  const bubble = async () => {
    const a = [...arr], n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setHl({ [j]: 'compare', [j + 1]: 'compare' }); await wait();
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          setHl({ [j]: 'swap', [j + 1]: 'swap' }); setArr([...a]); await wait();
        }
      }
    }
    done(n);
  };

  const insertion = async () => {
    const a = [...arr], n = a.length;
    for (let i = 1; i < n; i++) {
      const key = a[i]; let j = i - 1;
      setHl({ [i]: 'key' }); await wait();
      while (j >= 0 && a[j] > key) {
        setHl({ [j]: 'compare', [i]: 'key' });
        a[j + 1] = a[j]; setArr([...a]); await wait(); j--;
      }
      a[j + 1] = key; setArr([...a]); setHl({ [j + 1]: 'swap' }); await wait();
    }
    done(n);
  };

  const mergeSort = async () => {
    const a = [...arr];
    const mg = async (l: number, m: number, r: number) => {
      const L = a.slice(l, m + 1), R = a.slice(m + 1, r + 1);
      let i = 0, j = 0, k = l;
      while (i < L.length && j < R.length) {
        setHl({ [k]: 'merge' }); await wait();
        if (L[i] <= R[j]) { a[k++] = L[i++]; } else { a[k++] = R[j++]; }
        setArr([...a]);
      }
      while (i < L.length) { a[k++] = L[i++]; setArr([...a]); setHl({ [k - 1]: 'merge' }); await wait(); }
      while (j < R.length) { a[k++] = R[j++]; setArr([...a]); setHl({ [k - 1]: 'merge' }); await wait(); }
    };
    const ms = async (l: number, r: number): Promise<void> => {
      if (l >= r) return;
      const m = Math.floor((l + r) / 2);
      await ms(l, m); await ms(m + 1, r); await mg(l, m, r);
    };
    await ms(0, a.length - 1); done(a.length);
  };

  const quickSort = async () => {
    const a = [...arr];
    const pt = async (lo: number, hi: number) => {
      const pv = a[hi]; setHl({ [hi]: 'pivot' }); await wait();
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        setHl(h => ({ ...h, [j]: 'compare', [hi]: 'pivot' })); await wait();
        if (a[j] <= pv) {
          i++; [a[i], a[j]] = [a[j], a[i]]; setArr([...a]);
          setHl({ [i]: 'swap', [j]: 'swap', [hi]: 'pivot' }); await wait();
        }
      }
      [a[i + 1], a[hi]] = [a[hi], a[i + 1]]; setArr([...a]);
      setHl({ [i + 1]: 'sorted' }); await wait();
      return i + 1;
    };
    const qs = async (lo: number, hi: number): Promise<void> => {
      if (lo >= hi) return;
      const pi = await pt(lo, hi); await qs(lo, pi - 1); await qs(pi + 1, hi);
    };
    await qs(0, a.length - 1); done(a.length);
  };

  const run = async () => {
    setBusy(true); setHl({}); addLog(`${algo} Sort…`);
    if (algo === 'Bubble') await bubble();
    else if (algo === 'Insertion') await insertion();
    else if (algo === 'Merge') await mergeSort();
    else await quickSort();
    addLog('Done!', 'success'); setBusy(false);
  };

  const max = Math.max(...arr, 1);
  const bc = (s?: string) => {
    if (s === 'compare') return 'bg-gradient-to-t from-yellow/70 to-yellow shadow-[0_-3px_14px_rgba(251,191,36,0.15)]';
    if (s === 'swap') return 'bg-gradient-to-t from-red/70 to-red shadow-[0_-3px_14px_rgba(248,113,113,0.15)]';
    if (s === 'sorted') return 'bg-gradient-to-t from-cyan/50 to-cyan shadow-[0_-3px_12px_rgba(34,211,238,0.1)]';
    if (s === 'pivot') return 'bg-gradient-to-t from-purple/60 to-purple shadow-[0_-3px_14px_rgba(167,139,250,0.15)]';
    if (s === 'merge') return 'bg-gradient-to-t from-orange/60 to-orange shadow-[0_-3px_14px_rgba(251,146,60,0.15)]';
    if (s === 'key') return 'bg-gradient-to-t from-blue/60 to-blue shadow-[0_-3px_14px_rgba(108,140,255,0.15)]';
    return 'bg-gradient-to-t from-surface-high/80 to-surface-med/80 border border-border-faint';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl overflow-hidden border border-border-faint">
          {ALGOS.map(a => (
            <button key={a} onClick={() => setAlgo(a)} disabled={busy}
              className={`px-3 py-[7px] text-[11px] font-semibold transition-all ${algo === a ? 'bg-blue/10 text-blue' : 'bg-transparent text-text-ghost hover:text-text-dim'}`}>{a}</button>
          ))}
        </div>
        <button onClick={run} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Play className="w-3.5 h-3.5" />Sort</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setArr(Array.from({ length: randInt(16, 30) }, () => randInt(5, 95))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setArr(Array.from({ length: 24 }, () => randInt(5, 95))); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>
      <div className="flex gap-1 text-[9px] font-mono text-text-ghost">
        <span className="px-2 py-0.5 rounded bg-yellow/10 text-yellow">Compare</span>
        <span className="px-2 py-0.5 rounded bg-red/10 text-red">Swap</span>
        <span className="px-2 py-0.5 rounded bg-cyan/10 text-cyan">Sorted</span>
        <span className="px-2 py-0.5 rounded bg-purple/10 text-purple">Pivot</span>
      </div>
      <div className="flex-1 flex items-end justify-center gap-[2px] p-4 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-hidden">
        {arr.map((v, i) => (
          <div key={`${i}-${v}-${arr.length}`}
            className={`viz-bar flex-1 max-w-3 ${bc(hl[i])}`}
            style={{ height: `${(v / max) * 100}%` }} />
        ))}
      </div>
    </div>
  );
}
