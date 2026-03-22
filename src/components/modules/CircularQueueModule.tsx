import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Minus, Eye, Shuffle, RotateCcw } from 'lucide-react';

const MAX = 8;

const THEORY = `## Circular Queue — Ring Buffer

A **Circular Queue** (Ring Buffer) is a linear data structure that connects the end of the queue back to the beginning, forming a circle. This eliminates the wasted space problem of a regular queue.

### Problem with Linear Queue
In a regular queue implemented with an array, after several enqueue/dequeue operations, the front moves forward leaving wasted space at the beginning. Circular queue solves this by wrapping around.

### How It Works
- Maintain **front** and **rear** pointers.
- When rear reaches the end of the array, it wraps to index 0: rear = (rear + 1) % size.
- **Full** condition: (rear + 1) % size == front.
- **Empty** condition: front == rear.

### Core Operations
- **Enqueue**: Place at rear, advance rear circularly. O(1).
- **Dequeue**: Read from front, advance front circularly. O(1).
- **Peek**: Read front without advancing. O(1).

### Advantages over Linear Queue
- No wasted space — reuses dequeued positions.
- Fixed memory — bounded, predictable memory usage.
- Cache-friendly — operates on a fixed array.

### Real-World Applications
- **CPU Scheduling**: Round-robin scheduling uses circular queues.
- **Streaming Buffers**: Audio/video streaming ring buffers.
- **Keyboard Buffer**: OS stores keystrokes in a circular buffer.
- **Network Packet Buffers**: Routers use ring buffers for packets.
- **Producer-Consumer**: Bounded buffer between threads.

### Complexity Summary
| Operation | Time | Space |
|-----------|------|-------|
| Enqueue | O(1) | O(1) |
| Dequeue | O(1) | O(1) |
| Peek | O(1) | O(1) |
`;

export default function CircularQueueModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [buf, setBuf] = useState<(number | null)[]>(() => {
    const a: (number | null)[] = Array(MAX).fill(null);
    a[0] = 10; a[1] = 20; a[2] = 30;
    return a;
  });
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(3);
  const [count, setCount] = useState(3);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Enqueue','O(1)','O(1)'],['Dequeue','O(1)','O(1)'],['Peek','O(1)','O(1)']]);
    setPseudocode(`ENQUEUE(val):\n  if full: ERROR\n  buf[rear] = val\n  rear = (rear + 1) % SIZE\n  count++\n\nDEQUEUE():\n  if empty: ERROR\n  val = buf[front]\n  buf[front] = null\n  front = (front + 1) % SIZE\n  count--`);
    setTheory(THEORY);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const enqueue = async () => {
    const v = parseInt(val);
    if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    if (count >= MAX) { addLog('Queue is FULL!', 'error'); return; }
    setBusy(true);
    setHl({ [rear]: 'new' });
    setBuf(b => { const c = [...b]; c[rear] = v; return c; });
    addLog(`Enqueued ${v} at position ${rear}`, 'success');
    setRear((rear + 1) % MAX);
    setCount(count + 1);
    await wait(); setHl({}); setBusy(false); setVal('');
  };

  const dequeue = async () => {
    if (count <= 0) { addLog('Queue is EMPTY!', 'error'); return; }
    setBusy(true);
    setHl({ [front]: 'active' });
    addLog(`Dequeuing ${buf[front]} from position ${front}…`);
    await wait();
    setBuf(b => { const c = [...b]; c[front] = null; return c; });
    setFront((front + 1) % MAX);
    setCount(count - 1);
    setHl({});
    addLog('Dequeued', 'success');
    setBusy(false);
  };

  const peek = async () => {
    if (count <= 0) { addLog('Empty!', 'error'); return; }
    setBusy(true);
    setHl({ [front]: 'found' });
    addLog(`Front = ${buf[front]}`, 'success');
    await sleep(1200); setHl({}); setBusy(false);
  };

  const reset = () => {
    const a: (number | null)[] = Array(MAX).fill(null);
    a[0] = 10; a[1] = 20; a[2] = 30;
    setBuf(a); setFront(0); setRear(3); setCount(3); setHl({}); addLog('Reset');
  };

  const nc = (idx: number) => {
    const s = hl[idx];
    if (s === 'active') return 'border-red/40 bg-red/5 shadow-[0_0_16px_rgba(248,113,113,0.15)]';
    if (s === 'found') return 'border-green/40 bg-green/5 shadow-[0_0_20px_rgba(74,222,128,0.2)]';
    if (s === 'new') return 'border-blue/40 bg-blue/5 shadow-[0_0_16px_rgba(108,140,255,0.15)] anim-pop-in';
    if (buf[idx] !== null) return 'border-primary/20 bg-primary/5';
    return 'border-border-faint bg-surface-med/20';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-24" />
        <button onClick={enqueue} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Enqueue</button>
        <button onClick={dequeue} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><Minus className="w-3.5 h-3.5" />Dequeue</button>
        <button onClick={peek} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Eye className="w-3.5 h-3.5" />Peek</button>
        <span className="text-[11px] font-mono text-text-dim ml-2">{count}/{MAX}</span>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { const a: (number | null)[] = Array(MAX).fill(null); const n = randInt(2, 6); for (let i = 0; i < n; i++) a[i] = randInt(1, 99); setBuf(a); setFront(0); setRear(n); setCount(n); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={reset} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        <div className="relative" style={{ width: 280, height: 280 }}>
          {buf.map((v, i) => {
            const angle = (i / MAX) * 2 * Math.PI - Math.PI / 2;
            const x = 140 + 110 * Math.cos(angle);
            const y = 140 + 110 * Math.sin(angle);
            return (
              <div key={i} className={`absolute w-14 h-14 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center ${nc(i)}`}
                style={{ left: x - 28, top: y - 28 }}>
                {v !== null ? (
                  <span className="font-mono text-sm text-text-white font-semibold">{v}</span>
                ) : (
                  <span className="text-[10px] text-text-ghost">—</span>
                )}
                <span className="text-[7px] text-text-ghost font-mono">[{i}]</span>
                <span className="text-[7px] text-text-ghost font-mono opacity-50 px-1 py-0.5 mt-0.5 rounded bg-black/20">
                  {`0x${(0x1000 + i * 4).toString(16).toUpperCase().padStart(4, '0')}`}
                </span>
                {i === front && count > 0 && <span className="absolute -bottom-4 text-[8px] text-primary font-mono font-bold">F</span>}
                {i === ((rear - 1 + MAX) % MAX) && count > 0 && <span className="absolute -top-4 text-[8px] text-accent font-mono font-bold">R</span>}
              </div>
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-[10px] text-text-ghost font-display uppercase">Circular</div>
              <div className="text-[10px] text-text-ghost font-display uppercase">Queue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
