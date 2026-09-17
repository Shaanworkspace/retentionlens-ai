const ON = true;
export function logGenAI(stage, data) {
  if (!ON) return;
  const time = new Date().toLocaleTimeString("en-IN");
  console.groupCollapsed(`%c[GenAI ${stage}] %c${time}`, "color:#7c3aed;font-weight:bold", "color:#888");
  console.log(data);
  console.groupEnd();
}
export function logGenAISend(payload) { logGenAI("SEND → Gemini (via backend)", payload); }
export function logGenAIReply(res) { logGenAI("REPLY ← backend", res); }
export function logGenAIError(err) {
  logGenAI("ERROR ✕", {
    message: err?.response?.data?.detail || err?.message || String(err),
    status: err?.response?.status || null,
    url: err?.config?.url || null,
  });
}
