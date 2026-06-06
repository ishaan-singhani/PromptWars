export const EXAMS_LIST = [
  { value: "NEET", label: "NEET (Medical)" },
  { value: "JEE", label: "JEE (Engineering)" },
  { value: "CUET", label: "CUET (University Entrance)" },
  { value: "CAT", label: "CAT (Management)" },
  { value: "GATE", label: "GATE (Engineering/Science)" },
  { value: "UPSC", label: "UPSC (Civil Services)" },
  { value: "CBSE Board", label: "CBSE Board (Class 10/12)" },
  { value: "ICSE/ISC Board", label: "ICSE/ISC/CISCE Board (Class 10/12)" },
  { value: "State Board", label: "State Board (Class 10/12)" }
];

export const TRIGGERS_LIST = [
  "Study Load",
  "Self-Doubt",
  "Family Pressure",
  "Fear of Failure",
  "Sleep Issues",
  "Comparison with Others",
  "Physical Health"
];

export const MOODS_LIST = [
  { value: "Energized", emoji: "😄", label: "Energized" },
  { value: "Okay", emoji: "🙂", label: "Okay" },
  { value: "Tired", emoji: "😐", label: "Tired" },
  { value: "Anxious", emoji: "😟", label: "Anxious" },
  { value: "Burnt Out", emoji: "😔", label: "Burnt Out" }
];

export const FALLBACK_TIPS = {
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

export const MOTIVATIONAL_QUOTES = [
  {
    text: "You cannot change your future, but you can change your habits, and surely your habits will change your future.",
    author: "Dr. A.P.J. Abdul Kalam",
    meta: "Aerospace Scientist & Former President of India"
  },
  {
    text: "Arise, awake, and stop not till the goal is reached.",
    author: "Swami Vivekananda",
    meta: "Philosopher"
  },
  {
    text: "Our greatest glory is not in never falling, but in rising every time we fall.",
    author: "Confucius",
    meta: "Philosopher"
  },
  {
    text: "Rank is just a number in a database. Your curiosity, resilience, and compassion are what make you irreplaceable.",
    author: "MindBoard Mentor",
    meta: "JEE & UPSC Toppers Advice"
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas A. Edison",
    meta: "Inventor"
  },
  {
    text: "Study to understand, to build, to discover. Don't study just to clear a cutoff. The knowledge stays; the rank fades.",
    author: "Richard Feynman",
    meta: "Nobel Laureate in Physics"
  },
  {
    text: "Mock tests are mirrors to show your weak spots, not scales to weigh your intelligence.",
    author: "UPSC Topper (AIR 4)",
    meta: "Civil Services Aspirant Wisdom"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    meta: "Statesman"
  },
  {
    text: "Do not judge me by my successes, judge me by how many times I fell down and got back up again.",
    author: "Nelson Mandela",
    meta: "Philanthropist & Statesman"
  },
  {
    text: "It is okay to be scared. But it is not okay to let fear stop you from seeing what you are capable of.",
    author: "Board Exam Topper (98.5%)",
    meta: "Peer Encouragement"
  }
];

export const JOURNAL_PROMPTS = [
  "Write down everything you're worried about right now. Let it out on this page and leave it here.",
  "What are three small things you are grateful for today?",
  "Reflect on a concept or topic you struggled with, but finally understood recently. How did it feel?",
  "If your best friend was feeling this exam pressure, what comforting words would you tell them?",
  "Describe your ideal relaxing day after your exams are over."
];
