"use client";

import { Question } from "@/hooks/useUserTest";
import { Drawer, Text, Box, Group, ActionIcon, Badge, Stack, Button, ScrollArea, ScrollAreaAutosize } from "@mantine/core";
import { useTranslations } from "next-intl";
import { IconCheck, IconX } from "@tabler/icons-react";
import classes from "./QuestionListDrawer.module.css";

interface QuestionListDrawerProps {
    opened: boolean;
    onClose: () => void;
    questions: Question[];
    currentQuestionIndex: number;
    answeredQuestionIds: Set<string>;
    onQuestionSelect: (index: number) => void;
    onFinishTest?: () => void; // Add new prop for finish test handler
}

export default function QuestionListDrawer({
    opened,
    onClose,
    questions,
    currentQuestionIndex,
    answeredQuestionIds,
    onQuestionSelect,
    onFinishTest,
}: Readonly<QuestionListDrawerProps>) {
    const t = useTranslations('Tests');

    const handleQuestionClick = (index: number) => {
        onQuestionSelect(index);
        onClose();
    };

    // Calculate how many questions are answered
    const answeredCount = answeredQuestionIds.size;
    const totalQuestions = questions.length;

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            position="bottom"
            size="70%"
            overlayProps={{ backgroundOpacity: 0.5, blur: 2 }}
            withCloseButton={false}
            transitionProps={{ duration: 200 }} // Add faster transition
            closeOnEscape={true}
            closeOnClickOutside={true}
            classNames={{
                header: classes.drawerHeader,
                body: classes.drawerBody,
                content: classes.drawerContent,
                inner: classes.drawerInner,
                title: classes.drawerTitle,
            }}
            title={
                <Group justify="space-between" style={{ width: '100%' }} wrap="nowrap">
                    <Text fw={500}>{t('questionList')}</Text>
                    <Button
                        variant="subtle"
                        hiddenFrom="md"
                        size="xs"
                        color="red"
                        leftSection={<IconCheck size={14} />}
                        onClick={onFinishTest}
                    >
                        {t('finishTest')}
                    </Button>
                </Group>
            }
        >
            <Box className={classes.closeButtonContainer}>
                <ActionIcon onClick={onClose} variant="subtle" radius="xl" size="lg">
                    <IconX size="1.5rem" />
                </ActionIcon>
            </Box>

            <Text size="sm" c="dimmed" className={classes.progressIndicator}>
                {answeredCount}/{totalQuestions} {t('answered')}
            </Text>

            <Stack className={classes.questionsContainer} gap={0}>
                {questions.map((question, index) => {
                    const isAnswered = answeredQuestionIds.has(question.id);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                        <Box
                            key={question.id}
                            onClick={() => handleQuestionClick(index)}
                            className={classes.questionItem}
                            data-answered={isAnswered}
                            data-current={isCurrent}
                        >
                            <Group gap="sm" align="center" wrap="nowrap">
                                <Text 
                                    c={isAnswered ? "dimmed" : "white"} 
                                    fw={500}
                                    className={classes.questionIndex}
                                >
                                    {index + 1}
                                </Text>
                                <Text
                                    lineClamp={2} 
                                    fw={isCurrent ? 600 : 400}
                                    size="sm"
                                    className={classes.questionText}
                                    c={isAnswered ? "dimmed" : "white" }
                                >
                                    {question.question}
                                </Text>
                            </Group>
                        </Box>
                    );
                })}
            </Stack>
        </Drawer>
    );
}
