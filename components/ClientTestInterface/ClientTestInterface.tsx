"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserTest, { Option, AdditionalData, AnswerIndicator } from "@/hooks/useUserTest";
import { ActionIcon, Button, Card, Container, Group, LoadingOverlay, Modal, Paper, Progress, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import QuestionCard from "@/components/Test/Question/Question";
import { useTranslations } from "next-intl";
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock, IconList } from "@tabler/icons-react";
import TestProgressBar from "@/components/TestProgressBar/TestProgressBar";
import classes from "./ClientTestInterface.module.css";
import { JsonObject } from "next-auth/adapters";
import { useDidUpdate, useHotkeys, useDisclosure } from "@mantine/hooks";
import QuestionListDrawer from "@/components/QuestionListDrawer/QuestionListDrawer";
import ErrorCard from "@/components/ErrorCard/ErrorCard";

export default function ClientTestInterface({ testId, codeLanguage = 'cpp' }: Readonly<{ testId: string, codeLanguage?: string }>) {
    // Inițializăm hook-urile de traducere pentru diferitele secțiuni ale aplicației
    const tErrors = useTranslations('General.Errors');
    const tGeneral = useTranslations('General');
    const t = useTranslations('Tests');

    const router = useRouter();
    
    // Definim starea componentei
    const [choice, setChoice] = useState<string | string[]>(); // Stocăm răspunsul utilizatorului (un singur ID sau mai multe pentru întrebări cu răspunsuri multiple)
    const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false); // Controlăm vizibilitatea dialogului de confirmare la trimiterea testului
    const [loading, setLoading] = useState(false); // Indicator de încărcare pentru acțiuni asincrone
    const [remainingTime, setRemainingTime] = useState<string | null>(null); // Timpul rămas formatat ca string (MM:SS)
    const [questionAnswered, setQuestionAnswered] = useState(false); // Indicator dacă s-a răspuns la întrebarea curentă
    const [feedback, setFeedback] = useState<{
        correct: string[],
        incorrect: string[],
        missed: string[]
    } | undefined>(undefined); // Feedback pentru răspunsurile utilizatorului
    
    // Starea drawer-ului pentru lista de întrebări
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);

    // Inițializăm hook-ul personalizat care gestionează datele și logica testului
    const test = useUserTest(testId);

    // Funcție care verifică dacă utilizatorul a selectat o opțiune validă
    const isValidChoice = (): boolean => {
        if (!choice) return false;

        // Pentru întrebări cu răspunsuri multiple verificăm dacă array-ul nu este gol
        if (Array.isArray(choice)) {
            return choice.length > 0;
        }

        // Pentru întrebări cu un singur răspuns verificăm dacă există o valoare definită și non-vidă
        return choice !== undefined && choice !== '';
    };

    // Obținem întrebarea curentă din hook-ul useUserTest
    const currentQuestion = test.getCurrentQuestion();

    // Calculăm diverse date derivate din starea testului
    const questionsLength = test.userTest?.questions?.length ?? 0; // Numărul total de întrebări, cu fallback la 0
    const isLastQuestion = questionsLength > 0 && test.currentQuestionIndex === questionsLength - 1; // Verificăm dacă suntem la ultima întrebare
    const showAnswers = (test.userTest?.configurations as JsonObject | undefined)?.showAnswers as boolean | undefined; // Setarea care controlează afișarea feedback-ului după fiecare răspuns
    const timeLimit = test.getTimeLimit(); // Limita de timp a testului (în minute)

    // Configurăm timer-ul pentru a actualiza timpul rămas
    useEffect(() => {
        if (!timeLimit) return; // Nu facem nimic dacă nu există limită de timp

        const interval = setInterval(() => {
            const remainingSeconds = test.getRemainingTime();
            if (remainingSeconds === null) {
                setRemainingTime(null);
                return;
            }

            // Formatăm timpul rămas ca MM:SS cu zero-padding
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            setRemainingTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

            // Trimitem automat testul dacă timpul a expirat
            if (remainingSeconds <= 0) {
                clearInterval(interval);
                handleEndTest();
            }
        }, 1000); // Actualizăm în fiecare secundă

        // Curățăm interval-ul la demontarea componentei
        return () => clearInterval(interval);
    }, [timeLimit, test.userTest]);

    // Resetăm starea când se schimbă întrebarea
    useEffect(() => {
        setFeedback(undefined);
        setQuestionAnswered(false);
        
        // Verificăm dacă s-a răspuns deja la întrebarea curentă
        if (test.isQuestionAnswered(currentQuestion?.id ?? '')) {
            setQuestionAnswered(true);
            
            // Găsim răspunsul anterior al utilizatorului pentru această întrebare
            const previousAnswer = test.userTest?.selectedAnswers?.find(
                a => a.questionId === currentQuestion?.id
            );
            
            if (showAnswers) {
                // Dacă afișarea răspunsurilor este activată, arătăm feedback-ul
                setFeedback(test.getAnswerFeedback(currentQuestion?.id ?? '') ?? undefined);
                setChoice(undefined); // Golim selecția pentru a nu confunda utilizatorul
            } else if (previousAnswer?.answerIds) {
                // Dacă nu arătăm feedback, afișăm răspunsurile anterioare ale utilizatorului
                if (currentQuestion?.type === 'singleChoice' && previousAnswer.answerIds.length > 0) {
                    // Pentru întrebări cu un singur răspuns, luăm primul ID din array
                    setChoice(previousAnswer.answerIds[0]);
                } else {
                    // Pentru întrebări cu răspunsuri multiple, setăm întregul array
                    setChoice(previousAnswer.answerIds);
                }
            }
        } else {
            // Resetăm alegerea pentru întrebările noi
            setChoice(undefined);
        }
    }, [test.currentQuestionIndex, currentQuestion?.id, currentQuestion?.type, showAnswers, test.userTest?.selectedAnswers]);

    // Calculăm procentajul de progres pentru bara de progres
    const progressPercentage =
        test.userTest?.selectedAnswers?.length && questionsLength > 0
            ? (test.userTest.selectedAnswers.length / questionsLength) * 100
            : 0;

    // Funcții pentru navigare între întrebări
    const handleNext = () => {
        test.nextQuestion();
    };

    const handlePrevious = () => {
        test.previousQuestion();
    };

    // Găsim indexul primei întrebări fără răspuns pentru navigare rapidă
    const findFirstUnansweredIndex = (): number => {
        if (!test.userTest?.questions?.length || !test.userTest?.selectedAnswers) return 0;

        const answeredIds = new Set(
            test.userTest.selectedAnswers.map(answer => answer.questionId)
        );

        const firstUnansweredIndex = test.userTest.questions.findIndex(
            q => !answeredIds.has(q.id)
        );

        return firstUnansweredIndex === -1 ? 0 : firstUnansweredIndex;
    };

    // Navigăm la prima întrebare fără răspuns
    const handleGoToFirstUnanswered = () => {
        const firstUnansweredIndex = findFirstUnansweredIndex();
        if (firstUnansweredIndex >= 0) {
            test.setCurrentQuestionIndex(firstUnansweredIndex);
            setSubmitConfirmOpen(false);
        }
    };

    // Procesăm trimiterea unui răspuns
    const handleAnswerSubmit = async () => {
        if (!currentQuestion || !isValidChoice()) return;

        setLoading(true);
        try {
            // Formatăm răspunsul corect în funcție de tipul întrebării
            let answerIds: string[];

            if (currentQuestion.type === 'singleChoice') {
                // Pentru răspuns unic, asigurăm că avem un array cu un singur element
                answerIds = typeof choice === 'string' ? [choice] : (Array.isArray(choice) && choice.length > 0 ? [choice[0]] : []);
            } else {
                // Pentru răspunsuri multiple, asigurăm că avem un array
                answerIds = Array.isArray(choice) ? choice : (typeof choice === 'string' ? [choice] : []);
            }

            // Filtrăm valorile invalide (undefined, șiruri goale)
            answerIds = answerIds.filter(id => typeof id === 'string' && id.trim() !== '');

            // Nu continuăm dacă nu avem răspunsuri valide
            if (answerIds.length === 0) {
                setLoading(false);
                return;
            }

            // Trimitem răspunsul la server
            const result = await test.submitAnswer(currentQuestion.id, answerIds);

            if (result) {
                setQuestionAnswered(true);

                if (showAnswers && 'answerFeedback' in result) {
                    // Afișăm feedback-ul dacă este activat
                    setFeedback(result.answerFeedback);
                } else {
                    // Altfel, trecem la următoarea întrebare sau finalizăm testul
                    setFeedback(undefined);
                    
                    if (isLastQuestion) {
                        if (hasAllQuestionsAnswered()) {
                            handleEndTest();
                        } else {
                            setSubmitConfirmOpen(true);
                        }
                    } else {
                        // Trecem automat la următoarea întrebare după o scurtă întârziere
                        setTimeout(() => {
                            handleNext();
                        }, 500);
                    }
                }
            } else if (test.error) {
                // Verificăm dacă avem o traducere pentru codul de eroare și afișăm notificarea corespunzătoare
                const errorExists = tErrors.has(`${test.error}.title`);
                notifications.show({
                    title: errorExists ? tErrors(`${test.error}.title`) : tErrors('UNKNOWN.title'),
                    message: errorExists ? tErrors(`${test.error}.message`) : tErrors('UNKNOWN.message'),
                    color: 'red',
                });
            }
        } catch (error) {
            // Gestionăm erorile neașteptate
            console.error("Error submitting answer:", error);
            notifications.show({
                title: tErrors('UNKNOWN.title'),
                message: tErrors('UNKNOWN.message'),
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    // Verificăm dacă toate întrebările au primit răspuns
    const hasAllQuestionsAnswered = (): boolean => {
        if (!test.userTest?.questions?.length || !test.userTest?.selectedAnswers) return false;
        
        // Creăm un set cu ID-urile întrebărilor la care s-a răspuns
        const answeredIds = new Set(
            test.userTest.selectedAnswers.map(answer => answer.questionId)
        );
        
        // Verificăm dacă toate întrebările au răspuns
        return test.userTest.questions.every(question => answeredIds.has(question.id));
    };

    // Încheiem testul și redirecționăm utilizatorul la rezultate
    const handleEndTest = async () => {
        setLoading(true);
        try {
            const allAnswered = hasAllQuestionsAnswered();
            
            // Înregistrăm metrice pentru depanare dacă nu toate întrebările au primit răspuns
            if (!allAnswered) {
                console.warn('Terminare test cu întrebări fără răspuns:', {
                    totalQuestions: test.userTest?.questions?.length,
                    answeredQuestions: test.userTest?.selectedAnswers?.length,
                });
            }
            
            await test.endTest();
            router.push(`/app/test/${testId}`);
        } catch (error) {
            notifications.show({
                title: tErrors('UNKNOWN.title'),
                message: tErrors('UNKNOWN.message'),
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    // Gestionăm pasul următor după afișarea feedback-ului
    const handleNextAfterFeedback = () => {
        setFeedback(undefined);
        if (isLastQuestion) {
            if (hasAllQuestionsAnswered()) {
                handleEndTest();
            } else {
                setSubmitConfirmOpen(true);
            }
        } else {
            handleNext();
        }
    };

    // Gestionăm trimiterea testului cu verificarea completării tuturor întrebărilor
    const handleSubmitTest = () => {
        if (!hasAllQuestionsAnswered()) {
            setSubmitConfirmOpen(true);
        } else {
            handleEndTest();
        }
    };

    // Configurăm hotkey-uri pentru navigare rapidă și trimitere răspunsuri
    useHotkeys([
        ['Space', (event) => {
            event.preventDefault(); // Prevenim scroll-ul implicit

            // Implementăm comportamente diferite în funcție de starea curentă
            if (!questionAnswered && isValidChoice() && !loading) {
                // Trimitem răspunsul când nu s-a răspuns încă și avem o alegere validă
                handleAnswerSubmit();
            }
            else if (questionAnswered && !isLastQuestion && !loading) {
                // Mergem la următoarea întrebare dacă s-a răspuns deja și nu suntem la ultima întrebare
                handleNext();
            }
            else if (questionAnswered && isLastQuestion && !loading) {
                // Arătăm dialogul de confirmare dacă suntem la ultima întrebare
                setSubmitConfirmOpen(true);
            }
            else if (feedback) {
                // Gestionăm navigarea după afișarea feedback-ului
                handleNextAfterFeedback();
            }
        }],
        ['ctrl+Space', (event) => {
            event.preventDefault();

            // Combinație alternativă pentru trimiterea răspunsurilor
            if (!questionAnswered && isValidChoice() && !loading) {
                handleAnswerSubmit();
            }
        }],
    ]);

    // Gestionăm navigarea prin lista de întrebări din drawer
    const handleQuestionSelect = (index: number) => {
        // Închidem drawer-ul imediat pentru o experiență mai fluidă
        closeDrawer();
        // Adăugăm o mică întârziere pentru a preveni flicker-ul în timpul animației
        setTimeout(() => {
            test.setCurrentQuestionIndex(index);
        }, 50);
    };

    // Afișăm un card de eroare dacă apare o eroare în timpul inițializării testului
    if (test.error) {
        // Verificăm dacă avem o traducere pentru codul de eroare
        const errorExists = tErrors.has(`${test.error}.title`);
        return (
            <Container className={classes.container}>
                <ErrorCard
                    title={errorExists ? tErrors(`${test.error}.title`) : tErrors('UNKNOWN.title')}
                    description={errorExists ? tErrors(`${test.error}.message`) : tErrors('UNKNOWN.message')}
                    errorCode={test.error}
                    primaryButtonText={tGeneral('return')}
                    onPrimaryButtonClick={() => router.push(`/app/test/${testId}`)}
                />
            </Container>
        );
    }

    // Afișăm un indicator de încărcare dacă nu avem întrebări disponibile încă
    if ((!currentQuestion || questionsLength === 0)) {
        return (
            <Container className={classes.container}>
                <LoadingOverlay visible={true} loaderProps={{ color: 'teal', type: 'dots' }} zIndex={1100} />
            </Container>
        )
    }

    // Renderizăm interfața principală a testului
    return (
        <Container className={classes.container}>
            {/* Indicator de încărcare pentru acțiuni asincrone */}
            <LoadingOverlay visible={loading} loaderProps={{ color: 'teal', type: 'dots' }} zIndex={1100} />

            {/* Header cu informații despre test și controale */}
            <Card withBorder shadow="sm" className={classes.header}>
                <Group justify="space-between" wrap="nowrap" mb="xs">
                    <Group gap="xs">
                        <Text fw={500} size="lg">
                            {t('question')} {test.currentQuestionIndex + 1} / {questionsLength}
                        </Text>
                    </Group>

                    <Group gap="md">
                        {/* Afișăm timer-ul doar dacă există limită de timp */}
                        {timeLimit && (
                            <Group gap="xs">
                                <IconClock size={20} />
                                <Text>{remainingTime ?? "--:--"}</Text>
                            </Group>
                        )}
                        {/* Buton pentru finalizarea testului */}
                        <Button 
                            variant="subtle"
                            color="red" 
                            onClick={() => setSubmitConfirmOpen(true)}
                            size="sm"
                            leftSection={<IconCheck size={16} />}
                            className={classes.finishButton}
                        >
                            {t('finishTest')}
                        </Button>
                        {/* Buton pentru deschiderea listei de întrebări */}
                        <ActionIcon
                            size="lg"
                            variant="subtle" 
                            onClick={openDrawer} 
                            title={t('questionList') || "Question List"}
                        >
                            <IconList size={20} />
                        </ActionIcon>
                    </Group>
                </Group>

                {/* Bară de progres pentru vizualizarea întrebărilor răspunse */}
                <TestProgressBar
                    value={progressPercentage}
                    size={25}
                    labels={{
                        filled: { tooltip: t('answered') },
                        rest: { root: "" }
                    }}
                />
            </Card>
            
            {/* Drawer cu lista întrebărilor pentru navigare rapidă */}
            <QuestionListDrawer
                opened={drawerOpened}
                onClose={closeDrawer}
                questions={test.userTest?.questions || []}
                currentQuestionIndex={test.currentQuestionIndex}
                answeredQuestionIds={test.getAnsweredQuestionsSet()}
                onQuestionSelect={handleQuestionSelect}
                onFinishTest={() => {
                    closeDrawer();
                    setTimeout(() => {
                        setSubmitConfirmOpen(true);
                    }, 50);
                }}
            />

            {/* Zona principală cu întrebarea curentă */}
            <ScrollArea className={classes.questionCard} mt="md">
                <QuestionCard
                    question={currentQuestion.question}
                    options={manipulateOptions(currentQuestion.options, codeLanguage)}
                    type={currentQuestion.type === 'singleChoice' ? 'singleChoice' : 'multipleChoice'}
                    additionalData={manipulateAdditionalData(currentQuestion.additionalData, codeLanguage)}
                    questionNumber={test.currentQuestionIndex + 1}
                    feedback={feedback}
                    answered={questionAnswered}
                    value={choice}
                    onChange={(newChoice) => {
                        // Procesăm alegerea în funcție de tipul întrebării
                        if (currentQuestion.type === 'multipleChoice') {
                            // Pentru întrebări cu răspunsuri multiple, asigurăm că avem un array
                            const adjustedChoice = Array.isArray(newChoice)
                                ? newChoice
                                : (newChoice ? [newChoice] : []);
                            setChoice(adjustedChoice);
                        } else {
                            // Pentru răspuns unic, stocăm valoarea direct
                            setChoice(newChoice);
                        }
                    }}
                />
            </ScrollArea>

            {/* Controale pentru navigare și trimitere răspunsuri */}
            <Group justify="space-between" mt="lg" className={classes.controls}>
                <Group gap="xs" className={classes.navigationButtons}>
                    <Button
                        variant="subtle"
                        leftSection={<IconArrowLeft />}
                        onClick={handlePrevious}
                        disabled={test.currentQuestionIndex === 0}
                    >
                        {t('previous')}
                    </Button>

                    <Button
                        variant="subtle"
                        leftSection={<IconCheck />}
                        onClick={handleGoToFirstUnanswered}
                        disabled={hasAllQuestionsAnswered() || test.currentQuestionIndex === findFirstUnansweredIndex()}
                    >
                        {t('firstUnanswered')}
                    </Button>
                </Group>

                {/* Afișăm butoane diferite în funcție de stare */}
                {feedback ? (
                    <Button
                        color="blue"
                        rightSection={<IconArrowRight />}
                        onClick={handleNextAfterFeedback}
                    >
                        {isLastQuestion ? t('finishTest') : t('next')}
                    </Button>
                ) :
                    (<Fragment>
                        {questionAnswered && (
                            <Button
                                color="blue"
                                rightSection={<IconArrowRight />}
                                onClick={isLastQuestion ? () => handleSubmitTest() : handleNext}
                                disabled={loading}
                            >
                                {isLastQuestion ? t('finishTest') : t('next')}
                            </Button>
                        )}
                        {!questionAnswered &&
                            <Button
                                color="green"
                                onClick={handleAnswerSubmit}
                                disabled={!isValidChoice() || loading}
                            >
                                {t('submitAnswer')}
                            </Button>
                        }
                    </Fragment>)}
            </Group>

            {/* Modal de confirmare pentru trimiterea testului cu întrebări nefinalizate */}
            <Modal
                opened={submitConfirmOpen}
                onClose={() => setSubmitConfirmOpen(false)}
                title={t('submitConfirmation.title')}
                centered
            >
                <Stack>
                    <Text>{t('submitConfirmation.message')}</Text>
                    <Group justify="space-between" mt="md">
                        <Button variant="outline" onClick={handleGoToFirstUnanswered}>
                            {t('submitConfirmation.goToUnanswered')}
                        </Button>
                        <Button color="red" onClick={handleEndTest}>
                            {t('submitConfirmation.submit')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}

// Interfață pentru opțiuni cu cod manipulat (un singur obiect de cod în loc de array)
interface SingleCodeOption extends Omit<Option, 'code'> {
    code?: {
        language: string;
        code: string;
    };
}

// Transformăm array-ul de coduri în opțiuni într-un singur obiect de cod în funcție de limba preferată
function manipulateOptions(options: Option[], codeLanguage: string): SingleCodeOption[] {
    return options.map((option) => {
        // Căutăm codul în limba preferată
        let code = option.code.find((code) => code.language.includes(codeLanguage));
        if (code) {
            // Dacă am găsit codul în limba preferată, îl folosim
            let { code: cody } = code;
            return {
                ...option,
                code: {
                    code: cody,
                    language: codeLanguage
                }
            };
        }
        else if (option.code.length > 0) {
            // Dacă nu găsim codul în limba preferată, folosim primul cod disponibil
            let { code, language } = option.code[0];
            return {
                ...option,
                code: {
                    code,
                    language: language[0]
                }
            };
        }
        // Dacă nu există cod, returnăm opțiunea fără proprietatea code
        const { code: cody, ...optionWithoutCode } = option;
        return optionWithoutCode;
    });
}

// Interfețe pentru date adiționale cu cod simplificat
interface SingleCodeAdditionalData extends Omit<AdditionalData, 'code' | 'explanation'> {
    code?: {
        language: string;
        code: string;
    };
    explanation?: SingleCodeAnswerIndicator
}

interface SingleCodeAnswerIndicator extends Omit<AnswerIndicator, 'code'> {
    code?: {
        language: string;
        code: string;
    };
}

// Transformăm array-ul de coduri în date adiționale într-un singur obiect de cod
function manipulateAdditionalData(additionalData: AdditionalData, codeLanguage: string): SingleCodeAdditionalData {
    // Manipulăm mai întâi explicația pentru a evita duplicarea codului
    let additionalDataSingleCodeExplanation = manipulateAdditionalDataExplanation(additionalData, codeLanguage);
    
    // Căutăm codul în limba preferată
    let code = additionalData.code.find((code) => code.language.includes(codeLanguage));
    if (code) {
        // Dacă am găsit codul în limba preferată, îl folosim
        let { code: cody } = code;
        return {
            ...additionalDataSingleCodeExplanation,
            code: {
                code: cody,
                language: codeLanguage
            }
        };
    }
    else if (additionalData.code.length > 0) {
        // Dacă nu găsim codul în limba preferată, folosim primul cod disponibil
        let { code, language } = additionalData.code[0];
        return {
            ...additionalDataSingleCodeExplanation,
            code: {
                code,
                language: language[0]
            }
        };
    }
    // Dacă nu există cod, returnăm doar datele adiționale procesate anterior
    return additionalDataSingleCodeExplanation;
}

// Manipulăm explicația din datele adiționale pentru a simplifica codul
function manipulateAdditionalDataExplanation(additionalData: AdditionalData, codeLanguage: string): SingleCodeAdditionalData {
    // Căutăm codul din explicație în limba preferată
    let code = additionalData.explanation?.code.find((code) => code.language.includes(codeLanguage));

    if (code) {
        // Dacă am găsit codul în limba preferată, îl folosim
        let { code: cody } = code;
        return {
            ...additionalData,
            code: undefined,
            explanation: {
                ...additionalData.explanation,
                code: {
                    code: cody,
                    language: codeLanguage
                }
            }
        };
    }
    else if (additionalData.explanation?.code && additionalData.explanation?.code.length > 0) {
        // Dacă nu găsim codul în limba preferată, folosim primul cod disponibil
        let { code, language } = (additionalData.explanation?.code ?? [])[0] || {};
        return {
            ...additionalData,
            code: undefined,
            explanation: {
                ...additionalData.explanation,
                code: {
                    code,
                    language: language[0]
                }
            }
        };
    }
    // Dacă nu există cod în explicație, returnăm datele adiționale fără proprietățile code
    const { code: cody, explanation, ...additionalDataWithoutCode } = additionalData;
    const { code: cody2, ...explanationWithoutCode } = explanation || {};
    return {
        ...additionalDataWithoutCode,
        explanation: explanationWithoutCode
    };
}
