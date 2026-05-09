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

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState("fire");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const cat = CATEGORIES.find(c => c.id === selectedCategory);

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    const fullPrompt = `[Category: ${cat.label}]\n\n${userMessage}`;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, category: cat }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.role === "user" ? `[Category: ${m.category?.label}]\n\n${m.content}` : m.content,
      }));

      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: "user", content: fullPrompt }],
        }),
      });

      const text = await response.text();
      const data = JSON.parse(text);
      const reply = data.content?.map(b => b.text || "").join("") || "No response received.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("🔴") || line.startsWith("🟡") || line.startsWith("🟢") || line.startsWith("🔵") || line.startsWith("📋")) {
        return <div key={i} style={{ color: "#FFD700", fontWeight: "bold", marginTop: 12, marginBottom: 4, fontSize: 13 }}>{line}</div>;
      }
      if (line.trim().startsWith("-") || line.trim().match(/^\d+\./)) {
        return <div key={i} style={{ color: "#CBD5E1", paddingLeft: 16, lineHeight: 1.7, fontSize: 13 }}>{line}</div>;
      }
      return <div key={i} style={{ color: "#94A3B8", lineHeight: 1.7, fontSize: 13 }}>{line}</div>;
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0A0A0F", color: "#E2E8F0", fontFamily: "Courier New, monospace" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #FF4500", background: "rgba(255,69,0,0.05)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid #FF4500", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔥</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: "bold", color: "#FF4500", letterSpacing: 3 }}>S.P.A.R.K.Z</div>
            <div style={{ fontSize: 9, color: "#64748B", letterSpacing: 2 }}>AI FIRE & RESCUE TACTICS ADVISOR</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "#FF4500" }}>● SYSTEM ONLINE</div>
          <div style={{ fontSize: 9, color: "#475569" }}>by Taufiq Sparkz</div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ display: "flex", gap: 6, padding: "8px 16px", borderBottom: "1px solid #1E293B", flexShrink: 0, overflowX: "auto" }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} style={{
            padding: "5px 12px", borderRadius: 4, fontSize: 11, letterSpacing: 1, whiteSpace: "nowrap",
            border: `1px solid ${selectedCategory === c.id ? c.color : "#1E293B"}`,
            background: selectedCategory === c.id ? `${c.color}22` : "transparent",
            color: selectedCategory === c.id ? c.color : "#475569",
            cursor: "pointer",
          }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* CHAT */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
            <div style={{ color: "#FF4500", fontSize: 14, letterSpacing: 2, marginBottom: 8 }}>SPARKZ TACTICAL AI</div>
            <div style={{ color: "#475569", fontSize: 11, marginBottom: 24 }}>Describe your emergency scenario and receive AI-powered tactical guidance</div>
            <div style={{ color: "#334155", fontSize: 10, marginBottom: 10 }}>QUICK SCENARIOS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 400, margin: "0 auto" }}>
              {QUICK_SCENARIOS.map((s, i) => (
                <button key={i} onClick={() => setInput(s)} style={{
                  padding: "8px 14px", textAlign: "left", fontSize: 11,
                  background: "rgba(255,69,0,0.05)", border: "1px solid #1E293B",
                  color: "#64748B", borderRadius: 4, cursor: "pointer",
                }}>→ {s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "user" ? (
              <div style={{ maxWidth: "80%" }}>
                <div style={{ fontSize: 9, color: "#475569", marginBottom: 4, textAlign: "right" }}>{msg.category?.icon} {msg.category?.label} · OPERATOR INPUT</div>
                <div style={{ background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.3)", borderRadius: "8px 8px 2px 8px", padding: "10px 14px", fontSize: 13, color: "#E2E8F0" }}>{msg.content}</div>
              </div>
            ) : (
              <div style={{ maxWidth: "95%", width: "100%" }}>
                <div style={{ fontSize: 9, color: "#FF4500", marginBottom: 4 }}>🔥 SPARKZ TACTICAL RESPONSE</div>
                <div style={{ background: "rgba(15,23,42,0.8)", border: "1px solid #1E293B", borderLeft: "3px solid #FF4500", borderRadius: "2px 8px 8px 8px", padding: "12px 16px" }}>
                  {formatResponse(msg.content)}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ fontSize: 9, color: "#FF4500", letterSpacing: 1, padding: "12px 16px", border: "1px solid #1E293B", borderLeft: "3px solid #FF4500", borderRadius: "2px 8px 8px 8px", background: "rgba(15,23,42,0.8)" }}>
            SPARKZ ANALYZING...
          </div>
        )}
      </div>

      {/* INPUT */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #1E293B", background: "#0A0A0F", flexShrink: 0 }}>
        <div style={{ fontSize: 9, color: "#FF4500", marginBottom: 4 }}>{cat.icon} {cat.label.toUpperCase()} · DESCRIBE SCENARIO</div>
        <div style={{ display: "flex", gap: 8 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
            placeholder={`Describe your ${cat.label.toLowerCase()} scenario...`}
            rows={2}
            style={{ flex: 1, background: "rgba(30,41,59,0.5)", border: `1px solid ${input ? "#FF4500" : "#1E293B"}`, borderRadius: 6, padding: "10px 12px", color: "#E2E8F0", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none" }}
          />
          <button onClick={handleSubmit} disabled={loading || !input.trim()} style={{
            padding: "10px 18px", background: loading || !input.trim() ? "#1E293B" : "#FF4500",
            border: "none", borderRadius: 6, color: loading || !input.trim() ? "#475569" : "#fff",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: 16,
          }}>▶</button>
        </div>
        <div style={{ fontSize: 9, color: "#334155", marginTop: 6 }}>ENTER to send · SHIFT+ENTER for new line · Powered by Claude AI</div>
      </div>

    </div>
  );
}
