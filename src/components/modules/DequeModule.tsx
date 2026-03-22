import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Minus, Eye, Shuffle, RotateCcw } from 'lucide-react';

const THEORY = `## Deque — Double-Ended Queue

A **Deque** (Double-Ended Queue, pronounced "deck") allows insertion and deletion at **both ends** — front and rear.

### Core Operations
- **Push Front**: Insert at the front. O(1).
- **Push Back**: Insert at the rear. O(1).
- **Pop Front**: Remove from the front. O(1).
- **Pop Back**: Remove from the rear. O(1).

### How It Differs
| Structure | Insert Front | Insert Back | Remove Front | Remove Back |
|-----------|-------------|-------------|-------------|-------------|
| Queue | ✗ | O(1) | O(1) | ✗ |
| Stack | O(1) | ✗ | O(1) | ✗ |
| **Deque** | **O(1)** | **O(1)** | **O(1)** | **O(1)** |

### Variants
- **Input-Restricted Deque**: Insertion only at one end, deletion at both.
- **Output-Restricted Deque**: Deletion only at one end, insertion at both.

### Real-World Applications
- Sliding window algorithms (max/min in a window).
- Undo/Redo with limited history.
- BFS optimizations (0-1 BFS).
- Work-stealing schedulers in parallel computing.
- Browser tab management.

### Complexity Summary
| Operation | Time | Space |
|-----------|------|-------|
| Push Front | O(1) | O(1) |
| Push Back | O(1) | O(1) |
| Pop Front | O(1) | O(1) |
| Pop Back | O(1) | O(1) |
`;

export default function DequeModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [deque, setDeque] = useState([15, 30, 45, 60]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Push Front','O(1)','O(1)'],['Push Back','O(1)','O(1)'],['Pop Front','O(1)','O(1)'],['Pop Back','O(1)','O(1)']]);
    setPseudocode(`PUSH_FRONT(val):\n  front--\n  deque[front] = val\n\nPUSH_BACK(val):\n  deque[rear] = val\n  rear++\n\nPOP_FRONT():\n  val = deque[front]; front++\n\nPOP_BACK():\n  rear--; val = deque[rear]`);
    setTheory(THEORY);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const pushFront = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); setDeque(p => [v, ...p]); setHl({ 0: 'new' });
    addLog(`Pushed ${v} to front`, 'success'); await wait(); setHl({}); setBusy(false); setVal('');
  };
  const pushBack = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); setDeque(p => [...p, v]); setHl({ [deque.length]: 'new' });
    addLog(`Pushed ${v} to back`, 'success'); await wait(); setHl({}); setBusy(false); setVal('');
  };
  const popFront = async () => {
    if (!deque.length) { addLog('Empty!', 'error'); return; }
    setBusy(true); setHl({ 0: 'active' }); addLog(`Popping ${deque[0]} from front…`);
    await wait(); setDeque(p => p.slice(1)); setHl({}); addLog('Popped front', 'success'); setBusy(false);
  };
  const popBack = async () => {
    if (!deque.length) { addLog('Empty!', 'error'); return; }
    setBusy(true); setHl({ [deque.length - 1]: 'active' }); addLog(`Popping ${deque.at(-1)} from back…`);
    await wait(); setDeque(p => p.slice(0, -1)); setHl({}); addLog('Popped back', 'success'); setBusy(false);
  };
  const peekBoth = async () => {
    if (!deque.length) { addLog('Empty!', 'error'); return; }
    setBusy(true); setHl({ 0: 'found', [deque.length - 1]: 'found' });
    addLog(`Front = ${deque[0]}, Back = ${deque.at(-1)}`, 'success');
    await sleep(1200); setHl({}); setBusy(false);
  };

  const nc = (s?: string) => {
    if (s === 'active') return 'border-red/40 bg-red/5 shadow-[0_0_16px_rgba(248,113,113,0.15)] scale-[1.03]';
    if (s === 'found') return 'border-green/40 bg-green/5 shadow-[0_0_20px_rgba(74,222,128,0.2)] scale-[1.03]';
    if (s === 'new') return 'border-blue/40 bg-blue/5 shadow-[0_0_16px_rgba(108,140,255,0.15)] anim-pop-in';
    return 'border-border-soft bg-surface-med/50';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-24" />
        <button onClick={pushFront} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Push Front</button>
        <button onClick={pushBack} disabled={busy} className="pill-btn pill-secondary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Push Back</button>
        <button onClick={popFront} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><Minus className="w-3.5 h-3.5" />Pop Front</button>
        <button onClick={popBack} disabled={busy} className="pill-btn pill-orange text-[12px] py-2 px-3"><Minus className="w-3.5 h-3.5" />Pop Back</button>
        <button onClick={peekBoth} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Eye className="w-3.5 h-3.5" />Peek</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setDeque(Array.from({ length: randInt(3, 8) }, () => randInt(1, 99))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setDeque([15, 30, 45, 60]); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center gap-2 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        <div className="flex flex-col items-center mr-2">
          <span className="text-[10px] text-primary font-display uppercase tracking-widest">Front</span>
          <span className="text-lg text-primary">⟵</span>
        </div>
        {deque.map((v, i) => {
          const memAddr = "0x" + (0x1000 + i * 4).toString(16).toUpperCase().padStart(4, '0');
          return (
          <div key={`${i}-${v}`} className="flex flex-col items-center gap-2 group mt-6">
            <span className="text-[8px] font-mono text-text-ghost tracking-wider opacity-60 group-hover:opacity-100 transition-opacity bg-black/20 px-1.5 py-0.5 rounded">
              {memAddr}
            </span>
            <div className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl border transition-all duration-300 flex items-center justify-center ${nc(hl[i])}`}>
              <span className="font-mono text-sm text-text-white font-semibold">{v}</span>
            </div>
            <span className="text-[10px] text-text-ghost font-mono">[{i}]</span>
          </div>
        )})}
        {!deque.length && <span className="text-text-ghost text-sm font-display">Empty</span>}
        <div className="flex flex-col items-center ml-2">
          <span className="text-[10px] text-accent font-display uppercase tracking-widest">Back</span>
          <span className="text-lg text-accent">⟶</span>
        </div>
      </div>
    </div>
  );
}
