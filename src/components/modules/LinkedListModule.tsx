import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Minus, ArrowRight, Shuffle, RotateCcw, Search } from 'lucide-react';

interface LLNode { val: number; id: number; }

let nodeId = 100;

const THEORY = `## Linked List — Dynamic Linear Structure

A **Linked List** is a linear data structure where elements (called **nodes**) are stored in non-contiguous memory locations and connected via **pointers**. Unlike arrays, linked lists don't need a contiguous block of memory.

### Structure of a Node
Each node contains two parts:
1. **Data**: The value stored in the node.
2. **Next Pointer**: A reference to the next node in the sequence (null for the last node).

### Types of Linked Lists
| Type | Description |
|------|-------------|
| **Singly Linked List** | Each node points to the next node only. One-directional traversal. |
| **Doubly Linked List** | Each node has pointers to both the next and previous nodes. |
| **Circular Linked List** | The last node points back to the first node, forming a loop. |

### Core Operations
- **Prepend (Insert at Head)**: Create a new node, point it to the current head, update head. Time: O(1).
- **Append (Insert at Tail)**: Traverse to the end, attach a new node. Time: O(n) — or O(1) with a tail pointer.
- **Delete**: Find the node, update the previous node's pointer to skip it. Time: O(n).
- **Search**: Traverse the list comparing each node's value. Time: O(n).

### Advantages over Arrays
- **Dynamic size**: No need to declare a fixed size upfront.
- **Efficient insertions/deletions**: No shifting of elements required (once the position is found).
- **No wasted memory**: Allocates memory per node, only when needed.

### Disadvantages
- **No random access**: Must traverse from the head to reach a specific element.
- **Extra memory**: Each node requires additional memory for the pointer.
- **Cache-unfriendly**: Nodes are scattered in memory, reducing cache performance.

### Real-World Applications
- **Undo/Redo functionality** in editors (doubly linked list).
- **Browser history** navigation (back/forward).
- **Music playlists** (next/previous song).
- **Hash table chaining** for collision resolution.
- **Memory allocation** in operating systems (free block lists).

### Complexity Summary
| Operation | Time | Space |
|-----------|------|-------|
| Prepend | O(1) | O(1) |
| Append | O(n) | O(1) |
| Delete | O(n) | O(1) |
| Search | O(n) | O(1) |
`;

export default function LinkedListModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [nodes, setNodes] = useState<LLNode[]>([
    { val: 5, id: 1 }, { val: 12, id: 2 }, { val: 8, id: 3 }, { val: 21, id: 4 },
  ]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [val, setVal] = useState('');
  const [idx, setIdx] = useState('1');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Prepend','O(1)','O(1)'],['Append','O(n)','O(1)'],['Insert At','O(n)','O(1)'],['Delete','O(n)','O(1)'],['Search','O(n)','O(1)']]);
    setPseudocode(`PREPEND(val):\n  newNode.next = head; head = newNode\n\nAPPEND(val):\n  curr = head; while curr.next: curr=curr.next\n  curr.next = newNode\n\nINSERT_AT(idx, val):\n  if idx==0: PREPEND(val)\n  curr=head; for i=0 to idx-1: curr=curr.next\n  newNode.next = curr.next; curr.next = newNode\n\nDELETE_AT(idx):\n  if idx==0: head=head.next\n  curr=head; for i=0 to idx-1: curr=curr.next\n  curr.next = curr.next.next`);
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
    if (isNaN(v)) { addLog('Enter a value to insert', 'warn'); return; }
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
      setNodes(p => {
        const arr = [...p];
        arr.splice(pos, 0, newNode);
        return arr;
      });
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
      setHl({ [pos - 1]: 'active', [pos]: 'found' }); // mark target
      await wait();
      setNodes(p => {
        const arr = [...p];
        arr.splice(pos, 1);
        return arr;
      });
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
          <button onClick={() => { setNodes(Array.from({ length: randInt(3, 7) }, () => ({ val: randInt(1, 99), id: nodeId++ }))); setHl({}); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setNodes([{ val: 5, id: 1 }, { val: 12, id: 2 }, { val: 8, id: 3 }, { val: 21, id: 4 }]); setHl({}); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-start gap-1 p-6 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-auto">
        <span className="text-[10px] text-primary font-display uppercase tracking-widest mr-3">Head</span>
        {nodes.map((n, i) => {
          const memAddr = `0x${((n.id * 99991) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`;
          const nextAddr = i < nodes.length - 1 ? `0x${((nodes[i+1].id * 99991) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}` : 'NULL';
          
          return (
            <div key={n.id} className="flex items-center gap-1 group">
              <div className="flex flex-col items-center">
                {/* Memory Address floating above */}
                <span className="text-[8px] font-mono text-text-ghost mb-1 tracking-wider opacity-60 group-hover:opacity-100 transition-opacity bg-black/20 px-1.5 py-0.5 rounded">
                  {memAddr}
                </span>

                <div className={`relative rounded-xl border transition-all duration-300 flex flex-row overflow-hidden ${nc(hl[i])}`}>
                  {/* Data section */}
                  <div className="flex flex-col items-center justify-center px-3 py-2 min-w-[48px]">
                    <span className="text-[7px] text-text-ghost font-display uppercase tracking-widest mb-0.5">Data</span>
                    <span className="font-mono text-sm text-text-white font-bold">{n.val}</span>
                  </div>
                  {/* Divider */}
                  <div className="w-px bg-border-faint" />
                  {/* Next pointer section */}
                  <div className="flex flex-col items-center justify-center px-2 py-2 min-w-[50px] bg-primary/5">
                    <span className="text-[7px] text-primary/60 font-display uppercase tracking-widest mb-0.5">Next</span>
                    <span className={`text-[9px] font-mono ${nextAddr === 'NULL' ? 'text-red/60 font-bold' : 'text-primary'}`}>
                      {nextAddr}
                    </span>
                  </div>
                </div>
              </div>
              {i < nodes.length - 1 && <ArrowRight className="w-5 h-5 text-primary/40 flex-shrink-0 mx-0.5" />}
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
