import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Minus, ArrowRight, Shuffle, RotateCcw, Search, CornerDownLeft } from 'lucide-react';

interface LLNode { val: number; id: number; }

let nodeId = 800;

const THEORY = `## Circular Linked List

A **Circular Linked List (CLL)** is a variation of a linked list where the **last node points back to the first node** instead of pointing to null. This forms a continuous loop.

### Structure
- It can be singly or doubly linked. This module visualizes a **Singly Circular Linked List**.
- There is no traditional "null" reference to signify the end of the list. Instead, you traverse until the next pointer equals the head.

### Core Operations
- **Prepend/Append**: O(n) in a basic implementation because you must find the tail to update its next pointer to the new head. If a \`tail\` pointer is explicitly maintained, append is O(1).
- **Insert At**: O(n). Same as a singly linked list.
- **Delete**: O(n). Same as singly, but deleting the head requires updating the tail's next pointer.
- **Search**: O(n). Must track the starting node to avoid infinite loops.

### Advantages over Linear Lists
- Any node can be a starting point. Traverse the entire list by just following the pointers.
- Useful for implementation of queues. A single pointer to the tail allows both front (tail.next) and back operations in O(1).
- Continuous looping makes it ideal for cyclical tasks.

### Real-World Applications
- **Round-Robin Scheduling**: The OS gives each process a time slice in a circular order.
- **Multiplayer Board Games**: Passing the turn to the next player.
- **Image Carousels**: Pressing "next" on the last image brings you to the first.
`;

export default function CircularLinkedListModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [nodes, setNodes] = useState<LLNode[]>([
    { val: 7, id: 1 }, { val: 24, id: 2 }, { val: 18, id: 3 }, { val: 56, id: 4 },
  ]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [idx, setIdx] = useState('1');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Prepend','O(n)','O(1)'],['Append','O(n)','O(1)'],['Insert At','O(n)','O(1)'],['Delete','O(n)','O(1)'],['Search','O(n)','O(1)']]);
    setPseudocode(`PREPEND(val):n  newNode.next = headn  if head: tail.next = newNoden  else: newNode.next = newNoden  head = newNodennAPPEND(val):n  if !head: PREPEND(val)n  else: tail.next = newNode; newNode.next = headnnDELETE_HEAD():n  if head == tail: head = nulln  else: tail.next = head.next; head = head.next`);
    setTheory(THEORY);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const prepend = async () => {
    const v = parseInt(val);
    if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true);
    const newNode = { val: v, id: nodeId++ };
    setNodes(p => [newNode, ...p]);
    setHl({ 0: 'new' });
    addLog(`Prepended ${v} as new head`, 'success');
    await wait();
    setHl({});
    setBusy(false);
    setVal('');
  };

  const append = async () => {
    const v = parseInt(val);
    if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true);
    addLog('Traversing to tail…');
    for (let i = 0; i < nodes.length; i++) {
      setHl({ [i]: 'active' });
      await wait();
    }
    const newNode = { val: v, id: nodeId++ };
    setNodes(p => [...p, newNode]);
    setHl({ [nodes.length]: 'new' });
    addLog(`Appended ${v} at tail`, 'success');
    await wait();
    setHl({});
    setBusy(false);
    setVal('');
  };

  const deleteFirst = async () => {
    if (!nodes.length) { addLog('List is empty!', 'error'); return; }
    setBusy(true);
    setHl({ 0: 'active' });
    addLog(`Deleting head node (${nodes[0].val})…`);
    await wait();
    setNodes(p => p.slice(1));
    setHl({});
    addLog('Head deleted', 'success');
    setBusy(false);
  };

  const search = async () => {
    const v = parseInt(val);
    if (isNaN(v)) { addLog('Enter a value to search', 'warn'); return; }
    setBusy(true);
    addLog(`Searching for ${v}…`);
    for (let i = 0; i < nodes.length; i++) {
      setHl({ [i]: 'active' });
      addLog(`Checking node ${i}: ${nodes[i].val}`);
      await wait();
      if (nodes[i].val === v) {
        setHl({ [i]: 'found' });
        addLog(`Found ${v} at position ${i}!`, 'success');
        await sleep(1200);
        setHl({});
        setBusy(false);
        return;
      }
    }
    setHl({});
    addLog(`${v} not found (Full circle completed)`, 'error');
    setBusy(false);
  };

  const insertAt = async () => {
    const v = parseInt(val);
    const pos = parseInt(idx);
    if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    if (isNaN(pos) || pos < 0 || pos > nodes.length) { addLog('Enter a valid index', 'warn'); return; }
    
    setBusy(true);
    if (pos === 0) {
      addLog(`Inserting ${v} at head (index 0)`);
      const newNode = { val: v, id: nodeId++ };
      setNodes(p => [newNode, ...p]);
      setHl({ 0: 'new' });
      await wait();
    } else {
      addLog(`Traversing to index ${pos - 1}…`);
      for (let i = 0; i < pos; i++) {
        setHl({ [i]: 'active' });
        await wait();
      }
      const newNode = { val: v, id: nodeId++ };
      setNodes(p => { const arr = [...p]; arr.splice(pos, 0, newNode); return arr; });
      setHl({ [pos]: 'new' });
      addLog(`Inserted ${v} at index ${pos}`, 'success');
      await wait();
    }
    setHl({});
    setBusy(false);
    setVal('');
  };

  const deleteAt = async () => {
    const pos = parseInt(idx);
    if (isNaN(pos) || pos < 0 || pos >= nodes.length) { addLog('Enter a valid index', 'warn'); return; }
    
    setBusy(true);
    if (pos === 0) {
      addLog(`Deleting head node (index 0)`);
      setHl({ 0: 'active' });
      await wait();
      setNodes(p => p.slice(1));
      addLog('Head deleted', 'success');
    } else {
      addLog(`Traversing to index ${pos - 1}…`);
      for (let i = 0; i < pos; i++) {
        setHl({ [i]: 'active' });
        await wait();
      }
      addLog(`Removing node at index ${pos}`);
      setHl({ [pos - 1]: 'active', [pos]: 'found' });
      await wait();
      setNodes(p => { const arr = [...p]; arr.splice(pos, 1); return arr; });
      addLog(`Deleted node at index ${pos}`, 'success');
    }
    setHl({});
    setBusy(false);
  };

  const nc = (s?: string) => {
    if (s === 'active') return 'border-yellow/40 bg-yellow/5 shadow-[0_0_16px_rgba(255,209,102,0.15)] scale-[1.03]';
    if (s === 'found') return 'border-green/40 bg-green/5 shadow-[0_0_20px_rgba(74,222,128,0.2)] scale-[1.03]';
    if (s === 'new') return 'border-blue/40 bg-blue/5 shadow-[0_0_16px_rgba(108,140,255,0.15)] anim-pop-in';
    return 'border-border-soft bg-surface-med/50';
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2 relative z-10">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-20" />
        <input placeholder="Idx" value={idx} onChange={e => setIdx(e.target.value)} disabled={busy} className="input-field w-12" />
        <button onClick={prepend} disabled={busy} className="pill-btn pill-primary text-[11px] py-2 px-2.5">Prepend</button>
        <button onClick={append} disabled={busy} className="pill-btn pill-secondary text-[11px] py-2 px-2.5">Append</button>
        <button onClick={insertAt} disabled={busy} className="pill-btn pill-teal text-[11px] py-2 px-2.5">Insert At</button>
        <button onClick={deleteFirst} disabled={busy} className="pill-btn pill-red text-[11px] py-2 px-2.5">Del Head</button>
        <button onClick={deleteAt} disabled={busy} className="pill-btn pill-red text-[11px] py-2 px-2.5">Del At</button>
        <button onClick={search} disabled={busy} className="pill-btn text-text-white bg-surface-high border border-border-faint hover:border-border-soft text-[11px] py-2 px-2.5"><Search className="w-3.5 h-3.5" /></button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setNodes(Array.from({ length: randInt(3, 7) }, () => ({ val: randInt(1, 99), id: nodeId++ }))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setNodes([{ val: 7, id: 1 }, { val: 24, id: 2 }, { val: 18, id: 3 }, { val: 56, id: 4 }]); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-start gap-1 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto relative">
        <span className="text-[10px] text-primary font-display uppercase tracking-widest mr-3">Head</span>
        {nodes.map((n, i) => {
          const memAddr = `0x${((n.id * 77773) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`;
          // In circular, tail's next is head
          const nextAddr = i < nodes.length - 1 
            ? `0x${((nodes[i+1].id * 77773) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}` 
            : `0x${((nodes[0].id * 77773) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`;
          
          return (
            <div key={n.id} className={`flex items-center gap-1 group relative z-10 ${i === nodes.length - 1 ? 'last-node-marker' : ''}`}>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-text-ghost mb-1 tracking-wider opacity-60 group-hover:opacity-100 transition-opacity bg-black/20 px-1.5 py-0.5 rounded">
                  {memAddr}
                </span>

                <div className={`relative rounded-xl border transition-all duration-300 flex flex-row overflow-hidden ${nc(hl[i])}`}>
                  <div className="flex flex-col items-center justify-center px-3 py-2 min-w-[48px]">
                    <span className="text-[7px] text-text-ghost font-display uppercase tracking-widest mb-0.5">Data</span>
                    <span className="font-mono text-sm text-text-white font-bold">{n.val}</span>
                  </div>
                  <div className="w-px bg-border-faint" />
                  <div className="flex flex-col items-center justify-center px-2 py-2 min-w-[50px] bg-primary/5">
                    <span className="text-[7px] text-primary/60 font-display uppercase tracking-widest mb-0.5">Next</span>
                    <span className="text-[9px] font-mono text-primary">{nextAddr}</span>
                  </div>
                </div>
              </div>
              {i < nodes.length - 1 ? (
                 <ArrowRight className="w-5 h-5 text-primary/40 flex-shrink-0 mx-0.5" />
              ) : (
                 <div className="flex items-center gap-1 mx-2">
                   <div className="h-[2px] w-8 bg-primary/40" />
                   <CornerDownLeft className="w-5 h-5 text-primary/40 -ml-1 mt-3 transform scale-[-1] opacity-70" />
                 </div>
              )}
            </div>
          );
        })}
        {!nodes.length && <span className="text-text-ghost text-sm font-display mt-[20px]">Empty list</span>}
      </div>
    </div>
  );
}
