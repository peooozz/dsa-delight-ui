import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface LogEntry {
  msg: string;
  type: string;
  id: number;
}

interface ModuleMeta {
  title: string;
  desc: string;
}

const MODULE_META: Record<string, ModuleMeta> = {
  array: { title: 'Array Operations', desc: 'Visualize array operations.' },
  linkedlist: { title: 'Linked List', desc: 'Explore linked list nodes.' },
  doublylinkedlist: { title: 'Doubly Linked List', desc: 'Nodes with dual pointers.' },
  circularlinkedlist: { title: 'Circular Linked List', desc: 'Tail loops back to head.' },
  stack: { title: 'Stack', desc: 'LIFO data structure.' },
  queue: { title: 'Queue', desc: 'FIFO data structure.' },
  deque: { title: 'Deque', desc: 'Double-ended queue.' },
  circularqueue: { title: 'Circular Queue', desc: 'Ring buffer queue.' },
  priorityqueue: { title: 'Priority Queue', desc: 'Priority-based ordering.' },
  binarysearch: { title: 'Binary Search', desc: 'O(log n) search on sorted data.' },
  binarytree: { title: 'Binary Tree', desc: 'Tree traversals & operations.' },
  bst: { title: 'Binary Search Tree', desc: 'Efficient search structure.' },
  heap: { title: 'Heap', desc: 'Priority queue structure.' },
  trie: { title: 'Trie', desc: 'Prefix tree for strings.' },
  graph: { title: 'Graph', desc: 'Vertices and edges.' },
  hashtable: { title: 'Hash Table', desc: 'O(1) average lookup.' },
  sorting: { title: 'Sorting Algorithms', desc: 'Compare sorting strategies.' },
  towerofhanoi: { title: 'Tower of Hanoi', desc: 'Classic recursive puzzle.' },
  recursion: { title: 'Recursion', desc: 'Visualize recursive call stacks.' },
};

interface AppContextType {
  activeModule: string;
  setActiveModule: (m: string) => void;
  meta: ModuleMeta;
  complexity: string[][];
  setComplexity: (c: string[][]) => void;
  pseudocode: string;
  setPseudocode: (p: string) => void;
  theory: string;
  setTheory: (t: string) => void;
  logs: LogEntry[];
  addLog: (msg: string, type?: string) => void;
  speed: number;
  setSpeed: (s: number) => void;
  stepMode: boolean;
  setStepMode: (s: boolean) => void;
  nextStep: () => void;
  waitForStep: () => Promise<void>;
  sidebarOpen: boolean;
  setSidebarOpen: (o: boolean) => void;
  MODULE_META: Record<string, ModuleMeta>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModuleRaw] = useState('array');
  const [complexity, setComplexity] = useState<string[][]>([['Access', 'O(1)', 'O(n)']]);
  const [pseudocode, setPseudocode] = useState('');
  const [theory, setTheory] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [speed, setSpeed] = useState(600);
  const [stepMode, setStepMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const stepResolve = useRef<(() => void) | null>(null);
  const logId = useRef(0);

  const meta = MODULE_META[activeModule] || { title: 'Select Module', desc: '' };

  const setActiveModule = useCallback((m: string) => {
    setActiveModuleRaw(m);
    setLogs([]);
  }, []);

  const addLog = useCallback((msg: string, type: string = 'info') => {
    setLogs(prev => [...prev.slice(-50), { msg, type, id: logId.current++ }]);
  }, []);

  const nextStep = useCallback(() => {
    if (stepResolve.current) {
      stepResolve.current();
      stepResolve.current = null;
    }
  }, []);

  const waitForStep = useCallback(() => {
    return new Promise<void>(resolve => {
      stepResolve.current = resolve;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      activeModule, setActiveModule, meta,
      complexity, setComplexity,
      pseudocode, setPseudocode,
      theory, setTheory,
      logs, addLog,
      speed, setSpeed,
      stepMode, setStepMode,
      nextStep, waitForStep,
      sidebarOpen, setSidebarOpen,
      MODULE_META,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
