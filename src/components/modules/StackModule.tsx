import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { ArrowUpFromLine, ArrowDownToLine, Eye, Shuffle, RotateCcw } from 'lucide-react';

export default function StackModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [stack, setStack] = useState([12, 45, 7, 33]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Push','O(1)','O(1)'],['Pop','O(1)','O(1)'],['Peek','O(1)','O(1)'],['Search','O(n)','O(1)']]);
    setPseudocode(`PUSH(val):\n  top++; stack[top] = val\n\nPOP():\n  val = stack[top]; top--\n  return val\n\nPEEK(): return stack[top]`);
    setTheory(`## Stack — LIFO Data Structure\n\nA **Stack** is a linear data structure that follows the **Last In, First Out (LIFO)** principle. The most recently added element is the first to be removed — like a stack of plates.\n\n### Core Operations\n- **Push**: Add an element to the top. Time: O(1).\n- **Pop**: Remove the top element. Time: O(1).\n- **Peek / Top**: View the top element without removing it. Time: O(1).\n\n### How It Works\nA stack maintains a pointer (or index) called **top** that tracks the topmost element. Push increments top and places the element; pop reads and decrements top.\n\n### Real-World Applications\n- **Function Call Stack**: Every program uses a stack to manage function calls and local variables.\n- **Undo/Redo**: Text editors push each action onto a stack to support undo.\n- **Expression Evaluation**: Compilers use stacks to evaluate postfix expressions and check balanced parentheses.\n- **Backtracking**: DFS in graphs, maze solving, and puzzle solvers use stacks.\n- **Browser History**: The back button pops from a navigation stack.\n\n### Stack Overflow & Underflow\n- **Overflow**: Pushing to a full stack (fixed-size implementation).\n- **Underflow**: Popping from an empty stack.\n\n### Implementations\n| Method | Push | Pop | Notes |\n|--------|------|-----|-------|\n| Array-based | O(1) amortized | O(1) | May need resizing |\n| Linked List | O(1) | O(1) | No size limit |\n\n### Complexity Summary\n| Operation | Time | Space |\n|-----------|------|-------|\n| Push | O(1) | O(1) |\n| Pop | O(1) | O(1) |\n| Peek | O(1) | O(1) |\n| Search | O(n) | O(1) |`);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const push = async () => {
    const v = parseInt(val);
    if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); setStack(p => [...p, v]); setHl({ [stack.length]: 'new' });
    addLog(`Pushed ${v}`, 'success'); await wait(); setHl({}); setBusy(false); setVal('');
  };

  const pop = async () => {
    if (!stack.length) { addLog('Underflow!', 'error'); return; }
    setBusy(true); setHl({ [stack.length - 1]: 'active' });
    addLog(`Popping ${stack.at(-1)}…`); await wait();
    setStack(p => p.slice(0, -1)); setHl({}); addLog('Popped', 'success'); setBusy(false);
  };

  const peek = async () => {
    if (!stack.length) { addLog('Empty!', 'error'); return; }
    setBusy(true); setHl({ [stack.length - 1]: 'found' });
    addLog(`Top = ${stack.at(-1)}`, 'success'); await sleep(1200); setHl({}); setBusy(false);
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
        <button onClick={push} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><ArrowUpFromLine className="w-3.5 h-3.5" />Push</button>
        <button onClick={pop} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><ArrowDownToLine className="w-3.5 h-3.5" />Pop</button>
        <button onClick={peek} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Eye className="w-3.5 h-3.5" />Peek</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setStack(Array.from({ length: randInt(3, 7) }, () => randInt(1, 99))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setStack([12, 45, 7, 33]); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col-reverse items-center justify-start gap-2 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        <span className="text-[10px] text-text-ghost font-display uppercase tracking-widest mt-2">Bottom</span>
        {stack.map((v, i) => (
          <div key={`${i}-${v}`} className={`relative w-40 py-3 px-4 rounded-xl border transition-all duration-300 flex items-center justify-center ${nc(hl[i])}`}>
            <span className="font-mono text-sm text-text-white font-semibold">{v}</span>
            {i === stack.length - 1 && (
              <span className="absolute -right-12 text-[10px] font-display uppercase tracking-widest text-primary">TOP</span>
            )}
          </div>
        ))}
        {!stack.length && <span className="text-text-ghost text-sm font-display">Empty</span>}
      </div>
    </div>
  );
}
