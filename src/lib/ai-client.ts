
const AI_URL = process.env.NEXT_PUBLIC_AI_ENGINE_URL || "http://127.0.0.1:8000";

export const aiClient = {
  async predictAnalytics(data: any) {
    try {
      const response = await fetch(`${AI_URL}/api/predict-analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("AI Engine error");
      return await response.json();
    } catch (error) {
      console.error("AI Client Error (Analytics):", error);
      return null;
    }
  },

  async suggestEffort(description: string, taskType: string) {
    try {
      const response = await fetch(`${AI_URL}/api/suggest-effort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, taskType }),
      });
      
      if (!response.ok) throw new Error("AI Engine error");
      return await response.json();
    } catch (error) {
      console.error("AI Client Error (Effort):", error);
      return null;
    }
  }
};