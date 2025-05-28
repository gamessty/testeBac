"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import startUserTest from "@/actions/PrismaFunctions/test/start/startUserTest";
import endUserTest from "@/actions/PrismaFunctions/test/start/endUserTest";
import resumeUserTest from "@/actions/PrismaFunctions/test/start/resumeUserTest";
import sendAnswer from "@/actions/PrismaFunctions/test/start/sendAnswer";
import { JsonObject, JsonValue } from "next-auth/adapters";

// Interfețe pentru modelul de date
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
  correct: string[];    // Opțiuni alese corect de utilizator
  incorrect: string[];  // Opțiuni alese incorect de utilizator
  missed: string[];     // Opțiuni corecte pe care utilizatorul nu le-a selectat
}

// Exportăm interfețele pentru a fi folosite în alte componente
export type { UserTest, Question, Option, SelectedAnswer, AnswerFeedback, AdditionalData, AnswerIndicator };

export default function useUserTest(testId: string) {
  const router = useRouter();
  const [userTest, setUserTest] = useState<UserTest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndexState] = useState<number>(0);

  // Inițializăm testul la montarea componentei
  useEffect(() => {
    if (testId) {
      initializeTest();
    }
  }, [testId]);

  // Verificăm dacă timpul de test a expirat
  useEffect(() => {
    if (userTest?.startedAt && userTest.configurations) {
      const timeLimit = (userTest.configurations as JsonObject | undefined)?.timeLimit as number | undefined;

      if (timeLimit) {
        const checkInterval = setInterval(() => {
          if (isTestTimeExpired(userTest.startedAt!, timeLimit)) {
            clearInterval(checkInterval);
            handleEndTest();
          }
        }, 30000); // Verificăm la fiecare 30 de secunde
        
        return () => clearInterval(checkInterval);
      }
    }
  }, [userTest]);

  // ----- Funcții de inițializare și gestionare test -----

  const initializeTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Încercăm să reluăm testul mai întâi
      const resumeResponse = await resumeUserTest({ userTestId: testId });
      
      if ('message' in resumeResponse) {
        if (resumeResponse.message === "NOT_STARTED") {
          // Începem un test nou dacă nu a fost început
          await startTest();
        } else if (resumeResponse.message === "ALREADY_ENDED") {
          // Redirecționăm către pagina de rezultate dacă testul s-a încheiat deja
          router.push(`/app/test/${testId}/start`);
          return;
        } else if (resumeResponse.message === "ALREADY_STARTED") {
          // Dacă obținem ALREADY_STARTED, încercăm să reluăm din nou
          // Aceasta gestionează condiția de cursă în care clientul încearcă să înceapă un test
          // care tocmai a fost început
          const retryResponse = await resumeUserTest({ userTestId: testId });
          if ('message' in retryResponse) {
            setError(retryResponse.message);
          } else {
            setUserTest(retryResponse);
            const firstUnansweredQuestion = findFirstUnansweredQuestionIndex(retryResponse);
            setCurrentQuestionIndexState(firstUnansweredQuestion);
          }
        } else if (resumeResponse.message === "NOT_FOUND" || resumeResponse.message === "UNAUTHORIZED") {
          setError(resumeResponse.message);
        }
      } else {
        setUserTest(resumeResponse);
        const firstUnansweredQuestion = findFirstUnansweredQuestionIndex(resumeResponse);
        setCurrentQuestionIndexState(firstUnansweredQuestion);
      }
    } catch (err) {
      setError("Failed to initialize test");
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
        setUserTest(response);
        setCurrentQuestionIndexState(0);
        return response;
      }
    } catch (err) {
      setError("Failed to start test");
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
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ----- Funcții pentru gestionarea răspunsurilor și navigarea între întrebări -----

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
        
        // Dacă showAnswers este true în configurație, generăm feedback pentru răspuns
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
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = () => {
    if (userTest && currentQuestionIndex < userTest.questions.length - 1) {
      setCurrentQuestionIndexState(prev => prev + 1);
      return true;
    }
    return false;
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndexState(prev => prev - 1);
      return true;
    }
    return false;
  };

  // ----- Funcții pentru obținerea întrebărilor -----

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

  // ----- Funcții pentru feedback și stare -----

  const getAnswerFeedback = (questionId: string): AnswerFeedback | null => {
    if (!userTest?.selectedAnswers) return null;
    
    // Găsim răspunsul utilizatorului pentru această întrebare
    const userAnswer = userTest.selectedAnswers.find(
      answer => answer.questionId === questionId
    );
    
    if (!userAnswer) return null;
    
    // Obținem întrebarea
    const question = getQuestionById(questionId);
    if (!question) return null;
    
    // Calculăm și returnăm feedback-ul
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
    return Math.floor(remainingMilliseconds / 1000); // Returnăm secundele rămase
  };

  /**
   * Calculăm feedback pentru o întrebare pe baza răspunsurilor utilizatorului
   * @param question Obiectul întrebării
   * @param userAnswerIds ID-urile opțiunilor selectate de utilizator
   * @returns Obiect cu array-uri de ID-uri de opțiuni corecte, incorecte și ratate
   */
  function calculateAnswerFeedback(question: Question, userAnswerIds: string[]): AnswerFeedback {
    const feedback: AnswerFeedback = {
      correct: [],
      incorrect: [],
      missed: []
    };
    
    // Procesăm fiecare opțiune
    question.options.forEach(option => {
      const optionId = option.id;
      const isSelected = userAnswerIds.includes(optionId);
      const isCorrect = option.isCorrect || false;
      
      if (isSelected) {
        // Utilizatorul a selectat această opțiune
        if (isCorrect) {
          feedback.correct.push(optionId);
        } else {
          feedback.incorrect.push(optionId);
        }
      } else if (isCorrect) {
        // Dacă opțiunea este corectă dar nu a fost selectată, este "ratată"
        feedback.missed.push(optionId);
      }
    });
    
    return feedback;
  }

  // ----- Funcții utilitare -----

  const isQuestionAnswered = (questionId: string): boolean => {
    if (!userTest?.selectedAnswers) return false;
    return userTest.selectedAnswers.some(answer => answer.questionId === questionId);
  };

  const getAnsweredQuestionsSet = (): Set<string> => {
    const answeredQuestionIds = new Set<string>();
    
    if (userTest?.selectedAnswers) {
      userTest.selectedAnswers.forEach(answer => {
        answeredQuestionIds.add(answer.questionId);
      });
    }
    
    return answeredQuestionIds;
  };

  const getQuestionStatus = (questionId: string): { 
    isAnswered: boolean; 
    feedback: AnswerFeedback | null;
  } => {
    const isAnswered = isQuestionAnswered(questionId);
    const feedback = isAnswered ? getAnswerFeedback(questionId) : null;
    
    return {
      isAnswered,
      feedback
    };
  };

  // Adăugăm un setter direct pentru indexul întrebării curente
  const setCurrentQuestionIndex = (index: number) => {
    if (!userTest?.questions) return false;
    
    // Ne asigurăm că indexul este în intervalul valid
    if (index >= 0 && index < userTest.questions.length) {
      setCurrentQuestionIndexState(index);
      return true;
    }
    
    return false;
  };

  // ----- Funcții helper interne -----

  function findLastAnsweredQuestionIndex(test: UserTest): number {
    if (!test.selectedAnswers || test.selectedAnswers.length === 0) return -1;
    
    const lastAnsweredQuestionId = test.selectedAnswers[test.selectedAnswers.length - 1].questionId;
    return test.questions.findIndex(q => q.id === lastAnsweredQuestionId);
  }

  function findFirstUnansweredQuestionIndex(test: UserTest): number {
    if (!test.selectedAnswers || test.selectedAnswers.length === 0) return 0;
    
    // Obținem toate ID-urile de întrebări la care s-a răspuns
    const answeredQuestionIds = new Set(
      test.selectedAnswers.map(answer => answer.questionId)
    );
    
    // Găsim prima întrebare care nu este în setul de răspunsuri
    const firstUnansweredIndex = test.questions.findIndex(
      question => !answeredQuestionIds.has(question.id)
    );
    
    // Dacă toate întrebările au primit răspuns, returnăm 0, altfel returnăm indexul
    return firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0;
  }

  function isTestTimeExpired(startedAt: Date, timeLimit: number): boolean {
    const startTime = new Date(startedAt).getTime();
    const currentTime = new Date().getTime();
    const timeLimitMs = timeLimit * 60 * 1000; // Convertim minutele în milisecunde
    return (currentTime - startTime) > timeLimitMs;
  }

  // Returnăm API-ul hook-ului
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
    isQuestionAnswered,
    getAnsweredQuestionsSet,
    getQuestionStatus,
    setCurrentQuestionIndex,
  };
}