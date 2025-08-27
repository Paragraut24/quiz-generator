'use client';

import { useState, useEffect } from 'react';

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
  const [numQuestions, setNumQuestions] = useState(3);
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

  const getScoreEmoji = () => {
    const percentage = (score / quiz.length) * 100;
    if (percentage >= 90) return '🏆';
    if (percentage >= 70) return '🎉';
    if (percentage >= 50) return '👍';
    return '💪';
  };

  return (
    <div className="min-h-screen p-4 md:p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Animated Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="animate-float mb-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-text">
              AI Quiz Generator
            </h1>
          </div>
          <p className="text-xl text-gray-400 animate-fade-in">
            Create personalized quizzes powered by AI ✨
          </p>
        </div>

        {/* Quiz Setup Form */}
        {quiz.length === 0 && !quizCompleted && (
          <div className="glass-card p-8 max-w-2xl mx-auto animate-slide-up hover-lift">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-semibold mb-2 text-white">Create Your Quiz</h2>
              <p className="text-gray-400">Choose your topic and get started!</p>
            </div>
            
            <div className="space-y-8">
              {/* Topic Input with Animation */}
              <div className="animate-fade-in">
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  🎯 What topic would you like to be quizzed on?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Python programming, World History, Biology..."
                />
              </div>

              {/* Settings Grid with Staggered Animation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <label className="block text-sm font-medium mb-3 text-gray-300">
                    📊 Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="input-field"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <label className="block text-sm font-medium mb-3 text-gray-300">
                    🔢 Questions
                  </label>
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    min="1"
                    max="10"
                    className="input-field"
                  />
                </div>

                <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <label className="block text-sm font-medium mb-3 text-gray-300">
                    📝 Type
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="input-field"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="tf">True/False</option>
                  </select>
                </div>
              </div>

              {/* Generate Button with Animation */}
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <button
                  onClick={generateQuiz}
                  disabled={isGenerating || !topic.trim()}
                  className="btn-primary w-full"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <div className="loading-spinner mr-3"></div>
                      Generating Quiz...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      🚀 Generate Quiz
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Questions */}
        {quiz.length > 0 && !quizCompleted && (
          <div className="glass-card p-8 max-w-4xl mx-auto animate-slide-up">
            {/* Animated Progress Section */}
            <div className="mb-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-lg font-semibold text-white">
                    Question {currentQuestion + 1} of {quiz.length}
                  </span>
                  <p className="text-gray-400 text-sm">Keep going, you are doing great! 💪</p>
                </div>
                <span className="difficulty-badge animate-pulse-custom">
                  {quiz[currentQuestion].difficulty}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="progress-bar transition-all duration-500 ease-out" 
                  style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Section */}
            <div className="mb-8 animate-slide-up">
              <h3 className="text-2xl md:text-3xl font-semibold mb-6 leading-relaxed text-white">
                {quiz[currentQuestion].question}
              </h3>

              {/* Answer Options with Staggered Animation */}
              <div className="space-y-4">
                {questionType === 'mcq' ? (
                  quiz[currentQuestion].options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={showResult}
                      className={`option-btn animate-fade-in ${
                        selectedAnswer === option ? 'option-selected' : ''
                      } ${
                        showResult && option === quiz[currentQuestion].answer
                          ? 'option-correct'
                          : showResult && selectedAnswer === option && option !== quiz[currentQuestion].answer
                          ? 'option-incorrect'
                          : ''
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="flex items-center">
                        <span className="w-8 h-8 rounded-full border-2 border-current mr-4 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  ['True', 'False'].map((option, index) => (
                    <button
                      key={option}
                      onClick={() => setSelectedAnswer(option)}
                      disabled={showResult}
                      className={`option-btn animate-fade-in ${
                        selectedAnswer === option ? 'option-selected' : ''
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="flex items-center">
                        <span className="w-8 h-8 rounded-full border-2 border-current mr-4 flex items-center justify-center text-sm font-bold">
                          {option[0]}
                        </span>
                        <span className="flex-1">{option}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Explanation with Animation */}
            {showResult && (
              <div className="explanation animate-slide-up">
                <h4 className="font-semibold mb-3 text-blue-300 flex items-center">
                  💡 Explanation:
                </h4>
                <p className="text-gray-300">{quiz[currentQuestion].explanation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              {!showResult ? (
                <button
                  onClick={handleAnswer}
                  disabled={!selectedAnswer}
                  className="btn-primary flex-1 animate-fade-in"
                >
                  Submit Answer ✓
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="btn-primary flex-1 animate-glow"
                >
                  {currentQuestion < quiz.length - 1 ? 'Next Question →' : 'Finish Quiz 🏁'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quiz Completion with Celebration Animation */}
        {quizCompleted && (
          <div className="glass-card p-8 max-w-2xl mx-auto text-center animate-slide-up">
            <div className="mb-8">
              <div className="text-8xl mb-6 animate-float">{getScoreEmoji()}</div>
              <h2 className="text-4xl font-bold mb-4 text-white">Quiz Completed!</h2>
              <div className="score-display mb-4 animate-pulse-custom">
                {score}/{quiz.length}
              </div>
              <p className="text-2xl text-gray-400 mb-2">
                You scored {Math.round((score / quiz.length) * 100)}%!
              </p>
              <p className="text-lg text-gray-500 mb-8">
                {score === quiz.length ? 'Perfect score! 🎯' : 
                 score >= quiz.length * 0.7 ? 'Great job! 🌟' : 
                 'Keep practicing! 📚'}
              </p>
            </div>
            
            <button
              onClick={resetQuiz}
              className="btn-primary hover-lift animate-glow"
            >
              <span className="flex items-center justify-center">
                🔄 Take Another Quiz
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
