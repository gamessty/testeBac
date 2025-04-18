//TBD TRANSLATIONS NEEDED
'use client';
import classes from "./TestDisplay.module.css";
import { Badge, Box, Button, Card, Container, Progress, Skeleton, Title, Text, Stack, Group, ScrollArea, ActionIcon } from "@mantine/core";
import { UserActiveTest } from "@/auth";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { useIsFirstRender, useShallowEffect } from "@mantine/hooks";
import TestProgressBar from "../TestProgressBar/TestProgressBar";
import { useTranslations } from "next-intl";
import { getInitialsColor } from "@/utils";
import ReturnButton from "../ReturnButton/ReturnButton";
import { useLineClamp } from "@/hooks/useLineClamp";
import { redirect } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { IconTrash } from "@tabler/icons-react";


interface TestDisplayProps {
    testDetails?: UserActiveTest;
}

export default function TestDisplay({ testDetails }: Readonly<TestDisplayProps>) {
    const t = useTranslations('Tests');
    const router = useRouter();
    const pathname = usePathname();
    const { ref, clampedText } = useLineClamp(2);

    function capitalizeFirstLetter(val: string) {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1).toLowerCase();
    }

    useEffect(() => {
        router.prefetch(pathname + '/start');
    }, []);

    function getSubjectName(value: string | string[]) {
        if (Array.isArray(value)) {
            return value.map((val) => {
                if (val === undefined) {
                    return '...';
                }
                return t.has(`Subjects.${val.toLowerCase()}`) ? t(`Subjects.${val.toLowerCase()}`) : capitalizeFirstLetter(val);
            }).join(" | ");
        }
        return t.has(`Subjects.${value.toLowerCase()}`) ? t(`Subjects.${value.toLowerCase()}`) : capitalizeFirstLetter(value);
    }

    return (
        <Container className={classes.testDisplay}>
            <Box className={classes.testDetails}>
                <ScrollArea
                    h={"100%"}
                >
                    <ReturnButton size="xs" className={classes.returnButton} href="/app?tab=tests" />
                    <div className={classes.header}>
                        <Title size="h4" className={classes.title}>
                            test details
                        </Title>
                        <ActionIcon variant="subtle" classNames={{ icon: classes.deleteIcon }}>
                            <IconTrash size={24} />
                        </ActionIcon>
                    </div>
                    <Title size="h1" order={2} className={classes.testTitle} >
                        {(!testDetails || (testDetails && !clampedText)) && <Skeleton className={classes.skeleton} height="100%" width="40%">.................</Skeleton>}
                        <Text span lineClamp={2} inherit className={classes.testTitleText} ref={ref} display={clampedText ? undefined : 'none'}>
                            {clampedText || testDetails?.subjects ? getSubjectName((testDetails?.subjects ?? []).map(sj => sj.name?.toLowerCase())) : testDetails?.folder?.category}
                        </Text>
                        <Badge display={testDetails ? undefined : 'none'} color={getInitialsColor(testDetails?.testType)} variant="outline" size="md" className={classes.testTypeBadge}>{testDetails?.testType}</Badge>
                        <Badge display={testDetails ? undefined : 'none'} color={getInitialsColor(testDetails?.folder?.category)} variant="outline" size="md" className={classes.testTypeBadge}>{testDetails?.folder?.category}</Badge>
                    </Title>
                    <TestProgressBar
                        size={30}
                        labels={{ filled: { tooltip: 'Solved' }, rest: { root: testDetails ? testDetails.questions.length - testDetails.selectedAnswers.length + " left" : undefined } }}
                        value={testDetails ? testDetails.selectedAnswers.length / testDetails.questions.length * 100 : undefined}
                    />
                    <Card shadow="sm" className={classes.container} withBorder p="md" mt="md">
                        {(testDetails?.subjects ?? []).filter(s => s.type == 'QUESTION').length > 0 && (
                            <Stack>
                                {(testDetails?.subjects ?? []).filter(s => s.type == 'QUESTION').map(subject => {
                                    return (
                                        <div key={subject.id} className={classes.itemContainer}>
                                            <Group justify="space-between" className={classes.item}>
                                                <div className={classes.distribution}>
                                                    <Text fw={500}>{getSubjectName(subject.name)}</Text>
                                                    <Badge color="blue" variant="light">
                                                        {t('availableQuestions', { count: testDetails?.questions.filter(q => q.subjectId == subject.id).length ?? 0 })}
                                                    </Badge>
                                                </div>
                                            </Group>
                                        </div>
                                    );
                                })}
                            </Stack>
                        )}

                        {(testDetails?.chapters ?? []).length > 0 && (
                            <Stack gap={0}>
                                {testDetails?.chapters?.map(chapter => {
                                    return (
                                        <div key={chapter.id} className={classes.itemContainer}>
                                            <Group justify="space-between" className={classes.item}>
                                                <div className={classes.distribution}>
                                                    <Text fw={500}>{chapter.name}</Text>
                                                    <Badge color="green" variant="light">
                                                        {t('availableQuestions', { count: testDetails?.questions.filter(q => q.chapterId == chapter.id).length ?? 0 })}
                                                    </Badge>
                                                </div>
                                            </Group>
                                        </div>
                                    );
                                })}
                            </Stack>
                        )}
                    </Card>
                </ScrollArea>
            </Box>
            <Box className={classes.actionButtons}>
                <Button.Group className={classes.buttonGroup}>
                    <Button size="lg" onClick={() => { redirect(pathname + '/start') }}>
                        {testDetails?.selectedAnswers.length != 0 ? t('continueTest') : t('startTest')}
                    </Button>
                </Button.Group>
            </Box>
        </Container>
    );
}