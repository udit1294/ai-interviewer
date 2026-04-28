/**
 * ChatInterview Component
 * Manages the interview conversation flow
 */

'use client';
import { logger } from "@/lib/logger";

import React, { useState, useEffect, useRef } from 'react';
import { ParsedResume, ConversationMessage, ApiResponse, InterviewEvaluation } from '@/types/interview';
import Loader from './Loader';
import { saveLocalAudio } from '@/lib/storage';

interface ChatInterviewProps {
  resumeData: ParsedResume;
  targetRole: string;
  jobDescription?: string;
  onInterviewComplete: (evaluation: InterviewEvaluation) => void;
}

const ChatInterview: React.FC<ChatInterviewProps> = ({
  resumeData,
  targetRole,
  jobDescription,
  onInterviewComplete,
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [error, setError] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [answeredLastQuestion, setAnsweredLastQuestion] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Wait for user to explicitly initiate
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartInterviewFlow = () => {
    setHasStarted(true);
    setIsInitializing(true);
    
    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    startCamera();
    initializeSpeech();
    initializeInterview();
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format elapsed time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `Started: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Suppress start errors identically safely
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (e) {
        // Suppress stop errors identically safely
      }
    }
  };

  const initializeSpeech = () => {
    // Initialize speech recognition securely
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.language = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setUserInput((prev) => prev + transcript + ' ');
          } else {
            interimText += transcript;
          }
        }
        setInterimTranscript(interimText);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          console.warn(`Speech recognition error: ${event.error}`);
        }
      };

      startListening();
    }
  };

  const speakText = async (text: string) => {
    stopListening();
    setIsSpeaking(true);

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setIsSpeaking(false);
        if (!answeredLastQuestion && !isEvaluating) startListening();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        if (!answeredLastQuestion && !isEvaluating) startListening();
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      logger.error('Browser TTS error', e);
      setIsSpeaking(false);
      if (!answeredLastQuestion && !isEvaluating) startListening();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraActive(true);

      const combinedRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      audioChunksRef.current = [];

      combinedRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = combinedRecorder;
      combinedRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Unable to access camera/microphone. Please check permissions.');
      logger.error('Camera error:', err);
    }
  };

  const stopCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }

      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }

      setCameraActive(false);
    } catch (err) {
      logger.error('Error stopping camera:', err);
    }
  };

  const convertWebMToMP3 = async (): Promise<string> => {
    if (audioChunksRef.current.length === 0) return '';

    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);

    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  };

  const exitInterview = async () => {
    const confirm = window.confirm('Are you sure you want to exit? Your partial recording will be saved to your dashboard.');
    if (confirm) {
      setIsLoading(true);
      await stopCamera();

      // Upload partial video seamlessly
      if (audioChunksRef.current && audioChunksRef.current.length > 0) {
        const formData = new FormData();
        const currentParams = new URLSearchParams(window.location.search);
        const resolvedSessionId = currentParams.get('sessionId') || sessionStorage.getItem('sessionId') || '';

        if (resolvedSessionId) {
          const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
          formData.append('file', blob, 'partial_recording.webm');
          formData.append('sessionId', resolvedSessionId);
          formData.append('duration', String(elapsedTime));

          await fetch('/api/recordings', { method: 'POST', body: formData })
            .catch(e => logger.error("Audio block failed to upload on exit", e));
        }
      }

      window.location.href = '/dashboard';
    }
  };

  const initializeInterview = async () => {
    try {
      setIsInitializing(true);
      setError('');

      // Determine max questions based on experience level
      const yearsExp = resumeData.yearsOfExperience || 0;
      let questionsToAsk = 4; // Default: mid-level
      if (yearsExp < 2) {
        questionsToAsk = 3; // Entry-level
      } else if (yearsExp >= 2 && yearsExp < 5) {
        questionsToAsk = 4; // Mid-level
      } else {
        questionsToAsk = 5; // Senior
      }
      setMaxQuestions(questionsToAsk);

      // Get initial greeting/question from AI
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          targetRole,
          jobDescription,
          conversationHistory: [],
          isFirstQuestion: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initialize interview');
      }

      // Read the streaming response from Groq
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable stream available');

      let fullText = '';
      const initialMessage: ConversationMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages([initialMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages([{ ...initialMessage, content: fullText }]);
      }

      setQuestionCount(1);

      // Speak the completed question
      speakText(fullText);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize interview';
      setError(errorMessage);
      logger.error('Initialization error:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !maxQuestions || questionCount > maxQuestions) return;

    try {
      setIsLoading(true);
      setError('');

      // Add user message
      const newUserMessage: ConversationMessage = {
        role: 'user',
        content: userInput,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, newUserMessage];
      setMessages(updatedMessages);
      setUserInput('');

      // Check if we've reached the question limit
      if (questionCount >= maxQuestions) {
        // Mark that we've answered the last question
        setAnsweredLastQuestion(true);
        // Interview completed, evaluate responses
        await evaluateInterview(updatedMessages);
        return;
      }

      // Get next question from AI
      const questionResponse = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          targetRole,
          jobDescription,
          conversationHistory: updatedMessages,
          isFirstQuestion: false,
        }),
      });

      if (!questionResponse.ok) {
        throw new Error('Failed to generate next question from Stream');
      }

      let streamingText = '';
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages([...updatedMessages, assistantMessage]);

      // Natively bypass Vercel Blocks gracefully organically magically reading chunks!
      const reader = questionResponse.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader stream natively identified");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamingText += decoder.decode(value, { stream: true });
        
        // Push raw tokens straight directly dynamically explicitly to UI seamlessly
        setMessages((curr) => {
           const next = [...curr];
           next[next.length - 1] = { ...assistantMessage, content: streamingText };
           return next;
        });
      }

      setQuestionCount(questionCount + 1);

      // Now speak perfectly normally organically natively
      speakText(streamingText);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      logger.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateInterview = async (conversationMessages: ConversationMessage[]) => {
    try {
      setIsLoading(true);
      setIsEvaluating(true);

      // Stop camera when interview completes
      await stopCamera();

      // Fallback safely to extract sessionId from query if available, or sessionCache
      const currentParams = new URLSearchParams(window.location.search);
      const resolvedSessionId = currentParams.get('sessionId') || sessionStorage.getItem('sessionId') || '';

      // Async Dispatch!
      await fetch('/api/trigger-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: resolvedSessionId,
          resumeData,
          targetRole,
          conversationHistory: conversationMessages,
        }),
      }).catch(console.error);

      // Offload File Upload cleanly natively without Proxying Memory limits organically
      if (audioChunksRef.current && audioChunksRef.current.length > 0) {
        const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
        
        try {
          const res = await fetch('/api/recordings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: resolvedSessionId,
              duration: String(elapsedTime),
              fileSize: blob.size,
              fileType: blob.type || 'video/webm'
            })
          });
          
          if (res.ok) {
            const { uploadUrl } = await res.json();
            
            // Bypass Vercel explicitly natively by firing PUT organically
            await fetch(uploadUrl, {
              method: 'PUT',
              body: blob,
              headers: { 'Content-Type': blob.type || 'video/webm' }
            });
          }
        } catch (e) {
          logger.error("Direct-to-cloud token transfer failed", e);
        }
      }

      // Seamlessly kick client onto Dashboard exactly like specified, no downloading loops
      window.location.href = '/dashboard';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to evaluate interview';
      setError(errorMessage);
      setIsEvaluating(false);
      logger.error('Evaluation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasStarted) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hardware Setup</h2>
          <p className="text-gray-600 mb-6 text-sm">
            We need access to your camera and microphone to conduct the interview organically. This allows us to securely record your session and provide detailed behavioral feedback.
          </p>
          <button 
            onClick={handleStartInterviewFlow} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg w-full transition shadow-md"
          >
            Grant Access & Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return <Loader message="Starting your interview..." />;
  }

  return (
    <div className="w-full h-screen flex bg-white">
      {/* Main Chat Area - Left Side */}
      <div className="flex-1 flex flex-col rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">Interview: {targetRole}</h2>
              <p className="text-blue-100">
                {formatTime(elapsedTime)}
              </p>
            </div>
            {/* Exit Button */}
            <button
              onClick={exitInterview}
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
              title="Exit interview"
            >
              ❌ Exit
            </button>
          </div>
          <div className="mt-2 w-full bg-blue-400 rounded-full h-2">
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: maxQuestions ? `${(questionCount / maxQuestions) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-lg px-4 py-3 rounded-lg ${message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
          ))}

          {/* Show interim transcript while listening */}
          {isListening && interimTranscript && (
            <div className="flex justify-end">
              <div className="max-w-lg px-4 py-3 rounded-lg bg-blue-500 text-white rounded-br-none italic opacity-75">
                <p className="text-sm">{interimTranscript}</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Input Area */}
        {maxQuestions && questionCount <= maxQuestions && (
          <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isListening ? "🎤 Listening... Type or speak" : "Type your response..."}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />

              {/* Mic Toggle Button Native */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading || isSpeaking}
                className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition min-w-[140px] flex items-center justify-center`}
                title="Toggle Microphone"
              >
                {isListening ? '🛑 Stop Mic' : '🎤 Start Mic'}
              </button>

              {/* Speaker Button */}
              <button
                type="button"
                onClick={() => {
                  const lastAssistantMessage = [...messages]
                    .reverse()
                    .find((m) => m.role === 'assistant');
                  if (lastAssistantMessage) speakText(lastAssistantMessage.content);
                }}
                disabled={isLoading || isSpeaking}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition min-w-[140px] flex items-center justify-center"
                title="Repeat question"
              >
                <span>🔊 {isSpeaking ? 'Speaking' : 'Speak'}</span>
              </button>

              <button
                type="submit"
                disabled={!userInput.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Send
              </button>
            </div>
          </form>
        )}

        {/* Interview Complete Message */}
        {answeredLastQuestion && isEvaluating && (
          <div className="p-6 bg-green-50 border-t border-green-200">
            <div className="text-center">
              <p className="text-green-800 font-semibold mb-3">
                ✓ Interview completed! Evaluating your responses...
              </p>
              {isLoading && (
                <div className="flex justify-center items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm text-green-700 ml-2">This may take 10-15 seconds...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Camera Feed - Right Side (Always physically mounted to protect refs) */}
      <div className={`w-80 bg-black border-l border-gray-300 flex flex-col items-center justify-start p-4 sticky top-0 right-0 ${!cameraActive && 'hidden'}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg w-full h-80 object-cover border-4 border-green-500"
        />
        <div className="mt-4 text-white w-full text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold">Recording</span>
          </div>
          <p className="text-xs text-gray-300">Camera Active</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterview;
