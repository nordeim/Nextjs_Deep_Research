export type ApiProvider = 'openai' | 'gemini';

export interface ResearchConfig {
  apiKey: string;
  provider: ApiProvider;
  model: string;
  temperature?: number;
  query: string;
  maxDepth: number;
  maxBranches: number;
}

export interface ResearchResult {
  query: string;
  answer: string;
  followUpQuestions: string[];
  confidence: number;
  sources?: string[];
}