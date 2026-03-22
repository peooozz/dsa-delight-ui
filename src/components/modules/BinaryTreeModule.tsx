import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Trash2, Shuffle, RotateCcw } from 'lucide-react';

class TN { v: number; l: TN | null; r: TN | null; constructor(v: number) { this.v = v; this.l = null; this.r = null; } }

function ins(n: TN | null, v: number): TN { if (!n) return new TN(v); if (v < n.v) n.l = ins(n.l, v); else if (v > n.v) n.r = ins(n.r, v); return n; }
function del(n: TN | null, v: number): TN | null { if (!n) return null; if (v < n.v) n.l = del(n.l, v); else if (v > n.v) n.r = del(n.r, v); else { if (!n.l) return n.r; if (!n.r) return n.l; let m = n.r; while (m.l) m = m.l; n.v = m.v; n.r = del(n.r, m.v); } return n; }
function clone(n: TN | null): TN | null { if (!n) return null; const c = new TN(n.v); c.l = clone(n.l); c.r = clone(n.r); return c; }
function dflt(): TN { let r: TN | null = null; [50, 30, 70, 20, 40, 60, 80].forEach(v => r = ins(r, v)); return r!; }
function inorder(n: TN | null, a: number[] = []): number[] { if (n) { inorder(n.l, a); a.push(n.v); inorder(n.r, a); } return a; }
function preorder(n: TN | null, a: number[] = []): number[] { if (n) { a.push(n.v); preorder(n.l, a); preorder(n.r, a); } return a; }
function postorder(n: TN | null, a: number[] = []): number[] { if (n) { postorder(n.l, a); postorder(n.r, a); a.push(n.v); } return a; }
function lvlorder(n: TN | null): number[] { if (!n) return []; const r: number[] = [], q: TN[] = [n]; while (q.length) { const x = q.shift()!; r.push(x.v); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } return r; }

interface FlatItem { v?: number; x?: number; y?: number; e?: boolean; x1?: number; y1?: number; x2?: number; y2?: number; }
function flat(n: TN | null, x: number, y: number, dx: number, o: FlatItem[]) {
  if (!n) return;
  o.push({ v: n.v, x, y });
  if (n.l) { o.push({ e: true, x1: x, y1: y, x2: x - dx, y2: y + 70 }); flat(n.l, x - dx, y + 70, dx * 0.52, o); }
  if (n.r) { o.push({ e: true, x1: x, y1: y, x2: x + dx, y2: y + 70 }); flat(n.r, x + dx, y + 70, dx * 0.52, o); }
}

export default function BinaryTreeModule() {
  const { speed, addLog, setComplexity, setPseudocode, stepMode, waitForStep } = useApp();
  const [root, setRoot] = useState<TN>(() => dflt());
  const [active, setActive] = useState(new Set<number>());
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Insert','O(log n)','O(log n)'],['Delete','O(log n)','O(log n)'],['Traversal','O(n)','O(n)']]);
    setPseudocode(`IN-ORDER(node):\n  IN-ORDER(left)\n  visit(node)\n  IN-ORDER(right)\n\nPRE-ORDER: visit → left → right\nPOST-ORDER: left → right → visit`);
  }, [setComplexity, setPseudocode]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const doIns = async () => { const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; } setBusy(true); setRoot(ins(clone(root)!, v)); setActive(new Set([v])); addLog(`Inserted ${v}`, 'success'); await wait(); setActive(new Set()); setBusy(false); setVal(''); };
  const doDel = async () => { const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; } setBusy(true); setActive(new Set([v])); await wait(); setRoot(del(clone(root)!, v) as TN); addLog(`Deleted ${v}`, 'success'); setActive(new Set()); setBusy(false); setVal(''); };
  const trav = async (name: string, fn: (n: TN | null) => number[]) => {
    setBusy(true); const o = fn(root); addLog(`${name}: [${o.join(', ')}]`);
    for (const v of o) { setActive(new Set([v])); await wait(); }
    setActive(new Set()); addLog(`${name} done`, 'success'); setBusy(false);
  };

  const items: FlatItem[] = []; flat(root, 400, 40, 150, items);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-24" />
        <button onClick={doIns} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Insert</button>
        <button onClick={doDel} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><Trash2 className="w-3.5 h-3.5" />Delete</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => trav('In-Order', inorder)} disabled={busy} className="pill-btn pill-secondary text-[11px] py-1.5 px-2.5">In-Order</button>
        <button onClick={() => trav('Pre-Order', preorder)} disabled={busy} className="pill-btn pill-secondary text-[11px] py-1.5 px-2.5">Pre-Order</button>
        <button onClick={() => trav('Post-Order', postorder)} disabled={busy} className="pill-btn pill-secondary text-[11px] py-1.5 px-2.5">Post-Order</button>
        <button onClick={() => trav('Level-Order', lvlorder)} disabled={busy} className="pill-btn pill-secondary text-[11px] py-1.5 px-2.5">Level</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { let r: TN | null = null; Array.from({ length: randInt(5, 9) }, () => randInt(1, 99)).forEach(v => r = ins(r, v)); setRoot(r!); setActive(new Set()); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setRoot(dflt()); setActive(new Set()); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>
      <div className="flex-1 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-hidden">
        <svg viewBox="0 0 800 400" className="w-full h-full">
          {items.filter(i => i.e).map((e, idx) => (
            <line key={`e-${idx}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
          ))}
          {items.filter(i => !i.e).map((n, idx) => {
            const a = active.has(n.v!);
            return (
              <g key={`n-${idx}`} className="viz-node">
                {a && <circle cx={n.x} cy={n.y} r="26" fill="rgba(108,140,255,0.06)" />}
                <circle cx={n.x} cy={n.y} r="20" fill={a ? 'rgba(108,140,255,0.1)' : 'rgba(255,255,255,0.02)'} stroke={a ? 'rgba(108,140,255,0.4)' : 'rgba(255,255,255,0.06)'} strokeWidth="1.5" />
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill={a ? '#6C8CFF' : '#e2e8f0'} fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">{n.v}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
