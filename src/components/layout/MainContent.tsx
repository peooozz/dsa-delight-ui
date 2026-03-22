import { useApp } from '@/context/AppContext';
import InfoPanel from './InfoPanel';
import ArrayModule from '@/components/modules/ArrayModule';
import BinaryTreeModule from '@/components/modules/BinaryTreeModule';
import BSTModule from '@/components/modules/BSTModule';
import HeapModule from '@/components/modules/HeapModule';
import GraphModule from '@/components/modules/GraphModule';
import HashTableModule from '@/components/modules/HashTableModule';
import SortingModule from '@/components/modules/SortingModule';
import StackModule from '@/components/modules/StackModule';
import { Lightbulb } from 'lucide-react';

const MODULES: Record<string, React.ComponentType> = {
  array: ArrayModule, stack: StackModule,
  binarytree: BinaryTreeModule, bst: BSTModule, heap: HeapModule,
  graph: GraphModule, hashtable: HashTableModule, sorting: SortingModule,
};

const TIPS: Record<string, string> = {
  array: "Arrays store elements in contiguous memory. Access any element in O(1) using its index!",
  stack: "LIFO — Last In, First Out. Like a stack of plates, you can only add/remove from the top.",
  binarytree: "Each node has at most 2 children. Traversals visit every node in a specific order.",
  bst: "Left < Parent < Right. This ordering gives us O(log n) search — like binary search!",
  heap: "A complete binary tree where parent is always smaller (min) or larger (max) than children.",
  graph: "Vertices connected by edges. Models networks like social graphs, maps, and the internet.",
  hashtable: "Hash function maps keys → buckets for average O(1) lookup. The fastest search structure!",
  sorting: "Watch algorithms race! Compare how different strategies order data step by step.",
};

export default function MainContent() {
  const { activeModule, meta, complexity } = useApp();
  const Mod = MODULES[activeModule];

  const avgTime = complexity.length > 0 ? complexity[0][1] : 'O(N)';
  const avgSpace = complexity.length > 0 ? complexity[0][2] : 'O(1)';
  const opsCount = complexity.length || 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-text-white tracking-tight">{meta.title}</h1>
            <p className="text-[13px] text-text-dim mt-1">{meta.desc}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="dsa-card px-4 py-3 rounded-xl border border-border-faint">
            <div className="text-[10px] font-display uppercase tracking-widest text-text-ghost mb-1">Time Complexity</div>
            <div className="text-lg font-mono font-bold text-primary">{avgTime}</div>
          </div>
          <div className="dsa-card px-4 py-3 rounded-xl border border-border-faint">
            <div className="text-[10px] font-display uppercase tracking-widest text-text-ghost mb-1">Space Complexity</div>
            <div className="text-lg font-mono font-bold text-accent">{avgSpace}</div>
          </div>
          <div className="dsa-card px-4 py-3 rounded-xl border border-border-faint">
            <div className="text-[10px] font-display uppercase tracking-widest text-text-ghost mb-1">Operations</div>
            <div className="text-lg font-mono font-bold text-secondary">{opsCount} ops</div>
          </div>
        </div>

        {/* Tip */}
        {TIPS[activeModule] && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10">
            <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-[11px] text-text-light leading-relaxed">{TIPS[activeModule]}</span>
          </div>
        )}
      </div>

      {/* Visualization */}
      <div className="flex-1 px-6 pb-2 overflow-hidden">
        {Mod && <Mod />}
      </div>

      {/* Info Panel */}
      <InfoPanel />
    </div>
  );
}
