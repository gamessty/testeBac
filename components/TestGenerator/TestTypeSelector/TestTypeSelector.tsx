"use client";
import { Container, Divider, FloatingIndicator, NumberInput, SegmentedControlItem, Switch, Tabs, TabsProps } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { Chapter, Subject } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import QuestionNumberSelector from '../QuestionNumberSelector/QuestionNumberSelector';
import testTypes from './testTypes.json';
import classes from './TestTypeSelector.module.css';

// Add the QuestionRange interface
interface QuestionRange {
  min: number;
  max: number;
  count: number;
}

interface TestTypeSelectorProps {
    value?: string;
    defaultValue?: string;
    data?: (string | SegmentedControlItem)[]; 
    onChange?: (value: string) => void;
    onConfigurationsChange?: (configs: Record<string, any>) => void;
    onQuestionDistributionChange?: (distribution: Record<string, number>, ranges?: Record<string, QuestionRange>) => void;
    selectedSubjects?: string[];
    selectedChapters?: string[];
    subjects?: Subject[];
    chapters?: Chapter[];
    configs?: Record<string, any>;
}

// Helper function to parse template variables in strings
function parseTemplateVariable(value: any, variables: Record<string, any>): any {
    if (typeof value !== 'string') return value;
    
    // Check if the string contains a template variable pattern *{variableName}*
    const templatePattern = /\*\{([^}]+)\}\*/g;
    const matches = value.match(templatePattern);
    
    if (!matches) return value;
    
    // If it's a pure template variable (entire string is just the variable)
    if (matches.length === 1 && matches[0] === value) {
        const variableName = value.substring(2, value.length - 2);
        return variables[variableName] ?? value;
    }
    
    // If it contains template variables mixed with other content
    return value.replace(templatePattern, (match, variableName) => {
        return variables[variableName]?.toString() ?? match;
    });
}

export default function TestTypeSelector({
    value,
    defaultValue,
    data,
    onChange,
    onConfigurationsChange,
    onQuestionDistributionChange,
    selectedSubjects = [],
    selectedChapters = [],
    subjects = [],
    chapters = [],
    configs,
    ...props
}: Readonly<TestTypeSelectorProps & TabsProps>) {
    const t = useTranslations('Dashboard.TestGenerator.Selector.TestTypeSelector');
    const defaultData = testTypes.map(Ttype => { return { label: t("type", { id: Ttype.id }), value: Ttype.id } });
    const [_value, handleChange] = useUncontrolled<string | null>({
        value,
        defaultValue: defaultValue ?? defaultData[0].value,
        onChange,
    });
    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const controlsRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    
    // Use useCallback to prevent recreating the function on each render
    const setControlRef = useCallback((val: string) => (node: HTMLButtonElement) => {
        controlsRefs.current[val] = node;
    }, []);

    const handleConfigChange = useCallback((configId: string, newValue: any) => {
        if (onConfigurationsChange) {
            onConfigurationsChange({
                ...(configs || {}),
                [configId]: newValue,
            });
        }
    }, [onConfigurationsChange, configs]);

    const prevDistributionRef = useRef<string>('');
    const prevRangesRef = useRef<string | undefined>(undefined);

    // Track the maximum questions available
    const [templateVariables, setTemplateVariables] = useState<Record<string, any>>({
        maximumQuestionsNumber: 25 // Default fallback value
    });

    // On mount or when the test type (_value) or templateVariables change,
    // update the parent's configuration with default processed values.
    useEffect(() => {
        if (onConfigurationsChange && _value) {
            const testType = testTypes.find(type => type.id === _value);
            if (testType?.configurations) {
                const initialConfigs: Record<string, any> = {};
                testType.configurations.forEach(config => {
                    initialConfigs[config.id] = parseTemplateVariable(config.default, templateVariables);
                });

                // Perform a deep comparison to avoid unnecessary updates
                const currentConfigs = JSON.stringify(configs);
                const newConfigs = JSON.stringify(initialConfigs);

                if (currentConfigs !== newConfigs) {
                    onConfigurationsChange(initialConfigs);
                }
            }
        }
    }, [_value, templateVariables, onConfigurationsChange, configs]);

    // Memoize templateVariables update to prevent cascading rerenders
    const updateTemplateVariables = useCallback((totalAvailableQuestions: number) => {
        setTemplateVariables(prev => {
            // Only update if the value has actually changed
            if (prev.maximumQuestionsNumber === totalAvailableQuestions) {
                return prev;
            }
            return {
                ...prev,
                maximumQuestionsNumber: totalAvailableQuestions
            };
        });
    }, []);

    const handleQuestionDistributionChange = useCallback((distribution: Record<string, number>, ranges?: Record<string, QuestionRange>) => {
        if (onQuestionDistributionChange) {
            const stableDistribution = JSON.stringify(distribution);
            const stableRanges = ranges ? JSON.stringify(ranges) : undefined;

            if (stableDistribution !== prevDistributionRef.current || stableRanges !== prevRangesRef.current) {
                prevDistributionRef.current = stableDistribution;
                prevRangesRef.current = stableRanges;

                const totalAvailableQuestions = ranges
                    ? Object.values(ranges).reduce((acc, range) => acc + (range.max - range.min + 1), 0)
                    : Object.values(distribution).reduce((acc, count) => acc + count, 0);

                updateTemplateVariables(totalAvailableQuestions);
                onQuestionDistributionChange(distribution, ranges);

                if (onConfigurationsChange && _value) {
                    const testType = testTypes.find(type => type.id === _value);
                    if (testType) {
                        const updatedConfigs = { ...(configs || {}) };
                        let configChanged = false;

                        testType.configurations.forEach(config => {
                            if (config.id === 'numberOfQuestions' && config.type === 'number') {
                                const currentValue = updatedConfigs.numberOfQuestions || config.default;
                                if (totalAvailableQuestions && currentValue > totalAvailableQuestions) {
                                    updatedConfigs.numberOfQuestions = totalAvailableQuestions;
                                    configChanged = true;
                                }
                            }
                        });

                        if (configChanged) {
                            onConfigurationsChange(updatedConfigs);
                        }
                    }
                }
            }
        }
    }, [onQuestionDistributionChange, onConfigurationsChange, _value, configs, updateTemplateVariables]);

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
                        parent={rootRef}
                        className={classes.indicator}
                    />
                </Tabs.List>

                {
                    defaultData.map((item) => {
                        const testType = testTypes.find(type => type.id === item.value);
                        return (
                            <Tabs.Panel key={item.value} value={item.value} className={classes.panel}>
                                <Container className={classes.container}>
                                    {testType?.configurations.map(config => {
                                        // Process template variables in configuration
                                        const processedConfig = {
                                            ...config,
                                            min: parseTemplateVariable(config.min, templateVariables),
                                            max: parseTemplateVariable(config.max, templateVariables),
                                            default: parseTemplateVariable(config.default, templateVariables),
                                            label: parseTemplateVariable(config.label, templateVariables)
                                        };
                                        
                                        switch (processedConfig.type) {
                                            case 'boolean':
                                                return (
                                                    <Switch
                                                        key={processedConfig.id}
                                                        classNames={{
                                                            body: classes.switch,
                                                        }}
                                                        size="md"
                                                        defaultChecked={processedConfig.default as boolean}
                                                        label={t(`Configurations.labels.${processedConfig.id}`) ?? processedConfig.label}
                                                        onChange={(event) => handleConfigChange(processedConfig.id, event.currentTarget.checked)}
                                                        labelPosition="left"
                                                    />
                                                );
                                            case 'number':
                                                return (
                                                    <NumberInput
                                                        key={processedConfig.id}
                                                        classNames={{
                                                            input: classes.numberInput,
                                                        }}
                                                        test-configuration-input-id={processedConfig.id}
                                                        size="md"
                                                        defaultValue={processedConfig.default}
                                                        label={t(`Configurations.labels.${processedConfig.id}`) ?? processedConfig.label}
                                                        min={processedConfig.min}
                                                        max={processedConfig.max}
                                                        // Clamp the value to processedConfig.max before updating
                                                        onChange={(value) => 
                                                            handleConfigChange(
                                                                processedConfig.id, 
                                                                value !== null ? Math.min(Number(value), processedConfig.max) : value
                                                            )
                                                        }
                                                    />
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </Container>
                            </Tabs.Panel>
                        );
                    })
                }
            </Tabs>
            <Divider />
            
            {/* Question Distribution Selector */}
            {(selectedSubjects.length > 0 || selectedChapters.length > 0) && (
                <QuestionNumberSelector
                    selectedSubjects={selectedSubjects}
                    selectedChapters={selectedChapters}
                    subjects={subjects}
                    chapters={chapters}
                    onChange={handleQuestionDistributionChange}
                />
            )}
        </>
    );
}