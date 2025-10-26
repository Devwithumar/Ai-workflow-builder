import { Node, Edge } from 'reactflow';
import { NodeData, ExecutionLog, WorkflowConfig, NodeType } from '../types/workflow';

export class WorkflowEngine {
  private nodes: Node<NodeData>[];
  private edges: Edge[];
  private config: WorkflowConfig;
  private logs: ExecutionLog[] = [];
  private onLogUpdate: (logs: ExecutionLog[]) => void;

  constructor(
    nodes: Node<NodeData>[],
    edges: Edge[],
    config: WorkflowConfig,
    onLogUpdate: (logs: ExecutionLog[]) => void
  ) {
    this.nodes = nodes;
    this.edges = edges;
    this.config = config;
    this.onLogUpdate = onLogUpdate;
  }

  private addLog(
    nodeId: string,
    nodeLabel: string,
    status: 'running' | 'success' | 'error',
    message: string,
    output?: any
  ) {
    const log: ExecutionLog = {
      id: `${nodeId}-${Date.now()}`,
      nodeId,
      nodeLabel,
      timestamp: new Date(),
      status,
      message,
      output,
    };
    this.logs.push(log);
    this.onLogUpdate([...this.logs]);
  }

  private findNextNodes(nodeId: string): Node<NodeData>[] {
    const outgoingEdges = this.edges.filter((edge) => edge.source === nodeId);
    return outgoingEdges
      .map((edge) => this.nodes.find((node) => node.id === edge.target))
      .filter(Boolean) as Node<NodeData>[];
  }

  private async executeNode(node: Node<NodeData>, previousOutput?: any): Promise<any> {
    const { type, label, config = {} } = node.data;

    this.addLog(node.id, label, 'running', `Executing ${label}...`);

    try {
      let output: any;

      switch (type) {
        case 'trigger':
          output = { triggered: true, timestamp: new Date().toISOString() };
          this.addLog(node.id, label, 'success', 'Workflow triggered');
          break;

        case 'aiTextGen':
          output = await this.executeAITextGen(config, previousOutput);
          this.addLog(node.id, label, 'success', 'Text generated', output);
          break;

        case 'aiImageGen':
          output = await this.executeAIImageGen(config, previousOutput);
          this.addLog(node.id, label, 'success', 'Image generated', output);
          break;

        case 'aiAnalysis':
          output = await this.executeAIAnalysis(config, previousOutput);
          this.addLog(node.id, label, 'success', 'Analysis completed', output);
          break;

        case 'notion':
          output = await this.executeNotion(config, previousOutput);
          this.addLog(node.id, label, 'success', 'Notion action completed', output);
          break;

        case 'database':
          output = await this.executeDatabase(config, previousOutput);
          this.addLog(node.id, label, 'success', 'Database action completed', output);
          break;

        case 'sendEmail':
          output = await this.executeSendEmail(config, previousOutput);
          this.addLog(node.id, label, 'success', 'Email sent', output);
          break;

        case 'apiCall':
          output = await this.executeApiCall(config, previousOutput);
          this.addLog(node.id, label, 'success', 'API call completed', output);
          break;

        case 'condition':
          output = await this.executeCondition(config, previousOutput);
          this.addLog(node.id, label, 'success', `Condition evaluated: ${output.result}`, output);
          break;

        case 'delay':
          output = await this.executeDelay(config);
          this.addLog(node.id, label, 'success', `Delayed for ${config.seconds}s`, output);
          break;

        default:
          throw new Error(`Unknown node type: ${type}`);
      }

      return output;
    } catch (error: any) {
      this.addLog(node.id, label, 'error', `Error: ${error.message}`);
      throw error;
    }
  }

  private async executeAITextGen(config: any, previousOutput?: any): Promise<any> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.interpolate(config.prompt || '', previousOutput);
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.config.openaiApiKey,
        prompt,
        model: config.model || 'gpt-3.5-turbo',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private async executeAIImageGen(config: any, previousOutput?: any): Promise<any> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.interpolate(config.prompt || '', previousOutput);
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.config.openaiApiKey,
        prompt,
        size: config.size || '1024x1024',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private async executeAIAnalysis(config: any, previousOutput?: any): Promise<any> {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.interpolate(config.prompt || '', previousOutput);
    const context = JSON.stringify(previousOutput || {});
    const fullPrompt = `${prompt}\n\nContext: ${context}`;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: this.config.openaiApiKey,
        prompt: fullPrompt,
        model: config.model || 'gpt-3.5-turbo',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    return await response.json();
  }

  private async executeNotion(config: any, previousOutput?: any): Promise<any> {
    return {
      action: config.action,
      database: config.database,
      data: previousOutput,
      status: 'mocked',
      message: 'Notion integration (mock)',
    };
  }

  private async executeDatabase(config: any, previousOutput?: any): Promise<any> {
    return {
      action: config.action,
      table: config.table,
      data: previousOutput,
      status: 'mocked',
      message: 'Database operation (mock)',
    };
  }

  private async executeSendEmail(config: any, previousOutput?: any): Promise<any> {
    const to = this.interpolate(config.to || '', previousOutput);
    const subject = this.interpolate(config.subject || '', previousOutput);
    const body = this.interpolate(config.body || '', previousOutput);

    return {
      to,
      subject,
      body,
      status: 'mocked',
      message: 'Email sent (mock)',
    };
  }

  private async executeApiCall(config: any, previousOutput?: any): Promise<any> {
    const url = this.interpolate(config.url || '', previousOutput);
    const method = config.method || 'GET';

    if (!url) {
      throw new Error('API URL is required');
    }

    const response = await fetch(url, {
      method,
      headers: config.headers || {},
      body: method !== 'GET' ? JSON.stringify(previousOutput) : undefined,
    });

    const data = await response.json();
    return data;
  }

  private async executeCondition(config: any, previousOutput?: any): Promise<any> {
    const condition = config.condition || '';
    const operator = config.operator || 'equals';
    const value = config.value || '';

    let result = false;

    if (previousOutput && condition) {
      const actualValue = previousOutput[condition];
      switch (operator) {
        case 'equals':
          result = actualValue == value;
          break;
        case 'notEquals':
          result = actualValue != value;
          break;
        case 'contains':
          result = String(actualValue).includes(value);
          break;
        case 'greaterThan':
          result = Number(actualValue) > Number(value);
          break;
        case 'lessThan':
          result = Number(actualValue) < Number(value);
          break;
      }
    }

    return { result, condition, operator, value };
  }

  private async executeDelay(config: any): Promise<any> {
    const seconds = config.seconds || 1;
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    return { delayed: seconds };
  }

  private interpolate(template: string, data?: any): string {
    if (!data) return template;
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }

  async execute(): Promise<void> {
    this.logs = [];
    const triggerNodes = this.nodes.filter((node) => node.data.type === 'trigger');

    if (triggerNodes.length === 0) {
      this.addLog('system', 'System', 'error', 'No trigger node found');
      throw new Error('No trigger node found');
    }

    for (const triggerNode of triggerNodes) {
      await this.executeFromNode(triggerNode);
    }
  }

  private async executeFromNode(node: Node<NodeData>, previousOutput?: any): Promise<void> {
    const output = await this.executeNode(node, previousOutput);
    const nextNodes = this.findNextNodes(node.id);

    for (const nextNode of nextNodes) {
      await this.executeFromNode(nextNode, output);
    }
  }
}
