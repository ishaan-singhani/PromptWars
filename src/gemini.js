import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const isGeminiConfigured = apiKey && apiKey !== "your_gemini_api_key";

let genAI = null;
if (isGeminiConfigured) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Warm, handcrafted offline fallback templates based on triggers and moods.
// These templates ensure the app functions and displays custom tips instantly
// even without an active internet connection or API Key.
const fallbackTips = {
  "Study Load": {
    "Anxious": "Hey {name}, I know the {exam} syllabus feels like a mountain right now. Take a deep breath. You don't have to conquer the whole mountain today; just focus on the next page. Put away your books for 10 minutes and drink a glass of water. You are doing enough.",
    "Burnt Out": "Hey {name}, your mind and body are telling you to slow down. Preparing for {exam} is a marathon, not a sprint. Resting is just as productive as studying. Give yourself permission to close the books for the rest of the evening. You cannot pour from an empty cup.",
    "Tired": "Hey {name}, it's completely normal to feel exhausted under this study load. How about a quick 15-minute power nap or a walk outside without your phone? A refreshed mind learns faster than a tired one. Be kind to yourself.",
    "default": "Hey {name}, the {exam} portion can get incredibly overwhelming. Break your study blocks into 25-minute Pomodoros followed by a hard 5-minute break. Remember, your progress is measured in steps, not leaps."
  },
  "Self-Doubt": {
    "Anxious": "Hey {name}, that inner voice saying you aren't ready for {exam} is just the exam stress talking, not the truth. Look back at how far you've come. You have solved tough problems before and you will solve them again. Your value isn't decided by a mock test score.",
    "Burnt Out": "Hey {name}, it is okay to feel unsure of yourself when you're this exhausted. Don't let fatigue trick you into thinking you're not capable. Take today off to rest. You've fought hard to get here, and that strength is still inside you.",
    "default": "Hey {name}, self-doubt is something even toppers face. When it hits, write down three things you successfully understood this week. Small wins build huge confidence. You are more capable than you give yourself credit for."
  },
  "Family Pressure": {
    "Anxious": "Hey {name}, it's incredibly tough when you feel like you carry your family's dreams alongside your own. Remember: your family loves you, even if they sometimes express it as pressure. For now, focus on your own breathing. You are studying for your future, and your path is your own.",
    "Burnt Out": "Hey {name}, the expectation to score high in {exam} can feel like a heavy weight on your chest. You are allowed to feel overwhelmed. Your worth as a person is infinite and has absolutely nothing to do with rank or percentiles. Take a quiet moment just for yourself.",
    "default": "Hey {name}, when expectations from home feel loud, close your eyes and focus on your inner calm. Your family wants you to secure a good future, but your mental peace is the foundation of that future. Take it one step at a time."
  },
  "Fear of Failure": {
    "Anxious": "Hey {name}, the fear of what happens on the {exam} day is normal, but don't let it steal your present. A single exam cannot define the course of your entire life. There are a hundred different paths to success. Focus on today's effort, not tomorrow's outcome. You've got this.",
    "Burnt Out": "Hey {name}, you're putting so much pressure on yourself because you care. But caring shouldn't cost you your peace. If you fail a practice test, it is just feedback, not a final judgment. Sleep early tonight; tomorrow is a fresh start.",
    "default": "Hey {name}, fear of failure is just energy that wants to protect you, but it's overdrive right now. Reframe it: every mistake in your practice is one less mistake you will make on the actual {exam} day. Keep going!"
  },
  "Sleep Issues": {
    "Tired": "Hey {name}, sleep is the ultimate brain booster. If you're studying late for {exam}, try setting a 'screen curfew' 30 minutes before bed. Let your brain wind down with light music or box breathing. Your health is the real top rank.",
    "Anxious": "Hey {name}, racing thoughts keeping you awake? Keep a notepad by your bed and 'brain dump' everything you need to do tomorrow. Once it's on paper, tell your mind: 'We will handle this tomorrow. Tonight is for rest.' Let's try 4 rounds of box breathing.",
    "default": "Hey {name}, sleep deprivation makes everything feel twice as stressful. Try to get 7 hours of rest, especially now. Your brain consolidation happens during sleep, so resting actually helps you remember what you studied!"
  },
  "Comparison with Others": {
    "Anxious": "Hey {name}, comparing your page 10 to someone else's page 100 is a trap. In competitive exams like {exam}, everyone has a different starting point and a different learning style. Your only real competitor is who you were yesterday. Focus on your own growth.",
    "default": "Hey {name}, social media and study groups can make it look like everyone is ahead. But they only show their highlights, not their struggles. Put down the group chat and focus on your dashboard today. You are on track."
  },
  "Physical Health": {
    "Tired": "Hey {name}, your body is the vehicle carrying you to {exam} day. If it's exhausted, no amount of study hours will help. Drink a tall glass of water, eat a healthy snack, and stretch your back. Take care of the engine first.",
    "default": "Hey {name}, a stiff neck or a headache is a sign to step away from the desk. Do some light stretches, roll your shoulders, and rest your eyes from the screen. Your physical wellness is fuel for your mind."
  },
  "default": {
    "default": "Hey {name}, preparing for {exam} is a major journey. Be proud of yourself for showing up today, even if it was hard. Take a deep breath, count to four, and remember that you are learning and growing every single day. Your effort is what matters."
  }
};

/**
 * Generates a warm, empathetic reframe message for the student.
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
    } catch (e) {
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
    } catch (error) {
      console.warn("MindBoard: Gemini API call failed. Falling back to local templates.", error);
    }
  }

  // 2. Fallback to handcrafted templates
  const triggerMap = fallbackTips[trigger] || fallbackTips["default"];
  let tipTemplate = triggerMap[mood] || triggerMap["default"] || fallbackTips["default"]["default"];
  
  // Replace tokens
  const customizedTip = tipTemplate
    .replace(/{name}/g, name)
    .replace(/{exam}/g, exam);

  return customizedTip;
}
