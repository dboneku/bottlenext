import { useState, useRef, useEffect } from 'react';
import { evaluateAnswer } from '../../lib/openai';

const formatText = (text) =>
  text.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={i} style={{ display: 'block', marginBottom: i < arr.length - 1 ? '4px' : 0 }}>
        {parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} style={{ color: '#F5D78C', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
            : p
        )}
      </span>
    );
  });


export function GuidedChat({ module, onComplete }) {
  const { questions, completionMessage, color } = module;
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: 'bot',
      text: `Welcome to the **${module.title}**.\n\n${questions[0].prompt}`,
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || done || isEvaluating) return;
    const userText = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    
    // Evaluate the answer using OpenAI
    setIsEvaluating(true);
    const currentQ = questions[currentStep];
    const aiResult = await evaluateAnswer(module.title, currentQ.prompt, userText);
    setIsEvaluating(false);

    if (!aiResult.accepted) {
      // The AI rejected the answer, ask the follow-up question
      setMessages(prev => [...prev, { role: 'bot', text: aiResult.feedback }]);
      return; 
    }

    // Answer accepted! Save it.
    const newAnswers = { ...answers, [currentQ.id]: userText };
    setAnswers(newAnswers);

    // If the AI provided some encouraging feedback, show it.
    if (aiResult.feedback) {
      setMessages(prev => [...prev, { role: 'bot', text: aiResult.feedback }]);
    }

    // Move to the next step
    setTimeout(() => {
      const nextStep = currentStep + 1;
      if (nextStep < questions.length) {
        setMessages(prev => [...prev, { role: 'bot', text: questions[nextStep].prompt }]);
        setCurrentStep(nextStep);
      } else {
        setDone(true);
        setMessages(prev => [...prev, { role: 'bot', text: completionMessage }]);
        setTimeout(() => onComplete(newAnswers), 1800);
      }
    }, aiResult.feedback ? 1500 : 400); // Give them a beat to read feedback before the next question hits
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progress = Math.round((currentStep / questions.length) * 100);

  return (
    <div className="chat-panel" style={{ height: '72vh', minHeight: 520 }}>
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="chat-avatar" style={{ background: `linear-gradient(135deg, ${color} 0%, var(--accent-dim) 100%)` }}>
            {module.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
              {module.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{module.subtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="online-dot"></div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Online</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            {done ? 'Complete' : `${currentStep} / ${questions.length}`}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border)', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${progress}%`,
          background: `linear-gradient(90deg, var(--ruby), ${color})`,
          transition: 'width 0.5s ease',
          boxShadow: `0 0 10px ${color}88`,
        }} />
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'msg-user' : 'msg-bot'}>
            {formatText(msg.text)}
          </div>
        ))}
        {isEvaluating && (
          <div className="msg-bot" style={{ opacity: 0.7, padding: '12px 16px' }}>
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center', height: '1.2em' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', animation: 'pulse-dot 1.4s ease-in-out infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', animation: 'pulse-dot 1.4s ease-in-out 0.2s infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--muted)', animation: 'pulse-dot 1.4s ease-in-out 0.4s infinite' }} />
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder={done ? 'Session complete…' : 'Type your answer here…'}
            value={inputValue}
            disabled={done}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
          />
          <button className="send-btn" onClick={handleSend} disabled={!inputValue.trim() || done}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
            </svg>
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 10 }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
