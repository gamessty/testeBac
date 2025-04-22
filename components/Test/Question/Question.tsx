"use client";
import { CodeHighlight } from "@mantine/code-highlight";
import { Card, CardProps, Checkbox, Flex, Group, Image, Radio, Stack, Text, Title } from "@mantine/core";
import { HotkeyItem, useHotkeys } from "@mantine/hooks";
import { Montserrat } from "next/font/google";
import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import classes from './Question.module.css';
import { IconCheck, IconX } from "@tabler/icons-react";

const montserrat = Montserrat({ subsets: ['latin'] });

type ChoiceType = string | string[] | undefined;

interface QuestionCardProps {
    question: string,
    options: {
        id: string,
        option: string,
        image?: string | null,
        code?: { language: string, code: string },
        isCorrect?: boolean,
        localization?: { locale: string, text: string }[]
    }[],
    type: 'singleChoice' | 'multipleChoice',
    additionalData?: {
        image?: string | null,
        code?: { language: string, code: string },
        explanation?: {
            code?: { language: string, code: string },
            markdown?: string | null
        },
        localization?: { locale: string, text: string }[]
    },
    questionNumber: number,
    feedback?: {
        correct: string[],
        incorrect: string[],
        missed: string[],
    },
    answered?: boolean,
    value?: ChoiceType,
    onChange?: (value: ChoiceType) => void
}

export default function QuestionCard({
    question,
    options,
    type,
    additionalData,
    questionNumber,
    feedback,
    answered = false,
    value,
    onChange,
    ...props
}: Readonly<QuestionCardProps & CardProps>) {
    const t = useTranslations('General');

    const [internalValue, setInternalValue] = useState<string | string[] | undefined>(value);

    useEffect(() => {
        setInternalValue(value);
    }, [value, question]);

    const handleChange = useCallback((val: string | string[]) => {
        setInternalValue(val);

        if (type === 'multipleChoice' && Array.isArray(val)) {
            onChange?.(val.slice());
        } else {
            onChange?.(val);
        }
    }, [onChange, type]);

    useEffect(() => {
        return () => {
            setInternalValue(undefined);
        };
    }, [question]);

    const hotkeys: HotkeyItem[] = options.map((option, index) => [
        String.fromCharCode(65 + index),
        () => {
            if (answered) return;

            if (type === 'singleChoice') {
                handleChange(internalValue === option.id ? '' : option.id);
            } else {
                const newChoice = Array.isArray(internalValue) ? internalValue : [];
                if (newChoice.includes(option.id)) {
                    handleChange(newChoice.filter(item => item !== option.id));
                } else {
                    handleChange([...newChoice, option.id]);
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

    const getOptionStatus = (optionId: string): string | undefined => {
        if (!feedback) return undefined;

        if (feedback.correct.includes(optionId)) return 'correct';
        if (feedback.incorrect.includes(optionId)) return 'incorrect';
        if (feedback.missed.includes(optionId)) return 'missed';

        return undefined;
    };

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

    const isChecked = (optionId: string): boolean | undefined => {
        if (feedback) {
            return feedback.correct.includes(optionId) ||
                feedback.incorrect.includes(optionId) ||
                feedback.missed.includes(optionId);
        }

        if (Array.isArray(internalValue)) {
            return internalValue.includes(optionId);
        }

        return internalValue === optionId;
    };

    const isSingleChoice = type === 'singleChoice';

    const codeToDisplay = additionalData.code;

    const optionCards = options.map((option) => {
        const optionStatus = feedback ? getOptionStatus(option.id) : undefined;
        const OptionComponent = isSingleChoice ? Radio.Card : Checkbox.Card;

        const optionCode = option.code;

        return (
            <OptionComponent
                className={`${classes.root} ${montserrat.className}`}
                value={option.id}
                key={'option-' + option.id}
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
            key={`question-${questionNumber}`}
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
                        value={internalValue as string | undefined}
                        onChange={handleChange as (val: string) => void}
                        id={`question-options-${questionNumber}`}
                    >
                        <Stack gap="0">
                            {optionCards}
                        </Stack>
                    </Radio.Group>
                ) : (
                    <Checkbox.Group
                        style={{ flexGrow: 1 }}
                        value={internalValue as string[] | undefined}
                        onChange={handleChange as (val: string[]) => void}
                        id={`question-options-${questionNumber}`}
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