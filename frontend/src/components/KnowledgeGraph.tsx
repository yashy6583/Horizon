import React from 'react';

interface KnowledgeGraphProps {
  topicsCovered: string[];
}

interface NodeDef {
  id: string;
  label: string;
  x: number;
  y: number;
  module: number;
}

interface EdgeDef {
  source: string;
  target: string;
}

// Layout nodes in 4 columns corresponding to progression
const NODES: NodeDef[] = [
  // Col 1: Foundations (X: 15%)
  { id: 'embeddings', label: 'Embeddings', x: 50, y: 70, module: 1 },
  { id: 'vectordb', label: 'Vector DBs', x: 50, y: 150, module: 1 },
  { id: 'populating', label: 'DB Ingest', x: 50, y: 230, module: 1 },
  { id: 'prompting', label: 'Prompt Eng.', x: 50, y: 310, module: 3 },
  
  // Col 2: RAG & Functions (X: 40%)
  { id: 'retrieval', label: 'Retrieval Engine', x: 160, y: 100, module: 2 },
  { id: 'rag', label: 'RAG Systems', x: 160, y: 190, module: 2 },
  { id: 'functions', label: 'Function Calls', x: 160, y: 280, module: 3 },
  { id: 'finetuning', label: 'Fine-Tuning', x: 160, y: 370, module: 4 },

  // Col 3: Code & Agents (X: 65%)
  { id: 'lora', label: 'LoRA/QLoRA', x: 270, y: 370, module: 4 },
  { id: 'fastapi', label: 'FastAPI API', x: 270, y: 100, module: 5 },
  { id: 'streamlit', label: 'Streamlit UI', x: 270, y: 190, module: 5 },
  { id: 'streaming', label: 'Streaming', x: 270, y: 280, module: 5 },
  { id: 'agents', label: 'ReAct Agents', x: 380, y: 280, module: 6 },
  
  // Col 4: Advanced & Deployment (X: 90%)
  { id: 'mcp', label: 'MCP tools', x: 380, y: 190, module: 6 },
  { id: 'agentic_chatbot', label: 'Agentic App', x: 380, y: 100, module: 6 },
  { id: 'evaluation', label: 'Evaluation', x: 480, y: 70, module: 7 },
  { id: 'optimization', label: 'Optimization', x: 480, y: 140, module: 7 },
  { id: 'security', label: 'Guardrails', x: 480, y: 210, module: 8 },
  { id: 'docker', label: 'Docker/K8s', x: 480, y: 280, module: 8 },
  { id: 'monitoring', label: 'Observability', x: 480, y: 350, module: 8 }
];

const EDGES: EdgeDef[] = [
  { source: 'embeddings', target: 'vectordb' },
  { source: 'vectordb', target: 'populating' },
  { source: 'populating', target: 'retrieval' },
  { source: 'retrieval', target: 'rag' },
  { source: 'prompting', target: 'rag' },
  { source: 'prompting', target: 'functions' },
  { source: 'rag', target: 'fastapi' },
  { source: 'finetuning', target: 'lora' },
  { source: 'fastapi', target: 'streamlit' },
  { source: 'fastapi', target: 'streaming' },
  { source: 'functions', target: 'agents' },
  { source: 'mcp', target: 'agentic_chatbot' },
  { source: 'agents', target: 'agentic_chatbot' },
  { source: 'evaluation', target: 'optimization' },
  { source: 'security', target: 'docker' },
  { source: 'docker', target: 'monitoring' }
];

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ topicsCovered }) => {
  // Normalize covered strings to matching node labels or ids
  const lowerCovered = topicsCovered.map(t => t.toLowerCase());
  
  const isCovered = (node: NodeDef) => {
    return lowerCovered.some(t => 
      t.includes(node.label.toLowerCase()) || 
      t.includes(node.id.toLowerCase()) ||
      node.label.toLowerCase().includes(t)
    );
  };

  return (
    <div style={{
      background: '#0D0D16',
      border: '1px solid #29233D',
      borderRadius: '16px',
      padding: '16px',
      marginTop: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        fontSize: '11px',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '12px',
        fontWeight: 600
      }}>
        Knowledge Graph
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox="0 0 540 420" width="100%" height="280" style={{ background: '#07070D', borderRadius: '8px' }}>
          {/* Gradients */}
          <defs>
            <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Draw Edges */}
          {EDGES.map((edge, i) => {
            const sourceNode = NODES.find(n => n.id === edge.source);
            const targetNode = NODES.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const active = isCovered(sourceNode) && isCovered(targetNode);

            return (
              <line
                key={`edge-${i}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={active ? '#8B5CF6' : '#29233D'}
                strokeWidth={active ? 2.5 : 1.5}
                strokeDasharray={active ? 'none' : '4, 4'}
                style={{ transition: 'all 0.5s ease' }}
              />
            );
          })}

          {/* Draw Nodes */}
          {NODES.map((node) => {
            const active = isCovered(node);

            return (
              <g key={node.id} style={{ cursor: 'pointer' }}>
                {active && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    fill="url(#node-glow)"
                  />
                )}
                
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={7}
                  fill={active ? '#8B5CF6' : '#1F1A30'}
                  stroke={active ? '#C4B5FD' : '#29233D'}
                  strokeWidth={2}
                  style={{ transition: 'all 0.5s ease' }}
                />

                <text
                  x={node.x}
                  y={node.y - 12}
                  textAnchor="middle"
                  fill={active ? '#F5F3FF' : '#4B5563'}
                  fontSize="9px"
                  fontWeight={active ? 700 : 500}
                  style={{ 
                    transition: 'all 0.5s ease',
                    textShadow: active ? '0 0 8px rgba(139, 92, 246, 0.6)' : 'none'
                  }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '10px', color: '#6B7280' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }} />
          Assessed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#1F1A30', border: '1px solid #29233D' }} />
          Not Covered
        </div>
      </div>
    </div>
  );
};
