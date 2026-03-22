import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Search, Trash2, Shuffle, RotateCcw } from 'lucide-react';

const SIZE = 7;
const hash = (v: number) => ((v * 31) % SIZE + SIZE) % SIZE;

export default function HashTableModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [buckets, setBuckets] = useState<number[][]>(() => {
    const b = Array.from({ length: SIZE }, () => [] as number[]);
    [15, 42, 8, 23, 50, 19, 7].forEach(v => b[hash(v)].push(v)); return b;
  });
  const [hlB, setHlB] = useState<number | null>(null);
  const [hlV, setHlV] = useState<number | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Insert','O(1) avg','O(n)'],['Search','O(1) avg','O(1)'],['Delete','O(1) avg','O(1)']]);
    setPseudocode(`HASH(key) = (key × 31) mod SIZE\n\nINSERT(key):\n  idx = HASH(key)\n  table[idx].append(key)\n\nSEARCH(key):\n  idx = HASH(key)\n  walk chain at table[idx]`);
    setTheory(`## Hash Table — Constant Time Lookup\n\nA **Hash Table** (or Hash Map) is a data structure that maps **keys to values** using a **hash function**. It provides average O(1) time for insertions, deletions, and lookups.\n\n### How It Works\n1. A **hash function** converts the key into an index (bucket number).\n2. The value is stored at that index in an underlying array.\n3. When two keys map to the same index (**collision**), a resolution strategy is used.\n\n### Hash Function\nA good hash function should:\n- Be **deterministic** (same input → same output).\n- **Distribute uniformly** across the bucket range.\n- Be **fast** to compute.\n\n### Collision Resolution\n| Strategy | How It Works |\n|----------|-------------|\n| **Chaining** | Each bucket stores a linked list of entries |\n| **Open Addressing** | Probe for the next available slot |\n| **Linear Probing** | Check the next sequential slot |\n| **Quadratic Probing** | Check slots at 1², 2², 3²… |\n| **Double Hashing** | Use a second hash function for probe step |\n\n### Load Factor\nThe **load factor** (α) = number of entries / number of buckets. When α gets too high, performance degrades::\n- Chaining: Average chain length becomes α\n- Open addressing: Performance deteriorates rapidly near α = 1\n- Solution: **Rehash** — create a larger table and re-insert all entries.\n\n### Real-World Applications\n- Dictionaries/Maps in programming languages (Python dict, JS Object).\n- Database indexing.\n- Caches (web browser cache, CDN cache).\n- Symbol tables in compilers.\n- Counting frequency of elements.\n\n### Complexity Summary\n| Operation | Average | Worst |\n|-----------|---------|-------|\n| Insert | O(1) | O(n) |\n| Search | O(1) | O(n) |\n| Delete | O(1) | O(n) |`);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const doIns = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); const idx = hash(v); setInfo(`h(${v}) = ${idx}`); setHlB(idx); await wait();
    setBuckets(b => { const c = b.map(a => [...a]); c[idx].push(v); return c; });
    setHlV(v); addLog(`Inserted ${v} → [${idx}]`, 'success'); await wait();
    setInfo(null); setHlB(null); setHlV(null); setBusy(false); setVal('');
  };

  const doSearch = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); const idx = hash(v); setInfo(`h(${v}) = ${idx}`); setHlB(idx); await wait();
    for (const item of buckets[idx]) {
      setHlV(item); addLog(`Compare ${item}…`); await wait();
      if (item === v) { addLog('Found!', 'success'); await sleep(1200); setInfo(null); setHlB(null); setHlV(null); setBusy(false); return; }
    }
    addLog('Not found', 'error'); setInfo(null); setHlB(null); setHlV(null); setBusy(false);
  };

  const doDel = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); const idx = hash(v); setInfo(`h(${v}) = ${idx}`); setHlB(idx); await wait();
    for (const item of buckets[idx]) {
      setHlV(item); await wait();
      if (item === v) {
        setBuckets(b => { const c = b.map(a => [...a]); c[idx] = c[idx].filter(x => x !== v); return c; });
        addLog(`Deleted ${v}`, 'success'); setInfo(null); setHlB(null); setHlV(null); setBusy(false); setVal(''); return;
      }
    }
    addLog('Not found', 'error'); setInfo(null); setHlB(null); setHlV(null); setBusy(false);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-24" />
        <button onClick={doIns} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Insert</button>
        <button onClick={doSearch} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Search className="w-3.5 h-3.5" />Search</button>
        <button onClick={doDel} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><Trash2 className="w-3.5 h-3.5" />Delete</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { const b = Array.from({ length: SIZE }, () => [] as number[]); Array.from({ length: randInt(5, 12) }, () => randInt(1, 99)).forEach(v => b[hash(v)].push(v)); setBuckets(b); setHlB(null); setHlV(null); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setBuckets(Array.from({ length: SIZE }, () => [])); addLog('Cleared'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Clear</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2 p-4 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        {info && (
          <div className="text-center mb-2">
            <span className="px-3 py-1.5 rounded-full text-[12px] font-mono bg-primary/10 text-primary border border-primary/20">{info}</span>
          </div>
        )}
        {buckets.map((chain, i) => (
          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${hlB === i ? 'bg-primary/5 border border-primary/20' : 'border border-transparent'}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono text-[12px] font-bold ${hlB === i ? 'bg-primary/10 text-primary' : 'bg-surface-med text-text-dim'}`}>
              [{i}]
            </div>
            {chain.length > 0 && <span className="text-text-ghost text-xs">→</span>}
            <div className="flex items-center gap-1.5 flex-wrap">
              {chain.map((v, j) => (
                <div key={`${i}-${j}-${v}`} className={`px-3 py-1.5 rounded-lg font-mono text-[12px] font-semibold border transition-all ${hlV === v ? 'bg-accent/10 text-accent border-accent/30 shadow-[0_0_12px_rgba(0,209,255,0.15)]' : 'bg-surface-high border-border-faint text-text-light'}`}>
                  {v}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
