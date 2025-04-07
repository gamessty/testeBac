"use client";
import { Badge, Card, Group, NumberInput, Stack, Text, Title } from '@mantine/core';
import { useDidUpdate, useMap } from '@mantine/hooks';
import { Chapter, Subject } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { memo, useCallback, useEffect, useRef } from 'react';
import getQuestionNumber from '../../../actions/PrismaFunctions/getQuestionNumber';
import classes from './QuestionNumberSelector.module.css';

// Define interface for question range
interface QuestionRange {
    min: number;
    max: number;
    count: number;
}

interface QuestionNumberSelectorProps {
    selectedSubjects: string[];
    selectedChapters: string[];
    subjects: Subject[];
    chapters: Chapter[];
    onChange?: (distribution: Record<string, number>, ranges?: Record<string, QuestionRange>) => void;
}

function QuestionNumberSelector({
    selectedSubjects,
    selectedChapters,
    subjects,
    chapters,
    onChange
}: Readonly<QuestionNumberSelectorProps>) {
    const t = useTranslations('Dashboard.TestGenerator.QuestionDistribution');

    // Initialize useMap hooks
    const distribution = useMap<string, number>([]);
    const questionCounts = useMap<string, number>([]);
    const loading = useMap<string, boolean>([]);
    const questionRanges = useMap<string, QuestionRange>([]);

    // Use refs to track previous values to avoid redundant operations
    const prevSelectedSubjectsRef = useRef<string[]>([]);
    const prevSelectedChaptersRef = useRef<string[]>([]);
    const prevDistributionRef = useRef<string>('');
    const prevRangesRef = useRef<string>('');

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

            // Process subjects
            for (const subjectId of selectedSubjects) {
                const count = await getQuestionNumber({ type: 'subjectQuestion', id: subjectId });
                const questionCount = typeof count === 'number' ? count : 0;
                questionCounts.set(subjectId, questionCount);

                // Initialize or update range for this subject
                if (!questionRanges.has(subjectId) && questionCount > 0) {
                    questionRanges.set(subjectId, { min: 1, max: questionCount, count: distribution.get(subjectId) ?? 0 });
                } else if (questionCount > 0) {
                    const currentRange = questionRanges.get(subjectId);
                    if (currentRange) {
                        // Ensure max doesn't exceed available questions
                        questionRanges.set(subjectId, {
                            ...currentRange,
                            max: Math.min(currentRange.max, questionCount),
                            // Ensure count doesn't exceed new max
                            count: Math.min(currentRange.count, questionCount)
                        });
                    }
                }

                loading.set(subjectId, false);
            }

            // Process chapters
            for (const chapterId of selectedChapters) {
                const count = await getQuestionNumber({ type: 'chapter', id: chapterId });
                const questionCount = typeof count === 'number' ? count : 0;
                questionCounts.set(chapterId, questionCount);

                // Initialize or update range for this chapter
                if (!questionRanges.has(chapterId) && questionCount > 0) {
                    questionRanges.set(chapterId, { min: 1, max: questionCount, count: distribution.get(chapterId) ?? 0 });
                } else if (questionCount > 0) {
                    const currentRange = questionRanges.get(chapterId);
                    if (currentRange) {
                        // Ensure max doesn't exceed available questions
                        questionRanges.set(chapterId, {
                            ...currentRange,
                            max: Math.min(currentRange.max, questionCount),
                            // Ensure count doesn't exceed new max
                            count: Math.min(currentRange.count, questionCount)
                        });
                    }
                }

                loading.set(chapterId, false);
            }
        }

        if (selectedSubjects.length > 0 || selectedChapters.length > 0) {
            fetchQuestionCounts();
        }
    }, [selectedSubjects.join(','), selectedChapters.join(',')]);

    // Initialize distribution with default values
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

        // Remove ranges that are no longer selected
        [...questionRanges.keys()].forEach(key => {
            if (!allCurrentIds.has(key)) {
                questionRanges.delete(key);
            }
        });

        // Set default values for subjects and chapters that aren't already set
        [...selectedSubjects, ...selectedChapters].forEach(id => {
            if (!distribution.has(id)) {
                distribution.set(id, 0);
            }

            // Initialize range if not set and we have the question count
            const count = questionCounts.get(id) ?? 0;
            if (!questionRanges.has(id) && count > 0) {
                questionRanges.set(id, { min: 1, max: count, count: 0 });
            }
        });
    }, [selectedSubjects.join(','), selectedChapters.join(',')]);

    // Memoize the notification to parent component
    const notifyParent = useCallback(() => {
        if (onChange) {
            const distributionObject = Object.fromEntries(distribution.entries());
            const rangesObject = Object.fromEntries(
                Array.from(questionRanges.entries()).map(([key, range]) => [key, { ...range }])
            );

            // Perform a deep comparison to avoid redundant updates
            const newDistribution = JSON.stringify(distributionObject);
            const newRanges = JSON.stringify(rangesObject);

            if (newDistribution !== prevDistributionRef.current || newRanges !== prevRangesRef.current) {
                prevDistributionRef.current = newDistribution;
                prevRangesRef.current = newRanges;
                onChange(distributionObject, rangesObject);
            }
        }
    }, [onChange, distribution, questionRanges]);

    // Notify parent when distribution changes, but debounce to reduce frequency
    useDidUpdate(() => {
        notifyParent();
    }, [notifyParent]);

    // Memoize these handlers to prevent re-renders
    const handleDistributionChange = useCallback((id: string, value: number) => {
        distribution.set(id, value);

        // Update the count in the ranges too
        const range = questionRanges.get(id);
        if (range) {
            questionRanges.set(id, { ...range, count: value });
        }
    }, [distribution, questionRanges]);

    const handleRangeMinChange = useCallback((id: string, value: number) => {
        const range = questionRanges.get(id);
        if (range) {
            // Ensure min doesn't exceed max
            const newMin = Math.min(value, range.max);
            questionRanges.set(id, { ...range, min: newMin });

            // If current count is less than new min, update count
            if (range.count < newMin) {
                handleDistributionChange(id, newMin);
            }
        }
    }, [questionRanges, handleDistributionChange]);

    const handleRangeMaxChange = useCallback((id: string, value: number) => {
        const range = questionRanges.get(id);
        if (range) {
            // Ensure max isn't less than min
            const newMax = Math.max(value, range.min);
            questionRanges.set(id, { ...range, max: newMax });

            // If current count exceeds new max, update count
            if (range.count > newMax) {
                handleDistributionChange(id, newMax);
            }
        }
    }, [questionRanges, handleDistributionChange]);

    const getSubjectName = useCallback((id: string) => {
        return subjects.find(subject => subject.id === id)?.name ?? id;
    }, [subjects]);

    const getChapterName = useCallback((id: string) => {
        return chapters.find(chapter => chapter.id === id)?.name ?? id;
    }, [chapters]);

    // Calculate available question pool size based on ranges
    const totalAvailableQuestions = Array.from(questionRanges.entries()).reduce((acc, [_, range]) => {
        return acc + (range.max - range.min + 1);
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
                        const range = questionRanges.get(subjectId);
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
                                    <Group className={classes.rangeControls}>
                                        <Text size="sm" fw={500}>{t('questionRange')}:</Text>
                                        <Group>
                                            <NumberInput
                                                size="sm"
                                                min={1}
                                                max={totalCount}
                                                value={range?.min ?? 1}
                                                onChange={(value) => handleRangeMinChange(subjectId, Number(value))}
                                                disabled={isDisabled}
                                                classNames={{ input: classes.rangeInput }}
                                            />
                                            <Text size="sm">-</Text>
                                            <NumberInput
                                                size="sm"
                                                min={range?.min ?? 1}
                                                max={totalCount}
                                                value={range?.max ?? totalCount}
                                                onChange={(value) => handleRangeMaxChange(subjectId, Number(value))}
                                                disabled={isDisabled}
                                                classNames={{ input: classes.rangeInput }}
                                            />
                                        </Group>
                                    </Group>
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
                        const range = questionRanges.get(chapterId);
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
                                    <Group className={classes.rangeControls}>
                                        <Text size="sm" fw={500}>{t('questionRange')}:</Text>
                                        <Group>
                                            <NumberInput
                                                size="sm"
                                                min={1}
                                                max={totalCount}
                                                value={range?.min ?? 1}
                                                onChange={(value) => handleRangeMinChange(chapterId, Number(value))}
                                                disabled={isDisabled}
                                                classNames={{ input: classes.rangeInput }}
                                            />
                                            <Text size="sm">-</Text>
                                            <NumberInput
                                                size="sm"
                                                min={range?.min ?? 1}
                                                max={totalCount}
                                                value={range?.max ?? totalCount}
                                                onChange={(value) => handleRangeMaxChange(chapterId, Number(value))}
                                                disabled={isDisabled}
                                                classNames={{ input: classes.rangeInput }}
                                            />
                                        </Group>
                                    </Group>
                                </Group>
                            </div>
                        );
                    })}
                </Stack>
            )}

            <Group justify="flex-end" mt="lg">
                <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                        {t('availablePool')}: {totalAvailableQuestions}
                    </Text>
                </Stack>
            </Group>
        </Card>
    );
}

// Export memoized component to prevent unnecessary rerenders
export default memo(QuestionNumberSelector);
