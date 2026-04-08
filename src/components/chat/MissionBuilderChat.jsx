import { useState, useRef, useEffect } from 'react';

const QUESTIONS = [
  {
    id: 'purpose',
    label: 'Purpose',
    prompt: "Let's start your Mission Builder. **Why we exist.**\nWhat is the real reason you're here? What problem do you exist to solve?",
  },
  {
    id: 'promise',
    label: 'Promise / Work',
    prompt: "Great. Next — **What we do.**\nWhat is the practical outcome you deliver through your work?",
  },
  {
    id: 'people',
    label: 'People',
    prompt: "**Who we serve.**\nWho is the specific person or group you exist to help?",
  },
  {
    id: 'approach',
    label: 'Approach',
    prompt: "**How we do it.**\nHow do you behave while doing the work? What is your philosophy or standard?",
  },
  {
    id: 'impact',
    label: 'Impact',
    prompt: "Last one — **Our Impact.**\nWhat's different because you exist? What changes for people over time?",
  }
];

const formatText = (text) =>
  text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <span key={i} style={{ display: 'block', marginBottom: i < text.split('\n').length - 1 ? '4px' : 0 }}>
        {parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j} style={{ color: '#F5D78C', fontWeight: 700 }}>{p.slice(2,-2)}</strong>
            : p
        )}
      </span>
    );
  });

export function MissionBuilderChat({ onComplete }) {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: 'bot',
      text: `Welcome to the **Aligned Growth Mission Architect**. Let's build a clear, powerful mission statement together.\n\n${QUESTIONS[0].prompt}`
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || done) return;
    const userText = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    const currentQ = QUESTIONS[currentStep];
    const newAnswers = { ...answers, [currentQ.id]: userText };
    setAnswers(newAnswers);

    setTimeout(() => {
      const nextStep = currentStep + 1;
      if (nextStep < QUESTIONS.length) {
        setMessages(prev => [...prev, { role: 'bot', text: QUESTIONS[nextStep].prompt }]);
        setCurrentStep(nextStep);
      } else {
        setDone(true);
        setMessages(prev => [...prev, {
          role: 'bot',
          text: "Excellent work. I've captured the full picture of your mission.\n\nTo save this to your **Leadership Dashboard** and unlock your next steps, please create your free account below."
        }]);
        setTimeout(() => onComplete(newAnswers), 1600);
      }
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progress = ((currentStep) / QUESTIONS.length) * 100;

  return (
    <div className="chat-panel" style={{ height: '72vh', minHeight: 520 }}>
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="chat-avatar">AG</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#F5ECD7', letterSpacing: '-0.01em' }}>
              Mission Architect
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Aligned Growth Coaching</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="online-dot"></div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Online</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--border)', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--ruby), var(--accent))',
          transition: 'width 0.5s ease',
          boxShadow: '0 0 10px rgba(201,151,58,0.5)'
        }} />
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'msg-user' : 'msg-bot'}>
            {formatText(msg.text)}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrap">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            rows={1}
            placeholder={done ? 'Conversation complete…' : 'Type your answer here…'}
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
          Press Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
