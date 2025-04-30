"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Trash2, 
  PlusCircle, 
  Info, 
  Loader2,
  RefreshCcw 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface JobSource {
  job_id: string;
  job_title: string;
  employer: string;
  relevance_score: number;
}

interface ChatResponse {
  response: string;
  sources: JobSource[];
  error: string | null;
}

export default function AiPreferences() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string>('');
  const [isLoadingJobType, setIsLoadingJobType] = useState(false);
  const [newJobType, setNewJobType] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [sources, setSources] = useState<JobSource[]>([]);
  const [showSources, setShowSources] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hi there! I\'m your AI career assistant. I can help you understand job descriptions, requirements, and give career advice. To get started, please load a job type using the "Load Job Data" button.',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Fetch available job types on component mount
  useEffect(() => {
    fetchJobTypes();
  }, []);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchJobTypes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/chatbot/job-types');
      const data = await response.json();
      setJobTypes(data.job_types || []);
      
      // Set default selected job type if available
      if (data.job_types && data.job_types.length > 0) {
        setSelectedJobType(data.job_types[0]);
      }
    } catch (error) {
      console.error('Error fetching job types:', error);
    }
  };

  const loadJobData = async () => {
    if (!newJobType) return;
    
    setIsLoadingJobType(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/chatbot/search-and-index-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_type: newJobType,
          location: newLocation,
          num_results: 10
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add system message indicating job data is being loaded
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I'm now loading and analyzing job data for "${newJobType}" roles. This might take a few minutes. Once complete, you can ask me questions about these jobs.`,
          timestamp: new Date()
        }]);
        
        // Close dialog and reset fields
        setShowLoadDialog(false);
        setNewJobType('');
        
        // Refresh job types after a delay
        setTimeout(() => {
          fetchJobTypes();
        }, 10000); // Check after 10 seconds
      } else {
        throw new Error(data.detail || 'Failed to load job data');
      }
    } catch (error) {
      console.error('Error loading job data:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error loading job data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoadingJobType(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedJobType) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentMessage,
          job_type: selectedJobType
        }),
      });
      
      const data: ChatResponse = await response.json();
      
      if (response.ok) {
        // Add assistant response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }]);
        
        // Store sources
        if (data.sources && data.sources.length > 0) {
          setSources(data.sources);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await fetch('http://localhost:8000/api/chatbot/reset-chat', {
        method: 'POST'
      });
      
      // Reset local state
      setMessages([
        {
          role: 'assistant',
          content: 'Chat history cleared. How can I help you today?',
          timestamp: new Date()
        }
      ]);
      setSources([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">AI Career Assistant</h2>
        <div className="flex items-center gap-2">
          <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Load Job Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Job Data</DialogTitle>
                <DialogDescription>
                  Enter a job type to search for and analyze. This will enhance the AI's knowledge about specific jobs.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="jobType" className="text-right">
                    Job Type:
                  </label>
                  <Input
                    id="jobType"
                    className="col-span-3"
                    placeholder="e.g., Software Engineer, Data Scientist"
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="location" className="text-right">
                    Location:
                  </label>
                  <Input
                    id="location"
                    className="col-span-3"
                    placeholder="e.g., Remote, New York, San Francisco"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowLoadDialog(false)} variant="outline">
                  Cancel
                </Button>
                <Button 
                  onClick={loadJobData} 
                  disabled={!newJobType || isLoadingJobType}
                >
                  {isLoadingJobType ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : 'Load Data'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {sources.length > 0 && (
            <Dialog open={showSources} onOpenChange={setShowSources}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Sources
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Information Sources</DialogTitle>
                  <DialogDescription>
                    The AI used information from these job listings to generate its response.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {sources.map((source, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="font-medium">{source.job_title}</div>
                      <div className="text-sm text-gray-500">{source.employer}</div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-xs">
                          Relevance: {(source.relevance_score * 100).toFixed(1)}%
                        </Badge>
                        <span className="text-xs text-gray-500">ID: {source.job_id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </div>

      {jobTypes.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Job Category:</label>
          <Tabs value={selectedJobType} onValueChange={setSelectedJobType} className="w-full">
            <TabsList className="w-full overflow-x-auto">
              {jobTypes.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="flex-1 overflow-auto mb-4 border rounded-md bg-gray-50 dark:bg-gray-800">
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3/4 p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center mb-1">
                    <Bot className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">AI Assistant</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.timestamp && (
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="mt-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask me about job requirements, skills, or career advice..."
            disabled={isLoading || !selectedJobType}
          />
          <Button type="submit" disabled={isLoading || !currentMessage.trim() || !selectedJobType}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        {!selectedJobType && jobTypes.length === 0 && (
          <p className="text-sm text-amber-600 mt-2">
            Please load job data first to start the conversation.
          </p>
        )}
      </div>
    </div>
  );
}
