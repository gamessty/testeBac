"use client";
import { Box, Card, Collapse, Flex, NumberInput, Skeleton, Switch, Text, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import testTypes from '../TestGenerator/TestTypeSelector/testTypes.json';
import classes from './TestConfigDisplay.module.css';
import { JsonObject, JsonValue } from 'next-auth/adapters';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowAutofitDown, IconArrowDown, IconChevronDown } from '@tabler/icons-react';

interface TestConfigDisplayProps {
    testType: string;
    configurations: JsonValue;
    loading?: boolean;
}

export default function TestConfigDisplay({ testType, configurations, loading }: Readonly<TestConfigDisplayProps>) {
    const t = useTranslations('Dashboard.TestGenerator.Selector.TestTypeSelector');
    const [testTypeConfig, setTestTypeConfig] = useState<any>(null);
    const [opened, { toggle }] = useDisclosure(false);

    useEffect(() => {
        // Find the matching test type from our configuration
        const matchingType = testTypes.find(type => type.id.toLowerCase() === testType.toLowerCase());
        if (matchingType) {
            setTestTypeConfig(matchingType);
        }
    }, [testType]);

    if (loading) {
        return (
            <Skeleton visible={loading}>
                <Card shadow="sm" withBorder p="md" mt="md" className={classes.container}>
                    <Flex onClick={toggle} className={classes.header} justify="space-between" align="center">
                        <Title order={3} size="h4">
                            {t('testConfigTitle') || 'Test Configuration'}
                        </Title>
                        <IconChevronDown className={classes.chevron} />
                    </Flex>
                </Card>
            </Skeleton>
        )
    }
    // We need configurations to be a non-null object type to process it
    if (!testTypeConfig || !configurations || typeof configurations !== 'object' || Array.isArray(configurations)) {
        return null;
    }

    const configObject = configurations as Record<string, JsonValue>;

    return (
        <Card shadow="sm" withBorder p="md" mt="md" className={classes.container} data-rotate={opened}>
            <Flex onClick={toggle} className={classes.header} justify="space-between" align="center">
                <Title order={3} size="h4">
                    {t('testConfigTitle') || 'Test Configuration'}
                </Title>
                <IconChevronDown className={classes.chevron} />
            </Flex>

            <Collapse in={opened} className={classes.configItems}>
                {testTypeConfig.configurations
                    .filter((config: any) => config.id !== 'numberOfQuestions') // Filter out numberOfQuestions
                    .map((config: any) => {
                        const configValue = configObject[config.id];

                        // Skip if the configuration isn't present
                        if (configValue === undefined) return null;

                        switch (config.type) {
                            case 'boolean':
                                return (
                                    <Switch
                                        key={config.id}
                                        classNames={{
                                            body: classes.switch,
                                        }}
                                        size="md"
                                        checked={!!configValue}
                                        label={t(`Configurations.labels.${config.id}`) ?? config.label}
                                        readOnly
                                        disabled
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
                                        size="md"
                                        value={typeof configValue === 'number' ? configValue : undefined}
                                        label={t(`Configurations.labels.${config.id}`) ?? config.label}
                                        readOnly
                                        disabled
                                        suffix={config.suffix}
                                    />
                                );
                            default:
                                return (
                                    <Text key={config.id}>
                                        {t(`Configurations.labels.${config.id}`) ?? config.label}: {configValue?.toString()}
                                    </Text>
                                );
                        }
                    })}
            </Collapse>
        </Card>
    );
}
