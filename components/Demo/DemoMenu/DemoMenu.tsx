"use client";
import {
    Anchor,
    Card,
    CardProps,
    Group,
    SimpleGrid,
    Text,
    UnstyledButton,
    useMantineTheme,
} from '@mantine/core';
import {
    IconFile,
    IconFilePlus
} from '@tabler/icons-react';
import { Link } from '../../../i18n/routing';
import { getInitialsColor } from '../../../utils';
import classes from './DemoMenu.module.css';

interface MockDataItem {
    title: string;
    icon: React.FC<any>;
    href: string;
    color?: string;
}

const mockdata: MockDataItem[] = [
    { title: 'QuestionCard', icon: IconFile, href: './demo/question' },
    { title: 'TestGenerator', icon: IconFilePlus, href: './demo/generator' },
    { title: 'Tests', icon: IconFile, href: './demo/tests' },
    { title: 'TestTypeSelector', icon: IconFile, href: './demo/selector' },
];

export default function DemoMenu({ ...props }: Readonly<CardProps>) {
    const theme = useMantineTheme();

    const items = mockdata.map((item) => (
        <UnstyledButton component={Link} href={item.href} key={item.title} className={classes.item}>
            <item.icon color={theme.colors[item.color ?? getInitialsColor(item.title)][6]} size={32} />
            <Text size="xs" mt={7}>
                {item.title}
            </Text>
        </UnstyledButton>
    ));

    return (
        <Card {...props} withBorder radius="md" className={classes.card}>
            <Group justify="space-between">
                <Text className={classes.title}>Demos</Text>
                <Anchor size="xs" c="dimmed" style={{ lineHeight: 1 }}>
                    + others coming soon
                </Anchor>
            </Group>
            <SimpleGrid cols={3} mt="md">
                {items}
            </SimpleGrid>
        </Card>
    );
}