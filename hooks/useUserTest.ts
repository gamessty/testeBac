"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import startUserTest from "@/actions/PrismaFunctions/test/start/startUserTest";
import endUserTest from "@/actions/PrismaFunctions/test/start/endUserTest";
import resumeUserTest from "@/actions/PrismaFunctions/test/start/resumeUserTest";
import sendAnswer from "@/actions/PrismaFunctions/test/start/sendAnswer";
import { JsonObject } from "next-auth/adapters";

interface Question {
  id: string;
  text: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
  // Add other question fields as needed
}

interface UserTestQuestion {
  questionId: string;
  question: Question;
  // Add other fields as needed
}

interface SelectedAnswer {
  questionId: string;
  answerIds: string[];
}

interface UserTest {
  id: string;
  startedAt: Date | null;
  finishedAt: Date | null;
  questions: UserTestQuestion[];
  selectedAnswers: SelectedAnswer[] | null;
  configurations: JsonObject | null;
}

interface AnswerFeedback {
  correct: string[];    // Options correctly chosen
  incorrect: string[];  // Options incorrectly chosen
  missed: string[];     // Correct options not chosen
  unanswered: string[]; // Options not chosen (includes both incorrect and missed)
}

export default function useUserTest(testId: string) {
  const router = useRouter();
  const [userTest, setUserTest] = useState<UserTest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Initialize the test on component mount
  useEffect(() => {
    if (testId) {
      initializeTest();
    }
  }, [testId]);

  // Check if test time is expired
  useEffect(() => {
    if (userTest?.startedAt && userTest.configurations) {
      const timeLimit = userTest.configurations.timeLimit as number | undefined;
      
      if (timeLimit) {
        const checkInterval = setInterval(() => {
          if (isTestTimeExpired(userTest.startedAt!, timeLimit)) {
            clearInterval(checkInterval);
            handleEndTest();
          }
        }, 30000); // Check every 30 seconds
        
        return () => clearInterval(checkInterval);
      }
    }
  }, [userTest]);

  const initializeTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to resume test first
      const resumeResponse = await resumeUserTest({ userTestId: testId });
      
      if ('message' in resumeResponse) {
        if (resumeResponse.message === "NOT_STARTED") {
          // Start a new test if not started
          await startTest();
        } else if (resumeResponse.message === "ALREADY_ENDED") {
          // Redirect to results page if test already ended
          router.push(`/app/test/${testId}/results`);
          return;
        } else if (resumeResponse.message === "NOT_FOUND" || resumeResponse.message === "UNAUTHORIZED") {
          setError(resumeResponse.message);
        }
      } else {
        // Successfully resumed an existing test
        setUserTest(resumeResponse as unknown as UserTest);
        const lastAnsweredIndex = findLastAnsweredQuestionIndex(resumeResponse as unknown as UserTest);
        setCurrentQuestionIndex(lastAnsweredIndex + 1);
      }
    } catch (err) {
      setError("Failed to initialize test");
      console.error("Test initialization error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    setLoading(true);
    try {
      const response = await startUserTest({ userTestId: testId });
      
      if ('message' in response) {
        setError(response.message);
        return null;
      } else {
        setUserTest(response as unknown as UserTest);
        setCurrentQuestionIndex(0);
        return response;
      }
    } catch (err) {
      setError("Failed to start test");
      console.error("Start test error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const endTest = async () => {
    await handleEndTest();
    router.push(`/app/test/${testId}/results`);
  };

  const handleEndTest = async () => {
    setLoading(true);
    try {
      const response = await endUserTest({ userTestId: testId });
      
      if ('message' in response) {
        setError(response.message);
      } else {
        setUserTest(prev => prev ? { ...prev, finishedAt: response.finishedAt } : null);
      }
      return response;
    } catch (err) {
      setError("Failed to end test");
      console.error("End test error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string, answerIds: string[]) => {
    setLoading(true);
    try {
      const response = await sendAnswer({ 
        userTestId: testId, 
        questionId, 
        answerIds 
      });
      
      if ('message' in response) {
        if (response.message === "TIME_LIMIT_EXCEEDED") {
          router.push(`/app/test/${testId}/results`);
          return null;
        }
        setError(response.message);
        return null;
      } else {
        setUserTest(response as unknown as UserTest);
        
        // If showAnswers is true in the configuration, generate answer feedback
        const showAnswers = userTest?.configurations?.showAnswers as boolean | undefined;
        if (showAnswers) {
          const question = getQuestionById(questionId);
          if (question) {
            const feedback = calculateAnswerFeedback(question, answerIds);
            return {
              ...response,
              answerFeedback: feedback
            };
          }
        }
        
        return response;
      }
    } catch (err) {
      setError("Failed to submit answer");
      console.error("Submit answer error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (userTest && currentQuestionIndex < userTest.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      return true;
    }
    return false;
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      return true;
    }
    return false;
  };

  const getQuestion = (index?: number) => {
    if (!userTest?.questions?.length) return null;
    
    const questionIndex = index ?? currentQuestionIndex;
    if (questionIndex < 0 || questionIndex >= userTest.questions.length) return null;
    
    return userTest.questions[questionIndex].question;
  };

  const getCurrentQuestion = () => getQuestion(currentQuestionIndex);
  
  const getLastQuestion = () => {
    if (!userTest?.questions?.length) return null;
    
    const lastAnsweredIndex = findLastAnsweredQuestionIndex(userTest);
    return lastAnsweredIndex >= 0 ? userTest.questions[lastAnsweredIndex].question : null;
  };

  const getFirstUnansweredQuestion = () => {
    if (!userTest?.questions?.length) return null;
    
    const firstUnansweredIndex = findFirstUnansweredQuestionIndex(userTest);
    return firstUnansweredIndex >= 0 ? userTest.questions[firstUnansweredIndex].question : null;
  };

  const getQuestionById = (questionId: string): Question | null => {
    if (!userTest?.questions?.length) return null;
    
    const questionObj = userTest.questions.find(q => q.questionId === questionId);
    return questionObj ? questionObj.question : null;
  };

  const getAnswerFeedback = (questionId: string): AnswerFeedback | null => {
    if (!userTest?.selectedAnswers) return null;
    
    // Find the user's answer for this question
    const userAnswer = userTest.selectedAnswers.find(
      answer => answer.questionId === questionId
    );
    
    if (!userAnswer) return null;
    
    // Get the question
    const question = getQuestionById(questionId);
    if (!question) return null;
    
    // Calculate and return the feedback
    return calculateAnswerFeedback(question, userAnswer.answerIds);
  };

  const getTimeLimit = () => {
    return userTest?.configurations?.timeLimit as number | undefined;
  };

  const getRemainingTime = () => {
    const timeLimit = getTimeLimit();
    if (!timeLimit || !userTest?.startedAt) return null;
    
    const startTime = new Date(userTest.startedAt).getTime();
    const currentTime = new Date().getTime();
    const endTime = startTime + (timeLimit * 60 * 1000);
    
    const remainingMilliseconds = Math.max(0, endTime - currentTime);
    return Math.floor(remainingMilliseconds / 1000); // Return remaining seconds
  };

  /**
   * Calculate feedback for a question based on user's answers
   * @param question The question object
   * @param userAnswerIds The IDs of the options selected by the user
   * @returns Object with arrays of correct, incorrect, missed, and unanswered option IDs
   */
  function calculateAnswerFeedback(question: Question, userAnswerIds: string[]): AnswerFeedback {
    const feedback: AnswerFeedback = {
      correct: [],
      incorrect: [],
      missed: [],
      unanswered: []
    };
    
    // Process each option
    question.options.forEach(option => {
      const optionId = option.id;
      const isSelected = userAnswerIds.includes(optionId);
      const isCorrect = option.isCorrect || false;
      
      if (isSelected) {
        // User selected this option
        if (isCorrect) {
          feedback.correct.push(optionId);
        } else {
          feedback.incorrect.push(optionId);
        }
      } else {
        // User did not select this option
        feedback.unanswered.push(optionId);
        
        // If it was correct, it's also "missed"
        if (isCorrect) {
          feedback.missed.push(optionId);
        }
      }
    });
    
    return feedback;
  }

  // Helper functions
  function findLastAnsweredQuestionIndex(test: UserTest): number {
    if (!test.selectedAnswers || test.selectedAnswers.length === 0) return -1;
    
    const lastAnsweredQuestionId = test.selectedAnswers[test.selectedAnswers.length - 1].questionId;
    return test.questions.findIndex(q => q.questionId === lastAnsweredQuestionId);
  }

  function findFirstUnansweredQuestionIndex(test: UserTest): number {
    if (!test.selectedAnswers || test.selectedAnswers.length === 0) return 0;
    
    // Get all answered question IDs
    const answeredQuestionIds = new Set(
      test.selectedAnswers.map(answer => answer.questionId)
    );
    
    // Find the first question that isn't in the answered set
    const firstUnansweredIndex = test.questions.findIndex(
      question => !answeredQuestionIds.has(question.questionId)
    );
    
    // If all questions are answered, return -1, otherwise return the index
    return firstUnansweredIndex !== -1 ? firstUnansweredIndex : -1;
  }

  function isTestTimeExpired(startedAt: Date, timeLimit: number): boolean {
    const startTime = new Date(startedAt).getTime();
    const currentTime = new Date().getTime();
    const timeLimitMs = timeLimit * 60 * 1000; // Convert minutes to milliseconds
    return (currentTime - startTime) > timeLimitMs;
  }

  return {
    userTest,
    loading,
    error,
    currentQuestionIndex,
    startTest,
    endTest,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    getQuestion,
    getCurrentQuestion,
    getLastQuestion,
    getFirstUnansweredQuestion,
    getQuestionById,
    getAnswerFeedback,
    getTimeLimit,
    getRemainingTime,
  };
}