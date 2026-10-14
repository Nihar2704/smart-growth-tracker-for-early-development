import React, { useState, useEffect, useRef } from 'react';
import { askMilestoneAssistant } from '../services/api';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export default function MilestoneChatbot({
  child,
  activeAssessment,
  activeDomain,
  activeQuestion,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  initialQuery = null,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledOnToggle !== undefined ? controlledOnToggle : setInternalIsOpen;

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelBadge, setModelBadge] = useState('Gemini AI');
  const [suggestedChips, setSuggestedChips] = useState([]);
  const messagesEndRef = useRef(null);

  // Calculate approximate child age in months
  const childAgeMonths = child?.date_of_birth
    ? Math.max(0, Math.floor((new Date() - new Date(child.date_of_birth)) / (1000 * 60 * 60 * 24 * 30.4375)))
    : 12;

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const childName = child?.name || 'your child';
      const welcomeText = `**Hello! I am GrowSense AI**, your CDC-aligned pediatric developmental companion. 

I can help explain **${childName}'s** (${childAgeMonths} months) developmental milestones, suggest play-based at-home exercises, and guide you on what to expect.

*How can I assist you today?*`;

      setMessages([
        {
          role: 'assistant',
          content: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [child?.name, childAgeMonths]);

  // Update suggestion chips when context changes
  useEffect(() => {
    const chips = [];
    if (activeQuestion) {
      chips.push(`Explain: "${activeQuestion.slice(0, 32)}..."`);
    }
    if (activeDomain) {
      chips.push(`Tips for ${activeDomain.replace('_', ' ')}`);
    }
    chips.push(`Key milestones at ${childAgeMonths}m`);
    chips.push('When should I consult a pediatrician?');
    chips.push('Suggest fun learning games today');
    setSuggestedChips(chips);
  }, [activeQuestion, activeDomain, childAgeMonths]);

  // Handle auto-query triggered from external button (e.g. from questionnaire)
  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const contextPayload = {
        child_name: child?.name,
        age_months: childAgeMonths,
        gender: child?.gender,
        current_domain: activeDomain || (activeAssessment ? 'Assessment Summary' : null),
        current_question: activeQuestion || null,
        latest_scores: activeAssessment
          ? {
              gross_motor: activeAssessment.gross_motor_score,
              fine_motor: activeAssessment.fine_motor_score,
              language: activeAssessment.language_score,
              cognitive: activeAssessment.cognitive_score,
              social: activeAssessment.social_emotional_score,
            }
          : null,
        status: activeAssessment?.status || null,
      };

      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await askMilestoneAssistant({
        message: query,
        childId: child?.id || null,
        context: contextPayload,
        history: historyPayload,
      });

      if (res?.model) {
        setModelBadge(res.model.includes('gemini') ? 'Gemini 2.5 Flash' : 'CDC Expert Engine');
      }

      const botMsg = {
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (res.suggestions && res.suggestions.length > 0) {
        setSuggestedChips(res.suggestions);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      const errMsg = {
        role: 'assistant',
        content:
          '**Temporary Connection Notice**: Unable to reach cloud AI right now. Please verify your connection or consult our milestone checklist for standard recommendations.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    const childName = child?.name || 'your child';
    setMessages([
      {
        role: 'assistant',
        content: `Chat session refreshed. What would you like to explore regarding **${childName}** (${childAgeMonths}m)?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Helper to format basic markdown (bold, lists)
  const renderFormattedContent = (content) => {
    return content.split('\n').map((line, idx) => {
      // Bold rendering
      let parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-teal-800">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-[var(--primary)] mt-0.5 shrink-0 font-bold">•</span>
            <span className="text-slate-700 leading-relaxed">{formattedParts}</span>
          </div>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="text-slate-800 leading-relaxed my-0.5">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Toggle Button (raised to bottom-20 on mobile to not block bottom nav) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2.5 btn-primary text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 cursor-pointer group active:scale-95"
          aria-label="Open Pediatric AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full"></span>
          </div>
          <span className="text-xs font-semibold tracking-wide">Ask Pediatric AI</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 left-3 sm:left-auto sm:bottom-6 sm:right-6 z-50 w-auto sm:w-[420px] max-h-[75vh] sm:max-h-[85vh] h-[550px] flex flex-col bg-white border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 font-sans">
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900 tracking-wide">GrowSense Pediatric AI</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                    {modelBadge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  CDC & WHO Milestone Screening Guidance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Child & Domain Context Bar */}
          <div className="bg-slate-50 px-4 py-2 border-b border-[var(--border-color)] flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-800 truncate">
                {child?.name || 'General Profile'} ({childAgeMonths}m)
              </span>
              {activeDomain && (
                <span className="text-slate-500 truncate">
                  • {activeDomain.replace('_', ' ')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-mono shrink-0">Live Context</span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#FAFAF8]">
            {messages.map((m, index) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[var(--primary)] shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                      isUser
                        ? 'bg-[var(--primary)] text-white rounded-br-xs font-medium'
                        : 'bg-white text-slate-800 border border-[var(--border-color)] rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      renderFormattedContent(m.content)
                    )}
                    <div
                      className={`text-[9px] mt-1 font-mono flex items-center ${
                        isUser ? 'text-teal-100 justify-end' : 'text-slate-400 justify-start'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-[var(--primary)] shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-2.5 justify-start items-center text-slate-500">
                <div className="w-6 h-6 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[var(--primary)] shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-[var(--border-color)] rounded-2xl px-3.5 py-2 text-xs flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-500 ml-1">Analyzing CDC guidelines...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Question Chips */}
          {suggestedChips.length > 0 && !loading && (
            <div className="px-3 py-2 bg-slate-50 border-t border-[var(--border-color)] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
              {suggestedChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 text-[11px] rounded-full border border-[var(--border-color)] hover:border-teal-300 transition shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span className="truncate max-w-[200px]">{chip}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[var(--border-color)] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask about ${child?.name || 'milestones'}, scores, activities...`}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-2 btn-primary rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Medical Disclaimer Banner */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-[var(--border-color)] text-center">
            <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Educational guidance only. Not a medical diagnosis.</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
