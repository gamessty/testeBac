"use client";
import { CodeHighlight } from "@mantine/code-highlight";
import { Card, CardProps, Checkbox, Flex, Group, Image, Radio, Stack, Text, Title } from "@mantine/core";
import { HotkeyItem, useHotkeys, useUncontrolled } from "@mantine/hooks";
import { Montserrat } from "next/font/google";
import { hashCode } from "../../../utils";
import classes from './Question.module.css';
import { IconCheck, IconCircle, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

const montserrat = Montserrat({ subsets: ['latin'] });

type ChoiceType = string | string[] | undefined;

interface QuestionCardProps {
    question: string,
    options: {
        id: string,
        option: string,
        image?: string | null,
        code?: { language: string, code: string }, // Updated: language is a string, not an array
        isCorrect?: boolean,
        localization?: { locale: string, text: string }[]
    }[],
    type: 'singleChoice' | 'multipleChoice', 
    additionalData?: {
        image?: string | null,
        code?: { language: string, code: string }, // Updated: language is a string, not an array
        explanation?: { 
            code?: { language: string, code: string }, // Updated: language is a string, not an array
            markdown?: string | null
        },
        localization?: { locale: string, text: string }[]
    },
    questionNumber: number,
    feedback?: {
        correct: string[],    // Options correctly chosen
        incorrect: string[],  // Options incorrectly chosen
        missed: string[],     // Correct options that user failed to select (missed opportunities)
    },
    answered?: boolean,
    value?: ChoiceType,
    defaultValue?: ChoiceType,
    onChange?: (value: ChoiceType) => void
}

export default function QuestionCard({ 
    question, 
    options, 
    additionalData, 
    type, 
    questionNumber, 
    feedback,
    answered = false,
    value,
    defaultValue,
    onChange,
    ...props 
}: Readonly<QuestionCardProps & CardProps>) {
    const t = useTranslations('General');

    // Use the useUncontrolled hook to handle both controlled and uncontrolled states
    const [choice, setChoice] = useUncontrolled({
        value,
        defaultValue,
        finalValue: type === 'singleChoice' ? undefined : [], // Default to empty array for multiple choice
        onChange,
    });

    // Create hotkeys for keyboard navigation (A, B, C, D, etc.)
    const hotkeys: HotkeyItem[] = options.map((option, index) => [
        String.fromCharCode(65 + index), // 'A', 'B', 'C', 'D', 'E', etc.
        () => {
            if (answered) return; // Don't allow changes if already answered
            
            const isSingleChoice = type === 'singleChoice';
            
            if (isSingleChoice) {
                setChoice(choice === option.id ? '' : option.id);
            } else {
                // Multiple choice handling
                const newChoice = Array.isArray(choice) 
                    ? choice 
                    : []; // Initialize as empty array if not already an array
                
                if (newChoice.includes(option.id)) {
                    // Remove option if already selected
                    setChoice(newChoice.filter(item => item !== option.id));
                } else {
                    // Add option if not already selected
                    setChoice([...newChoice, option.id]);
                }
            }
        },
        { usePhysicalKeys: true }
    ]);

    useHotkeys(hotkeys);

    additionalData ??= {
        image: undefined,
        code: undefined
    };

    // Determine option status based on feedback (if available)
    const getOptionStatus = (optionId: string): string | undefined => {
        if (!feedback) return undefined;
        
        if (feedback.correct.includes(optionId)) return 'correct';
        if (feedback.incorrect.includes(optionId)) return 'incorrect';
        if (feedback.missed.includes(optionId)) return 'missed';
        
        return undefined;
    };

    // Get appropriate icon based on option status
    const getStatusIcon = (status: string | undefined) => {
        switch (status) {
            case 'missed':
            case 'correct':
                return IconCheck;
            case 'incorrect':
                return IconX;
            default:
                return IconCheck;
        }
    };

    // Check if option should be marked as checked
    const isChecked = (optionId: string): boolean | undefined => {
        if (feedback) {
            // Only mark as checked if user actually selected this option
            // Don't include missed options (which were correct but not selected)
            return feedback.correct.includes(optionId) || 
                  feedback.incorrect.includes(optionId) ||
                  feedback.missed.includes(optionId);
        }
        
        if (Array.isArray(choice)) {
            return choice.includes(optionId);
        }
        
        return choice === optionId;
    };

    // Determine if the question is a single-choice type
    const isSingleChoice = type === 'singleChoice';

    // Get the first code block for display if available
    const codeToDisplay = additionalData.code

    // Create option cards
    const optionCards = options.map((option, index) => {
        const optionStatus = feedback ? getOptionStatus(option.id) : undefined;
        const OptionComponent = isSingleChoice ? Radio.Card : Checkbox.Card;
        
        // Determine if this option has code to display
        const optionCode = option.code
        
        return (
            <OptionComponent 
                className={`${classes.root} ${montserrat.className}`}
                value={option.id}
                key={option.id}
                data-status={optionStatus}
                disabled={answered}
            >
                <Group wrap="nowrap" align="flex-start">
                    {isSingleChoice ? (
                        <Radio.Indicator 
                            icon={getStatusIcon(optionStatus)} 
                            checked={isChecked(option.id)} 
                            classNames={{ indicator: classes.indicator }}
                        />
                    ) : (
                        <Checkbox.Indicator 
                            icon={getStatusIcon(optionStatus)} 
                            checked={isChecked(option.id)} 
                            classNames={{ indicator: classes.indicator }}
                        />
                    )}
                    <div style={{ width: '100%' }}>
                        <Text className={classes.label}>{option.option}</Text>
                        {option.image && (
                            <Image 
                                src={option.image} 
                                alt="option image" 
                                className={classes['question-image']} 
                                style={{ marginTop: 10 }}
                            />
                        )}
                        {optionCode && (
                            <CodeHighlight 
                                language={optionCode.language}
                                copyLabel={t('copyLabel')} 
                                copiedLabel={t('copiedLabel')} 
                                code={optionCode.code} 
                                classNames={{ copy: classes['copy-code'] }}
                                mt={10}
                            />
                        )}
                    </div>
                </Group>
            </OptionComponent>
        );
    });

    return (
        <Card 
            shadow="xs" 
            padding="lg" 
            withBorder 
            {...props} 
            autoFocus 
            data-question 
            data-answered={answered ? "true" : "false"}
            className={classes.questionCard}
        >
            <Title order={4} style={{ marginBottom: 10 }} className={classes['title']}>
                {questionNumber ? questionNumber + ". " : ''}{question}
            </Title>
            {additionalData?.image && (
                <Image 
                    className={classes['question-image']} 
                    src={additionalData.image} 
                    alt="question image" 
                    style={{ width: '100%', marginBottom: 10 }} 
                />
            )}
            <Flex h="100%"
                direction={{ base: 'column', 'md': 'row' }}
                gap="md"
                align="stretch"
            >
                {codeToDisplay && (
                    <CodeHighlight 
                        language={codeToDisplay.language}
                        copyLabel={t('copyLabel')} 
                        copiedLabel={t('copiedLabel')} 
                        code={codeToDisplay.code} 
                        classNames={{ root: classes["copy-root"], copy: classes['copy-code'] }}
                    />
                )}
                
                {isSingleChoice ? (
                    <Radio.Group
                        style={{ flexGrow: 1 }}
                        value={choice as string | undefined}
                        onChange={!answered ? setChoice : undefined}
                    >
                        <Stack gap="0">
                            {optionCards}
                        </Stack>
                    </Radio.Group>
                ) : (
                    <Checkbox.Group 
                        style={{ flexGrow: 1 }} 
                        value={choice as string[] | undefined} 
                        onChange={!answered ? setChoice : undefined}
                    >
                        <Stack gap="0">
                            {optionCards}
                        </Stack>
                    </Checkbox.Group>
                )}
            </Flex>
            
            {feedback && (additionalData?.explanation?.markdown || additionalData.explanation?.code) && (
                <Card mt="md" withBorder p="sm" radius="sm" bg="rgba(0,0,0,0.03)" className={classes['explanation']}>
                    <Title order={5} mb="xs">{t('explanation')}</Title>
                    <Text size="sm">{additionalData.explanation.markdown}</Text>
                    {additionalData.explanation.code && (
                        <CodeHighlight 
                            language={additionalData.explanation.code.language}
                            code={additionalData.explanation.code.code}
                            copyLabel={t('copyLabel')} 
                            copiedLabel={t('copiedLabel')}
                            mt="xs"
                        />
                    )}
                </Card>
            )}
        </Card>
    );
}