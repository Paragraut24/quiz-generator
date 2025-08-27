import { NextRequest } from "next/server";

interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: string;
}

export async function POST(req: NextRequest) {
  console.log("🚀 Quiz API called with Ollama integration!");
  
  try {
    const body = await req.json();
    const { topic, difficulty = "medium", numQuestions, questionType } = body;

    console.log("📝 Request data:", { topic, difficulty, numQuestions, questionType });

    // Validate input
    if (!topic || !numQuestions) {
      return Response.json({
        error: "Topic and number of questions are required"
      }, { status: 400 });
    }

    const prompt = `Generate ${numQuestions} ${difficulty.toLowerCase()} difficulty ${questionType === "mcq" ? "multiple choice" : "true/false"} questions about ${topic}.

Return ONLY a valid JSON array in this exact format:
[
  {
    "question": "What is Python primarily used for?",
    "options": ["Web development", "Gaming", "Mobile apps", "Hardware design"],
    "answer": "Web development",
    "explanation": "Python is widely used for web development due to frameworks like Django and Flask.",
    "difficulty": "${difficulty.toLowerCase()}"
  }
]

Requirements:
- ${numQuestions} questions only
- ${difficulty.toLowerCase()} difficulty level
- Questions about ${topic}
- ${questionType === "mcq" ? "4 options each with 1 correct answer" : "True/False questions"}
- Detailed explanations
- Return ONLY the JSON array, no other text`;

    console.log("🤖 Calling Ollama API...");

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral:7b",
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.9,
          num_predict: 1500,
        }
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    const ollamaData = await ollamaResponse.json();
    console.log("🎯 Ollama response received");
    
    if (!ollamaData.response) {
      throw new Error("No response from Ollama");
    }

    // Clean the response - FIXED REGEX
    // Clean the response
  let responseText = ollamaData.response.replace(/^\s*```json\s*|\s*```$/g, '').trim();


    console.log("🧹 Cleaned response:", responseText.substring(0, 200));

    let quizData: any[] = [];
    try {
      quizData = JSON.parse(responseText);
    } catch (e) {
      // Try to extract just the array part
      const match = responseText.match(/$$([\s\S]*)$$/);
      if (match) {
        quizData = JSON.parse(`[${match}]`);[1]
      } else {
        throw new Error("Could not parse quiz data");
      }
    }

    // Validate questions with proper typing
    const validQuestions: QuizQuestion[] = quizData
      .filter((q: any) => q && q.question && q.answer && q.explanation)
      .map((q: any) => ({
        question: q.question.trim(),
        options: questionType === "mcq" ? 
          (Array.isArray(q.options) ? q.options.map((o: any) => String(o).trim()) : []) : 
          undefined,
        answer: String(q.answer).trim(),
        explanation: String(q.explanation).trim(),
        difficulty: q.difficulty || difficulty.toLowerCase()
      }))
      .slice(0, numQuestions);

    console.log(`✅ Generated ${validQuestions.length} valid questions`);

    if (validQuestions.length === 0) {
      throw new Error("No valid questions were generated");
    }

    return Response.json({ quiz: validQuestions });

  } catch (error) {
    console.error("❌ Quiz generation error:", error);
    
    // Fallback to mock data if Ollama fails
    console.log("🔄 Falling back to mock data");
    const { topic, difficulty = "medium", numQuestions, questionType } = await req.json();
    
    const mockQuiz: QuizQuestion[] = Array.from({ length: numQuestions }, (_, i) => ({
      question: `Real ${topic} question ${i + 1} would appear here`,
      options: questionType === "mcq" ? [
        "Option A", "Option B", "Option C", "Option D"
      ] : undefined,
      answer: questionType === "mcq" ? "Option A" : "True",
      explanation: `This would be a real explanation about ${topic}.`,
      difficulty: difficulty.toLowerCase()
    }));

    return Response.json({ quiz: mockQuiz });
  }
}
