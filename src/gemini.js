import { GoogleGenerativeAI } from "@google/generative-ai";
import { FALLBACK_TIPS } from "./constants";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const isGeminiConfigured = apiKey && apiKey !== "your_gemini_api_key";

let genAI = null;
if (isGeminiConfigured) {
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Generates a warm, empathetic reframe message for the student.
 * If the Gemini API is configured, it requests a real-time message;
 * otherwise, it falls back to handcrafted templates based on the trigger and mood.
 * 
 * @param {object} studentInfo Onboarding details { name, targetExam, examDate }
 * @param {string} mood Selected mood
 * @param {string} trigger Selected stress trigger
 * @returns {Promise<string>} Empathic reframe tip
 */
export async function generateWellnessTip(studentInfo, mood, trigger) {
  const name = studentInfo.name || "friend";
  const exam = studentInfo.targetExam || "exams";
  
  // Format exam date if available
  let formattedDate = "";
  if (studentInfo.examDate) {
    try {
      const d = new Date(studentInfo.examDate);
      formattedDate = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      formattedDate = studentInfo.examDate;
    }
  }

  // 1. If Gemini API is configured, use it for real-time generative support
  if (isGeminiConfigured && genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        You are MindBoard, a warm, caring, and deeply understanding mentor or elder sibling who has successfully cleared competitive exams in India. 
        You are talking directly to ${name}, who is preparing for the highly competitive ${exam} exam${formattedDate ? ` (scheduled on ${formattedDate})` : ""}.
        
        Today, ${name} is feeling "${mood}" and is affected most by "${trigger}".
        
        Write a short response (exactly 3 to 4 sentences).
        
        Tone guidelines:
        - Must be extremely warm, human, sibling-like, and comforting.
        - DO NOT sound like a clinical psychologist or a medical doctor. Avoid clinical jargon.
        - Do not use bullet points, numbered lists, or bold labels.
        - Acknowledge their specific exam pressure (${exam}), their mood (${mood}), and their trigger (${trigger}) naturally.
        - Provide a gentle cognitive reframe: remind them that their worth is infinite and has absolutely nothing to do with their exam rank, percentiles, or scores.
        - End with one practical, micro-action they can do right now (e.g., box breathing, drinking water, stepping outside for fresh air, stretching).
      `;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.7,
        }
      });
      
      const text = result.response.text();
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    } catch {
      // Silently swallow API errors and fall back to local templates
    }
  }

  // 2. Fallback to handcrafted templates
  const triggerMap = FALLBACK_TIPS[trigger] || FALLBACK_TIPS["default"];
  const tipTemplate = triggerMap[mood] || triggerMap["default"] || FALLBACK_TIPS["default"]["default"];
  
  // Replace tokens
  const customizedTip = tipTemplate
    .replace(/{name}/g, name)
    .replace(/{exam}/g, exam);

  return customizedTip;
}
