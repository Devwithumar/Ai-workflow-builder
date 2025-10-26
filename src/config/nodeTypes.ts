import { NodeType } from '../types/workflow';
import {
  Zap,
  MessageSquare,
  Image,
  Brain,
  FileText,
  Database,
  Mail,
  Globe,
  GitBranch,
  Clock,
} from 'lucide-react';

export interface NodeTypeConfig {
  type: NodeType;
  label: string;
  icon: any;
  gradient: string;
  description: string;
  defaultConfig?: Record<string, any>;
}

export const nodeTypes: NodeTypeConfig[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: Zap,
    gradient: 'from-purple-500 to-purple-700',
    description: 'Start the workflow',
    defaultConfig: { triggerType: 'manual' },
  },
  {
    type: 'aiTextGen',
    label: 'AI Text Gen',
    icon: MessageSquare,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Generate text using OpenAI',
    defaultConfig: { prompt: '', model: 'gpt-3.5-turbo' },
  },
  {
    type: 'aiImageGen',
    label: 'AI Image Gen',
    icon: Image,
    gradient: 'from-cyan-500 to-teal-500',
    description: 'Generate images using DALL-E',
    defaultConfig: { prompt: '', size: '1024x1024' },
  },
  {
    type: 'aiAnalysis',
    label: 'AI Analysis',
    icon: Brain,
    gradient: 'from-teal-500 to-green-500',
    description: 'Analyze data with AI',
    defaultConfig: { prompt: '', model: 'gpt-3.5-turbo' },
  },
  {
    type: 'notion',
    label: 'Notion',
    icon: FileText,
    gradient: 'from-green-500 to-emerald-500',
    description: 'Integrate with Notion',
    defaultConfig: { action: 'create', database: '' },
  },
  {
    type: 'database',
    label: 'Database',
    icon: Database,
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Store or retrieve data',
    defaultConfig: { action: 'insert', table: '' },
  },
  {
    type: 'sendEmail',
    label: 'Send Email',
    icon: Mail,
    gradient: 'from-orange-500 to-red-500',
    description: 'Send email notifications',
    defaultConfig: { to: '', subject: '', body: '' },
  },
  {
    type: 'apiCall',
    label: 'API Call',
    icon: Globe,
    gradient: 'from-red-500 to-pink-500',
    description: 'Make HTTP API requests',
    defaultConfig: { method: 'GET', url: '' },
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    gradient: 'from-pink-500 to-purple-500',
    description: 'Conditional branching',
    defaultConfig: { condition: '', operator: 'equals' },
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    gradient: 'from-fuchsia-500 to-pink-500',
    description: 'Wait for specified time',
    defaultConfig: { seconds: 5 },
  },
];

export const getNodeTypeConfig = (type: NodeType): NodeTypeConfig | undefined => {
  return nodeTypes.find((n) => n.type === type);
};
