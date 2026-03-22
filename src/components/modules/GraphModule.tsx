import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep } from '@/lib/drawUtils';
import { Play, RotateCcw } from 'lucide-react';

interface GraphData {
  nodes: Record<string, { x: number; y: number }>;
  edges: [string, string, number][];
}

const INIT = (): GraphData => ({
  nodes: { A: { x: 200, y: 80 }, B: { x: 450, y: 80 }, C: { x: 560, y: 240 }, D: { x: 380, y: 280 }, E: { x: 150, y: 280 }, F: { x: 500, y: 380 } },
  edges: [['A', 'B', 4], ['A', 'E', 2], ['B', 'C', 5], ['B', 'D', 10], ['C', 'D', 3], ['D', 'E', 7], ['D', 'F', 6], ['C', 'F', 8]],
});

export default function GraphModule() {
  const { speed, addLog, setComplexity, setPseudocode, stepMode, waitForStep } = useApp();
  const [graph, setGraph] = useState<GraphData>(INIT);
  const [visited, setVisited] = useState(new Set<string>());
  const [activeEdges, setActiveEdges] = useState(new Set<string>());
  const [current, setCurrent] = useState<string | null>(null);
  const [start, setStart] = useState('A');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setComplexity([['BFS','O(V+E)','O(V)'],['DFS','O(V+E)','O(V)'],['Dijkstra','O((V+E)logV)','O(V)']]);
    setPseudocode(`BFS(start):\n  queue = [start]; visited(start)\n  while queue:\n    node = dequeue()\n    for neighbor: visit & enqueue\n\nDFS(start):\n  stack = [start]; visited(start)\n  while stack:\n    node = pop()\n    for neighbor: visit & push`);
  }, [setComplexity, setPseudocode]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const adj = useCallback(() => {
    const a: Record<string, [string, number][]> = {};
    Object.keys(graph.nodes).forEach(n => a[n] = []);
    graph.edges.forEach(([u, v, w]) => { a[u].push([v, w]); a[v].push([u, w]); });
    return a;
  }, [graph]);

  const bfs = async () => {
    setBusy(true); const vis = new Set<string>(), q = [start]; vis.add(start); addLog('BFS started');
    while (q.length) {
      const n = q.shift()!; setCurrent(n); setVisited(new Set(vis)); addLog(`Visit ${n}`); await wait();
      for (const [nb] of adj()[n]) if (!vis.has(nb)) { vis.add(nb); q.push(nb); setActiveEdges(new Set([`${n}-${nb}`, `${nb}-${n}`])); await wait(); }
    }
    setActiveEdges(new Set()); setCurrent(null); addLog('BFS complete', 'success'); setBusy(false);
  };

  const dfs = async () => {
    setBusy(true); const vis = new Set<string>(), st = [start]; addLog('DFS started');
    while (st.length) {
      const n = st.pop()!; if (vis.has(n)) continue;
      vis.add(n); setCurrent(n); setVisited(new Set(vis)); addLog(`Visit ${n}`); await wait();
      for (const [nb] of adj()[n]) if (!vis.has(nb)) { st.push(nb); setActiveEdges(new Set([`${n}-${nb}`, `${nb}-${n}`])); await wait(); }
    }
    setActiveEdges(new Set()); setCurrent(null); addLog('DFS complete', 'success'); setBusy(false);
  };

  const dijkstra = async () => {
    setBusy(true); const INF = Infinity, dist: Record<string, number> = {}, vis = new Set<string>();
    Object.keys(graph.nodes).forEach(n => dist[n] = INF); dist[start] = 0; addLog('Dijkstra started');
    while (vis.size < Object.keys(graph.nodes).length) {
      let u = ''; let mn = INF;
      for (const n of Object.keys(graph.nodes)) if (!vis.has(n) && dist[n] < mn) { mn = dist[n]; u = n; }
      if (!u) break; vis.add(u); setCurrent(u); setVisited(new Set(vis)); addLog(`Visit ${u} (d=${dist[u]})`); await wait();
      for (const [nb, w] of adj()[u]) {
        if (dist[u] + w < dist[nb]) {
          dist[nb] = dist[u] + w;
          setActiveEdges(new Set([`${u}-${nb}`, `${nb}-${u}`])); addLog(`Update ${nb}: ${dist[nb]}`); await wait();
        }
      }
    }
    setActiveEdges(new Set()); setCurrent(null); addLog('Dijkstra complete', 'success'); setBusy(false);
  };

  const onMD = (id: string, e: React.MouseEvent) => { if (busy) return; e.preventDefault(); setDrag(id); };
  const onMM = (e: React.MouseEvent) => {
    if (!drag || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const scaleX = 700 / r.width;
    const scaleY = 450 / r.height;
    setGraph(g => ({ ...g, nodes: { ...g.nodes, [drag]: { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY } } }));
  };
  const onMU = () => setDrag(null);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-text-ghost font-mono">Start:</span>
        <select value={start} onChange={e => setStart(e.target.value)} disabled={busy} className="input-field w-[55px] py-1 text-[11px]">
          {Object.keys(graph.nodes).map(n => <option key={n}>{n}</option>)}
        </select>
        <button onClick={bfs} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Play className="w-3.5 h-3.5" />BFS</button>
        <button onClick={dfs} disabled={busy} className="pill-btn pill-secondary text-[12px] py-2 px-3"><Play className="w-3.5 h-3.5" />DFS</button>
        <button onClick={dijkstra} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Play className="w-3.5 h-3.5" />Dijkstra</button>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => { setGraph(INIT()); setVisited(new Set()); setActiveEdges(new Set()); setCurrent(null); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        </div>
      </div>
      <span className="text-[10px] text-text-ghost">Drag nodes to rearrange</span>
      <div className="flex-1 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-hidden">
        <svg ref={svgRef} viewBox="0 0 700 450" className="w-full h-full" onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
          {graph.edges.map(([u, v, w], idx) => {
            const { x: x1, y: y1 } = graph.nodes[u], { x: x2, y: y2 } = graph.nodes[v];
            const a = activeEdges.has(`${u}-${v}`) || activeEdges.has(`${v}-${u}`);
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            return (
              <g key={`edge-${idx}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={a ? 'rgba(108,140,255,0.5)' : 'rgba(255,255,255,0.08)'} strokeWidth={a ? 2.5 : 1.5} />
                {a && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(108,140,255,0.15)" strokeWidth="6" />}
                <text x={mx} y={my - 8} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="var(--font-mono)">{w}</text>
              </g>
            );
          })}
          {Object.entries(graph.nodes).map(([id, { x, y }]) => {
            const v = visited.has(id), c = current === id;
            const fill = c ? 'rgba(108,140,255,0.12)' : v ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)';
            const stroke = c ? 'rgba(108,140,255,0.4)' : v ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.06)';
            const text = c ? '#6C8CFF' : v ? '#4ade80' : '#e2e8f0';
            return (
              <g key={id} onMouseDown={e => onMD(id, e)} style={{ cursor: busy ? 'default' : 'grab' }}>
                {c && <circle cx={x} cy={y} r="32" fill="rgba(108,140,255,0.06)" />}
                <circle cx={x} cy={y} r="24" fill={fill} stroke={stroke} strokeWidth="1.5" />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={text} fontSize="14" fontFamily="var(--font-display)" fontWeight="600">{id}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
