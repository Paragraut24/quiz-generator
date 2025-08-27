'use client';

import { useState } from 'react';

interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: string;
}

export default function QuizPage() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('mcq');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          difficulty,
          numQuestions,
          questionType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const data = await response.json();
      setQuiz(data.quiz);
      setCurrentQuestion(0);
      setScore(0);
      setShowResult(false);
      setQuizCompleted(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = () => {
    if (!selectedAnswer) return;

    if (selectedAnswer === quiz[currentQuestion].answer) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setQuiz([]);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setShowResult(false);
    setQuizCompleted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          AI Quiz Generator
        </h1>

        {quiz.length === 0 && !quizCompleted && (
          <div className="glass rounded-xl p-8 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2">Topic:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  placeholder="Enter quiz topic..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">Difficulty:</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Questions:</label>
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    min="1"
                    max="20"
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Type:</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="tf">True/False</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generateQuiz}
                disabled={isGenerating || !topic.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {isGenerating ? 'Generating Quiz...' : 'Generate Quiz'}
              </button>
            </div>
          </div>
        )}

        {quiz.length > 0 && !quizCompleted && (
          <div className="glass rounded-xl p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  Question {currentQuestion + 1}/{quiz.length}
                </h2>
                <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm">
                  {quiz[currentQuestion].difficulty.toUpperCase()}
                </span>
              </div>
              
              <h3 className="text-xl text-white mb-6">
                {quiz[currentQuestion].question}
              </h3>

              {questionType === 'mcq' ? (
                <div className="space-y-3 mb-6">
                  {quiz[currentQuestion].options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        selectedAnswer === option
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      } ${showResult && option === quiz[currentQuestion].answer
                        ? 'bg-green-500 border-green-400'
                        : showResult && selectedAnswer === option && option !== quiz[currentQuestion].answer
                        ? 'bg-red-500 border-red-400'
                        : ''
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {['True', 'False'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        selectedAnswer === option
                          ? 'bg-purple-500 border-purple-400 text-white'
                          : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {showResult && (
                <div className="mb-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400">
                  <h4 className="text-white font-semibold mb-2">Explanation:</h4>
                  <p className="text-white">{quiz[currentQuestion].explanation}</p>
                </div>
              )}

              <div className="flex gap-4">
                {!showResult ? (
                  <button
                    onClick={handleAnswer}
                    disabled={!selectedAnswer}
                    className="px-6 py-3 bg-purple-500 text-white rounded-lg disabled:opacity-50"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg"
                  >
                    {currentQuestion < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {quizCompleted && (
          <div className="glass rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Quiz Completed!</h2>
            <p className="text-xl text-white mb-6">
              You scored {score} out of {quiz.length} questions
            </p>
            <button
              onClick={resetQuiz}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold"
            >
              Generate New Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
