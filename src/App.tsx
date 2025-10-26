import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import { motion } from 'framer-motion';
import { Play, Save, FolderOpen, Key } from 'lucide-react';
import { LeftPanel } from './components/LeftPanel';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { RightPanel } from './components/RightPanel';
import { ContextMenu } from './components/ContextMenu';
import { NodeData, ExecutionLog, Workflow } from './types/workflow';
import { getNodeTypeConfig } from './config/nodeTypes';
import { WorkflowEngine } from './engine/workflowEngine';
import { supabase } from './lib/supabase';

let nodeId = 0;

function AppContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflowName, setCurrentWorkflowName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setOpenaiApiKey(savedKey);
    }
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#a855f7' } }, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const config = getNodeTypeConfig(type as any);
      if (!config) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode: Node<NodeData> = {
        id: `node_${nodeId++}`,
        type: 'custom',
        position,
        data: {
          label: config.label,
          type: config.type,
          config: { ...config.defaultConfig },
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        nodeId: node.id,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
    setSelectedNode(null);
  }, []);

  const handleDuplicateNode = useCallback(() => {
    if (!contextMenu) return;

    const node = nodes.find((n) => n.id === contextMenu.nodeId);
    if (!node) return;

    const newNode: Node<NodeData> = {
      ...node,
      id: `node_${nodeId++}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setContextMenu(null);
  }, [contextMenu, nodes, setNodes]);

  const handleDeleteNode = useCallback(() => {
    if (!contextMenu) return;

    setNodes((nds) => nds.filter((n) => n.id !== contextMenu.nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== contextMenu.nodeId && e.target !== contextMenu.nodeId)
    );
    setContextMenu(null);
  }, [contextMenu, setNodes, setEdges]);

  const handleNodeConfigChange = useCallback(
    (nodeId: string, config: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, config } };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleExecute = async () => {
    if (!openaiApiKey) {
      setShowApiKeyInput(true);
      return;
    }

    setIsExecuting(true);
    setExecutionLogs([]);

    try {
      const engine = new WorkflowEngine(
        nodes,
        edges,
        { openaiApiKey },
        (logs) => setExecutionLogs(logs)
      );
      await engine.execute();
    } catch (error: any) {
      console.error('Workflow execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('openai_api_key', openaiApiKey);
    setShowApiKeyInput(false);
  };

  const handleSaveWorkflow = async () => {
    if (!currentWorkflowName.trim()) return;

    try {
      const { error } = await supabase.from('workflows').insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        name: currentWorkflowName,
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
      });

      if (error) throw error;

      alert('Workflow saved successfully!');
      setShowSaveDialog(false);
      loadWorkflows();
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Failed to save workflow. Using localStorage as fallback.');

      const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      workflows.push({
        id: Date.now().toString(),
        name: currentWorkflowName,
        nodes,
        edges,
      });
      localStorage.setItem('workflows', JSON.stringify(workflows));
      setShowSaveDialog(false);
    }
  };

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setWorkflows(data.map(w => ({
          ...w,
          nodes: typeof w.nodes === 'string' ? JSON.parse(w.nodes) : w.nodes,
          edges: typeof w.edges === 'string' ? JSON.parse(w.edges) : w.edges,
        })));
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      const localWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      setWorkflows(localWorkflows);
    }
  };

  const handleLoadWorkflow = (workflow: Workflow) => {
    setNodes(workflow.nodes);
    setEdges(workflow.edges);
    setShowLoadDialog(false);
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      const selected = nodes.find((n) => n.selected);
      setSelectedNode(selected || null);
    }
  }, [nodes]);

  return (
    <div className="h-screen w-screen bg-gray-950 flex flex-col overflow-hidden">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">AI Workflow Builder</h1>
            <p className="text-sm text-gray-400">Design and automate AI-powered workflows</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApiKeyInput(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <Key className="w-4 h-4" />
              {openaiApiKey ? 'Update' : 'Add'} API Key
            </button>

            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={nodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save
            </button>

            <button
              onClick={() => {
                loadWorkflows();
                setShowLoadDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
            >
              <FolderOpen className="w-4 h-4" />
              Load
            </button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExecute}
              disabled={isExecuting || nodes.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden" ref={reactFlowWrapper}>
        <LeftPanel />
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
        />
        <RightPanel
          selectedNode={selectedNode}
          executionLogs={executionLogs}
          onNodeConfigChange={handleNodeConfigChange}
        />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onDuplicate={handleDuplicateNode}
          onDelete={handleDeleteNode}
          onClose={() => setContextMenu(null)}
        />
      )}

      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">OpenAI API Key</h3>
            <input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveApiKey}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => setShowApiKeyInput(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Save Workflow</h3>
            <input
              type="text"
              value={currentWorkflowName}
              onChange={(e) => setCurrentWorkflowName(e.target.value)}
              placeholder="Workflow name..."
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveWorkflow}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showLoadDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl border border-gray-700 max-h-[80vh] flex flex-col"
          >
            <h3 className="text-xl font-bold text-white mb-4">Load Workflow</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {workflows.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No saved workflows</p>
              ) : (
                workflows.map((workflow) => (
                  <button
                    key={workflow.id}
                    onClick={() => handleLoadWorkflow(workflow)}
                    className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
                  >
                    <h4 className="text-white font-semibold">{workflow.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {workflow.nodes?.length || 0} nodes, {workflow.edges?.length || 0} connections
                    </p>
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => setShowLoadDialog(false)}
              className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg w-full"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  );
}
