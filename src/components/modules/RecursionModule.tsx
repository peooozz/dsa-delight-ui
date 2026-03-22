import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep } from '@/lib/drawUtils';
import { Play, RotateCcw, Minus, Plus } from 'lucide-react';

const THEORY = `## Recursion — Self-Referencing Functions

**Recursion** is a technique where a function calls **itself** to solve a problem by breaking it into smaller subproblems of the same type.

### Anatomy of a Recursive Function
1. **Base Case**: The terminating condition that stops recursion.
2. **Recursive Case**: The function calls itself with a smaller/simpler input.
3. **Progress**: Each recursive call must move toward the base case.

### How It Works (Call Stack)
Each recursive call pushes a new **stack frame** onto the call stack:
- Function parameters and local variables are saved.
- When the base case is reached, frames start popping and returning values.
- If there's no base case → **Stack Overflow**.

### Classic Examples
| Problem | Formula | Time | Space |
|---------|---------|------|-------|
| Factorial | n! = n × (n-1)! | O(n) | O(n) |
| Fibonacci | F(n) = F(n-1) + F(n-2) | O(2ⁿ) | O(n) |
| Tower of Hanoi | T(n) = 2T(n-1) + 1 | O(2ⁿ) | O(n) |
| Binary Search | T(n) = T(n/2) + O(1) | O(log n) | O(log n) |

### Recursion vs Iteration
| Aspect | Recursion | Iteration |
|--------|-----------|-----------|
| Code | Often cleaner | Sometimes verbose |
| Memory | O(n) stack | O(1) usually |
| Speed | Function call overhead | Generally faster |
| Use Case | Trees, divide & conquer | Simple loops |

### Tail Recursion
A recursive call is **tail recursive** if it's the very last operation. Some languages optimize this to use O(1) stack space (Tail Call Optimization).

### When to Use Recursion
- Tree/graph traversals
- Divide and conquer algorithms
- Backtracking problems
- Problems with natural recursive structure (fractals, Fibonacci)

### Common Pitfalls
- Missing base case → infinite recursion → stack overflow.
- Overlapping subproblems → use memoization (Dynamic Programming).
- Deep recursion → may exceed stack limit in some languages.

### Complexity Summary
| Metric | Factorial | Fibonacci |
|--------|-----------|-----------|
| Time | O(n) | O(2ⁿ) naive |
| Space (Stack) | O(n) | O(n) |
| With Memo | — | O(n) |
`;

export default function RecursionModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [mode, setMode] = useState<'factorial' | 'fibonacci'>('factorial');
  const [n, setN] = useState(6);
  const [frames, setFrames] = useState<{ label: string; value: string; depth: number; status: 'pending' | 'computing' | 'done' }[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    if (mode === 'factorial') {
      setComplexity([['Time', 'O(n)', 'O(n)']]);
      setPseudocode(`FACTORIAL(n):\n  if n <= 1: return 1\n  return n × FACTORIAL(n - 1)`);
    } else {
      setComplexity([['Naive','O(2^n)','O(n)'],['Memoized','O(n)','O(n)']]);
      setPseudocode(`FIB(n):\n  if n <= 1: return n\n  return FIB(n-1) + FIB(n-2)`);
    }
    setTheory(THEORY);
  }, [mode, setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const runFactorial = async () => {
    setBusy(true); setResult(null); setFrames([]);
    addLog(`Computing factorial(${n})…`);
    const newFrames: typeof frames = [];

    // Build call stack going down
    for (let i = n; i >= 0; i--) {
      newFrames.push({ label: `fact(${i})`, value: i <= 1 ? '1' : '?', depth: n - i, status: i <= 1 ? 'done' : 'pending' });
      setFrames([...newFrames]);
      addLog(`Call: factorial(${i})${i <= 1 ? ' → base case = 1' : ''}`);
      await wait();
    }

    // Unwind
    let val = 1;
    for (let i = newFrames.length - 1; i >= 0; i--) {
      const num = n - newFrames[i].depth;
      val = num <= 1 ? 1 : num * val;
      newFrames[i].value = String(val);
      newFrames[i].status = 'done';
      setFrames([...newFrames]);
      addLog(`Return: factorial(${num}) = ${val}`);
      await wait();
    }

    setResult(val);
    addLog(`factorial(${n}) = ${val}`, 'success');
    setBusy(false);
  };

  const runFibonacci = async () => {
    setBusy(true); setResult(null); setFrames([]);
    addLog(`Computing fibonacci(${n})…`);
    const memo: Record<number, number> = {};
    const callFrames: typeof frames = [];

    const fib = async (x: number, depth: number): Promise<number> => {
      const frameIdx = callFrames.length;
      callFrames.push({ label: `fib(${x})`, value: '?', depth, status: 'computing' });
      setFrames([...callFrames]);
      addLog(`Call: fib(${x})`);
      await wait();

      let res: number;
      if (x <= 1) {
        res = x;
        addLog(`Base: fib(${x}) = ${x}`);
      } else if (memo[x] !== undefined) {
        res = memo[x];
        addLog(`Memo hit: fib(${x}) = ${res}`);
      } else {
        const a = await fib(x - 1, depth + 1);
        const b = await fib(x - 2, depth + 1);
        res = a + b;
        memo[x] = res;
      }

      callFrames[frameIdx].value = String(res);
      callFrames[frameIdx].status = 'done';
      setFrames([...callFrames]);
      addLog(`Return: fib(${x}) = ${res}`);
      await wait();
      return res;
    };

    const val = await fib(n, 0);
    setResult(val);
    addLog(`fibonacci(${n}) = ${val}`, 'success');
    setBusy(false);
  };

  const run = () => { if (mode === 'factorial') runFactorial(); else runFibonacci(); };

  const statusColor = (s: string) => {
    if (s === 'computing') return 'border-yellow/40 bg-yellow/5';
    if (s === 'done') return 'border-green/40 bg-green/5';
    return 'border-border-faint bg-surface-med/30';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl overflow-hidden border border-border-faint">
          <button onClick={() => setMode('factorial')} disabled={busy}
            className={`px-3 py-[7px] text-[11px] font-semibold transition-all ${mode === 'factorial' ? 'bg-blue/10 text-blue' : 'bg-transparent text-text-ghost hover:text-text-dim'}`}>Factorial</button>
          <button onClick={() => setMode('fibonacci')} disabled={busy}
            className={`px-3 py-[7px] text-[11px] font-semibold transition-all ${mode === 'fibonacci' ? 'bg-blue/10 text-blue' : 'bg-transparent text-text-ghost hover:text-text-dim'}`}>Fibonacci</button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-dim font-display">n:</span>
          <button onClick={() => setN(x => Math.max(1, x - 1))} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2"><Minus className="w-3 h-3" /></button>
          <span className="font-mono text-sm text-text-white font-bold w-6 text-center">{n}</span>
          <button onClick={() => setN(x => Math.min(mode === 'factorial' ? 12 : 8, x + 1))} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2"><Plus className="w-3 h-3" /></button>
        </div>
        <button onClick={run} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Play className="w-3.5 h-3.5" />Run</button>
        <button onClick={() => { setFrames([]); setResult(null); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        {result !== null && (
          <span className="ml-auto px-3 py-1.5 rounded-full text-[12px] font-mono bg-green/5 text-green border border-green/20">
            Result: {result}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 p-4 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        <span className="text-[10px] text-text-ghost font-display uppercase tracking-widest mb-2">Call Stack</span>
        {frames.map((f, i) => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-all ${statusColor(f.status)}`}
            style={{ marginLeft: f.depth * 16 }}>
            <span className="font-mono text-[12px] text-text-white font-semibold">{f.label}</span>
            <span className="text-[10px] text-text-ghost">→</span>
            <span className={`font-mono text-[12px] font-bold ${f.status === 'done' ? 'text-green' : 'text-yellow'}`}>{f.value}</span>
          </div>
        ))}
        {!frames.length && <span className="text-text-ghost text-sm font-display py-4 text-center">Click Run to visualize the recursive call stack</span>}
      </div>
    </div>
  );
}
