import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Play, Shuffle, RotateCcw } from 'lucide-react';

const THEORY = `## Binary Search — Divide and Conquer

**Binary Search** is an efficient algorithm for finding a target value in a **sorted array**. It works by repeatedly dividing the search interval in half.

### How It Works
1. Compare the target with the **middle element**.
2. If target equals middle → **found**.
3. If target < middle → search the **left half**.
4. If target > middle → search the **right half**.
5. Repeat until found or the interval is empty.

### Prerequisites
- The array **must be sorted** for binary search to work.
- If unsorted, sort first (O(n log n)) then search (O(log n)).

### Step-by-Step Example
Array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], Target: 23
- Step 1: mid=16 → 23 > 16 → go right
- Step 2: mid=56 → 23 < 56 → go left
- Step 3: mid=23 → Found!

### Iterative vs Recursive
| Approach | Space | Notes |
|----------|-------|-------|
| Iterative | O(1) | Uses while loop with lo/hi pointers |
| Recursive | O(log n) | Uses call stack, elegant but more memory |

### Common Pitfalls
- **Integer overflow**: Use mid = lo + (hi - lo) / 2 instead of (lo + hi) / 2
- **Off-by-one errors**: Careful with boundaries (< vs <=)
- **Unsorted input**: Binary search gives wrong results on unsorted data

### Variants
- **Lower Bound**: First position where element ≥ target
- **Upper Bound**: First position where element > target
- **Search Insert Position**: Where target would be inserted
- **Rotated Array Search**: Modified binary search

### Real-World Applications
- Dictionary lookup
- Database index searching
- Finding breakpoints in monotonic functions
- Git bisect (finding bug-introducing commits)
- IP routing table lookup

### Complexity Summary
| Operation | Time | Space |
|-----------|------|-------|
| Search | O(log n) | O(1) |
| Recursive | O(log n) | O(log n) |
`;

export default function BinarySearchModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [arr, setArr] = useState([2, 5, 8, 12, 16, 23, 38, 56, 72, 91]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [target, setTarget] = useState('');
  const [busy, setBusy] = useState(false);
  const [lo, setLo] = useState<number | null>(null);
  const [hi, setHi] = useState<number | null>(null);
  const [mid, setMid] = useState<number | null>(null);

  useEffect(() => {
    setComplexity([['Search', 'O(log n)', 'O(1)'], ['Recursive', 'O(log n)', 'O(log n)']]);
    setPseudocode(`BINARY_SEARCH(arr, target):\n  lo = 0, hi = n - 1\n  while lo <= hi:\n    mid = lo + (hi - lo) / 2\n    if arr[mid] == target: return mid\n    if arr[mid] < target: lo = mid + 1\n    else: hi = mid - 1\n  return -1  // not found`);
    setTheory(THEORY);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const search = async () => {
    const t = parseInt(target);
    if (isNaN(t)) { addLog('Enter a target value', 'warn'); return; }
    setBusy(true);
    let l = 0, h = arr.length - 1;
    addLog(`Searching for ${t} in sorted array…`);
    let steps = 0;

    while (l <= h) {
      const m = Math.floor(l + (h - l) / 2);
      steps++;
      setLo(l); setHi(h); setMid(m);
      const highlights: Record<number, string> = {};
      for (let i = l; i <= h; i++) highlights[i] = 'range';
      highlights[m] = 'mid';
      setHl(highlights);
      addLog(`Step ${steps}: lo=${l}, hi=${h}, mid=${m} → arr[${m}]=${arr[m]}`);
      await wait();

      if (arr[m] === t) {
        setHl({ [m]: 'found' });
        addLog(`Found ${t} at index ${m} in ${steps} steps!`, 'success');
        await sleep(1500);
        setHl({}); setLo(null); setHi(null); setMid(null);
        setBusy(false);
        return;
      } else if (arr[m] < t) {
        addLog(`${arr[m]} < ${t} → search right half`);
        l = m + 1;
      } else {
        addLog(`${arr[m]} > ${t} → search left half`);
        h = m - 1;
      }
      await wait();
    }

    setHl({});
    setLo(null); setHi(null); setMid(null);
    addLog(`${t} not found after ${steps} steps`, 'error');
    setBusy(false);
  };

  const randomize = () => {
    const newArr = Array.from({ length: randInt(8, 16) }, () => randInt(1, 99));
    newArr.sort((a, b) => a - b);
    const unique = [...new Set(newArr)];
    setArr(unique);
    setHl({});
    setLo(null); setHi(null); setMid(null);
    addLog('Randomized (sorted)');
  };

  const barColor = (s?: string) => {
    if (s === 'found') return 'bg-gradient-to-t from-green/70 to-green shadow-[0_-4px_24px_rgba(74,222,128,0.3)]';
    if (s === 'mid') return 'bg-gradient-to-t from-blue/80 to-blue shadow-[0_-4px_20px_rgba(108,140,255,0.25)]';
    if (s === 'range') return 'bg-gradient-to-t from-yellow/30 to-yellow/60';
    return 'bg-gradient-to-t from-surface-high/40 to-surface-med/40 border border-border-faint';
  };

  const max = Math.max(...arr, 1);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Target" value={target} onChange={e => setTarget(e.target.value)} disabled={busy} className="input-field w-24" />
        <button onClick={search} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Play className="w-3.5 h-3.5" />Search</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={randomize} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setArr([2, 5, 8, 12, 16, 23, 38, 56, 72, 91]); setHl({}); setLo(null); setHi(null); setMid(null); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>

      {/* Pointer indicators */}
      {lo !== null && hi !== null && mid !== null && (
        <div className="flex gap-1 text-[9px] font-mono text-text-ghost">
          <span className="px-2 py-0.5 rounded bg-yellow/10 text-yellow">Range [lo..hi]</span>
          <span className="px-2 py-0.5 rounded bg-blue/10 text-blue">mid</span>
          <span className="px-2 py-0.5 rounded bg-green/10 text-green">Found</span>
        </div>
      )}

      <div className="flex-1 flex items-end justify-center gap-1 p-4 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-hidden">
        {arr.map((v, i) => (
          <div key={`${i}-${v}`} className="flex flex-col items-center gap-1.5 anim-pop-in group" style={{ animationDelay: `${i * 30}ms` }}>
            <span className="text-[8px] font-mono text-text-ghost tracking-wider opacity-60 group-hover:opacity-100 transition-opacity bg-black/20 px-1 py-0.5 rounded">
              {`0x${(0x1000 + i * 4).toString(16).toUpperCase().padStart(4, '0')}`}
            </span>
            <span className={`text-[10px] font-mono font-semibold ${hl[i] === 'mid' ? 'text-blue' : hl[i] === 'found' ? 'text-green' : 'text-text-light'}`}>{v}</span>
            <div className={`w-8 rounded-t-lg transition-all duration-300 ${barColor(hl[i])}`}
              style={{ height: `${Math.max((v / max) * 200, 16)}px` }} />
            <span className={`text-[9px] font-mono ${hl[i] === 'mid' ? 'text-blue font-bold' : 'text-text-ghost'}`}>{i}</span>
            {i === lo && <span className="text-[8px] text-yellow font-mono font-bold">lo</span>}
            {i === hi && <span className="text-[8px] text-yellow font-mono font-bold">hi</span>}
            {i === mid && <span className="text-[8px] text-blue font-mono font-bold">mid</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
