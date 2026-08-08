import { Candidate, InterviewSession, AIProviderResponse, InterviewFeedback, RecruiterVerdict, EvidenceEntry, VerdictLevel, HallucinationFlag } from '../types';
import { getDayInfo, getCompletedDays, getWeakDays } from '../utils/curriculumLoader';
import { PERSONAS } from './PersonaConfig';
import { checkHallucinations } from './HallucinationChecker';
import { getRelatedConcepts } from './TopicGraph';

// ─────────────────────────────────────────────────────────────────
// Question bank keyed by curriculum day number
// ─────────────────────────────────────────────────────────────────
interface QuestionTemplate {
  question: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: string;
  followups: string[];
}

const QUESTION_BANK: Record<number, QuestionTemplate[]> = {
  7: [
    {
      question: "Can you explain what vector embeddings are and why they're useful for representing text?",
      topic: "Embeddings",
      difficulty: "easy",
      questionType: "conceptual",
      followups: [
        "You mentioned embeddings represent text as vectors. Why does cosine similarity work better than Euclidean distance for comparing sentence embeddings?",
        "How would you visualize whether your embedding model is capturing semantic meaning correctly? What would you look for in a PCA plot?",
        "If two sentences have very similar embeddings but completely different meanings, what does that tell you about your embedding model?"
      ]
    },
    {
      question: "Walk me through what happens when you call an embedding model on a paragraph of text. What does it produce, and what does that output represent?",
      topic: "Embeddings",
      difficulty: "medium",
      questionType: "practical",
      followups: [
        "You've embedded documents using sentence transformers. How do you decide the optimal chunk size before embedding, and what's the trade-off?",
        "What happens to semantic meaning when you embed a 500-word document as a single vector versus chunking it into smaller pieces first?"
      ]
    }
  ],
  8: [
    {
      question: "What is a vector database, and how does it differ from a traditional relational database like PostgreSQL?",
      topic: "Vector Databases",
      difficulty: "easy",
      questionType: "conceptual",
      followups: [
        "You've compared vector databases to relational databases. When would you choose to use BOTH in the same system — what role does each play?",
        "ChromaDB and Pinecone are both vector databases but with very different deployment models. What factors would drive you to choose one over the other for a production system?",
        "Explain what HNSW indexing is and why it matters for retrieval speed at scale."
      ]
    },
    {
      question: "You have a vector database with 10,000 documents. Retrieval quality is great. Now the database grows to 10 million documents and retrieval accuracy drops. What would you investigate first?",
      topic: "Vector Databases",
      difficulty: "hard",
      questionType: "scenario",
      followups: [
        "You mentioned indexing. Explain the trade-off between index build time, query speed, and recall accuracy in approximate nearest neighbor search.",
        "How would you design a metadata filtering strategy so vector search doesn't return irrelevant documents even when they're semantically close?"
      ]
    }
  ],
  9: [
    {
      question: "Describe the process of populating a vector database from a knowledge base. What steps are involved between having raw documents and having a searchable vector index?",
      topic: "Vector Database Population",
      difficulty: "medium",
      questionType: "practical",
      followups: [
        "When loading embeddings into ChromaDB, how do you handle documents that are too large to embed as a single unit?",
        "What metadata would you attach to each vector document, and why does metadata filtering matter for retrieval quality?"
      ]
    }
  ],
  10: [
    {
      question: "Walk me through how a query router works when you have both SQL data and a vector database. How does it decide which retrieval path to use?",
      topic: "Retrieval Engine",
      difficulty: "medium",
      questionType: "architecture",
      followups: [
        "You built a hybrid retrieval system. How do you merge and rank results from both SQL and vector search when they return overlapping answers?",
        "What's the failure mode when your query router makes the wrong routing decision? How would you detect and fix it?"
      ]
    },
    {
      question: "What does 'hybrid retrieval' mean, and what are the advantages over pure semantic or pure keyword search?",
      topic: "Retrieval Engine",
      difficulty: "easy",
      questionType: "conceptual",
      followups: [
        "In a hybrid search system that uses both BM25 and vector search, how do you combine the scores from both systems into a single ranking?",
        "Describe a scenario where keyword search outperforms semantic search. Why would this happen?"
      ]
    }
  ],
  11: [
    {
      question: "Explain what Retrieval-Augmented Generation (RAG) is and why you would use it instead of relying only on an LLM's internal knowledge.",
      topic: "RAG",
      difficulty: "easy",
      questionType: "conceptual",
      followups: [
        "You've built a RAG pipeline end-to-end. What are the most common failure modes, and how do you diagnose whether the problem is in retrieval or generation?",
        "How do you construct the prompt that combines retrieved context with the user's question? Walk me through your prompt template design.",
        "What does 'hallucination' mean in the context of RAG, and how does retrieved context reduce but not eliminate it?"
      ]
    }
  ],
  12: [
    {
      question: "What is the difference between zero-shot, few-shot, and chain-of-thought prompting? When would you choose each approach?",
      topic: "Prompt Engineering",
      difficulty: "easy",
      questionType: "conceptual",
      followups: [
        "You've designed multiple system prompt variations. How do you systematically evaluate which prompt performs best? What metrics do you use?",
        "Describe a case where chain-of-thought prompting significantly improved accuracy. Why does breaking reasoning into steps help?",
        "What's prompt injection, and how would you design a system prompt that's resistant to it?"
      ]
    },
    {
      question: "You're designing a production system prompt for a customer-facing chatbot. What elements would you include, and what trade-offs are you making?",
      topic: "Prompt Engineering",
      difficulty: "medium",
      questionType: "architecture",
      followups: [
        "Your system prompt is 2000 tokens long. That's eating into your context window. How do you balance a detailed system prompt with leaving room for conversation history and retrieved context?",
        "How would you version-control system prompts in a team environment where multiple people are experimenting with different prompts simultaneously?"
      ]
    }
  ],
  13: [
    {
      question: "Explain how LLM function calling works. What does the model actually do when you define a tool schema?",
      topic: "Function Calling",
      difficulty: "medium",
      questionType: "conceptual",
      followups: [
        "When an LLM calls multiple tools in a single response, how do you orchestrate the tool execution and feed results back to the model?",
        "What would you use Pydantic for in a function-calling workflow, and how does it protect your system from malformed LLM outputs?",
        "Describe a scenario where function calling is clearly better than prompt engineering alone."
      ]
    }
  ],
  14: [
    {
      question: "When should you fine-tune an LLM instead of using RAG or prompt engineering? What signals indicate fine-tuning is the right choice?",
      topic: "Fine-Tuning",
      difficulty: "medium",
      questionType: "tradeoff",
      followups: [
        "You've prepared a fine-tuning dataset. What makes a high-quality fine-tuning example, and how do you validate dataset quality before training?",
        "Compare the cost and maintenance implications of fine-tuning vs RAG for keeping a model up-to-date with new information."
      ]
    }
  ],
  15: [
    {
      question: "What is LoRA, and why does it make fine-tuning much more practical than full model fine-tuning?",
      topic: "Fine-Tuning with LoRA",
      difficulty: "medium",
      questionType: "conceptual",
      followups: [
        "What is QLoRA, and how does it differ from LoRA in terms of memory efficiency?",
        "After fine-tuning a model with LoRA, how do you evaluate whether the fine-tuning was beneficial? What metrics and test cases do you use?"
      ]
    }
  ],
  16: [
    {
      question: "You've built a /chat API endpoint using FastAPI. Walk me through how a single user message flows from the HTTP request all the way to the LLM response being returned.",
      topic: "Chatbot Backend",
      difficulty: "medium",
      questionType: "architecture",
      followups: [
        "How do you manage conversation history in a stateless REST API? Where does the conversation state live?",
        "Your chat API needs to handle 100 concurrent users. What bottlenecks would you expect and how would you address them?"
      ]
    },
    {
      question: "What is session management in the context of a multi-turn chatbot? Why can't you just send the latest message to the LLM each time?",
      topic: "Chatbot Backend",
      difficulty: "easy",
      questionType: "conceptual",
      followups: [
        "You're storing conversation history in SQLite. At what point does conversation history become a problem for the LLM, and how do you handle it?",
        "Explain the role of the messages array in the OpenAI chat completions API. What is the significance of the role field?"
      ]
    }
  ],
  17: [
    {
      question: "Describe how you connected a Streamlit frontend to a FastAPI backend. What were the key integration challenges?",
      topic: "Chatbot Frontend",
      difficulty: "easy",
      questionType: "practical",
      followups: [
        "How did you manage conversation state in Streamlit across multiple user interactions?",
        "What would you need to change to replace Streamlit with a React frontend while keeping the same backend?"
      ]
    }
  ],
  18: [
    {
      question: "Explain how streaming responses work in an LLM-powered application. What is different about handling streamed responses compared to standard JSON responses?",
      topic: "Streaming",
      difficulty: "medium",
      questionType: "conceptual",
      followups: [
        "How do Server-Sent Events differ from WebSockets for streaming LLM responses? When would you choose SSE over WebSockets?",
        "What happens if a streaming response is interrupted mid-stream? How do you handle partial responses gracefully?"
      ]
    }
  ],
  19: [
    {
      question: "How did you add citations to chatbot responses? Why are citations important in an RAG-based system?",
      topic: "Response Formatting",
      difficulty: "easy",
      questionType: "practical",
      followups: [
        "What structured output format did you use for claims and coverage summaries, and how did Pydantic help validate those outputs?",
        "How do you render rich Markdown content safely in a frontend chat interface?"
      ]
    }
  ],
  20: [
    {
      question: "How do you handle long conversation histories in a token-limited LLM? What strategies prevent the context window from overflowing?",
      topic: "Context Management",
      difficulty: "medium",
      questionType: "practical",
      followups: [
        "Explain conversation summarization as a context management strategy. What are its limitations?",
        "How do you decide which messages to keep and which to drop when you're approaching the context limit?"
      ]
    }
  ],
  21: [
    {
      question: "What is a ReAct agent, and how does it decide which tool to call when given a user query?",
      topic: "Agentic AI",
      difficulty: "medium",
      questionType: "conceptual",
      followups: [
        "You converted function-calling workflows into a LangChain ReAct agent. What are the key differences in how you structure tools for an agent versus raw function calling?",
        "How do you debug an agent that's choosing the wrong tool? Walk me through your debugging process.",
        "What is the reasoning trace in a ReAct agent, and why is it valuable for understanding agent behavior?"
      ]
    }
  ],
  22: [
    {
      question: "You built a multi-agent system where a router agent delegates to specialist agents. What are the benefits of this architecture over a single agent?",
      topic: "Multi-Agent Orchestration",
      difficulty: "medium",
      questionType: "architecture",
      followups: [
        "How do you handle failures or timeouts in one specialist agent without crashing the entire multi-agent pipeline?",
        "Compare CrewAI and LangGraph for multi-agent orchestration. What does each framework excel at?",
        "Describe a scenario where a multi-agent system creates more problems than it solves. What are the pitfalls?"
      ]
    },
    {
      question: "What is agent orchestration, and why is it more complex than simply chaining LLM calls?",
      topic: "Multi-Agent Orchestration",
      difficulty: "easy",
      questionType: "conceptual",
      followups: [
        "How do you prevent agents from going into infinite loops or making too many tool calls?",
        "What data needs to be shared between agents in a multi-agent system, and how do you manage that shared state?"
      ]
    }
  ],
  23: [
    {
      question: "What is the Model Context Protocol (MCP), and what problem does it solve for AI applications?",
      topic: "Model Context Protocol",
      difficulty: "medium",
      questionType: "conceptual",
      followups: [
        "You built an MCP server exposing chatbot tools. How does an MCP client discover and invoke those tools?",
        "What are the advantages of exposing AI capabilities through MCP compared to direct API calls?",
        "How does MCP standardization change the integration story for AI tools across different clients and models?"
      ]
    }
  ],
  24: [
    {
      question: "Describe your agentic chatbot pipeline that integrates agents, MCP tools, retrieval, and conversation memory. What was the hardest integration challenge?",
      topic: "Agentic Integration",
      difficulty: "hard",
      questionType: "architecture",
      followups: [
        "How do you implement retries and timeouts for MCP tool calls that might fail in production?",
        "Walk me through how you tested the reliability of the complete agentic pipeline."
      ]
    }
  ],
  25: [
    {
      question: "How do you evaluate a RAG-based chatbot's response quality? What metrics do you use and how do you collect ground truth?",
      topic: "Evaluation",
      difficulty: "medium",
      questionType: "practical",
      followups: [
        "What is 'groundedness' as an evaluation metric for RAG systems, and how do you measure it?",
        "Describe the benchmark dataset you created. What types of questions did you include and why?"
      ]
    }
  ],
  26: [
    {
      question: "Walk me through how you measured and optimized token usage in your chatbot pipeline. What were the biggest sources of unnecessary token consumption?",
      topic: "Performance Optimization",
      difficulty: "medium",
      questionType: "practical",
      followups: [
        "You implemented response caching. What are the risks of caching LLM responses, and how do you decide which responses are safe to cache?",
        "How do you balance reducing retrieval context size (to save tokens) versus maintaining answer quality?"
      ]
    }
  ],
  27: [
    {
      question: "What is prompt injection, and how would you design a system to protect against it in a production chatbot?",
      topic: "Security & Guardrails",
      difficulty: "hard",
      questionType: "practical",
      followups: [
        "How do you sanitize user inputs before passing them to an LLM without over-filtering legitimate queries?",
        "Describe the layered security approach you used for the chatbot API. What attack vectors did you address?"
      ]
    }
  ],
  28: [
    {
      question: "Walk me through how you containerized the chatbot using Docker. What goes into the Dockerfile for a FastAPI backend?",
      topic: "Docker & Kubernetes",
      difficulty: "medium",
      questionType: "practical",
      followups: [
        "You deployed to Kubernetes. How do you manage environment variables and secrets in a Kubernetes deployment?",
        "What health checks did you configure, and how does Kubernetes use them to decide if a pod is ready to receive traffic?",
        "Explain the difference between a Kubernetes Deployment, Service, and Ingress. How do they work together to expose your chatbot?"
      ]
    }
  ],
  29: [
    {
      question: "Explain what observability means in the context of a production AI system. How is it different from simple logging?",
      topic: "Monitoring & Observability",
      difficulty: "medium",
      questionType: "conceptual",
      followups: [
        "You integrated Prometheus and Grafana. What specific metrics did you track for the chatbot pipeline?",
        "How would you use monitoring data to identify that retrieval quality is degrading before users start complaining?"
      ]
    }
  ],
  30: [
    {
      question: "What does 'production readiness' mean to you for an AI application? What checks do you perform before going live?",
      topic: "Production Readiness",
      difficulty: "medium",
      questionType: "tradeoff",
      followups: [
        "Walk me through the end-to-end test you ran on the chatbot before the final release. What did you test and how?",
        "What operational runbooks or documentation did you prepare for the production deployment?"
      ]
    }
  ],
  31: [
    {
      question: "Walk me through your capstone project. What is the architecture, what problem does it solve, and what were the biggest technical challenges?",
      topic: "Capstone",
      difficulty: "medium",
      questionType: "practical",
      followups: [
        "If you had to rebuild your capstone project from scratch with what you know now, what would you do differently?",
        "How did you demonstrate the production-readiness of your system during the final demo?",
        "What real-world scenarios did you use to evaluate your chatbot, and what did those tests reveal?"
      ]
    }
  ]
};

// Default questions for days without specific entries
function getDefaultQuestion(day: number, title: string): QuestionTemplate {
  return {
    question: `You completed Day ${day}: ${title}. Can you walk me through the most important thing you built or learned on that day and why it matters for building production AI systems?`,
    topic: title,
    difficulty: 'medium',
    questionType: 'practical',
    followups: [
      `What was the hardest part of Day ${day} and how did you overcome it?`,
      `How does what you learned on Day ${day} connect to what you've built in earlier or later parts of the curriculum?`
    ]
  };
}

// ─────────────────────────────────────────────────────────────────
// Mock AI Provider
// ─────────────────────────────────────────────────────────────────
export class MockAIProvider {
  private usedQuestions = new Map<string, Set<string>>();
  private dayQueue = new Map<string, number[]>();

  private getAvailableQuestions(sessionId: string, day: number, dayTitle: string): QuestionTemplate[] {
    const templates = QUESTION_BANK[day] || [getDefaultQuestion(day, dayTitle)];
    const used = this.usedQuestions.get(sessionId) || new Set();
    return templates.filter(q => !used.has(q.question));
  }

  private markUsed(sessionId: string, question: string): void {
    if (!this.usedQuestions.has(sessionId)) {
      this.usedQuestions.set(sessionId, new Set());
    }
    this.usedQuestions.get(sessionId)!.add(question);
  }

  private buildDayQueue(session: InterviewSession): number[] {
    if (this.dayQueue.has(session.sessionId)) {
      return this.dayQueue.get(session.sessionId)!;
    }
    const completed = session.candidate.missions
      .filter(m => m.passed === true)
      .map(m => m.day);
    const weak = getWeakDays(session.candidate);
    const weakSet = new Set(weak);
    const strong = completed.filter(d => !weakSet.has(d));
    const queue = [...weak, ...strong];
    this.dayQueue.set(session.sessionId, queue);
    return queue;
  }

  async getOpening(session: InterviewSession): Promise<AIProviderResponse> {
    const { name, jobRole } = session.candidate.member;
    const completedCount = session.candidate.missions.filter(m => m.passed).length;
    
    // Fetch Selected Persona config
    const personaKey = session.persona || 'engineer';
    const personaConfig = PERSONAS[personaKey] || PERSONAS.engineer;

    const dayQueue = this.buildDayQueue(session);
    const firstDay = dayQueue[0] || session.candidate.missions[0]?.day || 12;
    const dayInfo = getDayInfo(firstDay);
    const templates = this.getAvailableQuestions(session.sessionId, firstDay, dayInfo?.title || 'AI Engineering');
    const template = templates[0] || getDefaultQuestion(firstDay, dayInfo?.title || 'AI Engineering');
    this.markUsed(session.sessionId, template.question);

    // Personalize welcome text based on persona template
    let welcomeText = personaConfig.welcomeTemplate
      .replace("Emily Chen", name)
      .replace("Sarah Johnson", name)
      .replace("Alex Turner", name);
      
    if (!welcomeText.includes(name)) {
      welcomeText = `Welcome, ${name}! ` + welcomeText;
    }

    const opening = `${welcomeText}\n\nI note that you have completed ${completedCount} milestones in the ABTalks AI engineering track. Let us start here:\n\n${template.question}`;

    return {
      reply: opening,
      done: false,
      topic: template.topic,
      curriculumDay: firstDay,
      difficulty: template.difficulty,
      relatedConcepts: getRelatedConcepts(firstDay)
    };
  }

  async getNextResponse(session: InterviewSession, userMessage: string): Promise<AIProviderResponse> {
    const questionCount = session.questionCount;
    const dayQueue = this.buildDayQueue(session);
    const personaKey = session.persona || 'engineer';
    const personaConfig = PERSONAS[personaKey] || PERSONAS.engineer;

    // Determine if we should generate final feedback
    const daysCovered = session.curriculumDaysCovered.length;
    const shouldComplete = questionCount >= 8 && daysCovered >= 4;

    if (shouldComplete) {
      return this.generateFeedback(session);
    }

    const lastDay = session.curriculumDaysCovered[session.curriculumDaysCovered.length - 1] || 12;
    const lastDayInfo = getDayInfo(lastDay);

    // 1. Hallucination detection
    const hallucinationFlags = checkHallucinations(lastDay, userMessage);

    // Analyze the user's answer quality
    const wordCount = userMessage.trim().split(/\s+/).length;
    const isStrong = wordCount >= 50 && hallucinationFlags.length === 0;
    const isWeak = wordCount < 20 || hallucinationFlags.some(f => f.severity === 'critical');
    
    let correctness = isStrong ? 0.85 : isWeak ? 0.35 : 0.65;
    let depth = isStrong ? 0.8 : isWeak ? 0.3 : 0.6;
    let reasoning = isStrong ? 0.8 : isWeak ? 0.3 : 0.6;

    // Penalty for hallucinations
    if (hallucinationFlags.length > 0) {
      correctness = Math.max(0.1, correctness - 0.25 * hallucinationFlags.length);
      depth = Math.max(0.2, depth - 0.15 * hallucinationFlags.length);
    }

    const evaluation = {
      correctness,
      depth,
      reasoning
    };

    // 2. Architecture Critic trigger
    const criticTriggerWords = ['architecture', 'design', 'components', 'infra', 'structure', 'pipeline', 'scale', 'scaling', 'deploy', 'system uses', 'i would build', 'i would use'];
    const lowerMessage = userMessage.toLowerCase();
    const hasCriticTrigger = criticTriggerWords.some(w => lowerMessage.includes(w));
    let architectureCritique: string | undefined;

    if (hasCriticTrigger && lastDayInfo) {
      architectureCritique = this.generateArchitectureCritique(lastDay, lastDayInfo.title, userMessage);
    }

    // 3. Log Evidence
    this.logEvidence(session, questionCount, lastDay, lastDayInfo?.title || 'Core concepts', userMessage, evaluation, hallucinationFlags);

    // Decide next action: follow-up or new topic
    const lastTemplates = QUESTION_BANK[lastDay] || [];
    const usedSet = this.usedQuestions.get(session.sessionId) || new Set();
    
    let selectedFollowup: string | null = null;
    if (!isWeak && lastTemplates.length > 0) {
      for (const t of lastTemplates) {
        if (usedSet.has(t.question) && t.followups.length > 0) {
          const unusedFollowup = t.followups.find(f => !usedSet.has(f));
          if (unusedFollowup && questionCount < 5) {
            selectedFollowup = unusedFollowup;
            this.markUsed(session.sessionId, unusedFollowup);
            break;
          }
        }
      }
    }

    if (selectedFollowup) {
      let transitionPhrase = '';
      if (personaConfig.id === 'skeptic') {
        transitionPhrase = isStrong 
          ? "I hear your explanation. However, I am skeptical about the latency footprint here. " 
          : "That explanation has significant loopholes. Let me ask this instead: ";
      } else if (personaConfig.id === 'mentor') {
        transitionPhrase = isStrong 
          ? "Spot on! That is an awesome point. Extending that idea, " 
          : "Interesting try. Let's redirect slightly to make sure we've got the basics down: ";
      } else if (personaConfig.id === 'researcher') {
        transitionPhrase = "Understood. Analyzing the secondary dimension of that hypothesis: ";
      } else if (personaConfig.id === 'cto') {
        transitionPhrase = "Makes sense for speed. But what about scale? Let's check this: ";
      } else {
        transitionPhrase = isStrong 
          ? "Good answer. Let me push a bit deeper on that.\n\n" 
          : "That is a reasonable start. Let's go one level deeper.\n\n";
      }

      return {
        reply: transitionPhrase + "\n\n" + selectedFollowup,
        done: false,
        topic: lastDayInfo?.title || 'Follow-up',
        curriculumDay: lastDay,
        difficulty: isStrong ? 'hard' : 'medium',
        evaluation,
        relatedConcepts: getRelatedConcepts(lastDay),
        hallucinationFlags,
        architectureCritique
      };
    }

    // Move to a new curriculum day
    const coveredSet = new Set(session.curriculumDaysCovered);
    const nextDay = dayQueue.find(d => {
      if (coveredSet.has(d)) return false;
      const available = this.getAvailableQuestions(session.sessionId, d, getDayInfo(d)?.title || '');
      return available.length > 0;
    });

    if (!nextDay) {
      const anyDay = dayQueue.find(d => {
        const available = this.getAvailableQuestions(session.sessionId, d, getDayInfo(d)?.title || '');
        return available.length > 0;
      });
      
      if (!anyDay) {
        return this.generateFeedback(session);
      }
      
      const dayInfo = getDayInfo(anyDay);
      const templates = this.getAvailableQuestions(session.sessionId, anyDay, dayInfo?.title || '');
      const template = templates[0]!;
      this.markUsed(session.sessionId, template.question);

      let topicTransition = `Let us revisit ${dayInfo?.title || 'another topic'}.\n\n`;
      if (personaConfig.id === 'skeptic') topicTransition = `Let's see if you can defend this other area, ${dayInfo?.title}.\n\n`;

      return {
        reply: topicTransition + template.question,
        done: false,
        topic: template.topic,
        curriculumDay: anyDay,
        difficulty: template.difficulty,
        evaluation,
        relatedConcepts: getRelatedConcepts(anyDay),
        hallucinationFlags,
        architectureCritique
      };
    }

    // Get a question from the new day
    const nextDayInfo = getDayInfo(nextDay);
    const templates = this.getAvailableQuestions(session.sessionId, nextDay, nextDayInfo?.title || '');
    const template = templates[0]!;
    this.markUsed(session.sessionId, template.question);

    let transition = '';
    if (personaConfig.id === 'skeptic') {
      transition = "I've heard enough on this topic. Let's probe a completely different area:\n\n";
    } else if (personaConfig.id === 'mentor') {
      transition = "Awesome, let's switch gears and look at another topic next:\n\n";
    } else if (personaConfig.id === 'cto') {
      transition = "Got it. Let's move quickly to the next topic:\n\n";
    } else {
      transition = "Thanks for that. Let's shift topics now.\n\n";
    }

    return {
      reply: transition + template.question,
      done: false,
      topic: template.topic,
      curriculumDay: nextDay,
      difficulty: template.difficulty,
      evaluation,
      relatedConcepts: getRelatedConcepts(nextDay),
      hallucinationFlags,
      architectureCritique
    };
  }

  private generateArchitectureCritique(day: number, topic: string, answer: string): string {
    const lowerAnswer = answer.toLowerCase();
    
    // Topic-specific critique rules
    if (day === 7 || day === 8 || day === 9 || day === 10 || day === 11) { // RAG & Vector DBs
      let points = [];
      if (!lowerAnswer.includes('chunk') && !lowerAnswer.includes('split')) {
        points.push("⚠️ Missing detailed Document Chunking Strategy. Large chunks risk context overflow; small chunks break semantic continuity.");
      }
      if (!lowerAnswer.includes('filter') && !lowerAnswer.includes('metadata')) {
        points.push("⚠️ No Metadata Filtering mechanism identified. Vector matching alone suffers from high recall of irrelevant matches in scaled multi-tenant databases.");
      }
      if (!lowerAnswer.includes('hybrid') && !lowerAnswer.includes('bm25') && !lowerAnswer.includes('keyword')) {
        points.push("💡 Recommendation: Use Hybrid Search. Combining BM25 keyword matching with dense semantic embeddings balances keyword precision with semantic accuracy.");
      }
      if (lowerAnswer.includes('cosine') && !lowerAnswer.includes('normalize')) {
        points.push("✅ Correct use of Cosine Similarity. Note that vectors should be unit-normalized during insertion to optimize dot-product query speed.");
      }
      
      if (points.length === 0) {
        return `### 🏗️ Architecture Review: RAG Pipeline
- **Status**: Excellent Design.
- **Strengths**: Comprehensive consideration of search mechanics.
- **Production Tip**: Introduce a reranker (e.g. Cohere Rerank) to further optimize token limits.`;
      }
      
      return `### 🏗️ Architecture Review: RAG & Vector DB
- **Gaps Identified**:
${points.map(p => `- ${p}`).join('\n')}
- **Production Tip**: Ensure your vector index (e.g. HNSW) has a configured graph construction parameter M and efConstruction to balance speed and accuracy.`;
    }

    if (day === 13 || day === 21 || day === 22 || day === 24) { // Agents & Function Calling
      let points = [];
      if (!lowerAnswer.includes('loop') && !lowerAnswer.includes('limit')) {
        points.push("⚠️ No Agent Loop Guardrails. AI agents can get stuck in infinite execution loops, consuming massive API tokens. Configure Max Iterations and Timeouts.");
      }
      if (!lowerAnswer.includes('retry') && !lowerAnswer.includes('error')) {
        points.push("⚠️ Missing Tool Call Exception Handling. External API failures must be handled and formatted back to the agent state, rather than crashing the loop.");
      }
      if (points.length === 0) {
        return `### 🏗️ Architecture Review: Agentic AI
- **Status**: Robust Agent Loop Design.
- **Strengths**: Good handling of tool execution parameters.
- **Production Tip**: Use state-charts (like LangGraph) for structured routing instead of relying entirely on prompt-based tool dispatching.`;
      }
      
      return `### 🏗️ Architecture Review: Agentic AI
- **Gaps Identified**:
${points.map(p => `- ${p}`).join('\n')}
- **Production Tip**: Implement semantic validation or JSON schemas (e.g. Pydantic) on agent inputs to safeguard API stability.`;
    }

    // General Architecture Critique
    return `### 🏗️ Architecture Review: System Design
- **Analysis**: The described topology leverages decoupled services, which is positive.
- **Recommendation**: Ensure you have a structured logging middleware (e.g., OpenTelemetry) to track latency trace segments from API gateways down to LLM calls.`;
  }

  private logEvidence(
    session: InterviewSession,
    turn: number,
    day: number,
    topic: string,
    message: string,
    evaluation: { correctness: number },
    hallucinations: HallucinationFlag[]
  ) {
    if (!session.evidenceLog) session.evidenceLog = [];

    // Extract a brief representative sentence from answer
    let quote = message.split(/[.!?]/)[0].trim();
    if (quote.length > 80) quote = quote.substring(0, 77) + "...";
    quote = `"${quote}"`;

    if (evaluation.correctness >= 0.7 && hallucinations.length === 0) {
      session.evidenceLog.push({
        turn,
        quote,
        topic,
        day,
        score: evaluation.correctness,
        type: 'positive'
      });
    } else if (evaluation.correctness < 0.5 || hallucinations.length > 0) {
      session.evidenceLog.push({
        turn,
        quote,
        topic,
        day,
        score: evaluation.correctness,
        type: 'negative'
      });
    }
  }

  private generateFeedback(session: InterviewSession): AIProviderResponse {
    const { name, jobRole } = session.candidate.member;
    const scores = session.scores;
    
    const avgCorrectness = scores.correctness.length
      ? scores.correctness.reduce((a, b) => a + b, 0) / scores.correctness.length
      : 0.65;
    const avgDepth = scores.depth.length
      ? scores.depth.reduce((a, b) => a + b, 0) / scores.depth.length
      : 0.6;
    const avgReasoning = scores.reasoning.length
      ? scores.reasoning.reduce((a, b) => a + b, 0) / scores.reasoning.length
      : 0.65;

    const overallScore = Math.round((avgCorrectness * 0.4 + avgDepth * 0.3 + avgReasoning * 0.3) * 100);

    const topicsCovered = session.topicsCovered;
    const daysCovered = session.curriculumDaysCovered;
    const weakDays = getWeakDays(session.candidate);

    // Calculate Recruiter Verdict
    let verdict: VerdictLevel = 'BORDERLINE';
    if (overallScore >= 80) verdict = 'STRONG_HIRE';
    else if (overallScore >= 68) verdict = 'HIRE';
    else if (overallScore >= 50) verdict = 'BORDERLINE';
    else verdict = 'NO_HIRE';

    // Confidence score based on topic coverage density and correctness
    let confidence = Math.min(99, Math.round(overallScore * 0.9 + (daysCovered.length * 2)));
    
    // Penalize if candidate has many negative evidence logs or hallucinations
    const negativeEntries = (session.evidenceLog || []).filter(e => e.type === 'negative').length;
    confidence = Math.max(20, confidence - (negativeEntries * 5));

    const evidenceFor = (session.evidenceLog || []).filter(e => e.type === 'positive');
    const evidenceAgainst = (session.evidenceLog || []).filter(e => e.type === 'negative');

    const recruiterVerdict: RecruiterVerdict = {
      verdict,
      confidence,
      evidenceFor,
      evidenceAgainst,
      recruiterNotes: `${name} has demonstrated a technical scoring average of ${overallScore}%. They covered ${daysCovered.length} curriculum days. Strong candidate for ${jobRole} roles in AI integration. Recommended focus on bridging design patterns to production scale.`
    };

    // Build personalized feedback
    const strengths: string[] = [];
    const gaps: string[] = [];
    const next: string[] = [];

    if (avgCorrectness >= 0.7) {
      strengths.push(`Strong conceptual understanding across covered topics including ${topicsCovered.slice(0, 2).join(' and ')}`);
    }
    if (avgDepth >= 0.65) {
      strengths.push("Demonstrated ability to explain technical concepts with reasonable depth");
    }
    if (avgReasoning >= 0.65) {
      strengths.push("Good reasoning when discussing trade-offs and practical engineering decisions");
    }
    if (session.candidate.signals.missionsFirstTry > 15) {
      strengths.push(`High efficiency in the curriculum — ${session.candidate.signals.missionsFirstTry} missions passed on the first attempt`);
    }
    if (strengths.length === 0) {
      strengths.push("Completed the 31-day curriculum, displaying high dedication.");
    }

    if (weakDays.length > 0) {
      const weakTopics = weakDays.slice(0, 2).map(d => getDayInfo(d)?.title).filter(Boolean);
      gaps.push(`Topics requiring more practice: ${weakTopics.join(', ')} — these took multiple attempts in the curriculum`);
    }
    if (avgDepth < 0.6) {
      gaps.push("Answers sometimes lack depth — try to explain the 'why' behind technical choices");
    }
    if (negativeEntries > 1) {
      gaps.push("Spotted minor technical hallucinations or inaccuracies regarding indexing and scaling limits.");
    }
    if (gaps.length === 0) {
      gaps.push("Production deployment and multi-region scalability could be explored more deeply");
    }

    next.push(`Review the topics that required the most attempts: ${weakDays.slice(0, 2).map(d => getDayInfo(d)?.title).filter(Boolean).join(', ')}`);
    next.push("Formulate system design answers following the framework: Requirement -> Trade-offs -> Specific choices.");
    next.push("Familiarize yourself with memory constraints in LLM fine-tuning, especially parameters calculations.");

    const summary = overallScore >= 75
      ? `${name} demonstrated solid technical understanding across ${daysCovered.length} curriculum areas. The interview showed strong foundational knowledge with particularly good performance on ${topicsCovered[0] || 'core topics'}. Some deeper engineering and architecture reasoning would strengthen the overall profile.`
      : `${name} completed the 31-day curriculum and showed genuine engagement during the interview. To improve, focus on explaining technical choices and trade-offs rather than simply describing component actions.`;

    const feedbackMessage = `Thank you, ${name}. That concludes our technical interview.\n\nI've assessed your performance across ${daysCovered.length} curriculum areas with ${session.questionCount} questions. Your overall technical score is ${overallScore}/100.\n\nPlease review your detailed feedback below.`;

    const feedback: InterviewFeedback = {
      summary,
      strengths,
      gaps,
      next,
    };

    return {
      reply: feedbackMessage,
      done: true,
      feedback,
      evaluation: {
        correctness: avgCorrectness,
        depth: avgDepth,
        reasoning: avgReasoning,
      },
      recruiterVerdict
    };
  }
}
