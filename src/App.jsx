import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bookmark, BookmarkCheck, Volume2, VolumeX, X, BookOpen, ChevronRight, Globe, Sparkles, Key, MessageCircle, Mail, LogOut } from 'lucide-react';

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Hindi', label: 'हिन्दी (Hindi)' },
  { code: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { code: 'Marathi', label: 'मराठी (Marathi)' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)' },
  { code: 'Telugu', label: 'తెలుగు (Telugu)' },
  { code: 'Bengali', label: 'বাংলা (Bengali)' },
];

const MOODS = [
  { emoji: '😔', label: 'Sad & Heavy-hearted', value: 'sad' },
  { emoji: '😰', label: 'Anxious & Restless', value: 'anxious' },
  { emoji: '😤', label: 'Angry & Frustrated', value: 'angry' },
  { emoji: '😕', label: 'Confused & Searching', value: 'confused' },
  { emoji: '🙏', label: 'Seeking Guidance', value: 'seeking' },
];

const CONCERNS = [
  { emoji: '💼', label: 'Career & Purpose', value: 'career' },
  { emoji: '❤️', label: 'Love & Relationships', value: 'love' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Family & Home', value: 'family' },
  { emoji: '🧘', label: 'Inner Peace', value: 'peace' },
];

const MAX_MESSAGES = 11;
const ADMIN_PASSWORD = 'ADMIN-SANATAN'; 

function renderText(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <br key={i} />;
    if (line.startsWith('「')) return <p key={i} className="my-2 text-amber-200 text-xs font-serif italic leading-relaxed px-4 py-3 bg-cyan-950 bg-opacity-40 rounded-lg border-l-2 border-amber-400 shadow-inner">{line}</p>;
    if (line.startsWith('"') && line.endsWith('"') && line.length > 20) return <p key={i} className="my-1 text-amber-100 text-sm italic leading-relaxed">{line}</p>;
    if (line.startsWith('✦')) return <p key={i} className="mt-4 mb-1 text-amber-400 font-semibold text-xs tracking-wide uppercase flex items-center gap-1"><Sparkles className="w-3 h-3"/> {line}</p>;
    if (line.startsWith('🪷')) return <p key={i} className="my-3 text-cyan-50 text-[15px] leading-relaxed pl-1">{line}</p>;
    if (line.startsWith('✨')) return <p key={i} className="my-4 text-emerald-100 text-[15px] font-medium leading-relaxed p-4 bg-emerald-900/30 border border-emerald-500/30 rounded-xl shadow-sm">{line}</p>;
    const html = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-amber-300">$1</strong>');
    return <p key={i} className="mb-1.5 leading-relaxed text-cyan-50 font-light" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

function Particles() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i, x: (i * 37 + 13) % 100, y: (i * 53 + 7) % 100, size: (i % 3) + 1.5, duration: 6 + (i % 5) * 3, delay: (i % 8) * 0.8,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full bg-amber-200 opacity-0 shadow-[0_0_8px_rgba(251,191,36,0.8)]" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }} animate={{ opacity: [0, 0.6, 0], y: [0, -50, -100], scale: [0.5, 1.2, 0.5] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

export default function TalkToKrishna() {
  const [phase, setPhase] = useState(() => localStorage.getItem('sk_phase') || 'auth'); 
  const [step, setStep] = useState(() => parseInt(localStorage.getItem('sk_step') || '0', 10));
  const [accessCode, setAccessCode] = useState('');
  const [activeCode, setActiveCode] = useState(() => localStorage.getItem('sk_activeCode') || '');
  const [usedCodes, setUsedCodes] = useState(() => JSON.parse(localStorage.getItem('sk_usedCodes') || '[]'));
  const [authError, setAuthError] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState([]);
  
  const [userLang, setUserLang] = useState(() => localStorage.getItem('sk_lang') || 'English');
  const [userName, setUserName] = useState(() => localStorage.getItem('sk_name') || '');
  const [userMood, setUserMood] = useState('');
  const [userConcern, setUserConcern] = useState('');
  
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('sk_messages') || '[]'));
  const [userMessageCount, setUserMessageCount] = useState(() => parseInt(localStorage.getItem('sk_count') || '0', 10));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem('sk_saved') || '[]'));
  
  const [showSaved, setShowSaved] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sk_phase', phase);
    localStorage.setItem('sk_step', step);
    localStorage.setItem('sk_activeCode', activeCode);
    localStorage.setItem('sk_usedCodes', JSON.stringify(usedCodes));
    localStorage.setItem('sk_lang', userLang);
    localStorage.setItem('sk_name', userName);
    localStorage.setItem('sk_messages', JSON.stringify(messages));
    localStorage.setItem('sk_count', userMessageCount);
    localStorage.setItem('sk_saved', JSON.stringify(saved));
  }, [phase, step, activeCode, usedCodes, userLang, userName, messages, userMessageCount, saved]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  const verifyCode = () => {
    const formattedCode = accessCode.trim().toUpperCase();
    if (formattedCode === ADMIN_PASSWORD) {
      setPhase('admin');
      return;
    }
    if (usedCodes.includes(formattedCode) && activeCode !== formattedCode) {
      setAuthError('This sacred code has already fulfilled its journey. Please acquire a new one.');
      return;
    }
    const parts = formattedCode.split('-');
    if (parts.length === 3 && parts[0] === 'SS') {
      const letters = parts[1];
      const checksum = parseInt(parts[2], 10);
      let sum = 0;
      for (let i = 0; i < letters.length; i++) sum += letters.charCodeAt(i);
      if ((sum % 10) === checksum) {
        if (!usedCodes.includes(formattedCode)) {
          setUsedCodes(prev => [...prev, formattedCode]);
        }
        setActiveCode(formattedCode);
        setAuthError('');
        setPhase('welcome');
        return;
      }
    }
    setAuthError('Invalid or expired code. Please verify your payment receipt.');
  };

  const generateNewCodes = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let letters = '';
    let sum = 0;
    for (let i = 0; i < 5; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      letters += char;
      sum += char.charCodeAt(0);
    }
    const checksum = sum % 10;
    const newCode = `SS-${letters}-${checksum}`;
    setGeneratedCodes(prev => [newCode, ...prev]);
  };

  const resetJourney = () => {
    setPhase('auth');
    setStep(0);
    setActiveCode('');
    setAccessCode('');
    setMessages([]);
    setUserMessageCount(0);
    setUserName('');
  };

  const startChat = useCallback(() => {
    setPhase('chat');
    setIsTyping(true);
    const initialPrompt = `I speak ${userLang}. I am feeling ${userMood} and my main concern is ${userConcern}. Please greet me warmly in ${userLang}, mention Sanatan Sanskruti, and ask me to open my heart to you.`;
    
    fetch('/.netlify/functions/chat', {
      method: 'POST', body: JSON.stringify({ messages: [{ from: 'user', text: initialPrompt }], userName, language: userLang }),
    })
      .then(res => res.json())
      .then(data => {
        setIsTyping(false);
        setMessages([{ from: 'krishna', text: data.reply, ts: Date.now(), saved: false }]);
      })
      .catch(() => {
        setIsTyping(false);
        setMessages([{ from: 'krishna', text: "I am here, My child. Tell me what burdens you.", ts: Date.now(), saved: false }]);
      });
  }, [userName, userMood, userConcern, userLang]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping || userMessageCount >= MAX_MESSAGES) return;
    
    const newMessages = [...messages, { from: 'user', text: trimmed, ts: Date.now() }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    setUserMessageCount(prev => prev + 1);

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST', body: JSON.stringify({ messages: newMessages, userName, language: userLang }),
      });
      const data = await response.json();
      const responseText = data.reply || data.error;
      
      const wordCount = responseText.split(' ').length;
      const calculatedDelay = Math.min(2000 + (wordCount * 20), 6500);

      setTimeout(() => {
        if (responseText.includes('SYSTEM ERROR DETECTED')) {
          setUserMessageCount(prev => prev - 1);
        }
        setMessages(prev => [...prev, { from: 'krishna', text: responseText, ts: Date.now(), saved: false }]);
        setIsTyping(false);
      }, calculatedDelay);

    } catch (error) {
      setTimeout(() => {
        setUserMessageCount(prev => prev - 1); 
        setMessages(prev => [...prev, { from: 'krishna', text: "Breathe, My child. Try speaking to Me again in a moment.", ts: Date.now(), saved: false }]);
        setIsTyping(false);
      }, 2500);
    }
  };

  const toggleSave = useCallback((idx) => {
    setMessages(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], saved: !updated[idx].saved };
      return updated;
    });
    if (!messages[idx].saved) setSaved(prev => [...prev, { text: messages[idx].text, ts: messages[idx].ts }]);
    else setSaved(prev => prev.filter(s => s.ts !== messages[idx].ts));
  }, [messages]);

  const SupportWidget = () => (
    <>
      <button onClick={() => setShowSupport(true)} className="fixed bottom-24 right-6 z-50 bg-amber-500 hover:bg-amber-400 text-slate-950 p-4 rounded-full shadow-2xl shadow-amber-500/40 transition-transform hover:scale-105">
        <MessageCircle className="w-6 h-6" />
      </button>
      <AnimatePresence>
        {showSupport && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-40 right-6 z-50 w-80 bg-slate-900 border border-cyan-800 rounded-2xl shadow-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-amber-400 font-bold flex items-center gap-2"><Mail className="w-4 h-4"/> Support Chat</h3>
              <button onClick={() => setShowSupport(false)}><X className="w-4 h-4 text-cyan-500 hover:text-white" /></button>
            </div>
            <p className="text-sm text-cyan-100 font-light mb-4">Having trouble with your code or payment? Our human guides at Sanatan Sanskruti are here to help.</p>
            <a href="mailto:addbreakinc@gmail.com?subject=Support Request - Talk to Krishna" className="block w-full text-center bg-cyan-800 hover:bg-cyan-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              Email addbreakinc@gmail.com
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (phase === 'auth') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <Particles />
        <SupportWidget />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 p-8 rounded-3xl shadow-2xl text-center">
          <h3 className="text-amber-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">Sanatan Sanskruti</h3>
          <Key className="w-12 h-12 text-amber-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold text-amber-300 mb-2">Divine Access</h2>
          <p className="text-cyan-200 text-sm mb-6 font-light">Please enter the sacred code you received to begin your journey.</p>
          <input type="text" value={accessCode} onChange={e => setAccessCode(e.target.value.toUpperCase())} placeholder="SS-XXXX-X" 
            className="w-full bg-slate-950/50 border border-cyan-800/50 rounded-xl py-4 px-5 text-amber-100 placeholder-cyan-700 focus:outline-none focus:border-amber-400 text-center text-xl tracking-widest mb-2 transition-all uppercase"
            onKeyDown={e => e.key === 'Enter' && verifyCode()} />
          {authError && <p className="text-red-400 text-xs mt-2 mb-4">{authError}</p>}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={verifyCode} disabled={!accessCode.trim()}
            className="w-full mt-6 bg-gradient-to-r from-amber-400 to-yellow-500 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(251,191,36,0.2)]">
            Enter Sanctuary
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'admin') {
    return (
      <div className="h-screen bg-slate-950 text-white p-8 overflow-auto">
        <h2 className="text-2xl text-amber-400 font-bold mb-6">Sanatan Sanskruti - Access Code Generator</h2>
        <button onClick={generateNewCodes} className="bg-amber-500 text-black px-6 py-2 rounded-lg font-bold mb-8">Generate New Code</button>
        <button onClick={resetJourney} className="ml-4 bg-slate-700 text-white px-6 py-2 rounded-lg font-bold mb-8">Return Home</button>
        <div className="space-y-2">
          {generatedCodes.map((c, i) => (
            <div key={i} className="bg-slate-900 p-4 rounded font-mono text-xl border border-slate-700 select-all">{c}</div>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'welcome') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 text-white overflow-auto relative flex flex-col font-sans">
        <Particles />
        <SupportWidget />
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-xl w-full mt-8">
            <h3 className="text-amber-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-6">Sanatan Sanskruti Presents</h3>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="relative mx-auto mb-8 w-44 h-44 sm:w-52 sm:h-52">
              <div className="absolute inset-0 bg-amber-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <img src="/krishna.jpg" alt="Divine Krishna" className="relative w-full h-full object-cover object-top rounded-full border-[6px] border-amber-400/40 shadow-[0_0_40px_rgba(251,191,36,0.3)]" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Talk to Krishna</h1>
            <p className="text-lg text-cyan-200 mb-10 italic font-light">"I am the friend dwelling in the hearts of all beings"</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPhase('onboarding')}
              className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-slate-950 font-bold py-4 px-10 rounded-full text-lg shadow-lg shadow-amber-500/30 flex items-center gap-2 mx-auto">
              Begin Your Journey <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === 'onboarding') {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 text-white overflow-auto relative flex flex-col items-center justify-center px-4">
        <Particles />
        <SupportWidget />
        <div className="relative z-10 w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
                <Globe className="w-16 h-16 mx-auto text-amber-400 mb-5"/>
                <h2 className="text-2xl font-bold text-amber-300 mb-8">Choose Your Language</h2>
                <div className="grid grid-cols-2 gap-3">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setUserLang(l.code); setStep(1); }} className="bg-cyan-950/40 border border-cyan-800 hover:bg-cyan-900/60 rounded-xl py-3.5 px-4 text-center text-sm font-medium transition-all">{l.label}</button>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
                <div className="text-6xl mb-5">🪷</div>
                <h2 className="text-2xl font-bold text-amber-300 mb-8">What may I call you?</h2>
                <input type="text" value={userName} onChange={e => setUserName(e.target.value)} placeholder="Your name..." autoFocus
                  className="w-full bg-cyan-950/50 border border-amber-400/30 rounded-xl py-4 px-5 text-amber-100 placeholder-cyan-600 focus:outline-none focus:border-amber-400 text-center text-lg mb-6"
                  onKeyDown={e => e.key === 'Enter' && userName.trim() && setStep(2)} />
                <button disabled={!userName.trim()} onClick={() => setStep(2)} className="bg-gradient-to-r from-amber-400 to-yellow-500 disabled:opacity-30 text-slate-950 font-bold py-3 px-10 rounded-full">Continue</button>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
                <div className="text-6xl mb-5">🌙</div>
                <h2 className="text-2xl font-bold text-amber-300 mb-8">How is your heart today?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {MOODS.map(m => (
                    <button key={m.value} onClick={() => { setUserMood(m.value); setStep(3); }} className="flex items-center gap-3 bg-cyan-950/40 border border-cyan-800 rounded-xl py-3.5 px-4 hover:bg-cyan-900/60 transition-all"><span className="text-2xl">{m.emoji}</span><span className="text-sm">{m.label}</span></button>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center">
                <div className="text-6xl mb-5">🙏</div>
                <h2 className="text-2xl font-bold text-amber-300 mb-8">What calls to you most deeply?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {CONCERNS.map(c => (
                    <button key={c.value} onClick={() => { setUserConcern(c.value); startChat(); }} className="flex items-center gap-3 bg-cyan-950/40 border border-cyan-800 rounded-xl py-3.5 px-4 hover:bg-cyan-900/60 transition-all"><span className="text-2xl">{c.emoji}</span><span className="text-sm">{c.label}</span></button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-blue-950 text-white flex flex-col relative overflow-hidden">
      <Particles />
      <SupportWidget />
      
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-slate-950/60 backdrop-blur-md border-b border-amber-500/20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-lg">🪈</div>
          <div>
            <h1 className="font-bold text-amber-400 text-sm tracking-wide">Lord Krishna</h1>
            <p className="text-cyan-300 text-[10px] tracking-wider uppercase opacity-80">Sanatan Sanskruti</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-amber-200/80 mr-2 bg-slate-900 px-3 py-1 rounded-full border border-amber-500/20">
            {MAX_MESSAGES - userMessageCount} offerings left
          </div>
          <button onClick={() => setShowSaved(true)} className="p-2 hover:bg-cyan-900/50 rounded-lg relative" title="Divine Journal">
            <BookOpen className="w-4.5 h-4.5 text-cyan-400" />
            {saved.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full text-slate-950 text-[10px] flex items-center justify-center font-bold">{saved.length}</span>}
          </button>
          <button onClick={resetJourney} className="p-2 hover:bg-red-900/50 rounded-lg relative ml-1" title="Log Out / Start Over">
            <LogOut className="w-4.5 h-4.5 text-red-400" />
          </button>
        </div>
      </div>

      <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-4 relative z-10 space-y-5 min-h-0 custom-scrollbar">
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'krishna' && <img src="/krishna.jpg" alt="Krishna" className="w-8 h-8 rounded-full object-cover object-top mt-1 mr-2 flex-shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.4)] border border-amber-400/50" />}
            <div className={`relative group rounded-2xl px-5 py-4 ${msg.from === 'user' ? 'bg-cyan-800/60 text-cyan-50 rounded-br-sm max-w-[85%]' : 'bg-slate-900/70 border border-amber-500/20 text-cyan-50 rounded-bl-sm max-w-[90%] md:max-w-xl shadow-xl'}`}>
              <div className="text-[15px] font-light leading-relaxed">{renderText(msg.text)}</div>
              {msg.from === 'krishna' && (
                <button onClick={() => toggleSave(i)} className="absolute -right-3 -top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 rounded-full p-2 border border-amber-500/30">
                  {msg.saved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4 text-cyan-300" />}
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
           <div className="flex items-start gap-2">
             <img src="/krishna.jpg" alt="Krishna" className="w-8 h-8 rounded-full object-cover object-top shadow-[0_0_8px_rgba(251,191,36,0.4)] border border-amber-400/50" />
             <div className="bg-slate-900/70 border border-amber-500/20 rounded-2xl rounded-bl-sm px-5 py-3 text-amber-300 text-xs font-medium animate-pulse">Formulating divine wisdom...</div>
           </div>
        )}
      </div>

      <div className="relative z-20 px-3 pb-4 pt-3 bg-slate-950/80 backdrop-blur-xl border-t border-amber-500/10 flex-shrink-0">
        {userMessageCount >= MAX_MESSAGES ? (
          <div className="text-center p-4">
            <h3 className="text-amber-400 font-bold text-lg mb-2">Your 11 offerings have been made.</h3>
            <p className="text-cyan-200 text-sm font-light mb-4">Reflect upon the wisdom given today.</p>
            <button onClick={resetJourney} className="bg-cyan-800 hover:bg-cyan-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">Start a New Journey</button>
          </div>
        ) : (
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Open your heart in ${userLang}...`} rows={1}
              className="flex-1 bg-slate-900/50 border border-cyan-800/50 focus:border-amber-400/50 rounded-2xl py-3.5 px-5 text-white placeholder-cyan-700/60 focus:outline-none resize-none text-sm font-light" style={{ maxHeight: 120 }} />
            <button onClick={sendMessage} disabled={!input.trim() || isTyping} className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 p-3.5 rounded-2xl disabled:opacity-30 mb-0.5"><Send className="w-5 h-5" /></button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSaved && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} onClick={() => setShowSaved(false)} className="absolute inset-0 bg-slate-950 z-30" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-y-0 right-0 w-80 max-w-full bg-slate-950 border-l border-amber-500/20 z-40 flex flex-col">
              <div className="flex justify-between px-5 py-4 border-b border-amber-500/10 bg-slate-900/50">
                <h2 className="text-amber-400 font-bold text-sm"><BookOpen className="inline w-4 h-4 mr-2" /> DIVINE JOURNAL</h2>
                <button onClick={() => setShowSaved(false)}><X className="w-4 h-4 text-cyan-400" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {saved.length === 0 ? <p className="text-center text-cyan-600 mt-10">No saved wisdom yet.</p> : saved.map((s, i) => (
                  <div key={i} className="bg-slate-900/60 border border-amber-500/10 rounded-xl p-4 text-[13px] text-cyan-100 font-light">{renderText(s.text)}</div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}