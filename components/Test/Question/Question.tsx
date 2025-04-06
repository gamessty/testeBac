"use client";
import { CodeHighlight } from "@mantine/code-highlight";
import { Card, CardProps, Checkbox, Flex, Group, Image, Radio, Stack, Text, Title } from "@mantine/core";
import { HotkeyItem, useHotkeys } from "@mantine/hooks";
import { Montserrat } from "next/font/google";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { hashCode } from "../../../utils";
import classes from './Question.module.css';

const montserrat = Montserrat({ subsets: ['latin'] });

type ChoiceType = string | string[] | undefined;

interface QuestionCardProps {
    question: string,
    options: string[],
    type: 'singleChoice' | 'multipleChoice',
    additionalData?: {
        center: string,
        image?: string,
        code?: {
            code: string,
            language: string
        }
    },
    questionNumber: number,
    controlled?: {
        choice: ChoiceType,
        setChoice: Dispatch<SetStateAction<ChoiceType>>
    }
}

export default function QuestionCard({ question, options, additionalData, type, questionNumber, controlled, ...props }: Readonly<QuestionCardProps & CardProps>) {

    const hotkeys: HotkeyItem[] = options.map((option, index) => [
        String.fromCharCode(65 + index), // 'A', 'B', 'C', 'D', 'E', etc.
        () => {
            if (type === 'singleChoice') {
                setChoice(choice === option ? undefined : option);
            } else {
                setChoice((prevChoice): string[] => {
                    if (Array.isArray(prevChoice)) {
                        return prevChoice.includes(option)
                            ? prevChoice.filter((item) => item !== option)
                            : [...prevChoice, option];
                    }
                    return [option];
                });
            }
        },
        { usePhysicalKeys: true }
    ]);

    useHotkeys(hotkeys);

    const [uncontrolledChoice, setUncontrolledChoice] = useState<string | string[] | undefined>(undefined);

    const [choice, setChoice] = controlled ? [controlled.choice, controlled.setChoice] : [uncontrolledChoice, setUncontrolledChoice];

    if (!additionalData) {
        additionalData = {
            center: "Unknown",
            image: undefined,
            code: undefined
        };
    }

    useEffect(() => {
        setChoice(undefined);
    }, [question, setChoice]);

    const { center, image, code } = additionalData;

    const optionCards = options.map((option, index) => {
        switch (type) {
            case 'singleChoice':
                return (
                    <Radio.Card className={`${classes.root} ${montserrat.className}`} radius="xs" value={option} key={hashCode(option + index + Math.random())}>
                        <Group wrap="nowrap" align="flex-start">
                            <Radio.Indicator />
                            <div>
                                <Text className={classes.label}>{option}</Text>
                                {typeof option != 'string' && <Text className={classes.description}>{index}</Text>}
                            </div>
                        </Group>
                    </Radio.Card>
                );
            case 'multipleChoice':
            default:
                return (
                    <Checkbox.Card className={`${classes.root} ${montserrat.className}`} radius="xs" value={option} key={hashCode(option + index + Math.random())}>
                        <Group wrap="nowrap" align="flex-start">
                            <Checkbox.Indicator />
                            <div>
                                <Text className={classes.label}>{option}</Text>
                                {typeof option != 'string' && <Text className={classes.description}>{index}</Text>}
                            </div>
                        </Group>
                    </Checkbox.Card>
                );
        }
    });

    return (
        <Card shadow="xs" padding="lg" withBorder {...props} autoFocus>
            <Title order={3} style={{ marginBottom: 10 }}>
                {questionNumber ? questionNumber + ". " : ''}{question}
            </Title>
            {image && <Image className={classes['question-image']} src={image} alt="question image" style={{ width: '100%', marginBottom: 10 }} />}
            <Flex h="100%"
                direction={{ base: 'column', 'md': 'row' }}
                gap="md"
                align="stretch"
            >
                {code && <CodeHighlight language={code.language} code={code.code} />}
                {type === 'singleChoice' && (
                    <Radio.Group
                        style={{ flexGrow: 1 }}
                        value={choice as string | undefined}
                        onChange={setChoice}
                    >
                        <Stack pt="md" gap="xs">
                            {optionCards}
                        </Stack>
                    </Radio.Group>
                )}
                {type === 'multipleChoice' && (
                    <Checkbox.Group style={{ flexGrow: 1 }} value={choice as string[] | undefined} onChange={setChoice}>
                        <Stack pt="md" gap="xs">
                            {optionCards}
                        </Stack>
                    </Checkbox.Group>
                )}
            </Flex>
            <Text ta="center" mt="lg" size="sm" c="dimmed">
                Currently selected: {Array.isArray(choice) ? choice.join(', ') : choice}
            </Text>
        </Card>
    );
}