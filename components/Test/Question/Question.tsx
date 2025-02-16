"use client";
import { Card, CardProps, CardSection, Group, Radio, Title, Text, Stack, Divider, Image, Flex, Checkbox } from "@mantine/core";
import classes from './Question.module.css';
import { CodeHighlight } from "@mantine/code-highlight";
import { useEffect, useState } from "react";

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

}

export default function QuestionCard({ question, options, additionalData, type, questionNumber, ...props }: Readonly<QuestionCardProps & CardProps>) {
    const [choice, setChoice] = useState<string | string[] | undefined>(undefined);
    if (!additionalData) {
        additionalData = {
            center: "Unknown",
            image: undefined,
            code: undefined
        };
    }

    useEffect(() => {
        setChoice(undefined);
    }, [question]);
    const { center, image, code } = additionalData;
    const optionCards = options.map((option, index) => {
        switch (type) {
            case 'singleChoice':
                return (
                    <Radio.Card className={classes.root} radius="xs" value={option} key={option + index}>
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
                    <Checkbox.Card className={classes.root} radius="md" value={option} key={option + index}>
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
        <Card shadow="xs" padding="lg" withBorder {...props}>
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