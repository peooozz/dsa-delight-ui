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
import QueueModule from '@/components/modules/QueueModule';
import LinkedListModule from '@/components/modules/LinkedListModule';
import DoublyLinkedListModule from '@/components/modules/DoublyLinkedListModule';
import CircularLinkedListModule from '@/components/modules/CircularLinkedListModule';
import TowerOfHanoiModule from '@/components/modules/TowerOfHanoiModule';
import BinarySearchModule from '@/components/modules/BinarySearchModule';
import DequeModule from '@/components/modules/DequeModule';
import PriorityQueueModule from '@/components/modules/PriorityQueueModule';
import CircularQueueModule from '@/components/modules/CircularQueueModule';
import TrieModule from '@/components/modules/TrieModule';
import RecursionModule from '@/components/modules/RecursionModule';
import { Lightbulb, ExternalLink } from 'lucide-react';

const MODULES: Record<string, React.ComponentType> = {
  array: ArrayModule, stack: StackModule, queue: QueueModule, linkedlist: LinkedListModule,
  doublylinkedlist: DoublyLinkedListModule, circularlinkedlist: CircularLinkedListModule,
  deque: DequeModule, circularqueue: CircularQueueModule, priorityqueue: PriorityQueueModule,
  binarysearch: BinarySearchModule,
  binarytree: BinaryTreeModule, bst: BSTModule, heap: HeapModule,
  trie: TrieModule,
  graph: GraphModule, hashtable: HashTableModule, sorting: SortingModule,
  towerofhanoi: TowerOfHanoiModule, recursion: RecursionModule,
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
  queue: "FIFO — First In, First Out. Like a real queue, the first person in line gets served first.",
  linkedlist: "Each node stores Data and a Next pointer. Nodes are linked together in a chain.",
  doublylinkedlist: "Nodes have both next and prev pointers. You can walk forwards and backwards!",
  circularlinkedlist: "The tail node’s next pointer loops back to the head. The circle never ends!",
  towerofhanoi: "Move all disks from source to target peg following the rules. A classic recursion puzzle!",
  binarysearch: "Divide and conquer — eliminate half the data each step for O(log n) search!",
  deque: "Double-ended queue — insert and remove from both front and back in O(1).",
  circularqueue: "Ring buffer — rear wraps around to front, reusing space efficiently!",
  priorityqueue: "Elements are dequeued by priority, not arrival order. Powered by heaps!",
  trie: "Prefix tree — store and search strings character by character. Powers autocomplete!",
  recursion: "A function that calls itself! Watch the call stack build and unwind.",
};

const LEETCODE: Record<string, { title: string; url: string }> = {
  array: { title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
  stack: { title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/' },
  binarytree: { title: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/' },
  bst: { title: 'Validate BST', url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
  heap: { title: 'Kth Largest Element', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  graph: { title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/' },
  hashtable: { title: 'Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/' },
  sorting: { title: 'Sort an Array', url: 'https://leetcode.com/problems/sort-an-array/' },
  queue: { title: 'Implement Stack using Queues', url: 'https://leetcode.com/problems/implement-stack-using-queues/' },
  linkedlist: { title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/' },
  doublylinkedlist: { title: 'Design Linked List', url: 'https://leetcode.com/problems/design-linked-list/' },
  circularlinkedlist: { title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/' },
  binarysearch: { title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
  deque: { title: 'Sliding Window Maximum', url: 'https://leetcode.com/problems/sliding-window-maximum/' },
  circularqueue: { title: 'Design Circular Queue', url: 'https://leetcode.com/problems/design-circular-queue/' },
  priorityqueue: { title: 'Merge k Sorted Lists', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
  trie: { title: 'Implement Trie', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
  recursion: { title: 'Fibonacci Number', url: 'https://leetcode.com/problems/fibonacci-number/' },
};

export default function MainContent() {
  const { activeModule, meta, complexity } = useApp();
  const Mod = MODULES[activeModule];

  const avgTime = complexity.length > 0 ? complexity[0][1] : 'O(N)';
  const avgSpace = complexity.length > 0 ? complexity[0][2] : 'O(1)';
  const opsCount = complexity.length || 0;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header — compact */}
      <div className="px-5 pt-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="min-w-0">
            <h1 className="text-xl font-display font-bold text-text-white tracking-tight flex items-center gap-3">
              <span className="truncate">{meta.title}</span>
              {LEETCODE[activeModule] && (
                <a href={LEETCODE[activeModule].url} target="_blank" rel="noreferrer" 
                   className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 text-[9px] font-display uppercase tracking-wider bg-orange/10 text-orange border border-orange/20 rounded hover:bg-orange/20 transition-colors">
                  <ExternalLink className="w-3 h-3" /> LeetCode
                </a>
              )}
            </h1>
            <p className="text-[11px] text-text-dim truncate">{meta.desc}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="dsa-card px-3 py-1.5 rounded-lg border border-border-faint text-center">
              <div className="text-[8px] font-display uppercase tracking-widest text-text-ghost">Time</div>
              <div className="text-sm font-mono font-bold text-primary">{avgTime}</div>
            </div>
            <div className="dsa-card px-3 py-1.5 rounded-lg border border-border-faint text-center">
              <div className="text-[8px] font-display uppercase tracking-widest text-text-ghost">Space</div>
              <div className="text-sm font-mono font-bold text-accent">{avgSpace}</div>
            </div>
            <div className="dsa-card px-3 py-1.5 rounded-lg border border-border-faint text-center">
              <div className="text-[8px] font-display uppercase tracking-widest text-text-ghost">Ops</div>
              <div className="text-sm font-mono font-bold text-secondary">{opsCount}</div>
            </div>
          </div>
        </div>

        {/* Tip — single compact line */}
        {TIPS[activeModule] && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <Lightbulb className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-[10px] text-text-light leading-snug truncate">{TIPS[activeModule]}</span>
          </div>
        )}
      </div>

      {/* Visualization — takes all remaining space */}
      <div className="flex-1 px-5 pb-1 overflow-hidden min-h-0">
        {Mod && <Mod />}
      </div>

      {/* Info Panel */}
      <InfoPanel />
    </div>
  );
}
