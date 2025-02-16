import React, { useState } from 'react';
import { Brain, Lightbulb, Loader2, ChevronDown, ChevronUp, AlertCircle, Thermometer } from 'lucide-react';
import type { ResearchConfig, ResearchResult } from './types';
import { performResearch } from './services/ai';

function App() {
  const [config, setConfig] = useState<ResearchConfig>({
    apiKey: '',
    provider: 'openai',
    model: 'gpt-4-0125-preview',
    temperature: 0.7,
    query: '',
    maxDepth: 3,
    maxBranches: 3
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<number[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await performResearch(config);
      setResults([result, ...results]);
      setExpandedResults([0]);
    } catch (error: any) {
      console.error('Research failed:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (index: number) => {
    setExpandedResults(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-center mb-12">
          <Brain className="w-12 h-12 mr-4 text-blue-400" />
          <h1 className="text-4xl font-bold">Deep Research AI</h1>
        </header>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block mb-2">API Provider</label>
            <select
              value={config.provider}
              onChange={e => {
                const provider = e.target.value as 'openai' | 'gemini';
                setConfig({
                  ...config,
                  provider,
                  model: provider === 'openai' ? 'gpt-4-0125-preview' : 'gemini-pro'
                });
              }}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-2">API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={e => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder={`Enter your ${config.provider === 'openai' ? 'OpenAI' : 'Google AI'} API key`}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2">Model Name</label>
            <input
              type="text"
              value={config.model}
              onChange={e => setConfig({ ...config, model: e.target.value })}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder={`Enter model name (e.g., ${config.provider === 'openai' ? 'gpt-4-0125-preview' : 'gemini-pro'})`}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Temperature: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={e => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Controls response creativity: 0 for focused, 1 for more creative</p>
          </div>

          <div className="mb-6">
            <label className="block mb-2">Research Query</label>
            <textarea
              value={config.query}
              onChange={e => setConfig({ ...config, query: e.target.value })}
              className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your research question..."
              rows={4}
            />
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block mb-2">Max Depth</label>
              <input
                type="number"
                value={config.maxDepth}
                onChange={e => setConfig({ ...config, maxDepth: parseInt(e.target.value) })}
                min={1}
                max={5}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2">Max Branches</label>
              <input
                type="number"
                value={config.maxBranches}
                onChange={e => setConfig({ ...config, maxBranches: parseInt(e.target.value) })}
                min={1}
                max={5}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !config.apiKey || !config.query}
            className="w-full py-3 px-6 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Lightbulb className="w-5 h-5" />
                Start Research
              </>
            )}
          </button>
        </form>

        <div className="max-w-3xl mx-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="mb-6 bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
            >
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-750"
                onClick={() => toggleExpanded(index)}
              >
                <h3 className="text-lg font-medium">{result.query}</h3>
                {expandedResults.includes(index) ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </div>
              
              {expandedResults.includes(index) && (
                <div className="p-4 border-t border-gray-700">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Answer</h4>
                    <p className="text-gray-200 whitespace-pre-wrap">{result.answer}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Follow-up Questions</h4>
                    <ul className="list-disc list-inside space-y-2">
                      {result.followUpQuestions.map((question, qIndex) => (
                        <li
                          key={qIndex}
                          className="text-gray-200 cursor-pointer hover:text-blue-400"
                          onClick={() => setConfig({ ...config, query: question })}
                        >
                          {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;