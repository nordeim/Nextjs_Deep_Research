import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import type { ResearchConfig, ResearchResult } from '../types';

export async function performResearch(config: ResearchConfig): Promise<ResearchResult> {
  try {
    if (config.provider === 'openai') {
      return await performOpenAIResearch(config);
    } else {
      return await performGeminiResearch(config);
    }
  } catch (error: any) {
    const errorMessage = error.error?.message || error.message || 'Unknown error occurred';
    throw new Error(`API Error: ${errorMessage}`);
  }
}

async function performOpenAIResearch(config: ResearchConfig): Promise<ResearchResult> {
  const openai = new OpenAI({
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true
  });

  const response = await openai.chat.completions.create({
    model: config.model || "gpt-4-0125-preview",
    messages: [
      {
        role: "system",
        content: "You are a research assistant. Analyze the query deeply and provide a comprehensive answer with follow-up questions for deeper exploration."
      },
      {
        role: "user",
        content: config.query
      }
    ],
    functions: [
      {
        name: "provide_research_response",
        parameters: {
          type: "object",
          properties: {
            answer: { type: "string" },
            followUpQuestions: { type: "array", items: { type: "string" } },
            confidence: { type: "number" }
          },
          required: ["answer", "followUpQuestions", "confidence"]
        }
      }
    ],
    function_call: { name: "provide_research_response" }
  });

  const functionCall = response.choices[0].message.function_call;
  if (!functionCall) throw new Error("No response received from the model");
  
  try {
    const result = JSON.parse(functionCall.arguments);
    return {
      query: config.query,
      ...result
    };
  } catch (error) {
    throw new Error("Failed to parse model response");
  }
}

async function performGeminiResearch(config: ResearchConfig): Promise<ResearchResult> {
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const generativeModel = genAI.getGenerativeModel({ 
    model: config.model || "gemini-pro"
  });

  const generationConfig = {
    temperature: config.temperature || 0.7,
    topP: 0.95,
    topK: 40,
  };

  const safetySettings = [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ];

  const systemPrompt = `You are a research assistant. Your task is to:
1. Analyze the query deeply
2. Provide a comprehensive answer
3. Generate relevant follow-up questions
4. Format your response as JSON with this structure:
{
  "answer": "your detailed answer",
  "followUpQuestions": ["question 1", "question 2", "question 3"],
  "confidence": 0.95
}`;

  const prompt = `${systemPrompt}\n\nQuery: ${config.query}`;

  try {
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const text = response.text();
    
    try {
      const parsed = JSON.parse(text);
      return {
        query: config.query,
        ...parsed
      };
    } catch (e) {
      throw new Error("Failed to parse Gemini response. The model did not return valid JSON.");
    }
  } catch (error: any) {
    throw new Error(`Gemini API Error: ${error.message}`);
  }
}