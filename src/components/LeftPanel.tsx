import { motion } from 'framer-motion';
import { nodeTypes } from '../config/nodeTypes';

export const LeftPanel = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white mb-2">Components</h2>
        <p className="text-sm text-gray-400">Drag to canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {nodeTypes.map((nodeType, index) => {
          const Icon = nodeType.icon;
          return (
            <motion.div
              key={nodeType.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              draggable
              onDragStart={(e) => onDragStart(e, nodeType.type)}
              className="group cursor-move"
            >
              <div className="bg-gray-800 hover:bg-gray-750 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${nodeType.gradient} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm">{nodeType.label}</h3>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{nodeType.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
