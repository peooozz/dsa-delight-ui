import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { sleep } from '@/lib/drawUtils';
import { Plus, Search, RotateCcw } from 'lucide-react';

const THEORY = `## Trie — Prefix Tree

A **Trie** (pronounced "try") is a tree-like data structure used to store a dynamic set of strings. Each node represents a single character, and paths from root to leaf form complete words.

### Structure
- **Root**: Empty node.
- **Edges**: Each edge represents a character.
- **Nodes**: May be marked as "end of word".
- **Children**: Up to 26 children (for lowercase English letters).

### Core Operations
- **Insert**: Traverse the trie character by character, creating nodes as needed. O(m) where m = word length.
- **Search**: Follow the path for each character. O(m).
- **Prefix Search**: Same as search, but don't require end-of-word marker. O(m).
- **Delete**: Unmark end-of-word, remove nodes if no other words share them. O(m).

### Why Use a Trie?
| Operation | Hash Table | Trie |
|-----------|------------|------|
| Insert | O(m) avg | O(m) |
| Search | O(m) avg | O(m) |
| Prefix match | O(n × m) | O(m + k) |
| Sorted order | O(n log n) | O(n) — DFS |

### Real-World Applications
- **Autocomplete**: Suggest words as user types.
- **Spell Checking**: Quickly verify if a word exists.
- **IP Routing**: Longest prefix matching in routers.
- **Dictionary Implementation**: Efficient word storage.
- **T9 Predictive Text**: Old phone keyboard suggestions.
- **DNA Sequence Matching**: Bioinformatics applications.

### Space Optimization
- **Compressed Trie (Radix Tree)**: Merges single-child nodes.
- **Ternary Search Tree**: Each node has 3 children (less, equal, greater).

### Complexity Summary
| Operation | Time | Space |
|-----------|------|-------|
| Insert | O(m) | O(m) |
| Search | O(m) | O(1) |
| Prefix Search | O(m) | O(1) |
| Delete | O(m) | O(1) |

Where m = length of the word.
`;

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  char: string;
}

function newNode(char: string): TrieNode {
  return { children: new Map(), isEnd: false, char };
}

function insertWord(root: TrieNode, word: string) {
  let node = root;
  for (const ch of word.toLowerCase()) {
    if (!node.children.has(ch)) node.children.set(ch, newNode(ch));
    node = node.children.get(ch)!;
  }
  node.isEnd = true;
}

function searchWord(root: TrieNode, word: string): { found: boolean; path: string[] } {
  let node = root;
  const path: string[] = [];
  for (const ch of word.toLowerCase()) {
    path.push(ch);
    if (!node.children.has(ch)) return { found: false, path };
    node = node.children.get(ch)!;
  }
  return { found: node.isEnd, path };
}

function getWords(node: TrieNode, prefix: string): string[] {
  const res: string[] = [];
  if (node.isEnd) res.push(prefix);
  for (const [ch, child] of node.children) {
    res.push(...getWords(child, prefix + ch));
  }
  return res;
}

interface FlatNode { char: string; x: number; y: number; isEnd: boolean; parentX?: number; parentY?: number; active?: boolean; }

function flatten(node: TrieNode, x: number, y: number, dx: number, out: FlatNode[], parentX?: number, parentY?: number, activeChars?: Set<string>, depth = 0) {
  const isActive = activeChars?.has(Array.from({ length: depth }, (_, i) => '').join('') + node.char) || false;
  if (parentX !== undefined) {
    out.push({ char: node.char, x, y, isEnd: node.isEnd, parentX, parentY, active: isActive });
  }
  const kids = Array.from(node.children.values());
  const totalW = kids.length * dx;
  let cx = x - totalW / 2 + dx / 2;
  for (const child of kids) {
    flatten(child, cx, y + 55, dx * 0.7, out, x, y, activeChars, depth + 1);
    cx += dx;
  }
}

function buildDefault(): TrieNode {
  const root = newNode('');
  ['cat', 'car', 'card', 'care', 'dog', 'do', 'done'].forEach(w => insertWord(root, w));
  return root;
}

export default function TrieModule() {
  const { speed, addLog, setComplexity, setPseudocode, setTheory, stepMode, waitForStep } = useApp();
  const [root, setRoot] = useState<TrieNode>(() => buildDefault());
  const [word, setWord] = useState('');
  const [activePath, setActivePath] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setComplexity([['Insert','O(m)','O(m)'],['Search','O(m)','O(1)'],['Prefix','O(m)','O(1)']]);
    setPseudocode(`INSERT(word):\n  node = root\n  for ch in word:\n    if ch not in node.children:\n      node.children[ch] = new Node\n    node = node.children[ch]\n  node.isEnd = true\n\nSEARCH(word):\n  node = root\n  for ch in word:\n    if ch not in node.children:\n      return false\n    node = node.children[ch]\n  return node.isEnd`);
    setTheory(THEORY);
  }, [setComplexity, setPseudocode, setTheory]);

  const wait = useCallback(async () => { if (stepMode) await waitForStep(); else await sleep(speed); }, [speed, stepMode, waitForStep]);

  const doInsert = async () => {
    if (!word.trim()) { addLog('Enter a word', 'warn'); return; }
    setBusy(true);
    const w = word.toLowerCase().trim();
    addLog(`Inserting "${w}"…`);
    const path: string[] = [];
    for (const ch of w) {
      path.push(ch);
      setActivePath([...path]);
      await wait();
    }
    const newRoot = JSON.parse(JSON.stringify(root, (_, v) => v instanceof Map ? Object.fromEntries(v) : v));
    // rebuild with proper Maps
    const rebuild = (obj: any): TrieNode => {
      const node = newNode(obj.char);
      node.isEnd = obj.isEnd;
      if (obj.children) {
        for (const [k, v] of Object.entries(obj.children)) {
          node.children.set(k, rebuild(v as any));
        }
      }
      return node;
    };
    const cloned = rebuild(newRoot);
    insertWord(cloned, w);
    setRoot(cloned);
    addLog(`Inserted "${w}"`, 'success');
    await wait();
    setActivePath([]);
    setBusy(false);
    setWord('');
  };

  const doSearch = async () => {
    if (!word.trim()) { addLog('Enter a word', 'warn'); return; }
    setBusy(true);
    const w = word.toLowerCase().trim();
    addLog(`Searching for "${w}"…`);
    const path: string[] = [];
    for (const ch of w) {
      path.push(ch);
      setActivePath([...path]);
      addLog(`Following '${ch}'…`);
      await wait();
    }
    const { found } = searchWord(root, w);
    if (found) addLog(`"${w}" found!`, 'success');
    else addLog(`"${w}" not found`, 'error');
    await sleep(1200);
    setActivePath([]);
    setBusy(false);
  };

  const allWords = getWords(root, '');
  const items: FlatNode[] = [];
  const kids = Array.from(root.children.values());
  const totalW = kids.length * 120;
  let cx = 350 - totalW / 2 + 60;
  for (const child of kids) {
    flatten(child, cx, 50, 80, items, 350, 10);
    cx += 120;
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-wrap items-center gap-2">
        <input placeholder="Word" value={word} onChange={e => setWord(e.target.value)} disabled={busy} className="input-field w-32" />
        <button onClick={doInsert} disabled={busy} className="pill-btn pill-primary text-[12px] py-2 px-3"><Plus className="w-3.5 h-3.5" />Insert</button>
        <button onClick={doSearch} disabled={busy} className="pill-btn pill-teal text-[12px] py-2 px-3"><Search className="w-3.5 h-3.5" />Search</button>
        <button onClick={() => { setRoot(buildDefault()); setActivePath([]); addLog('Reset'); }} disabled={busy} className="pill-btn pill-ghost text-[11px] py-1.5 px-2.5"><RotateCcw className="w-3 h-3" />Reset</button>
        <div className="ml-auto flex gap-1 flex-wrap">
          {allWords.slice(0, 10).map(w => (
            <span key={w} className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/5 text-primary border border-primary/10">{w}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-2xl bg-surface-lowest/50 border border-border-faint overflow-hidden">
        <svg viewBox="0 0 700 350" className="w-full h-full">
          <circle cx={350} cy={10} r={12} fill="rgba(108,140,255,0.1)" stroke="rgba(108,140,255,0.3)" strokeWidth="1.5" />
          <text x={350} y={10} textAnchor="middle" dominantBaseline="central" fill="#6C8CFF" fontSize="10" fontFamily="var(--font-mono)">root</text>
          {items.map((n, idx) => {
            const isActive = activePath.includes(n.char);
            return (
              <g key={idx}>
                {n.parentX !== undefined && (
                  <line x1={n.parentX} y1={n.parentY! + 12} x2={n.x} y2={n.y - 12}
                    stroke={isActive ? 'rgba(108,140,255,0.4)' : 'rgba(255,255,255,0.06)'} strokeWidth="1.5" />
                )}
                {isActive && <circle cx={n.x} cy={n.y} r={18} fill="rgba(108,140,255,0.06)" />}
                <circle cx={n.x} cy={n.y} r={14}
                  fill={n.isEnd ? 'rgba(74,222,128,0.1)' : isActive ? 'rgba(108,140,255,0.1)' : 'rgba(255,255,255,0.02)'}
                  stroke={n.isEnd ? 'rgba(74,222,128,0.4)' : isActive ? 'rgba(108,140,255,0.4)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth="1.5" />
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                  fill={n.isEnd ? '#4ade80' : isActive ? '#6C8CFF' : '#e2e8f0'}
                  fontSize="12" fontFamily="var(--font-mono)" fontWeight="600">{n.char}</text>
                <text x={n.x} y={n.y + 24} textAnchor="middle" fill="currentColor" style={{ opacity: 0.6 }} className="text-[7px] font-mono text-text-ghost">
                  {`0x${(((n.char.charCodeAt(0) || 1) * idx * 99991) % 0xFFFF).toString(16).toUpperCase().padStart(4, '0')}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
