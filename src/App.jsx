import { useState, useRef, useEffect } from "react";

const CATEGORIES = [
  { id: "fire", label: "Fire Tactics", icon: "🔥", color: "#FF4500" },
  { id: "hazmat", label: "Hazmat", icon: "☣️", color: "#FFD700" },
  { id: "rescue", label: "Technical Rescue", icon: "⛑️", color: "#00BFFF" },
  { id: "diving", label: "Public Safety Diving", icon: "🤿", color: "#1E90FF" },
  { id: "drone", label: "Drone Ops", icon: "🚁", color: "#7CFC00" },
  { id: "medical", label: "Medical / Diving Med", icon: "🩺", color: "#FF69B4" },
];

const QUICK_SCENARIOS = [
  "Structure fire with trapped victim on 3rd floor",
  "Chemical spill on highway — unknown substance",
  "Underwater vehicle recovery operation",
  "Wildfire approaching residential area",
  "Collapsed building with multiple casualties",
  "SCBA malfunction during interior attack",
];

const SYSTEM_PROMPT = `You are SPARKZ — an elite AI Fire & Rescue Tactics Advisor, developed in collaboration with Taufiq Sparkz, a Malaysian Fire Officer, Instructor, Public Safety Diver, Smokejumpers Jumpmaster, Hazmat Instructor, Technical Rescue Instructor, and Fire & Rescue Researcher at the Malaysia Fire and Rescue Academy.

Your role is to provide clear, actionable, evidence-based fire and rescue tactical guidance for:
- Firefighters and commanders
- Rescue instructors and trainees
- Hazmat teams
- Public safety divers
- Drone operators in emergency response
- General public seeking safety awareness

Always structure your response with:
1. 🔴 SITUATION ASSESSMENT — quick read of the scenario
2. 🟡 KEY RISKS — top hazards to watch
3. 🟢 TACTICAL ACTIONS — step-by-step priorities
4. 🔵 SPECIAL CONSIDERATIONS — equipment, communications, safety officers
5. 📋 COMMAND NOTES — ICS/IC considerations if relevant

Keep responses concise but thorough. Use Malaysian fire & rescue context where relevant. Always emphasize life safety above all.`;

export default function FireRescueAI() {
  const [selectedCategory, setSelectedCategory] = useState("fire");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    const cat = CATEGORIES.find(c => c.id === selectedCategory);
    const fullPrompt = `[Category: ${cat.label}]\n\n${userMessage}`;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, category: cat }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.role === "user" ? `[Category: ${m.category?.label}]\n\n${m.content}` : m.content,
      }));

      const response = await fetch("/api.chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: "user", content: fullPrompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "No response received.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = (scenario) => {
    setInput(scenario);
    inputRef.current?.focus();
  };

  const formatResponse = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("🔴") || line.startsWith("🟡") || line.startsWith("🟢") || line.startsWith("🔵") || line.startsWith("📋")) {
        return <div key={i} style={{ color: "#FFD700", fontWeight: "bold", marginTop: 12, marginBottom: 4, fontFamily: "'Courier New', monospace", fontSize: 13 }}>{line}</div>;
      }
      if (line.trim().startsWith("-") || line.trim().match(/^\d+\./)) {
        return <div key={i} style={{ color: "#CBD5E1", paddingLeft: 16, lineHeight: 1.7, fontSize: 13 }}>{line}</div>;
      }
      return <div key={i} style={{ color: "#94A3B8", lineHeight: 1.7, fontSize: 13 }}>{line}</div>;
    });
  };

  const cat = CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "'Courier New', Courier, monospace",
      color: "#E2E8F0",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Scanline effect */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: `linear-gradient(transparent ${scanLine}%, rgba(255,69,0,0.015) ${scanLine + 1}%, transparent ${scanLine + 2}%)`,
        pointerEvents: "none", zIndex: 999,
      }} />

      {/* Grid background */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(255,69,0,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,69,0,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #FF4500",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,69,0,0.05)",
        backdropFilter: "blur(10px)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid #FF4500",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, boxShadow: "0 0 12px rgba(255,69,0,0.5)",
          }}>🔥</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: "bold", color: "#FF4500", letterSpacing: 3 }}>S.P.A.R.K.Z</div>
            <div style={{ fontSize: 9, color: "#64748B", letterSpacing: 2 }}>AI FIRE & RESCUE TACTICS ADVISOR</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "#FF4500", letterSpacing: 1 }}>● SYSTEM ONLINE</div>
          <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>by Taufiq Sparkz</div>
        </div>
      </div>

      {/* Category selector */}
      <div style={{
        display: "flex", gap: 6, padding: "10px 16px",
        overflowX: "auto", borderBottom: "1px solid #1E293B",
        flexShrink: 0,
        scrollbarWidth: "none",
      }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{
            padding: "5px 12px", borderRadius: 4, fontSize: 11, letterSpacing: 1,
            border: `1px solid ${selectedCategory === c.id ? c.color : "#1E293B"}`,
            background: selectedCategory === c.id ? `${c.color}22` : "transparent",
            color: selectedCategory === c.id ? c.color : "#475569",
            cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: selectedCategory === c.id ? `0 0 8px ${c.color}44` : "none",
            transition: "all 0.2s",
          }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div ref={chatRef} style={{
        flex: 1, overflowY: "auto", padding: "16px",
        display: "flex", flexDirection: "column", gap: 16,
        scrollbarWidth: "thin", scrollbarColor: "#FF4500 transparent",
      }}>

        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
            <div style={{ color: "#FF4500", fontSize: 14, letterSpacing: 2, marginBottom: 6 }}>SPARKZ TACTICAL AI</div>
            <div style={{ color: "#475569", fontSize: 11, marginBottom: 24, lineHeight: 1.8 }}>
              Describe your emergency scenario and receive<br />AI-powered tactical guidance
            </div>
            <div style={{ color: "#334155", fontSize: 10, letterSpacing: 1, marginBottom: 12 }}>QUICK SCENARIOS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 400, margin: "0 auto" }}>
              {QUICK_SCENARIOS.map((s, i) => (
                <button key={i} onClick={() => handleQuick(s)} style={{
                  padding: "8px 14px", textAlign: "left", fontSize: 11,
                  background: "rgba(255,69,0,0.05)", border: "1px solid #1E293B",
                  color: "#64748B", borderRadius: 4, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.target.style.borderColor = "#FF4500"; e.target.style.color = "#FF4500"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#1E293B"; e.target.style.color = "#64748B"; }}>
                  → {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4,
            alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "user" ? (
              <div style={{ maxWidth: "85%" }}>
                <div style={{ fontSize: 9, color: "#475569", marginBottom: 4, textAlign: "right", letterSpacing: 1 }}>
                  {msg.category?.icon} {msg.category?.label} · OPERATOR INPUT
                </div>
                <div style={{
                  background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.3)",
                  borderRadius: "8px 8px 2px 8px", padding: "10px 14px",
                  fontSize: 13, color: "#E2E8F0", lineHeight: 1.6,
                }}>
                  {msg.content}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: "95%", width: "100%" }}>
                <div style={{ fontSize: 9, color: "#FF4500", marginBottom: 4, letterSpacing: 1 }}>
                  🔥 SPARKZ TACTICAL RESPONSE
                </div>
                <div style={{
                  background: "rgba(15,23,42,0.8)", border: "1px solid #1E293B",
                  borderRadius: "2px 8px 8px 8px", padding: "12px 16px",
                  borderLeft: "3px solid #FF4500",
                }}>
                  {formatResponse(msg.content)}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              background: "rgba(15,23,42,0.8)", border: "1px solid #1E293B",
              borderLeft: "3px solid #FF4500", borderRadius: "2px 8px 8px 8px",
              padding: "12px 16px",
            }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ fontSize: 9, color: "#FF4500", letterSpacing: 1, marginRight: 8 }}>SPARKZ ANALYZING</div>
                {[0,1,2].map(j => (
                  <div key={j} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#FF4500",
                    animation: "pulse 1s infinite", animationDelay: `${j * 0.2}s`,
                    opacity: 0.6,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={{
        borderTop: "1px solid #1E293B", padding: "12px 16px",
        background: "rgba(10,10,15,0.9)", backdropFilter: "blur(10px)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ fontSize: 9, color: "#FF4500", letterSpacing: 1, marginBottom: 4 }}>
              {cat.icon} {cat.label.toUpperCase()} · DESCRIBE SCENARIO
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
              placeholder={`Describe your ${cat.label.toLowerCase()} scenario...`}
              rows={2}
              style={{
                width: "100%", background: "rgba(30,41,59,0.5)",
                border: `1px solid ${input ? "#FF4500" : "#1E293B"}`,
                borderRadius: 6, padding: "10px 12px", color: "#E2E8F0",
                fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button onClick={handleSubmit} disabled={loading || !input.trim()} style={{
            padding: "10px 18px", background: loading || !input.trim() ? "#1E293B" : "#FF4500",
            border: "none", borderRadius: 6, color: loading || !input.trim() ? "#475569" : "#fff",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: 16, transition: "all 0.2s", fontFamily: "inherit",
            boxShadow: !loading && input.trim() ? "0 0 16px rgba(255,69,0,0.4)" : "none",
            marginBottom: 1,
          }}>
            {loading ? "⟳" : "▶"}
          </button>
        </div>
        <div style={{ fontSize: 9, color: "#334155", marginTop: 6, letterSpacing: 1 }}>
          ENTER to send · SHIFT+ENTER for new line · Powered by Claude AI
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3 } 50% { opacity: 1 } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #FF4500; border-radius: 2px; }
        textarea::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}