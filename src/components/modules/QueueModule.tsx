import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { ArrowRightToLine, ArrowLeftFromLine, Eye, Shuffle, RotateCcw } from 'lucide-react';

const THEORY = `## Queue — FIFO Data Structure

A **Queue** is a linear data structure that follows the **First In, First Out (FIFO)** principle. The element that is inserted first is the one that gets removed first — just like a real-world queue (line) at a ticket counter.

### Core Operations
- **Enqueue**: Add an element to the **rear** of the queue. Time: O(1).
- **Dequeue**: Remove the element from the **front** of the queue. Time: O(1).
- **Peek / Front**: View the front element without removing it. Time: O(1).

### How It Works
Imagine a pipe open at both ends: items enter from one end (rear) and leave from the other (front). This ordering guarantee makes queues essential whenever you need to process things in the exact order they arrived.

### Real-World Applications
- **CPU Scheduling**: Operating systems use queues to manage processes waiting for CPU time.
- **Print Spooler**: Documents are printed in the order they were sent using a queue.
- **BFS (Breadth-First Search)**: Graph/tree traversals use a queue to explore nodes level by level.
- **Message Queues**: Systems like RabbitMQ and Kafka use the queue concept for asynchronous communication.
- **Buffering**: Streaming video and audio use queues to buffer incoming data.

### Variants
| Variant | Description |
|---------|-------------|
| **Circular Queue** | The rear wraps around to the front, eliminating wasted space. |
| **Priority Queue** | Elements are dequeued based on priority, not just arrival order. |
| **Double-Ended Queue (Deque)** | Supports insertion and deletion at both ends. |

### Complexity Summary
| Operation | Time | Space |
|-----------|------|-------|
| Enqueue | O(1) | O(1) |
| Dequeue | O(1) | O(1) |
| Peek | O(1) | O(1) |
| Search | O(n) | O(1) |
`;

export default function QueueModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [queue, setQueue] = useState([10, 25, 42, 8]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Enqueue','O(1)','O(1)'],['Dequeue','O(1)','O(1)'],['Peek','O(1)','O(1)'],['Search','O(n)','O(1)']]);
    setPseudocode(`ENQUEUE(val):\n  rear++\n  queue[rear] = val\n\nDEQUEUE():\n  val = queue[front]\n  front++\n  return val\n\nPEEK(): return queue[front]`);
    setTheory(THEORY);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const enqueue = async () => {
    const v = parseInt(val);
    if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true);
    setQueue(p => [...p, v]);
    setHl({ [queue.length]: 'new' });
    addLog(`Enqueued ${v} at rear`, 'success');
    await wait();
    setHl({});
    setBusy(false);
    setVal('');
  };

  const dequeue = async () => {
    if (!queue.length) { addLog('Queue is empty!', 'error'); return; }
    setBusy(true);
    setHl({ 0: 'active' });
    addLog(`Dequeuing ${queue[0]}…`);
    await wait();
    setQueue(p => p.slice(1));
    setHl({});
    addLog('Dequeued from front', 'success');
    setBusy(false);
  };

  const peek = async () => {
    if (!queue.length) { addLog('Queue is empty!', 'error'); return; }
    setBusy(true);
    setHl({ 0: 'found' });
    addLog(`Front = ${queue[0]}`, 'success');
    await sleep(1200);
    setHl({});
    setBusy(false);
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
        <button onClick={enqueue} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><ArrowRightToLine className="w-3.5 h-3.5" />Enqueue</button>
        <button onClick={dequeue} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><ArrowLeftFromLine className="w-3.5 h-3.5" />Dequeue</button>
        <button onClick={peek} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Eye className="w-3.5 h-3.5" />Peek</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setQueue(Array.from({ length: randInt(3, 7) }, () => randInt(1, 99))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setQueue([10, 25, 42, 8]); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        <span className="text-[10px] text-primary font-display uppercase tracking-widest mr-2">Front</span>
        {queue.map((v, i) => {
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
        {!queue.length && <span className="text-text-ghost text-sm font-display mt-6">Empty</span>}
        <span className="text-[10px] text-accent font-display uppercase tracking-widest ml-2">Rear</span>
      </div>
    </div>
  );
}
