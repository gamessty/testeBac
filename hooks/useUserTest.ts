"use client";
//WIP - WORK IN PROGRESS

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import startUserTest from "@/actions/PrismaFunctions/test/start/startUserTest";
import endUserTest from "@/actions/PrismaFunctions/test/start/endUserTest";
import resumeUserTest from "@/actions/PrismaFunctions/test/start/resumeUserTest";
import sendAnswer from "@/actions/PrismaFunctions/test/start/sendAnswer";
import { JsonObject, JsonValue } from "next-auth/adapters";

// Full implementation of Question model with all properties
interface Code {
  language: string[];
  code: string;
}

interface Localization {
  locale: string;
  text: string;
}

interface AnswerIndicator {
  code: Code[];
  markdown?: string | null;
}

interface AdditionalData {
  image?: string | null;
  code: Code[];
  explanation?: AnswerIndicator | null;
  localization: Localization[];
}

interface Option {
  id: string;
  option: string;
  image?: string | null;
  code: Code[];
  isCorrect: boolean;
  localization: Localization[];
}

interface Question {
  id: string;
  subjectId?: string | null;
  chapterId?: string | null;
  userTestId?: string | null;
  type: 'singleChoice' | 'multipleChoice';
  answer?: string | null;
  question: string;
  options: Option[];
  additionalData: AdditionalData;
  createdAt: Date;
  updatedAt: Date;
}

interface SelectedAnswer {
  questionId: string;
  answerIds: string[];
}

interface UserTest {
  id: string;
  startedAt: Date | null;
  finishedAt: Date | null;
  questions: Question[];
  selectedAnswers: SelectedAnswer[] | null;
  configurations: JsonValue | null;
}

interface AnswerFeedback {
  correct: string[];    // Options correctly chosen by user
  incorrect: string[];  // Options incorrectly chosen by user
  missed: string[];     // Correct options that user failed to select (missed opportunities)
}

// export all interfaces
export type { UserTest, Question, Option, SelectedAnswer, AnswerFeedback, AdditionalData, AnswerIndicator };

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
      const timeLimit = (userTest.configurations as JsonObject | undefined)?.timeLimit as number | undefined;
      console.log(timeLimit)
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
          router.push(`/app/test/${testId}/start`);
          return;
        } else if (resumeResponse.message === "NOT_FOUND" || resumeResponse.message === "UNAUTHORIZED") {
          setError(resumeResponse.message);
        }
      } else {
        setUserTest(resumeResponse);
        const firstUnansweredQuestion = findFirstUnansweredQuestionIndex(resumeResponse);
        setCurrentQuestionIndex(firstUnansweredQuestion);
      }
    } catch (err) {
      console.error("Test initialization error:", err);
      setError("Failed to initialize test");
    } finally {
      setLoading(false);
    }
  };

  // Add a helper function to fetch questions if they're not included
  const fetchQuestionsForTest = async (test: UserTest): Promise<UserTest> => {
    if (!test.questions || test.questions.length === 0) {
      // If there are no questions, we need to fetch them
      try {
        const response = await resumeUserTest({ userTestId: testId });
        // Make sure we're not getting a message response
        if (!('message' in response)) {
          return response as unknown as UserTest;
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    }
    return test;
  };

  const startTest = async () => {
    setLoading(true);
    try {
      const response = await startUserTest({ userTestId: testId });
      
      if ('message' in response) {
        setError(response.message);
        return null;
      } else {
        setUserTest(response);
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
    router.push(`/app/test/${testId}/start`);
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
          router.push(`/app/test/${testId}/start`);
          return null;
        }
        setError(response.message);
        return null;
      } else {
        setUserTest(response as unknown as UserTest);
        
        // If showAnswers is true in the configuration, generate answer feedback
        const showAnswers = ((userTest?.configurations as JsonObject | undefined)?.showAnswers) as boolean | undefined;
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
    
    return userTest.questions[questionIndex];
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
    return firstUnansweredIndex >= 0 ? userTest.questions[firstUnansweredIndex] : null;
  };

  const getQuestionById = (questionId: string): Question | null => {
    if (!userTest?.questions?.length) return null;
    
    const questionObj = userTest.questions.find(q => q.id === questionId);
    return questionObj ?? null;
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
    return (userTest?.configurations as JsonObject | undefined)?.timeLimit as number | undefined;
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
   * @returns Object with arrays of correct, incorrect, and missed option IDs
   */
  function calculateAnswerFeedback(question: Question, userAnswerIds: string[]): AnswerFeedback {
    const feedback: AnswerFeedback = {
      correct: [],
      incorrect: [],
      missed: []
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
      } else if (isCorrect) {
        // If option is correct but not selected, it's "missed" (a missed opportunity)
        feedback.missed.push(optionId);
      }
    });
    
    return feedback;
  }

  // Helper functions
  function findLastAnsweredQuestionIndex(test: UserTest): number {
    if (!test.selectedAnswers || test.selectedAnswers.length === 0) return -1;
    
    const lastAnsweredQuestionId = test.selectedAnswers[test.selectedAnswers.length - 1].questionId;
    return test.questions.findIndex(q => q.id === lastAnsweredQuestionId);
  }

  function findFirstUnansweredQuestionIndex(test: UserTest): number {
    if (!test.selectedAnswers || test.selectedAnswers.length === 0) return 0;
    
    // Get all answered question IDs
    const answeredQuestionIds = new Set(
      test.selectedAnswers.map(answer => answer.questionId)
    );
    
    // Find the first question that isn't in the answered set
    const firstUnansweredIndex = test.questions.findIndex(
      question => !answeredQuestionIds.has(question.id)
    );
    
    // If all questions are answered, return -1, otherwise return the index
    return firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0;
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