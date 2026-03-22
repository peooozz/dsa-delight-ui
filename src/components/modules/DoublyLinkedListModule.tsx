import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Minus, ArrowLeftRight, Shuffle, RotateCcw, Search } from 'lucide-react';

interface LLNode { val: number; id: number; }

let nodeId = 500;

const THEORY = `## Doubly Linked List

A **Doubly Linked List (DLL)** is a variation of the linked list where each node contains **two pointers** instead of one: a \`prev\` pointer to the previous node and a \`next\` pointer to the next node.

### Structure of a Node
Each node contains three parts:
1. **Prev Pointer**: Reference to the previous node (null for the head).
2. **Data**: The value stored in the node.
3. **Next Pointer**: Reference to the next node (null for the tail).

### Core Operations
- **Prepend/Append**: O(1) if you have head/tail pointers.
- **Insert At**: O(n). Must update \`prev\` and \`next\` pointers for adjacent nodes.
- **Delete**: O(1) if you have a reference to the node (since you have access to both \`prev\` and \`next\` directly without traversing again). O(n) if searching.
- **Search**: O(n). Can traverse forwards OR backwards!

### Advantages over Singly Linked Lists
- Can be traversed in **both directions**.
- Deleting a given node is O(1) (vs O(n) for singly linked list where you need to find the node before it).
- Easy to reverse.

### Disadvantages
- Each node requires extra memory for the \`prev\` pointer.
- Insertions and deletions require more complex code strictly updating more pointers.

### Applications
- Cache mechanisms like LRU Cache.
- Browser history (back/forward buttons).
- Undo/redo stacks in text editors.
`;

export default function DoublyLinkedListModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [nodes, setNodes] = useState<LLNode[]>([
    { val: 4, id: 1 }, { val: 15, id: 2 }, { val: 9, id: 3 }, { val: 32, id: 4 },
  ]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [idx, setIdx] = useState('1');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Prepend','O(1)','O(1)'],['Append','O(n)','O(1)'],['Insert At','O(n)','O(1)'],['Delete','O(n)','O(1)'],['Search','O(n)','O(1)']]);
    setPseudocode(`PREPEND(val):\n  newNode.next = head; if head: head.prev = newNode\n  head = newNode\n\nAPPEND(val):\n  curr = head; while curr.next: curr=curr.next\n  curr.next = newNode; newNode.prev = curr\n\nINSERT_AT(idx, val):\n  curr=head; for i=0 to idx-1: curr=curr.next\n  newNode.next = curr.next; newNode.prev = curr\n  if curr.next: curr.next.prev = newNode\n  curr.next = newNode\n\nDELETE_AT(idx):\n  curr=head; for i=0 to idx: curr=curr.next\n  if curr.prev: curr.prev.next = curr.next\n  if curr.next: curr.next.prev = curr.prev`);
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
    addLog(`${v} not found`, 'error');
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
      addLog(`Traversing to index ${pos}…`);
      for (let i = 0; i <= pos; i++) {
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
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-20" />
        <input placeholder="Idx" value={idx} onChange={e => setIdx(e.target.value)} disabled={busy} className="input-field w-12" />
        <button onClick={prepend} disabled={busy} className="pill-btn pill-primary text-[11px] py-2 px-2.5">Prepend</button>
        <button onClick={append} disabled={busy} className="pill-btn pill-secondary text-[11px] py-2 px-2.5">Append</button>
        <button onClick={insertAt} disabled={busy} className="pill-btn pill-teal text-[11px] py-2 px-2.5">Insert At</button>
        <button onClick={deleteFirst} disabled={busy} className="pill-btn pill-red text-[11px] py-2 px-2.5">Del Head</button>
        <button onClick={deleteAt} disabled={busy} className="pill-btn pill-red text-[11px] py-2 px-2.5">Del At</button>
        <button onClick={search} disabled={busy} className="pill-btn text-text-white bg-surface-high border border-border-faint hover:border-border-soft text-[11px] py-2 px-2.5"><Search className="w-3.5 h-3.5" /></button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setNodes(Array.from({ length: randInt(3, 6) }, () => ({ val: randInt(1, 99), id: nodeId++ }))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setNodes([{ val: 4, id: 1 }, { val: 15, id: 2 }, { val: 9, id: 3 }, { val: 32, id: 4 }]); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-start gap-1 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        <span className="text-[10px] text-primary font-display uppercase tracking-widest mr-3">Head</span>
        {nodes.map((n, i) => {
          const memAddr = `0x${((n.id * 88883) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`;
          const prevAddr = i > 0 ? `0x${((nodes[i-1].id * 88883) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}` : 'NULL';
          const nextAddr = i < nodes.length - 1 ? `0x${((nodes[i+1].id * 88883) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}` : 'NULL';
          
          return (
            <div key={n.id} className="flex items-center gap-1 group">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-text-ghost mb-1 tracking-wider opacity-60 group-hover:opacity-100 transition-opacity bg-black/20 px-1.5 py-0.5 rounded">
                  {memAddr}
                </span>

                <div className={`relative rounded-xl border transition-all duration-300 flex flex-row overflow-hidden ${nc(hl[i])}`}>
                  <div className="flex flex-col items-center justify-center px-2 py-2 min-w-[50px] bg-secondary/5">
                    <span className="text-[7px] text-secondary/60 font-display uppercase tracking-widest mb-0.5">Prev</span>
                    <span className={`text-[9px] font-mono ${prevAddr === 'NULL' ? 'text-red/60 font-bold' : 'text-secondary'}`}>{prevAddr}</span>
                  </div>
                  <div className="w-px bg-border-faint" />
                  
                  <div className="flex flex-col items-center justify-center px-3 py-2 min-w-[48px]">
                    <span className="text-[7px] text-text-ghost font-display uppercase tracking-widest mb-0.5">Data</span>
                    <span className="font-mono text-sm text-text-white font-bold">{n.val}</span>
                  </div>
                  
                  <div className="w-px bg-border-faint" />
                  <div className="flex flex-col items-center justify-center px-2 py-2 min-w-[50px] bg-primary/5">
                    <span className="text-[7px] text-primary/60 font-display uppercase tracking-widest mb-0.5">Next</span>
                    <span className={`text-[9px] font-mono ${nextAddr === 'NULL' ? 'text-red/60 font-bold' : 'text-primary'}`}>{nextAddr}</span>
                  </div>
                </div>
              </div>
              {i < nodes.length - 1 && <ArrowLeftRight className="w-5 h-5 text-secondary/40 flex-shrink-0 mx-0.5" />}
            </div>
          );
        })}
        {nodes.length > 0 && (
          <div className="flex items-center gap-1 ml-1 mt-[20px]">
             <span className="text-[10px] text-red/50 font-mono px-2 py-1 rounded border border-red/20 bg-red/5">NULL</span>
          </div>
        )}
        {!nodes.length && <span className="text-text-ghost text-sm font-display mt-[20px]">Empty list</span>}
      </div>
    </div>
  );
}
