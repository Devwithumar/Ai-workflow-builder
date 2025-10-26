export type NodeType =
  | 'trigger'
  | 'aiTextGen'
  | 'aiImageGen'
  | 'aiAnalysis'
  | 'notion'
  | 'database'
  | 'sendEmail'
  | 'apiCall'
  | 'condition'
  | 'delay';

export interface NodeData {
  label: string;
  type: NodeType;
  config?: Record<string, any>;
  output?: any;
  error?: string;
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  timestamp: Date;
  status: 'running' | 'success' | 'error';
  message: string;
  output?: any;
}

export interface WorkflowConfig {
  openaiApiKey?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  created_at?: string;
  updated_at?: string;
}
