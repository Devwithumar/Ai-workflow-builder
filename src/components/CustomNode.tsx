import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { NodeData } from '../types/workflow';
import { getNodeTypeConfig } from '../config/nodeTypes';

export const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const config = getNodeTypeConfig(data.type);

  if (!config) return null;

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`min-w-[200px] bg-gray-800 rounded-lg border-2 transition-all ${
        selected ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-gray-700'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-purple-500" />

      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{data.label}</h3>
            <p className="text-xs text-gray-400">{config.label}</p>
          </div>
        </div>

        {data.output && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-green-400">Output available</p>
          </div>
        )}

        {data.error && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <p className="text-xs text-red-400">{data.error}</p>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-purple-500" />
    </motion.div>
  );
});

CustomNode.displayName = 'CustomNode';
