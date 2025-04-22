"use client";
import { Center, Checkbox, Container, Group, Loader, LoaderProps, Radio, Stack, Text } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';
import { Chapter, Folder, Subject } from '@prisma/client';
import { useLocale, useTranslations } from 'next-intl';
import classes from './TestGeneratorSelector.module.css';

type label = {
    name: string;
    description?: string;
}

interface TestGeneratorSelectorPropsBase {
    data: Folder[] | Subject[] | Chapter[] | label[];
    allowMultiple?: boolean;
    loaderProps?: LoaderProps;
    loader?: boolean; //controlled way to show loader
    cardSwoosh?: boolean; //controlled way to show transition the opacity of the cards
    preventDuplicates?: boolean; // way to prevent duplicates of data
}

interface TestGeneratorSelectorPropsSingle extends TestGeneratorSelectorPropsBase {
    allowMultiple?: false;
    value?: string; // for controlled component
    defaultValue?: string; // for uncontrolled component
    onChange?: (value: string) => void;
}

interface TestGeneratorSelectorPropsMultiple extends TestGeneratorSelectorPropsBase {
    allowMultiple: true;
    value?: string[]; // for controlled component, if null (by default) then it will be an "uncontrolled" component
    defaultValue?: string[]; // for uncontrolled component
    onChange?: (value: string[]) => void;
}

type TestGeneratorSelectorProps = TestGeneratorSelectorPropsSingle | TestGeneratorSelectorPropsMultiple;

function determineType(data: Folder[] | Subject[] | Chapter[] | unknown[]): 'Folder' | 'Subject' | 'Chapter' | 'Unknown' {
    if ((data[0] as Folder)?.category) {
        return 'Folder';
    } else if ((data[0] as Subject)?.folderId) {
        return 'Subject';
    } else if ((data[0] as Chapter)?.subjectId) {
        return 'Chapter';
    }
    return 'Unknown';
}

export default function TestGeneratorSelector({
    data,
    allowMultiple = false,
    value,
    defaultValue,
    onChange,
    loader = false,
    loaderProps,
    cardSwoosh = true,
    preventDuplicates = true
}: Readonly<TestGeneratorSelectorProps>) {
    const t = useTranslations('Dashboard.TestGenerator.Selector');
    const locale = useLocale();
    const [_value, handleChange] = useUncontrolled<typeof value>({
        value,
        defaultValue,
        onChange: (val: string | string[] | undefined) => onChange?.(val as any),
    });

    if (preventDuplicates && determineType(data) !== 'Unknown') {
        data = data.filter((v, i, a) => a.findIndex(t => (t as any).id === (v as any).id) === i);
    }

    let cards;

    switch (determineType(data)) {
        case 'Folder':
            cards = (data as Folder[]).map((folder) => (TestGeneratorSelectorCard({
                cardSwoosh,
                id: folder.id,
                name: folder.name,
                description: folder.additionalData.description,
                type: allowMultiple ? 'checkbox' : 'radio'
            })));
            break;
        case 'Subject':
            cards = (data as Subject[]).map((subject) => (TestGeneratorSelectorCard({
                cardSwoosh,
                id: subject.id,
                name: subject.name,
                description: t('updatedAt') + ' ' + subject.updatedAt.toLocaleDateString(locale),
                type: allowMultiple ? 'checkbox' : 'radio'
            })));
            break;
        case 'Chapter':
            cards = (data as Chapter[]).map((chapter) => (TestGeneratorSelectorCard({
                cardSwoosh,
                id: chapter.id,
                name: chapter.name,
                description: t('updatedAt') + ' ' + chapter.updatedAt.toLocaleDateString(locale),
                type: allowMultiple ? 'checkbox' : 'radio'
            })));
            break;
        default:
            cards = (data as label[]).map((label) => (TestGeneratorSelectorCard({
                cardSwoosh,
                name: label.name,
                description: label.description,
                type: allowMultiple ? 'checkbox' : 'radio'
            })));
    }

    if (!data || loader) {
        return <Container fluid>
            <Center>
                <Loader {...loaderProps} />
            </Center>
        </Container>
    }

    if (allowMultiple)
        return (
            <Checkbox.Group
                value={_value as string[]}
                onChange={handleChange}
            >
                <Stack pt="md" gap="xs">
                    {cards}
                </Stack>
            </Checkbox.Group>
        );
    else
        return (
            <Radio.Group
                value={_value as string}
                onChange={handleChange}
            >
                <Stack pt="md" gap="xs">
                    {cards}
                </Stack>
            </Radio.Group>
        );
}

interface TestGeneratorSelectorCardProps {
    id?: string;
    name: string;
    description?: string | null;
    type?: 'radio' | 'checkbox';
    cardSwoosh?: boolean;
}

function TestGeneratorSelectorCard({
    id,
    name,
    description,
    type = 'radio',
    cardSwoosh = true
}: Readonly<TestGeneratorSelectorCardProps>) {
    if (type == 'checkbox')
        return (
            <Checkbox.Card className={classes.root + (cardSwoosh ? " " + classes.cardTransition : '')} radius="md" value={id ?? name} key={id ?? name}>
                <Group wrap="nowrap" align="flex-start">
                    <Checkbox.Indicator />
                    <div>
                        <Text className={classes.label}>{name}</Text>
                        {description && <Text className={classes.description}>{description}</Text>}
                    </div>
                </Group>
            </Checkbox.Card>
        );
    else
        return (
            <Radio.Card className={classes.root + (cardSwoosh ? " " + classes.cardTransition : '')} radius="md" value={id ?? name} key={id ?? name}>
                <Group wrap="nowrap" align="flex-start">
                    <Radio.Indicator />
                    <div>
                        <Text className={classes.label}>{name}</Text>
                        {description && <Text className={classes.description}>{description}</Text>}
                    </div>
                </Group>
            </Radio.Card>
        );
}