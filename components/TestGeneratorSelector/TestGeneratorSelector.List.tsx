"use client";
import { useListState, randomId, useUncontrolled, useDidUpdate } from '@mantine/hooks';
import { Accordion, AccordionProps, ActionIcon, Center, Checkbox, CheckboxCardProps, Divider, Flex, Group, Text } from '@mantine/core';
import { Chapter, Subject } from '@prisma/client';
import classes from './TestGeneratorSelector.List.module.css';
import React from 'react';
import { IconArrowDown, IconPlus } from '@tabler/icons-react';

interface TestGeneratorSelectorListProps {
    subjects: Subject[];
    chapters: Chapter[];
    defaultValuesSubjects?: string[]; // selected subjects - only question subjects can be selected
    defaultValuesChapters?: string[]; // selected chapters
    valueChapters: string[];
    valueSubjects: string[];
    onChaptersChange: (value: string[]) => void;
    onSubjectsChange: (value: string[]) => void; // selected subjects - only question subjects can be selected
    onChapterSubjectChange?: (value: string[]) => void; // selected subjects - these are subjects with chapters that have been selected - optional callback
    variant?: 'default' | 'card';
}

export function TestGeneratorSelectorList({ chapters, subjects, defaultValuesChapters, defaultValuesSubjects, valueChapters, valueSubjects, variant = 'default', ...props }: Readonly<TestGeneratorSelectorListProps & AccordionProps>) {
    const [_chapters, handleChaptersChange] = useUncontrolled<string[]>({
        value: valueChapters,
        defaultValue: defaultValuesChapters,
        onChange: props.onChaptersChange,
    });

    const [_subjects, handleSubjectsChange] = useUncontrolled<string[]>({
        value: valueSubjects,
        defaultValue: defaultValuesSubjects,
        onChange: props.onSubjectsChange,
    });

    useDidUpdate(() => {
        if (props.onChapterSubjectChange) {
            const selectedSubjects = _chapters.map((chapterId) => {
                const chapter = chapters.find((chapter) => chapter.id === chapterId);
                return chapter?.subjectId;
            }).filter((subjectId) => subjectId !== undefined);
            props.onChapterSubjectChange(selectedSubjects);
        }
    }, [_chapters])

    function allChecked(subjectId: string) {
        return chapters.filter(c => c.subjectId == subjectId).every((chapter) => _chapters.includes(chapter.id));
    }

    function indeterminate(subjectId: string) {
        return chapters.filter(c => c.subjectId == subjectId).some((chapter) => _chapters.includes(chapter.id)) && !allChecked(subjectId);
    }

    const items = subjects
        .toSorted((a, b) => (a.type === 'QUESTION' && b.type !== 'QUESTION' ? -1 : b.type === 'QUESTION' && a.type !== 'QUESTION' ? 1 : 0))
        .map((subject) => {
            if (subject.type === 'QUESTION') {
                return (
                    <>
                        <Accordion.Item key={subject.id} value={subject.id}>
                            <Flex className={classes.flex}>
                                <Checkbox
                                    className={classes.checkbox}
                                    classNames={{
                                        labelWrapper: classes['checkbox-label'],
                                    }}
                                    checked={_subjects.includes(subject.id)}
                                    label={subject.name}
                                    onChange={(event) => {
                                        const checked = event.currentTarget.checked;
                                        let _newSubjects = _subjects;
                                        if (checked) {
                                            _newSubjects = [..._subjects, subject.id];
                                        } else {
                                            _newSubjects = _subjects.filter((id) => id !== subject.id);
                                        }
                                        handleSubjectsChange(_newSubjects);
                                    }}
                                />
                            </Flex>
                        </Accordion.Item>
                        <Divider key={randomId()} my="xs" />
                    </>
                );
            } else {
                return (
                    <React.Fragment key={subject.id}>
                        <Accordion.Item value={subject.id} classNames={{ item: classes['accordion-item'] }}>
                            <Flex className={classes.flex}>
                                <Checkbox
                                    className={classes.checkbox}
                                    classNames={{
                                        labelWrapper: classes['checkbox-label'],
                                    }}
                                    checked={allChecked(subject.id)}
                                    indeterminate={indeterminate(subject.id)}
                                    label={subject.name}
                                    onChange={(event) => {
                                        const checked = event.currentTarget.checked;
                                        let _newChapters = _chapters;
                                        if (checked) {
                                            _newChapters = [..._chapters, ...chapters.filter(c => c.subjectId == subject.id).map(c => c.id)];
                                        }
                                        else {
                                            _newChapters = _chapters.filter((id) => !chapters.filter(c => c.subjectId == subject.id).map(c => c.id).includes(id));
                                        }
                                        handleChaptersChange(_newChapters);
                                    }}
                                />
                                <Accordion.Control classNames={{ control: classes['accordion-control'] }} />
                            </Flex>
                            <Accordion.Panel>
                                {chapters.filter(c => c.subjectId == subject.id).map((chapter) => {
                                    if (variant == 'card') {
                                        return (<TestGeneratorSelectorCard
                                            key={chapter.id}
                                            label={chapter.name}
                                            checked={_chapters.includes(chapter.id)}
                                            onChange={(checked) => {
                                                let _newChapters = _chapters;
                                                if (checked) {
                                                    _newChapters = [..._chapters, chapter.id];
                                                } else {
                                                    _newChapters = _chapters.filter((id) => id !== chapter.id);
                                                }
                                                handleChaptersChange(_newChapters);
                                            }}
                                        />);
                                    } else {
                                        return (
                                            <Checkbox
                                                key={chapter.id}
                                                classNames={{
                                                    root: classes['checkbox-root'],
                                                    labelWrapper: classes['checkbox-label'],
                                                }}
                                                label={
                                                    <Text className={classes['card-label']}>
                                                        {chapter.name}
                                                    </Text>
                                                }
                                                checked={_chapters.includes(chapter.id)}
                                                onChange={(event) => {
                                                    const checked = event.currentTarget.checked;
                                                    let _newChapters = _chapters;
                                                    if (checked) {
                                                        _newChapters = [..._chapters, chapter.id];
                                                    } else {
                                                        _newChapters = _chapters.filter((id) => id !== chapter.id);
                                                    }
                                                    handleChaptersChange(_newChapters);
                                                }}
                                            />
                                        );
                                    }
                                })}
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Divider my="xs" />
                    </React.Fragment>
                );
            }
        });

    return (
        <Accordion
            variant='filled'
            chevron={<IconPlus className={classes.icon} />}
            classNames={{ chevron: classes.chevron }}
        >
            {items}
        </Accordion>
    );
}

interface TestGeneratorSelectorCardProps {
    label: string;
    description?: string | null;
    cardSwoosh?: boolean;
}

function TestGeneratorSelectorCard({
    label,
    description,
    cardSwoosh = true,
    ...props
}: Readonly<TestGeneratorSelectorCardProps & CheckboxCardProps>) {
    return (
        <Checkbox.Card className={classes['card-root'] + (cardSwoosh ? " " + classes['card-transition'] : '')} radius="md" {...props}>
            <Group wrap="nowrap" align="flex-start">
                <Checkbox.Indicator />
                <div>
                    <Text className={classes['card-label']}>{label}</Text>
                    {description && <Text className={classes['card-description']}>{description}</Text>}
                </div>
            </Group>
        </Checkbox.Card>
    );
}