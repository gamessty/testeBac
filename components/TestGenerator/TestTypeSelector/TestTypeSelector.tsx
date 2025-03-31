import { useEffect, useState } from 'react';
import { Container, Divider, FloatingIndicator, SegmentedControlItem, Switch, Tabs, TabsProps, NumberInput } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import testTypes from './testTypes.json';
import { useTranslations } from 'next-intl';
import classes from './TestTypeSelector.module.css';

interface TestTypeSelectorProps {
    value?: string;
    defaultValue?: string;
    data?: (string | SegmentedControlItem)[];
    onChange?: (value: string) => void;
    onConfigurationsChange?: (configs: Record<string, any>) => void;
}

export default function TestTypeSelector({
    value,
    defaultValue,
    data,
    onChange,
    onConfigurationsChange,
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
    const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
    const setControlRef = (val: string) => (node: HTMLButtonElement) => {
        controlsRefs[val] = node;
        setControlsRefs(controlsRefs);
    };

    const handleConfigChange = (configId: string, newValue: any) => {
        if (onConfigurationsChange) {
            onConfigurationsChange((prevConfigs: Record<string, any>) => ({
                ...prevConfigs,
                [configId]: newValue,
            }));
        }
    };

    return (
        <>
            <Tabs variant="none" value={_value} onChange={handleChange} {...props}>
                <Tabs.List ref={setRootRef} className={classes.list}>
                    {defaultData.map((item) => (
                        <Tabs.Tab key={item.value} value={item.value} ref={setControlRef(item.value)} className={classes.tab}>
                            {item.label}
                        </Tabs.Tab>
                    ))}

                    <FloatingIndicator
                        target={_value ? controlsRefs[_value] : null}
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
                                        switch (config.type) {
                                            case 'boolean':
                                                return (
                                                    <Switch
                                                        key={config.id}
                                                        classNames={{
                                                            body: classes.switch
                                                        }}
                                                        width="100%"
                                                        size='lg'
                                                        defaultChecked={config.default as boolean}
                                                        label={config.label}
                                                        onChange={(event) => handleConfigChange(config.id, event.currentTarget.checked)}
                                                        labelPosition='left'
                                                    />
                                                );
                                            case 'number':
                                                return (
                                                    <NumberInput
                                                        key={config.id}
                                                        classNames={{
                                                            input: classes.switch
                                                        }}
                                                        width="100%"
                                                        size='lg'
                                                        defaultValue={config.default as number}
                                                        label={config.label}
                                                        min={config.min}
                                                        max={config.max}
                                                        onChange={(value) => handleConfigChange(config.id, value)}
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
            CHAPTERS / SUBJECTS AND EACH WITH ITS OWN QUESTION NUMBER EDITOR
        </>
    );
}