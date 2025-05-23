"use client";

import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUserTest, { Option, AdditionalData, AnswerIndicator } from "@/hooks/useUserTest";
import { Button, Card, Container, Group, LoadingOverlay, Modal, Paper, Progress, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import QuestionCard from "@/components/Test/Question/Question";
import { useTranslations } from "next-intl";
import { IconArrowLeft, IconArrowRight, IconCheck, IconClock } from "@tabler/icons-react";
import TestProgressBar from "@/components/TestProgressBar/TestProgressBar";
import classes from "./ClientTestInterface.module.css";
import { JsonObject } from "next-auth/adapters";
import { useDidUpdate, useHotkeys } from "@mantine/hooks";

export default function ClientTestInterface({ testId, codeLanguage = 'cpp' }: Readonly<{ testId: string, codeLanguage?: string }>) {
    const tErrors = useTranslations('General.Errors');
    const tGeneral = useTranslations('General');
    const t = useTranslations('Tests');

    const router = useRouter();
    const [choice, setChoice] = useState<string | string[]>();
    const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [remainingTime, setRemainingTime] = useState<string | null>(null);
    const [questionAnswered, setQuestionAnswered] = useState(false);
    const [feedback, setFeedback] = useState<{
        correct: string[],
        incorrect: string[],
        missed: string[]
    } | undefined>(undefined);

    // Initialize the test hook
    const test = useUserTest(testId);

    // Properly determine if there's a valid choice selected
    const isValidChoice = (): boolean => {
        if (!choice) return false;

        // Handle array choices (multiple choice questions)
        if (Array.isArray(choice)) {
            return choice.length > 0;
        }

        // Handle single choice
        return choice !== undefined && choice !== '';
    };

    useEffect(() => {
        // Add debug logging to help diagnose the issue
        console.log("Current test state:", {
            loading: test.loading,
            error: test.error,
            currentQuestion: test.getCurrentQuestion(),
            questionsLength: test.userTest?.questions?.length ?? 0,
            userTest: test.userTest
        });
    }, [test.loading, test.error, test.currentQuestionIndex, test.userTest]);

    const currentQuestion = test.getCurrentQuestion();

    // Ensure we handle the case when questions array might be empty or undefined
    const questionsLength = test.userTest?.questions?.length ?? 0;
    const isLastQuestion = questionsLength > 0 && test.currentQuestionIndex === questionsLength - 1;
    const showAnswers = (test.userTest?.configurations as JsonObject | undefined)?.showAnswers as boolean | undefined;
    const timeLimit = test.getTimeLimit();

    // Timer effect to update remaining time
    useEffect(() => {
        if (!timeLimit) return;

        const interval = setInterval(() => {
            const remainingSeconds = test.getRemainingTime();
            if (remainingSeconds === null) {
                setRemainingTime(null);
                return;
            }

            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            setRemainingTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

            // Auto-submit if time is up
            if (remainingSeconds <= 0) {
                clearInterval(interval);
                handleEndTest();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLimit, test.userTest]);

    // Reset state when question changes
    useEffect(() => {
        setChoice(undefined);
        setFeedback(undefined);
        setQuestionAnswered(false);
        if (test.isQuestionAnswered(currentQuestion?.id ?? '')) {
            setQuestionAnswered(true);
            setFeedback(test.getAnswerFeedback(currentQuestion?.id ?? '') ?? undefined);
        }
    }, [test.currentQuestionIndex, currentQuestion?.id]);

    // Calculate progress percentage safely
    const progressPercentage =
        test.userTest?.selectedAnswers?.length && questionsLength > 0
            ? (test.userTest.selectedAnswers.length / questionsLength) * 100
            : 0;

    // Handle navigation
    const handleNext = () => {
        test.nextQuestion();
        // Clear choice when navigating
        setChoice(undefined);
    };

    const handlePrevious = () => {
        test.previousQuestion();
        // Clear choice when navigating
        setChoice(undefined);
    };

    // Find the index of the first unanswered question
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

    // Handle going to the first unanswered question
    const handleGoToFirstUnanswered = () => {
        const firstUnansweredIndex = findFirstUnansweredIndex();
        if (firstUnansweredIndex >= 0) {
            // Use the new direct setter method
            test.setCurrentQuestionIndex(firstUnansweredIndex);
            setSubmitConfirmOpen(false);
        }
    };

    useDidUpdate(() => {
        console.log("Current choice changed:", choice);

    }, [choice]);

    // Handle submitting an answer
    const handleAnswerSubmit = async () => {
        // Only allow submission if there's a valid choice selected
        if (!currentQuestion || !isValidChoice()) return;

        setLoading(true);
        try {
            // Create properly formatted answerIds array based on question type
            let answerIds: string[];

            if (currentQuestion.type === 'singleChoice') {
                // For single choice, wrap the choice in an array if it's a string
                answerIds = typeof choice === 'string' ? [choice] : (Array.isArray(choice) && choice.length > 0 ? [choice[0]] : []);
            } else {
                // For multiple choice, ensure we have an array of strings (not characters)
                answerIds = Array.isArray(choice) ? choice : (typeof choice === 'string' ? [choice] : []);
            }

            // Additional validation to prevent undefined or invalid values
            answerIds = answerIds.filter(id => typeof id === 'string' && id.trim() !== '');

            console.log("Submitting answer IDs for question type", currentQuestion.type, ":", answerIds);

            // Don't proceed if we don't have valid answer IDs
            if (answerIds.length === 0) {
                setLoading(false);
                return;
            }

            const result = await test.submitAnswer(currentQuestion.id, answerIds);

            if (result) {
                setQuestionAnswered(true);

                if (showAnswers && 'answerFeedback' in result) {
                    setFeedback(result.answerFeedback);
                } else {
                    // If we're on the last question, show submit confirmation
                    if (isLastQuestion) {
                        if (hasAllQuestionsAnswered()) {
                            handleEndTest();
                        } else {
                            setSubmitConfirmOpen(true);
                        }
                    } else {
                        // Automatically go to next question after a short delay
                        setTimeout(() => {
                            handleNext();
                        }, 500);
                    }
                }
            } else if (test.error) {
                notifications.show({
                    title: tErrors(`${test.error}.title`),
                    message: tErrors(`${test.error}.message`),
                    color: 'red',
                });
            }
        } catch (error) {
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

    // Check if all questions have been answered
    const hasAllQuestionsAnswered = (): boolean => {
        if (!test.userTest?.questions?.length || !test.userTest?.selectedAnswers) return false;
        return test.userTest.selectedAnswers.length >= test.userTest.questions.length;
    };

    // Handle ending the test
    const handleEndTest = async () => {
        setLoading(true);
        try {
            await test.endTest();
            // Redirect to results page
            router.push(`/app/test/${testId}`);
        } catch (error) {
            console.error("Error ending test:", error);
            notifications.show({
                title: tErrors('UNKNOWN.title'),
                message: tErrors('UNKNOWN.message'),
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle next after feedback is shown
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

    // Add hotkey for submitting answers with spacebar key instead of Enter
    useHotkeys([
        ['Space', (event) => {
            // Prevent default space behavior (scrolling)
            event.preventDefault();

            // Submit answer when submit button is active
            if (!questionAnswered && isValidChoice() && !loading) {
                handleAnswerSubmit();
            }
            // Navigate to next question when "Next" button is active
            else if (questionAnswered && !isLastQuestion && !loading) {
                handleNext();
            }
            // Show submit confirmation when on last question
            else if (questionAnswered && isLastQuestion && !loading) {
                setSubmitConfirmOpen(true);
            }
            // Handle feedback flow
            else if (feedback) {
                handleNextAfterFeedback();
            }
        }],
        ['ctrl+Space', (event) => {
            // Prevent default space behavior
            event.preventDefault();

            // Alternative hotkey combination for submitting answers
            if (!questionAnswered && isValidChoice() && !loading) {
                handleAnswerSubmit();
            }
        }],
    ]);

    if (test.error) {
        return (
            <Container className={classes.container}>
                <Card withBorder shadow="sm" p="xl">
                    <Title order={3} c="red" mb="md">{tErrors(`${test.error}.title`)}</Title>
                    <Text>{tErrors(`${test.error}.message`)}</Text>
                    <Button mt="lg" onClick={() => router.push(`/app/test/${testId}`)}>
                        {tGeneral('return')}
                    </Button>
                </Card>
            </Container>
        );
    }

    // Check if we have a valid question to display
    if ((!currentQuestion || questionsLength === 0)) {
        return (
            <Container className={classes.container}>
                <LoadingOverlay visible={true} loaderProps={{ color: 'teal', type: 'dots' }} zIndex={1100} />
            </Container>
        )
    }

    return (
        <Container className={classes.container}>
            <LoadingOverlay visible={loading} loaderProps={{ color: 'teal', type: 'dots' }} zIndex={1100} />

            <Card withBorder shadow="sm" className={classes.header}>
                <Group justify="space-between" wrap="nowrap">
                    <Text fw={500} size="lg">
                        {t('question')} {test.currentQuestionIndex + 1} / {questionsLength}
                    </Text>

                    {timeLimit && (
                        <Group gap="xs">
                            <IconClock size={20} />
                            <Text>{remainingTime ?? "--:--"}</Text>
                        </Group>
                    )}
                </Group>

                <TestProgressBar
                    value={progressPercentage}
                    size={25}
                    labels={{
                        filled: { tooltip: t('answered') },
                        rest: { root: "" }
                    }}
                />
            </Card>

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
                        console.log("Choice changed:", newChoice);
                        // For multiple choice questions, ensure we're working with arrays properly
                        if (currentQuestion.type === 'multipleChoice') {
                            // Ensure newChoice is always an array for multiple choice questions
                            const adjustedChoice = Array.isArray(newChoice)
                                ? newChoice
                                : (newChoice ? [newChoice] : []);
                            setChoice(adjustedChoice);
                        } else {
                            // For single choice, keep as is
                            setChoice(newChoice);
                        }
                    }}
                />
            </ScrollArea>

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
                                onClick={isLastQuestion ? () => setSubmitConfirmOpen(true) : handleNext}
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

            {/* Confirmation modal for submitting test with unanswered questions */}
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

interface SingleCodeOption extends Omit<Option, 'code'> {
    code?: {
        language: string;
        code: string;
    };
}

function manipulateOptions(options: Option[], codeLanguage: string): SingleCodeOption[] {
    return options.map((option) => {
        // instead of a code array return a code object with language and code properties of the codeLanguage given, if the codeLanguage is not present then return the first codeLanguage
        let code = option.code.find((code) => code.language.includes(codeLanguage));
        if (code) {
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
            let { code, language } = option.code[0];
            return {
                ...option,
                code: {
                    code,
                    language: language[0]
                }
            };
        }
        const { code: cody, ...optionWithoutCode } = option;
        return optionWithoutCode;
    });
}

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


function manipulateAdditionalData(additionalData: AdditionalData, codeLanguage: string): SingleCodeAdditionalData {
    let code = additionalData.code.find((code) => code.language.includes(codeLanguage));
    let additionalDataSingleCodeExplanation = manipulateAdditionalDataExplanation(additionalData, codeLanguage);
    if (code) {
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
        let { code, language } = additionalData.code[0];
        return {
            ...additionalDataSingleCodeExplanation,
            code: {
                code,
                language: language[0]
            }
        };
    }
    return additionalDataSingleCodeExplanation;
}

function manipulateAdditionalDataExplanation(additionalData: AdditionalData, codeLanguage: string): SingleCodeAdditionalData {
    let code = additionalData.explanation?.code.find((code) => code.language.includes(codeLanguage));

    if (code) {
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
    const { code: cody, explanation, ...additionalDataWithoutCode } = additionalData;
    const { code: cody2, ...explanationWithoutCode } = explanation || {};
    return {
        ...additionalDataWithoutCode,
        explanation: explanationWithoutCode
    };
}
