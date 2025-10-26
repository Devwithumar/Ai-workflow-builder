import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  NodeTypes,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './CustomNode';
import { getNodeTypeConfig } from '../config/nodeTypes';
import { NodeType, NodeData } from '../types/workflow';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface WorkflowCanvasProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: (connection: Connection) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onNodeContextMenu: (event: React.MouseEvent, node: Node) => void;
  onPaneClick: () => void;
}

export const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  onNodeContextMenu,
  onPaneClick,
}: WorkflowCanvasProps) => {
  return (
    <div className="flex-1 bg-gray-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-gray-950"
      >
        <Background className="bg-gray-950" color="#1f2937" gap={16} />
        <Controls className="bg-gray-800 border border-gray-700 rounded-lg" />
        <MiniMap
          className="bg-gray-800 border border-gray-700 rounded-lg"
          nodeColor={(node) => {
            const config = getNodeTypeConfig((node.data as NodeData).type);
            return config ? `rgb(168, 85, 247)` : '#6b7280';
          }}
        />
      </ReactFlow>
    </div>
  );
};
