export interface GraphNode {
  id: string;
  label: string;
  day: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export const GRAPH_NODES: GraphNode[] = [
  { id: 'embeddings', label: 'Embeddings', day: 7 },
  { id: 'vectordb', label: 'Vector DBs', day: 8 },
  { id: 'populating', label: 'DB Population', day: 9 },
  { id: 'retrieval', label: 'Retrieval Engine', day: 10 },
  { id: 'rag', label: 'RAG Architecture', day: 11 },
  { id: 'prompting', label: 'Prompt Eng.', day: 12 },
  { id: 'functions', label: 'Function Calling', day: 13 },
  { id: 'finetuning', label: 'Fine-Tuning', day: 14 },
  { id: 'lora', label: 'LoRA / QLoRA', day: 15 },
  { id: 'fastapi', label: 'FastAPI Backend', day: 16 },
  { id: 'streamlit', label: 'Streamlit UI', day: 17 },
  { id: 'streaming', label: 'Streaming APIs', day: 18 },
  { id: 'formatting', label: 'Citations & Formatting', day: 19 },
  { id: 'context', label: 'Context Windows', day: 20 },
  { id: 'agents', label: 'ReAct Agents', day: 21 },
  { id: 'multiagent', label: 'Multi-Agent Sys', day: 22 },
  { id: 'mcp', label: 'MCP Protocol', day: 23 },
  { id: 'agentic_chatbot', label: 'Agentic Chatbot', day: 24 },
  { id: 'evaluation', label: 'LLM Evaluation', day: 25 },
  { id: 'optimization', label: 'Cost & Latency', day: 26 },
  { id: 'security', label: 'Guardrails', day: 27 },
  { id: 'docker', label: 'Docker / K8s', day: 28 },
  { id: 'monitoring', label: 'Observability', day: 29 },
  { id: 'production', label: 'Prod Readiness', day: 30 },
  { id: 'capstone', label: 'Capstone Project', day: 31 }
];

export const GRAPH_EDGES: GraphEdge[] = [
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
  { source: 'rag', target: 'formatting' },
  { source: 'fastapi', target: 'context' },
  { source: 'functions', target: 'agents' },
  { source: 'agents', target: 'multiagent' },
  { source: 'mcp', target: 'agentic_chatbot' },
  { source: 'multiagent', target: 'agentic_chatbot' },
  { source: 'evaluation', target: 'optimization' },
  { source: 'security', target: 'docker' },
  { source: 'docker', target: 'monitoring' },
  { source: 'monitoring', target: 'production' },
  { source: 'agentic_chatbot', target: 'capstone' }
];

// Returns concepts related to the given day by walking the edges
export function getRelatedConcepts(day: number): string[] {
  const node = GRAPH_NODES.find(n => n.day === day);
  if (!node) return [];

  const related = new Set<string>();
  
  // Find immediate connections (incoming or outgoing)
  GRAPH_EDGES.forEach(edge => {
    if (edge.source === node.id) {
      const targetNode = GRAPH_NODES.find(n => n.id === edge.target);
      if (targetNode) related.add(targetNode.label);
    }
    if (edge.target === node.id) {
      const sourceNode = GRAPH_NODES.find(n => n.id === edge.source);
      if (sourceNode) related.add(sourceNode.label);
    }
  });

  return Array.from(related);
}
