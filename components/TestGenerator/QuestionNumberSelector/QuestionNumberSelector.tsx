"use client";
import { Badge, Card, Group, NumberInput, Stack, Text, Title } from '@mantine/core';
import { useDidUpdate, useMap } from '@mantine/hooks';
import { Chapter, Subject } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useEffect, useRef } from 'react';
import getQuestionNumber from '../../../actions/PrismaFunctions/getQuestionNumber';
import classes from './QuestionNumberSelector.module.css';

interface QuestionNumberSelectorProps {
    selectedSubjects: string[];
    selectedChapters: string[];
    subjects: Subject[];
    chapters: Chapter[];
    onChange?: (distribution: Record<string, number>) => void;
    onTotalQuestionsChange?: (total: number) => void;  // New prop to notify parent of total questions
}

function QuestionNumberSelector({
    selectedSubjects,
    selectedChapters,
    subjects,
    chapters,
    onChange,
    onTotalQuestionsChange
}: Readonly<QuestionNumberSelectorProps>) {
    const t = useTranslations('Dashboard.TestGenerator.QuestionDistribution');

    // Initialize useMap hooks
    const distribution = useMap<string, number>([]);
    const questionCounts = useMap<string, number>([]);
    const loading = useMap<string, boolean>([]);

    // Use refs to track previous values
    const prevSelectedSubjectsRef = useRef<string[]>([]);
    const prevSelectedChaptersRef = useRef<string[]>([]);
    const prevDistributionRef = useRef<string>('');
    const prevQuestionCountsRef = useRef<string>('');

    // Check if arrays have changed
    const haveSelectionsChanged = (
        prevSubjects: string[], 
        newSubjects: string[], 
        prevChapters: string[], 
        newChapters: string[]
    ): boolean => {
        if (prevSubjects.length !== newSubjects.length || prevChapters.length !== newChapters.length) return true;
        
        const prevSet = new Set([...prevSubjects, ...prevChapters]);
        return [...newSubjects, ...newChapters].some(id => !prevSet.has(id));
    };

    // Fetch question counts for each subject and chapter
    useEffect(() => {
        // Only proceed if selections have actually changed
        if (!haveSelectionsChanged(
            prevSelectedSubjectsRef.current, 
            selectedSubjects, 
            prevSelectedChaptersRef.current, 
            selectedChapters
        )) {
            return;
        }

        // Update refs
        prevSelectedSubjectsRef.current = [...selectedSubjects];
        prevSelectedChaptersRef.current = [...selectedChapters];

        async function fetchQuestionCounts() {
            // Reset loading state for all items
            [...selectedSubjects, ...selectedChapters].forEach(id => {
                loading.set(id, true);
            });

            let totalAvailable = 0;

            // Process subjects
            for (const subjectId of selectedSubjects) {
                const count = await getQuestionNumber({ type: 'subjectQuestion', id: subjectId });
                const questionCount = typeof count === 'number' ? count : 0;
                questionCounts.set(subjectId, questionCount);
                totalAvailable += questionCount;
                
                // Initialize distribution with max count if not set yet
                if (!distribution.has(subjectId)) {
                    distribution.set(subjectId, questionCount);
                }
                
                loading.set(subjectId, false);
            }

            // Process chapters
            for (const chapterId of selectedChapters) {
                const count = await getQuestionNumber({ type: 'chapter', id: chapterId });
                const questionCount = typeof count === 'number' ? count : 0;
                questionCounts.set(chapterId, questionCount);
                totalAvailable += questionCount;
                
                // Initialize distribution with max count if not set yet
                if (!distribution.has(chapterId)) {
                    distribution.set(chapterId, questionCount);
                }
                
                loading.set(chapterId, false);
            }

            // Notify parent component of total available questions
            if (onTotalQuestionsChange) {
                onTotalQuestionsChange(totalAvailable);
            }
        }

        if (selectedSubjects.length > 0 || selectedChapters.length > 0) {
            fetchQuestionCounts();
        }
    }, [selectedSubjects.join(','), selectedChapters.join(',')]);

    // Notify parent when question counts change (even before user selects)
    useDidUpdate(() => {
        const currentQuestionCounts = JSON.stringify(Object.fromEntries(questionCounts.entries()));
        
        if (currentQuestionCounts !== prevQuestionCountsRef.current) {
            prevQuestionCountsRef.current = currentQuestionCounts;
            
            // Calculate total available questions
            const totalAvailable = Array.from(questionCounts.entries()).reduce((acc, [_, count]) => {
                return acc + count;
            }, 0);
            
            // Notify parent component
            if (onTotalQuestionsChange) {
                onTotalQuestionsChange(totalAvailable);
            }
        }
    }, [questionCounts]);

    // Initialize distribution with default values and clean up removed items
    useEffect(() => {
        // Skip if no change in selections
        if (!haveSelectionsChanged(
            prevSelectedSubjectsRef.current, 
            selectedSubjects, 
            prevSelectedChaptersRef.current, 
            selectedChapters
        )) {
            return;
        }

        // Clear any items that are no longer selected
        const allCurrentIds = new Set([...selectedSubjects, ...selectedChapters]);

        // Remove keys that are no longer selected
        [...distribution.keys()].forEach(key => {
            if (!allCurrentIds.has(key)) {
                distribution.delete(key);
            }
        });
    }, [selectedSubjects.join(','), selectedChapters.join(',')]);

    // Notify parent when distribution changes
    useDidUpdate(() => {
        if (onChange) {
            const distributionObject = Object.fromEntries(distribution.entries());
            const newDistribution = JSON.stringify(distributionObject);

            if (newDistribution !== prevDistributionRef.current) {
                prevDistributionRef.current = newDistribution;
                onChange(distributionObject);
            }
        }
    }, [distribution]);

    // Handle distribution change
    const handleDistributionChange = useCallback((id: string, value: number) => {
        const maxCount = questionCounts.get(id) ?? 0;
        // Ensure value is in range (0 to maxCount)
        const validValue = Math.max(0, Math.min(value, maxCount));
        distribution.set(id, validValue);
        
        // Immediately calculate and notify parent about the updated total
        // This ensures that we don't have to wait for the useDidUpdate hook
        if (onChange) {
            const distributionObject = Object.fromEntries(distribution.entries());
            onChange(distributionObject);
        }
        
        // Update total questions count right away
        if (onTotalQuestionsChange) {
            const newTotal = Array.from(distribution.entries()).reduce((acc, [_, count]) => acc + count, 0);
            onTotalQuestionsChange(newTotal);
        }
    }, [distribution, questionCounts, onChange, onTotalQuestionsChange]);

    const getSubjectName = useCallback((id: string) => {
        return subjects.find(subject => subject.id === id)?.name ?? id;
    }, [subjects]);

    const getChapterName = useCallback((id: string) => {
        return chapters.find(chapter => chapter.id === id)?.name ?? id;
    }, [chapters]);

    // Calculate total number of questions
    const totalQuestions = Array.from(distribution.entries()).reduce((acc, [_, count]) => {
        return acc + count;
    }, 0);

    if (selectedSubjects.length === 0 && selectedChapters.length === 0) {
        return null;
    }

    return (
        <Card shadow="sm" className={classes.container} withBorder p="md" mt="md">
            <Text c="dimmed" mb="lg">{t('description')}</Text>

            {selectedSubjects.length > 0 && (
                <Stack>
                    {selectedSubjects.map(subjectId => {
                        const totalCount = questionCounts.get(subjectId) ?? 0;
                        const isDisabled = loading.get(subjectId) || (totalCount === 0);

                        return (
                            <div key={subjectId} className={classes.itemContainer}>
                                <Group justify="space-between" className={classes.item}>
                                    <div>
                                        <Text fw={500}>{getSubjectName(subjectId)}</Text>
                                        <Badge color="blue" variant="light">
                                            {loading.get(subjectId)
                                                ? t('loading')
                                                : t('availableQuestions', { count: totalCount })
                                            }
                                        </Badge>
                                    </div>
                                    <NumberInput
                                        size="sm"
                                        min={0}
                                        max={totalCount}
                                        value={distribution.get(subjectId) ?? 0}
                                        onChange={(value) => handleDistributionChange(subjectId, Number(value))}
                                        disabled={isDisabled}
                                        classNames={{ input: classes.numberInput }}
                                        label={t('title')}
                                    />
                                </Group>
                            </div>
                        );
                    })}
                </Stack>
            )}

            {selectedChapters.length > 0 && (
                <Stack gap={0}>
                    {selectedChapters.map(chapterId => {
                        const totalCount = questionCounts.get(chapterId) ?? 0;
                        const isDisabled = loading.get(chapterId) || (totalCount === 0);

                        return (
                            <div key={chapterId} className={classes.itemContainer}>
                                <Group justify="space-between" className={classes.item}>
                                    <div>
                                        <Text fw={500}>{getChapterName(chapterId)}</Text>
                                        <Badge color="green" variant="light">
                                            {loading.get(chapterId)
                                                ? t('loading')
                                                : t('availableQuestions', { count: totalCount })
                                            }
                                        </Badge>
                                    </div>
                                    <NumberInput
                                        size="sm"
                                        min={0}
                                        max={totalCount}
                                        value={distribution.get(chapterId) ?? 0}
                                        onChange={(value) => handleDistributionChange(chapterId, Number(value))}
                                        disabled={isDisabled}
                                        classNames={{ input: classes.numberInput }}
                                        label={t('title')}
                                    />
                                </Group>
                            </div>
                        );
                    })}
                </Stack>
            )}

            <Group justify="flex-end" mt="lg">
                <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                        {t('totalQuestions')}: {totalQuestions}
                    </Text>
                </Stack>
            </Group>
        </Card>
    );
}

// Export memoized component to prevent unnecessary rerenders
export default memo(QuestionNumberSelector);
