import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep } from '@/lib/drawUtils';
import { Play, RotateCcw, Minus, Plus } from 'lucide-react';

const COLORS = ['#6c8cff', '#ff6b6b', '#ffd166', '#00d4a8', '#9b5de5', '#ff9f43', '#5bc0eb'];

const THEORY = `## Tower of Hanoi — Recursive Algorithm

The **Tower of Hanoi** is a classic mathematical puzzle and a fundamental example of **recursion** in computer science. It was invented by the French mathematician Édouard Lucas in 1883.

### The Puzzle
You are given **3 pegs** (rods) and **N disks** of different sizes, initially stacked on the first peg in decreasing order of size (largest at the bottom).

**Goal**: Move all disks from the **source peg** to the **target peg**.

### Rules
1. Only **one disk** may be moved at a time.
2. Each move takes the **top disk** from one peg and places it on another.
3. A **larger disk** may never be placed on top of a **smaller disk**.

### Recursive Solution
The key insight is to think recursively:
1. Move the top **n-1** disks from Source to Auxiliary (using Target as helper).
2. Move the **nth disk** (largest) from Source to Target.
3. Move the **n-1** disks from Auxiliary to Target (using Source as helper).

\`\`\`
HANOI(n, source, target, auxiliary):
  if n == 1:
    move disk 1 from source to target
    return
  HANOI(n-1, source, auxiliary, target)
  move disk n from source to target
  HANOI(n-1, auxiliary, target, source)
\`\`\`

### Mathematical Analysis
- **Minimum moves required**: 2ⁿ - 1 (for n disks).
  - 3 disks → 7 moves
  - 4 disks → 15 moves
  - 5 disks → 31 moves
- **Time Complexity**: O(2ⁿ) — exponential growth.
- **Space Complexity**: O(n) — due to recursive call stack depth.

### Why It Matters
- **Teaches recursion**: One of the simplest and most elegant examples of breaking a problem into smaller subproblems.
- **Backup rotation schemes**: Used in computer science for disk backup strategies.
- **Gray codes**: The sequence of moves corresponds to a binary Gray code.
- **Mathematical induction**: Often used to teach proof by induction.

### Fun Fact
Legend says that monks at a temple are solving the Tower of Hanoi with 64 golden disks. When they finish, the world will end. At one move per second, it would take about **585 billion years** — far longer than the age of the universe!

### Complexity Summary
| Metric | Value |
|--------|-------|
| Minimum Moves | 2ⁿ - 1 |
| Time Complexity | O(2ⁿ) |
| Space Complexity | O(n) |
`;

interface Move { from: number; to: number; disk: number; }

function generateMoves(n: number, from: number, to: number, aux: number): Move[] {
  if (n === 0) return [];
  return [
    ...generateMoves(n - 1, from, aux, to),
    { from, to, disk: n },
    ...generateMoves(n - 1, aux, to, from),
  ];
}

export default function TowerOfHanoiModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [numDisks, setNumDisks] = useState(4);
  const [pegs, setPegs] = useState<number[][]>([[], [], []]);
  const [busy, setBusy] = useState(false);
  const [activeDisk, setActiveDisk] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const cancelRef = useRef(false);

  const initPegs = useCallback((n: number) => {
    const disks = Array.from({ length: n }, (_, i) => n - i);
    setPegs([disks, [], []]);
    setMoveCount(0);
    setActiveDisk(null);
  }, []);

  useEffect(() => {
    initPegs(numDisks);
  }, [numDisks, initPegs]);

  useEffect(() => {
    setComplexity([['Total Moves', `O(2^n)`, 'O(n)'], ['Per Move', 'O(1)', 'O(1)']]);
    setPseudocode(`HANOI(n, source, target, aux):\n  if n == 1:\n    move disk from source → target\n    return\n  HANOI(n-1, source, aux, target)\n  move disk n: source → target\n  HANOI(n-1, aux, target, source)`);
    setTheory(THEORY);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const solve = async () => {
    setBusy(true);
    cancelRef.current = false;
    const moves = generateMoves(numDisks, 0, 2, 1);
    addLog(`Solving for ${numDisks} disks (${moves.length} moves)…`, 'info');
    let count = 0;

    for (const move of moves) {
      if (cancelRef.current) { addLog('Cancelled', 'warn'); break; }
      setActiveDisk(move.disk);
      setPegs(prev => {
        const next = prev.map(p => [...p]);
        const disk = next[move.from].pop()!;
        next[move.to].push(disk);
        return next;
      });
      count++;
      setMoveCount(count);
      addLog(`Move ${count}: Disk ${move.disk} from Peg ${move.from + 1} → Peg ${move.to + 1}`);
      await wait();
    }

    setActiveDisk(null);
    if (!cancelRef.current) addLog(`Solved in ${count} moves!`, 'success');
    setBusy(false);
  };

  const reset = () => {
    cancelRef.current = true;
    setBusy(false);
    initPegs(numDisks);
    addLog('Reset');
  };

  const pegLabels = ['Source', 'Auxiliary', 'Target'];
  const maxWidth = 160;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-text-dim font-display">Disks:</span>
          <button onClick={() => setNumDisks(n => Math.max(2, n - 1))} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2"><Minus className="w-3 h-3" /></button>
          <span className="font-mono text-sm text-text-white font-bold w-6 text-center">{numDisks}</span>
          <button onClick={() => setNumDisks(n => Math.min(7, n + 1))} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2"><Plus className="w-3 h-3" /></button>
        </div>
        <button onClick={solve} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Play className="w-3.5 h-3.5" />Solve</button>
        <button onClick={reset} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        <span className="ml-auto text-[11px] font-mono text-text-dim">
          Moves: <span className="text-primary font-bold">{moveCount}</span> / {Math.pow(2, numDisks) - 1}
        </span>
      </div>

      <div className="flex-1 flex items-end justify-center gap-8 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        {pegs.map((peg, pi) => (
          <div key={pi} className="flex flex-col items-center" style={{ width: maxWidth + 40 }}>
            <div className="flex flex-col-reverse items-center justify-start" style={{ minHeight: numDisks * 28 + 20 }}>
              {peg.map((disk) => {
                const w = 30 + (disk / numDisks) * (maxWidth - 30);
                const isActive = activeDisk === disk;
                return (
                  <div
                    key={disk}
                    className={`rounded-lg transition-all duration-300 flex items-center justify-center mb-1 ${isActive ? 'scale-[1.05] shadow-lg' : ''}`}
                    style={{
                      width: w,
                      height: 24,
                      backgroundColor: COLORS[(disk - 1) % COLORS.length],
                      opacity: isActive ? 1 : 0.8,
                      boxShadow: isActive ? `0 0 20px ${COLORS[(disk - 1) % COLORS.length]}40` : 'none',
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold text-white/90">{disk}</span>
                  </div>
                );
              })}
            </div>
            {/* Peg base */}
            <div className="w-2 h-2 rounded-full bg-text-ghost mb-1" />
            <div className="w-full h-1 rounded-full bg-border-soft" />
            <span className="text-[10px] text-text-ghost font-display uppercase tracking-widest mt-2">{pegLabels[pi]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
