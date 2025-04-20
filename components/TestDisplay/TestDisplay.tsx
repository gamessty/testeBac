//TBD TRANSLATIONS NEEDED
'use client';
import classes from "./TestDisplay.module.css";
import { Badge, Box, Button, Card, Container, Progress, Skeleton, Title, Text, Stack, Group, ScrollArea, ActionIcon, LoadingOverlay } from "@mantine/core";
import { UserActiveTest } from "@/auth";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useIsFirstRender, useShallowEffect } from "@mantine/hooks";
import TestProgressBar from "../TestProgressBar/TestProgressBar";
import { useTranslations } from "next-intl";
import { getInitialsColor } from "@/utils";
import ReturnButton from "../ReturnButton/ReturnButton";
import { useLineClamp } from "@/hooks/useLineClamp";
import { redirect } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";
import { IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import deleteUserTest from "@/actions/PrismaFunctions/test/deleteUserTest";

interface TestDisplayProps {
    testDetails?: UserActiveTest;
}

export default function TestDisplay({ testDetails }: Readonly<TestDisplayProps>) {
    const tErrors = useTranslations('General.Errors');
    const t = useTranslations('Tests');

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
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

    function isValidDate(startedAt: Date | null | undefined) {
        return startedAt instanceof Date && !isNaN(startedAt.getTime());
    }

    function handleStartTest() {
        setLoading(true);
        setTimeout(() => {
            router.push(pathname + '/start');
        }, 1000);
    }

    const handleDeleteTest = async () => {
        if (!testDetails?.id) return;

        setDeleting(true);
        try {
            const result = await deleteUserTest({ userTestId: testDetails.id });

            if ('success' in result) {
                notifications.show({
                    title: t('testDeleted'),
                    message: t.rich('testDeletedMessage', {
                        testName: (testDetails?.subjects ? getSubjectName((testDetails?.subjects ?? []).map(sj => sj.name?.toLowerCase())) : testDetails?.folder?.category) ?? '...',
                        b: (chunks) => <b>{chunks}</b>
                    }),
                    color: 'green',
                    autoClose: 2000,
                });
                router.push('/app?tab=tests');
            } else {
                notifications.show({
                    title: tErrors(`${result.message}.title`),
                    message: tErrors(`${result.message}.message`),
                    color: 'red',
                    autoClose: 4000,
                });
            }
        } catch (error) {
            console.error(error);
            notifications.show({
                title: tErrors('UNKNOWN.title'),
                message: tErrors('UNKNOWN.message'),
                color: 'red',
                autoClose: 4000,
            });
        } finally {
            setDeleting(false);
        }
    };

    const openModal = () => modals.openConfirmModal({
        title: t('confirmDeleteTest.title'),
        children: (
            <Text>
                {
                    t.rich('confirmDeleteTest.message', {
                        testName: (testDetails?.subjects ? getSubjectName((testDetails?.subjects ?? []).map(sj => sj.name?.toLowerCase())) : testDetails?.folder?.category) ?? '...',
                        b: (chunks) => <b>{chunks}</b>
                    })
                }
            </Text>
        ),
        labels: { confirm: t('delete'), cancel: t('cancel') },
        confirmProps: { color: 'red', loading: deleting },
        onConfirm: () => { handleDeleteTest() },
    });

    return (
        <Container className={classes.testDisplay}>
            <LoadingOverlay visible={loading || deleting} loaderProps={{ type: "dots", color: 'teal' }} zIndex={1000}/>
            <Box className={classes.testDetails}>
                <ScrollArea
                    h={"100%"}
                >
                    <ReturnButton size="xs" className={classes.returnButton} href="/app?tab=tests" />
                    <div className={classes.header}>
                        <Title size="h4" className={classes.title}>
                            {t('details')}
                        </Title>
                        <ActionIcon variant="subtle" size="lg" classNames={{ icon: classes.deleteIcon }} onClick={openModal}>
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
                    <Button size="lg" onClick={handleStartTest} loading={loading} disabled={!!(testDetails?.finishedAt && isValidDate(testDetails?.finishedAt)) || deleting}>
                        {
                            (() => {
                                if (testDetails?.startedAt && isValidDate(testDetails?.startedAt)) {
                                    return t('continueTest')
                                }
                                if (testDetails?.finishedAt && isValidDate(testDetails?.finishedAt)) {
                                    return t('finishedTest')
                                }
                                else {
                                    return t('startTest')
                                }
                            })()
                        }
                    </Button>
                </Button.Group>
            </Box>
        </Container>
    );
}