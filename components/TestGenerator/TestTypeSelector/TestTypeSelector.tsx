"use client";
import { Container, Divider, FloatingIndicator, NumberInput, SegmentedControlItem, Switch, Tabs, TabsProps, Text } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { Chapter, Subject } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import QuestionNumberSelector from '../QuestionNumberSelector/QuestionNumberSelector';
import testTypes from './testTypes.json';
import classes from './TestTypeSelector.module.css';

interface TestTypeSelectorProps {
    value?: string;
    defaultValue?: string;
    data?: (string | SegmentedControlItem)[];
    onChange?: (value: string) => void;
    onConfigurationsChange?: (configs: Record<string, any>) => void;
    onQuestionDistributionChange?: (distribution: Record<string, number>) => void;
    onTotalQuestionsChange?: (total: number) => void;
    selectedSubjects?: string[];
    selectedChapters?: string[];
    subjects?: Subject[];
    chapters?: Chapter[];
    configs?: Record<string, any>;
}

function parseTemplateVariable(value: any, variables: Record<string, any>): any {
    if (typeof value !== 'string') return value;

    const templatePattern = /\*\{([^}]+)\}\*/g;
    const matches = value.match(templatePattern);

    if (!matches) return value;

    if (matches.length === 1 && matches[0] === value) {
        const variableName = value.substring(2, value.length - 2);
        return variables[variableName] ?? value;
    }

    return value.replace(templatePattern, (match, variableName) => {
        return variables[variableName]?.toString() ?? match;
    });
}

export default function TestTypeSelector({
    value,
    defaultValue,
    onChange,
    onConfigurationsChange,
    onQuestionDistributionChange,
    onTotalQuestionsChange,
    selectedSubjects = [],
    selectedChapters = [],
    subjects = [],
    chapters = [],
    configs,
    ...props
}: Readonly<TestTypeSelectorProps & TabsProps>) {
    const t = useTranslations('Dashboard.TestGenerator.Selector.TestTypeSelector');
    const defaultData = testTypes.map(Ttype => ({ label: t("type", { id: Ttype.id }), value: Ttype.id }));

    const [_value, handleChange] = useUncontrolled<string | null>({
        value,
        defaultValue: defaultValue ?? defaultData[0].value,
        onChange,
    });

    const controlsRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const rootRef = useRef<HTMLDivElement | null>(null);

    const [totalQuestions, setTotalQuestions] = useState(-1);
    const [usingDistribution, setUsingDistribution] = useState(false);

    useEffect(() => {
        console.log('TestTypeSelector configs:', configs);
    }, [configs]);

    const handleConfigChange = useCallback((configId: string, newValue: any) => {
        if (!onConfigurationsChange) return;
        
        onConfigurationsChange((currentConfigs) => {
            const updatedConfigs = { ...(currentConfigs || {}) };
            updatedConfigs[configId] = newValue;
            return updatedConfigs;
        });
    }, [onConfigurationsChange]);

    useEffect(() => {
        if (!onConfigurationsChange || !_value) return;

        const testType = testTypes.find(type => type.id === _value);
        if (!testType?.configurations) return;

        if (!configs || Object.keys(configs).length === 0) {
            const defaultConfigs: Record<string, any> = {};
            testType.configurations.forEach(cfg => {
                if (cfg.id !== 'numberOfQuestions') {
                    defaultConfigs[cfg.id] = cfg.default;
                }
            });
            onConfigurationsChange(defaultConfigs);
        }
    }, [_value, configs, onConfigurationsChange]);

    useEffect(() => {
        setUsingDistribution(selectedSubjects.length > 0 || selectedChapters.length > 0);
    }, [selectedSubjects, selectedChapters]);

    const handleDistributionChange = useCallback((distribution: Record<string, number>) => {
        if (onQuestionDistributionChange) {
            onQuestionDistributionChange(distribution);

            // Calculate and update total questions from the distribution
            const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
            setTotalQuestions(total);
            
            // Also notify the parent component about the new total
            if (onTotalQuestionsChange) {
                onTotalQuestionsChange(total);
            }
        }
    }, [onQuestionDistributionChange, onTotalQuestionsChange, configs, handleConfigChange]);

    const handleTotalQuestionsChange = useCallback((total: number) => {
        setTotalQuestions(total);
        if (onTotalQuestionsChange) {
            onTotalQuestionsChange(total);
        }
    }, [onTotalQuestionsChange]);

    const setControlRef = useCallback((val: string) => (node: HTMLButtonElement) => {
        controlsRefs.current[val] = node;
    }, []);

    const setRootRef = useCallback((node: HTMLDivElement) => {
        rootRef.current = node;
    }, []);

    return (
        <>
            <Tabs variant="none" value={_value} onChange={handleChange} {...props}>
                <Tabs.List ref={setRootRef} className={classes.list}>
                    {defaultData.map((item) => (
                        <Tabs.Tab
                            key={item.value}
                            value={item.value}
                            ref={setControlRef(item.value)}
                            className={classes.tab}
                        >
                            {item.label}
                        </Tabs.Tab>
                    ))}

                    <FloatingIndicator
                        target={_value ? controlsRefs.current[_value] : null}
                        parent={rootRef.current}
                        className={classes.indicator}
                    />
                </Tabs.List>

                {defaultData.map((item) => {
                    const testType = testTypes.find(type => type.id === item.value);
                    return (
                        <Tabs.Panel key={item.value} value={item.value} className={classes.panel}>
                            <Container className={classes.container}>
                                {testType?.configurations.map(config => {
                                    const maxQuestions = ((config.id === 'numberOfQuestions' && totalQuestions !== -1)
                                        ? totalQuestions
                                        : undefined);

                                    switch (config.type) {
                                        case 'boolean':
                                            return (
                                                <Switch
                                                    key={config.id}
                                                    classNames={{
                                                        body: classes.switch,
                                                    }}
                                                    size="md"
                                                    checked={configs?.[config.id] ?? config.default}
                                                    label={t(`Configurations.labels.${config.id}`) ?? config.label}
                                                    onChange={(event) => handleConfigChange(config.id, event.currentTarget.checked)}
                                                    labelPosition="left"
                                                />
                                            );
                                        case 'number':
                                            return (
                                                <NumberInput
                                                    key={config.id}
                                                    classNames={{
                                                        input: classes.numberInput,
                                                    }}
                                                    test-configuration-input-id={config.id}
                                                    size="md"
                                                    value={configs?.[config.id]}
                                                    placeholder={config.id === 'numberOfQuestions' ?
                                                        t('Configurations.labels.numberOfQuestions') || "Determined by question selection" :
                                                        undefined}
                                                    label={t(`Configurations.labels.${config.id}`) ?? config.label}
                                                    min={config.min}
                                                    max={maxQuestions}
                                                    onChange={(value) => {
                                                        if (value === '' || value === null) {
                                                            if (config.id === 'numberOfQuestions' && onConfigurationsChange) {
                                                                onConfigurationsChange((currentConfigs: any) => {
                                                                    const newConfigs = { ...(currentConfigs || {}) };
                                                                    delete newConfigs[config.id];
                                                                    return newConfigs;
                                                                });
                                                            }
                                                            return;
                                                        }

                                                        const numValue = Number(value);
                                                        if (!isNaN(numValue)) {
                                                            const safeValue = Math.max(config.min ?? 0, Math.min(numValue, maxQuestions ?? Infinity));
                                                            handleConfigChange(config.id, safeValue);
                                                        }
                                                    }}
                                                />
                                            );
                                        default:
                                            return null;
                                    }
                                })}

                                {usingDistribution && (
                                    <Text size="sm" c="dimmed" mt="md">
                                        {t('distributionInfoMessage') || "When using question distribution, the number of questions will be determined by your selections if not specified."}
                                    </Text>
                                )}
                            </Container>
                        </Tabs.Panel>
                    );
                })}
            </Tabs>
            <Divider />

            {(selectedSubjects.length > 0 || selectedChapters.length > 0) && (
                <QuestionNumberSelector
                    selectedSubjects={selectedSubjects}
                    selectedChapters={selectedChapters}
                    subjects={subjects}
                    chapters={chapters}
                    onChange={handleDistributionChange}
                    onTotalQuestionsChange={handleTotalQuestionsChange}
                />
            )}
        </>
    );
}