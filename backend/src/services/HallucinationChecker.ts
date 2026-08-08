import { HallucinationFlag } from '../types';

interface FactRule {
  keywords: string[];
  refuteKeywords: string[];
  claim: string;
  correction: string;
  severity: 'warning' | 'critical';
}

const FACT_RULES: Record<number, FactRule[]> = {
  7: [
    {
      keywords: ['euclidean', 'magnitude', 'length'],
      refuteKeywords: ['unaffected', 'independent', 'better than cosine'],
      claim: 'Euclidean distance is unaffected by document length when comparing text embeddings.',
      correction: 'Euclidean distance is highly sensitive to vector magnitude (and therefore document/chunk length). Cosine similarity is generally preferred for text embeddings because it measures directional alignment rather than absolute magnitude.',
      severity: 'warning'
    },
    {
      keywords: ['embedding'],
      refuteKeywords: ['sparse', 'one-hot', 'exact word matching'],
      claim: 'Text embeddings are sparse representations of exact word matches.',
      correction: 'Text embeddings are dense floating-point vector representations of semantic meaning, typically containing hundreds or thousands of dimensions, rather than sparse one-hot words.',
      severity: 'critical'
    }
  ],
  8: [
    {
      keywords: ['hnsw'],
      refuteKeywords: ['exact', 'o(1)', 'constant time', 'deterministic'],
      claim: 'HNSW indexing guarantees exact nearest neighbor search in O(1) time.',
      correction: 'HNSW is an Approximate Nearest Neighbor (ANN) search algorithm. It uses a multi-layered graph to find close neighbors heuristically, offering a trade-off between recall accuracy and query latency, rather than exact deterministic O(1) retrieval.',
      severity: 'critical'
    }
  ],
  11: [
    {
      keywords: ['rag', 'hallucination'],
      refuteKeywords: ['eliminate', 'prevents all', '100% accurate', 'impossible to hallucinate'],
      claim: 'Implementing RAG completely eliminates LLM hallucinations.',
      correction: 'RAG significantly reduces hallucinations by providing grounded context, but it does not eliminate them. LLMs can still hallucinate by misinterpreting the retrieved context or failing to ground their answers in the prompt data.',
      severity: 'warning'
    }
  ],
  12: [
    {
      keywords: ['injection'],
      refuteKeywords: ['impossible', 'completely safe', '100% secure', 'system prompt prevents'],
      claim: 'A well-written system prompt makes a chatbot fully secure against prompt injection.',
      correction: 'System prompts alone are never 100% secure against prompt injection. A secure architecture requires defense-in-depth, including input filtering, LLM guardrails (like NeMo Guardrails), and output validation.',
      severity: 'warning'
    }
  ],
  13: [
    {
      keywords: ['function calling', 'execute'],
      refuteKeywords: ['llm runs', 'model executes', 'executes code directly'],
      claim: 'The LLM executes the external API or database functions directly during function calling.',
      correction: 'The LLM does not execute functions itself. It only generates the arguments and decides which function to call in JSON format. The client application (your backend code) is responsible for executing the actual function and returning the result to the LLM.',
      severity: 'critical'
    }
  ],
  15: [
    {
      keywords: ['lora', 'weights'],
      refuteKeywords: ['trains all', 'updates all parameters', 'full fine-tuning'],
      claim: 'LoRA fine-tuning updates all the parameters of the base model.',
      correction: 'LoRA freezes the pre-trained base model weights and only trains small, low-rank decomposition matrices added to the layers, drastically reducing the number of trainable parameters (typically by 99%).',
      severity: 'critical'
    },
    {
      keywords: ['qlora', 'bits'],
      refuteKeywords: ['16-bit', '32-bit', 'double precision'],
      claim: 'QLoRA quantizes the base model parameters to 16-bit floating point representations.',
      correction: 'QLoRA quantizes the base model parameters down to 4-bit precision (typically using the NormalFloat4 format) to fit large models onto consumer GPUs, while using 16-bit Page Optimizers for training backpropagation.',
      severity: 'critical'
    }
  ],
  22: [
    {
      keywords: ['multi-agent', 'langgraph', 'crewai'],
      refuteKeywords: ['identical', 'same flow', 'linear only'],
      claim: 'CrewAI and LangGraph use the exact same state orchestration model.',
      correction: 'CrewAI is designed around role-playing agents following defined processes (sequential or hierarchical), while LangGraph is a lower-level framework modeling agent interaction as a state chart (graph) of nodes and edges, allowing cyclic flows.',
      severity: 'warning'
    }
  ],
  23: [
    {
      keywords: ['mcp'],
      refuteKeywords: ['trains', 'weights', 'fine-tuning protocol'],
      claim: 'Model Context Protocol (MCP) is a training framework for fine-tuning models.',
      correction: 'MCP is an open standard protocol created by Anthropic that allows LLM applications (clients) to securely connect to external data sources, tools, and prompts (servers), not a training framework.',
      severity: 'critical'
    }
  ]
};

export function checkHallucinations(day: number, answer: string): HallucinationFlag[] {
  const flags: HallucinationFlag[] = [];
  const rules = FACT_RULES[day];
  if (!rules) return flags;

  const lowerAnswer = answer.toLowerCase();

  for (const rule of rules) {
    // Check if the candidate is talking about the concept
    const mentionsConcept = rule.keywords.some(k => lowerAnswer.includes(k));
    if (!mentionsConcept) continue;

    // Check if they are asserting a refuted claim
    const hasRefutation = rule.refuteKeywords.some(rk => lowerAnswer.includes(rk));
    if (hasRefutation) {
      flags.push({
        claim: rule.claim,
        correction: rule.correction,
        severity: rule.severity
      });
    }
  }

  return flags;
}
