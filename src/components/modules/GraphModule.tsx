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
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
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
    setTheory(`## Graph — Network Data Structure\n\nA **Graph** is a non-linear data structure consisting of **vertices (nodes)** connected by **edges**. Graphs model relationships between objects and are one of the most versatile data structures.\n\n### Key Terminology\n- **Vertex/Node**: A fundamental unit of a graph.\n- **Edge**: A connection between two vertices.\n- **Weighted Graph**: Edges have associated costs/distances.\n- **Directed Graph**: Edges have a direction (one-way).\n- **Undirected Graph**: Edges are bidirectional.\n- **Degree**: Number of edges connected to a vertex.\n\n### Graph Representations\n| Representation | Space | Edge Lookup | Notes |\n|---------------|-------|-------------|-------|\n| Adjacency Matrix | O(V²) | O(1) | Best for dense graphs |\n| Adjacency List | O(V+E) | O(degree) | Best for sparse graphs |\n| Edge List | O(E) | O(E) | Simple but slow |\n\n### Traversal Algorithms\n- **BFS (Breadth-First Search)**: Explores all neighbors at current depth before going deeper. Uses a queue. Finds shortest path in unweighted graphs.\n- **DFS (Depth-First Search)**: Explores as far as possible along a branch before backtracking. Uses a stack. Useful for cycle detection and topological sort.\n\n### Shortest Path Algorithms\n- **Dijkstra**: Finds shortest paths from a source to all vertices in weighted graphs (non-negative weights).\n- **Bellman-Ford**: Handles negative weights. Slower but more general.\n- **Floyd-Warshall**: All-pairs shortest paths in O(V³).\n\n### Real-World Applications\n- Social networks (friendship graphs).\n- Google Maps (road network, shortest routes).\n- Internet routing (network topology).\n- Dependency resolution (package managers).\n- Recommendation systems.\n\n### Complexity Summary\n| Algorithm | Time | Space |\n|-----------|------|-------|\n| BFS | O(V+E) | O(V) |\n| DFS | O(V+E) | O(V) |\n| Dijkstra | O((V+E) log V) | O(V) |`);
  }, [setComplexity, setPseudocode, setTheory]);

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
                <text x={x} y={y + 34} textAnchor="middle" fill="currentColor" style={{ opacity: 0.6 }} className="text-[8px] font-mono text-text-ghost">
                  {`0x${(((id.charCodeAt(0) || 1) * 99991) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
