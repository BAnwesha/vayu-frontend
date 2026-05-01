"use client";

import { useRef, useEffect, useState } from "react";

interface OracleProps {
  weatherData: any;
  activeCity: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AtmosphericOracle({ weatherData, activeCity }: OracleProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          weatherData,
          city: activeCity,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const text = await response.text();
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Signal lost. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[500px]">

      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-sm uppercase text-blue-100 tracking-widest">Vayu Oracle</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">{activeCity}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg bg-slate-800/80 text-slate-200 border border-white/5 rounded-bl-none">
              Atmospheric data locked for {activeCity || "your location"}. Ask me how the current conditions will impact your day, health, or travel.
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
              msg.role === "user"
                ? "bg-blue-600/80 text-white rounded-br-none"
                : "bg-slate-800/80 text-slate-200 border border-white/5 rounded-bl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 p-4 rounded-2xl rounded-bl-none border border-white/5">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        className="p-4 border-t border-white/10 bg-black/20 flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about your run, flights, allergies..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm outline-none focus:border-blue-500/50 transition-colors text-white placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>

    </div>
  );
}