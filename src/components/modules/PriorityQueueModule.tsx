import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Minus, ToggleLeft, ToggleRight, Shuffle, RotateCcw } from 'lucide-react';

const THEORY = `## Priority Queue — Ordered by Priority

A **Priority Queue** is an abstract data type where each element has a **priority**. Elements are dequeued based on priority rather than insertion order.

### Types
- **Min-Priority Queue**: Lowest priority value dequeued first.
- **Max-Priority Queue**: Highest priority value dequeued first.

### Implementations
| Implementation | Insert | Extract | Peek |
|---------------|--------|---------|------|
| Unsorted Array | O(1) | O(n) | O(n) |
| Sorted Array | O(n) | O(1) | O(1) |
| **Binary Heap** | **O(log n)** | **O(log n)** | **O(1)** |
| Fibonacci Heap | O(1) amortized | O(log n) | O(1) |

### How It Works (Heap-Based)
- **Enqueue**: Insert element and bubble up to maintain heap order.
- **Dequeue**: Remove root (highest/lowest priority), replace with last element, bubble down.
- **Peek**: Return root without removing.

### Real-World Applications
- **Dijkstra's Algorithm**: Always process the nearest unvisited node.
- **Huffman Coding**: Build optimal prefix codes.
- **Task Scheduling**: OS process scheduling by priority.
- **Event-Driven Simulation**: Process events in time order.
- **A* Pathfinding**: Explore most promising paths first.

### Complexity Summary
| Operation | Time | Space |
|-----------|------|-------|
| Enqueue | O(log n) | O(1) |
| Dequeue | O(log n) | O(1) |
| Peek | O(1) | O(1) |
`;

interface PQItem { val: number; priority: number; id: number; }
let pqId = 200;

export default function PriorityQueueModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [pq, setPq] = useState<PQItem[]>([
    { val: 10, priority: 3, id: 201 }, { val: 20, priority: 1, id: 202 },
    { val: 30, priority: 5, id: 203 }, { val: 40, priority: 2, id: 204 },
  ]);
  const [isMin, setIsMin] = useState(true);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [pri, setPri] = useState('');
  const [busy, setBusy] = useState(false);

  const sorted = [...pq].sort((a, b) => isMin ? a.priority - b.priority : b.priority - a.priority);

  useEffect(() => {
    setComplexity([['Enqueue', 'O(log n)', 'O(1)'], ['Dequeue', 'O(log n)', 'O(1)'], ['Peek', 'O(1)', 'O(1)']]);
    setPseudocode(`ENQUEUE(val, priority):\n  insert into heap\n  bubble up by priority\n\nDEQUEUE():\n  remove root (min/max priority)\n  move last to root\n  bubble down\n\nPEEK(): return root`);
    setTheory(THEORY);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const enqueue = async () => {
    const v = parseInt(val), p = parseInt(pri);
    if (isNaN(v) || isNaN(p)) { addLog('Enter value and priority', 'warn'); return; }
    setBusy(true);
    const item = { val: v, priority: p, id: pqId++ };
    setPq(prev => [...prev, item]);
    addLog(`Enqueued ${v} with priority ${p}`, 'success');
    await wait(); setBusy(false); setVal(''); setPri('');
  };

  const dequeue = async () => {
    if (!pq.length) { addLog('Empty!', 'error'); return; }
    setBusy(true);
    const top = sorted[0];
    const idx = pq.findIndex(x => x.id === top.id);
    setHl({ [idx]: 'active' });
    addLog(`Dequeuing val=${top.val}, priority=${top.priority}…`);
    await wait();
    setPq(prev => prev.filter(x => x.id !== top.id));
    setHl({});
    addLog(`Dequeued (priority=${top.priority})`, 'success');
    setBusy(false);
  };

  const nc = (itemId: number) => {
    const idx = pq.findIndex(x => x.id === itemId);
    const s = hl[idx];
    if (s === 'active') return 'border-red/40 bg-red/5 shadow-[0_0_16px_rgba(248,113,113,0.15)] scale-[1.03]';
    if (sorted.length > 0 && sorted[0].id === itemId) return 'border-green/40 bg-green/5 shadow-[0_0_12px_rgba(74,222,128,0.12)]';
    return 'border-border-soft bg-surface-med/50';
  };

  const prColor = (p: number) => {
    if (p <= 2) return 'text-green';
    if (p <= 4) return 'text-yellow';
    return 'text-red';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-20" />
        <input placeholder="Priority" value={pri} onChange={e => setPri(e.target.value)} disabled={busy} className="input-field w-20" />
        <button onClick={enqueue} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Enqueue</button>
        <button onClick={dequeue} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><Minus className="w-3.5 h-3.5" />Dequeue</button>
        <button onClick={() => { setIsMin(!isMin); addLog(`Switched to ${!isMin ? 'Min' : 'Max'}-Priority`, 'success'); }} disabled={busy} className="pill-btn pill-secondary text-[12px] py-2 px-3">
          {isMin ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
          {isMin ? 'Min-PQ' : 'Max-PQ'}
        </button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setPq(Array.from({ length: randInt(4, 8) }, () => ({ val: randInt(1, 99), priority: randInt(1, 9), id: pqId++ }))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setPq([{ val: 10, priority: 3, id: pqId++ }, { val: 20, priority: 1, id: pqId++ }, { val: 30, priority: 5, id: pqId++ }, { val: 40, priority: 2, id: pqId++ }]); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        <span className="text-[10px] text-text-ghost font-display uppercase tracking-widest mb-2">
          {isMin ? '← Lowest Priority Dequeued First →' : '← Highest Priority Dequeued First →'}
        </span>
        <div className="flex gap-2 flex-wrap justify-center">
          {sorted.map((item, i) => (
            <div key={item.id} className={`w-20 rounded-xl border transition-all duration-300 flex flex-col items-center py-3 relative group ${nc(item.id)}`}>
              <span className="text-[8px] font-mono text-text-ghost tracking-wider opacity-60 group-hover:opacity-100 transition-opacity bg-black/20 px-1 py-0.5 rounded mb-1">
                {`0x${(0x1000 + i * 4).toString(16).toUpperCase().padStart(4, '0')}`}
              </span>
              <span className="font-mono text-sm text-text-white font-semibold">{item.val}</span>
              <span className={`text-[10px] font-mono font-bold mt-1 ${prColor(item.priority)}`}>P:{item.priority}</span>
            </div>
          ))}
        </div>
        {!pq.length && <span className="text-text-ghost text-sm font-display">Empty</span>}
        {sorted.length > 0 && (
          <div className="mt-3 px-3 py-1.5 rounded-full text-[11px] font-mono bg-green/5 text-green border border-green/20">
            Next out: val={sorted[0].val}, priority={sorted[0].priority}
          </div>
        )}
      </div>
    </div>
  );
}
