import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node } from 'reactflow';
import { NodeData, ExecutionLog } from '../types/workflow';
import { getNodeTypeConfig } from '../config/nodeTypes';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

interface RightPanelProps {
  selectedNode: Node<NodeData> | null;
  executionLogs: ExecutionLog[];
  onNodeConfigChange: (nodeId: string, config: Record<string, any>) => void;
}

export const RightPanel = ({
  selectedNode,
  executionLogs,
  onNodeConfigChange,
}: RightPanelProps) => {
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config');

  const handleConfigChange = (key: string, value: any) => {
    if (selectedNode) {
      const newConfig = { ...selectedNode.data.config, [key]: value };
      onNodeConfigChange(selectedNode.id, newConfig);
    }
  };

  const renderConfigForm = () => {
    if (!selectedNode) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Select a node to configure</p>
        </div>
      );
    }

    const config = selectedNode.data.config || {};
    const nodeType = selectedNode.data.type;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
          <input
            type="text"
            value={selectedNode.data.label}
            onChange={(e) => {
              selectedNode.data.label = e.target.value;
              onNodeConfigChange(selectedNode.id, config);
            }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {nodeType === 'aiTextGen' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your prompt..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
              <select
                value={config.model || 'gpt-3.5-turbo'}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </div>
          </>
        )}

        {nodeType === 'aiImageGen' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe the image..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Size</label>
              <select
                value={config.size || '1024x1024'}
                onChange={(e) => handleConfigChange('size', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="256x256">256x256</option>
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
              </select>
            </div>
          </>
        )}

        {nodeType === 'aiAnalysis' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Analysis Prompt
              </label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => handleConfigChange('prompt', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="What analysis to perform..."
              />
            </div>
          </>
        )}

        {nodeType === 'delay' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Delay (seconds)
            </label>
            <input
              type="number"
              value={config.seconds || 1}
              onChange={(e) => handleConfigChange('seconds', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {nodeType === 'sendEmail' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
              <input
                type="email"
                value={config.to || ''}
                onChange={(e) => handleConfigChange('to', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Email subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Body</label>
              <textarea
                value={config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Email body..."
              />
            </div>
          </>
        )}

        {nodeType === 'apiCall' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Method</label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => handleConfigChange('url', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://api.example.com/endpoint"
              />
            </div>
          </>
        )}

        {nodeType === 'condition' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
              <input
                type="text"
                value={config.condition || ''}
                onChange={(e) => handleConfigChange('condition', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="field name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Operator</label>
              <select
                value={config.operator || 'equals'}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="equals">Equals</option>
                <option value="notEquals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="comparison value"
              />
            </div>
          </>
        )}
      </motion.div>
    );
  };

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'running':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
      <div className="border-b border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'config'
                ? 'text-white bg-gray-800 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-white bg-gray-800 border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Execution Log
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'config' ? (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderConfigForm()}
            </motion.div>
          ) : (
            <motion.div
              key="logs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {executionLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No execution logs yet</p>
                </div>
              ) : (
                executionLogs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(log.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-white">{log.nodeLabel}</h4>
                          <span className="text-xs text-gray-500">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{log.message}</p>
                        {log.output && (
                          <pre className="mt-2 text-xs text-gray-500 overflow-x-auto">
                            {JSON.stringify(log.output, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
