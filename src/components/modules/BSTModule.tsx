import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep, randInt } from '@/lib/drawUtils';
import { Plus, Search, Trash2, Shuffle, RotateCcw } from 'lucide-react';

class BN { v: number; l: BN | null; r: BN | null; constructor(v: number) { this.v = v; this.l = null; this.r = null; } }

function ins(n: BN | null, v: number): BN {
  if (!n) return new BN(v);
  if (v < n.v) n.l = ins(n.l, v); else if (v > n.v) n.r = ins(n.r, v);
  return n;
}

function del(n: BN | null, v: number): BN | null {
  if (!n) return null;
  if (v < n.v) n.l = del(n.l, v);
  else if (v > n.v) n.r = del(n.r, v);
  else {
    if (!n.l) return n.r; if (!n.r) return n.l;
    let m = n.r; while (m.l) m = m.l;
    n.v = m.v; n.r = del(n.r, m.v);
  }
  return n;
}

function clone(n: BN | null): BN | null {
  if (!n) return null;
  const c = new BN(n.v); c.l = clone(n.l); c.r = clone(n.r); return c;
}

function dflt(): BN { let r: BN | null = null; [50, 30, 70, 20, 40, 60, 80, 10, 25].forEach(v => r = ins(r, v)); return r!; }

function spath(r: BN | null, v: number) {
  const p: number[] = []; let n = r;
  while (n) { p.push(n.v); if (v === n.v) return { p, found: true }; n = v < n.v ? n.l : n.r; }
  return { p, found: false };
}

function height(n: BN | null): number { if (!n) return 0; return 1 + Math.max(height(n.l), height(n.r)); }

interface FlatItem { v?: number; x?: number; y?: number; e?: boolean; x1?: number; y1?: number; x2?: number; y2?: number; }
function flat(n: BN | null, x: number, y: number, dx: number, o: FlatItem[]) {
  if (!n) return;
  o.push({ v: n.v, x, y });
  if (n.l) { o.push({ e: true, x1: x, y1: y, x2: x - dx, y2: y + 70 }); flat(n.l, x - dx, y + 70, dx * 0.52, o); }
  if (n.r) { o.push({ e: true, x1: x, y1: y, x2: x + dx, y2: y + 70 }); flat(n.r, x + dx, y + 70, dx * 0.52, o); }
}

export default function BSTModule() {
  const { speed, addLog, setComplexity, setPseudocode, stepMode, waitForStep } = useApp();
  const [root, setRoot] = useState<BN>(() => dflt());
  const [path, setPath] = useState(new Set<number>());
  const [found, setFound] = useState<number | null>(null);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Search','O(log n)','O(1)'],['Insert','O(log n)','O(1)'],['Delete','O(log n)','O(1)']]);
    setPseudocode(`SEARCH(node, val):\n  if node == null: NOT FOUND\n  if val == node.val: FOUND!\n  if val < node.val: go LEFT\n  else: go RIGHT\n\n→ Each step halves the tree = O(log n)`);
  }, [setComplexity, setPseudocode]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const doSearch = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); const { p, found: f } = spath(root, v);
    for (let i = 0; i < p.length; i++) { setPath(new Set(p.slice(0, i + 1))); addLog(`Visit ${p[i]}`); await wait(); }
    if (f) { setFound(v); addLog(`Found ${v}!`, 'success'); } else { addLog('Not found', 'error'); }
    await sleep(1200); setPath(new Set()); setFound(null); setBusy(false);
  };

  const doIns = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); const { p } = spath(root, v);
    for (let i = 0; i < p.length; i++) { setPath(new Set(p.slice(0, i + 1))); await wait(); }
    setRoot(ins(clone(root)!, v)); setFound(v); addLog(`Inserted ${v}`, 'success');
    await wait(); setPath(new Set()); setFound(null); setBusy(false); setVal('');
  };

  const doDel = async () => {
    const v = parseInt(val); if (isNaN(v)) { addLog('Enter a value', 'warn'); return; }
    setBusy(true); const { p, found: f } = spath(root, v);
    for (let i = 0; i < p.length; i++) { setPath(new Set(p.slice(0, i + 1))); await wait(); }
    if (f) { setRoot(del(clone(root)!, v) as BN); addLog(`Deleted ${v}`, 'success'); } else { addLog('Not found', 'error'); }
    await wait(); setPath(new Set()); setFound(null); setBusy(false); setVal('');
  };

  const h = height(root);
  const items: FlatItem[] = []; flat(root, 350, 30, 140, items);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Value" value={val} onChange={e => setVal(e.target.value)} disabled={busy} className="input-field w-24" />
        <button onClick={doIns} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Insert</button>
        <button onClick={doDel} disabled={busy} className="pill-btn pill-red text-[12px] py-2 px-3"><Trash2 className="w-3.5 h-3.5" />Delete</button>
        <button onClick={doSearch} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Search className="w-3.5 h-3.5" />Search</button>
        <span className="text-[11px] text-text-ghost font-mono ml-2">Height: {h}</span>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { let r: BN | null = null; Array.from({ length: randInt(6, 10) }, () => randInt(1, 99)).forEach(v => r = ins(r, v)); setRoot(r!); setPath(new Set()); setFound(null); addLog('Randomized'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><Shuffle className="w-3 h-3" />Random</button>
          <button onClick={() => { setRoot(dflt()); setPath(new Set()); setFound(null); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>
      <div className="flex-1 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-hidden">
        <svg viewBox="0 0 700 400" className="w-full h-full">
          {items.filter(i => i.e).map((e, idx) => (
            <line key={`e-${idx}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
          ))}
          {items.filter(i => !i.e).map((n, idx) => {
            const ip = path.has(n.v!), isF = found === n.v;
            const fill = isF ? 'rgba(74,222,128,0.1)' : ip ? 'rgba(251,146,60,0.08)' : 'rgba(255,255,255,0.02)';
            const stroke = isF ? 'rgba(74,222,128,0.4)' : ip ? 'rgba(251,146,60,0.35)' : 'rgba(255,255,255,0.06)';
            const text = isF ? '#4ade80' : ip ? '#fb923c' : '#e2e8f0';
            return (
              <g key={`n-${idx}`} className="viz-node">
                {(ip || isF) && <circle cx={n.x} cy={n.y} r="26" fill={isF ? 'rgba(74,222,128,0.05)' : 'rgba(251,146,60,0.04)'} />}
                <circle cx={n.x} cy={n.y} r="20" fill={fill} stroke={stroke} strokeWidth="1.5" />
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill={text} fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">{n.v}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
