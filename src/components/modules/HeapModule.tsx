import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Minus, ToggleLeft, ToggleRight, Shuffle, RotateCcw } from 'lucide-react';

export default function HeapModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [heap, setHeap] = useState([10, 20, 30, 25, 35, 40, 50]);
  const [isMin, setIsMin] = useState(true);
  const [active, setActive] = useState(new Set<number>());
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Insert','O(log n)','O(1)'],['Extract','O(log n)','O(1)'],['Peek','O(1)','O(1)']]);
    setPseudocode(`BUBBLE-UP(i):\n  while i > 0:\n    parent = (i-1)/2\n    if heap[i] < heap[parent]:\n      swap; i = parent\n\nBUBBLE-DOWN(i):\n  while child exists:\n    smallest = smaller_child\n    if ok: done\n    swap; i = smallest`);
    setTheory(`## Heap — Priority Queue Structure\n\nA **Heap** is a specialized binary tree that satisfies the **heap property**: in a min-heap, each parent is smaller than its children; in a max-heap, each parent is larger.\n\n### Heap Property\n- **Min-Heap**: parent ≤ children → root is the minimum element.\n- **Max-Heap**: parent ≥ children → root is the maximum element.\n\n### Key Properties\n- A heap is always a **complete binary tree** (every level is full except possibly the last, which is filled left-to-right).\n- Can be efficiently represented as an **array**, where for node at index i:\n  - Parent: floor((i-1)/2)\n  - Left child: 2i + 1\n  - Right child: 2i + 2\n\n### Core Operations\n- **Insert (Bubble Up)**: Add at the end, then swap upward until heap property is restored. O(log n).\n- **Extract (Bubble Down)**: Remove root, move last element to root, then swap downward. O(log n).\n- **Peek**: Return root element. O(1).\n- **Heapify**: Build a heap from an unsorted array. O(n).\n\n### Real-World Applications\n- **Priority Queues**: Task scheduling, event-driven simulation.\n- **Heap Sort**: An in-place O(n log n) sorting algorithm.\n- **Dijkstra's Algorithm**: Uses a min-heap to find shortest paths.\n- **Median Finding**: Use two heaps (max-heap for lower half, min-heap for upper half).\n- **K-th Largest/Smallest**: Maintain a heap of size K.\n\n### Complexity Summary\n| Operation | Time | Space |\n|-----------|------|-------|\n| Insert | O(log n) | O(1) |\n| Extract | O(log n) | O(1) |\n| Peek | O(1) | O(1) |\n| Heapify | O(n) | O(1) |`);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);
  const cmp = (a: number, b: number) => isMin ? a < b : a > b;

  const doIns = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); const h = [...heap, v]; let i = h.length - 1;
    setHeap([...h]); setActive(new Set([i])); addLog(`Inserted ${v}`); await wait();
    while (i > 0) {
      const p = Math.floor((i - 1) / 2); setActive(new Set([i, p])); await wait();
      if (cmp(h[i], h[p])) { [h[i], h[p]] = [h[p], h[i]]; setHeap([...h]); i = p; await wait(); } else break;
    }
    setActive(new Set()); addLog('Done', 'success'); setBusy(false); setVal('');
  };

  const doExt = async () => {
    if (!heap.length) { addLog('Empty!', 'error'); return; }
    setBusy(true); const h = [...heap], ex = h[0]; setActive(new Set([0])); await wait();
    h[0] = h.at(-1)!; h.pop(); setHeap([...h]);
    if (!h.length) { setActive(new Set()); addLog(`Extracted ${ex}`, 'success'); setBusy(false); return; }
    let i = 0;
    while (true) {
      const l = 2 * i + 1, r = 2 * i + 2; let t = i;
      if (l < h.length && cmp(h[l], h[t])) t = l;
      if (r < h.length && cmp(h[r], h[t])) t = r;
      if (t === i) break;
      setActive(new Set([i, t])); await wait();
      [h[i], h[t]] = [h[t], h[i]]; setHeap([...h]); i = t; await wait();
    }
    setActive(new Set()); addLog(`Extracted ${ex}`, 'success'); setBusy(false);
  };

  const toggleMode = () => {
    setIsMin(!isMin);
    const h = [...heap];
    const c = !isMin ? (a: number, b: number) => a < b : (a: number, b: number) => a > b;
    for (let i = Math.floor(h.length / 2) - 1; i >= 0; i--) {
      let k = i;
      while (true) {
        const l = 2 * k + 1, r = 2 * k + 2; let t = k;
        if (l < h.length && c(h[l], h[t])) t = l;
        if (r < h.length && c(h[r], h[t])) t = r;
        if (t === k) break;
        [h[k], h[t]] = [h[t], h[k]]; k = t;
      }
    }
    setHeap(h); addLog(`Switched to ${!isMin ? 'Min' : 'Max'}-Heap`, 'success');
  };

  const levels = heap.length > 0 ? Math.floor(Math.log2(heap.length)) + 1 : 1;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={toggleMode} disabled={busy} className="pill-btn pill-secondary text-[12px] py-2 px-3">
          {isMin ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
          {isMin ? 'Min-Heap' : 'Max-Heap'}
        </button>
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-24" />
        <button onClick={doIns} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Insert</button>
        <button onClick={doExt} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><Minus className="w-3.5 h-3.5" />Extract</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => {
            const a = Array.from({ length: randInt(5, 10) }, () => randInt(1, 99));
            const c = isMin ? (x: number, y: number) => x < y : (x: number, y: number) => x > y;
            for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) {
              let k = i; while (true) { const l = 2 * k + 1, r = 2 * k + 2; let t = k; if (l < a.length && c(a[l], a[t])) t = l; if (r < a.length && c(a[r], a[t])) t = r; if (t === k) break; [a[k], a[t]] = [a[t], a[k]]; k = t; }
            }
            setHeap(a); setActive(new Set()); addLog('Randomized');
          }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setHeap([10, 20, 30, 25, 35, 40, 50]); setIsMin(true); setActive(new Set()); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>
      <div className="flex-1 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-hidden">
        <svg viewBox="0 0 700 280" className="w-full h-full">
          {heap.map((v, i) => {
            const lv = Math.floor(Math.log2(i + 1)), pos = i - (2 ** lv - 1), cnt = 2 ** lv;
            const x = 700 * (pos + 0.5) / cnt, y = 25 + (lv / Math.max(levels - 1, 1)) * 200;
            const li = 2 * i + 1, ri = 2 * i + 2;
            const a = active.has(i);
            return (
              <g key={`h-${i}`}>
                {[li, ri].filter(c => c < heap.length).map(c => {
                  const cl = Math.floor(Math.log2(c + 1)), cp = c - (2 ** cl - 1), cn = 2 ** cl;
                  return <line key={`l-${i}-${c}`} x1={x} y1={y} x2={700 * (cp + 0.5) / cn} y2={25 + (cl / Math.max(levels - 1, 1)) * 200} stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />;
                })}
                {a && <circle cx={x} cy={y} r="26" fill="rgba(108,140,255,0.06)" />}
                <circle cx={x} cy={y} r="20" fill={a ? 'rgba(108,140,255,0.1)' : 'rgba(255,255,255,0.02)'} stroke={a ? 'rgba(108,140,255,0.4)' : 'rgba(255,255,255,0.06)'} strokeWidth="1.5" />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={a ? '#6C8CFF' : '#e2e8f0'} fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">{v}</text>
                <text x={x} y={y + 28} textAnchor="middle" fill="currentColor" style={{ opacity: 0.6 }} className="text-[8px] font-mono text-text-ghost">
                  {`0x${(0x1000 + i * 4).toString(16).toUpperCase().padStart(4, '0')}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-4 pb-2">
        <div className="text-[10px] text-text-ghost font-display uppercase tracking-widest mb-1">Array</div>
        <div className="flex gap-1 flex-wrap">
          {heap.map((v, i) => (
            <div key={i} className={`flex flex-col items-center px-2 py-1 rounded-lg border transition-all ${active.has(i) ? 'border-blue/30 bg-blue/5' : 'border-border-faint bg-surface-med/30'}`}>
              <span className="text-[11px] font-mono text-text-light font-semibold">{v}</span>
              <span className="text-[8px] text-text-ghost font-mono">{i}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
