"use client";
import {
    IconBuildingBank,
    IconCashBanknote,
    IconCoin,
    IconCreditCard,
    IconFile,
    IconReceipt,
    IconReceiptRefund,
    IconReceiptTax,
    IconRepeat,
    IconReport,
} from '@tabler/icons-react';
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
import classes from './DemoMenu.module.css';
import { getInitialsColor } from '../../../utils';

interface MockDataItem {
    title: string;
    icon: React.FC<any>;
    href: string;
    color?: string;
}

const mockdata: MockDataItem[] = [
    { title: 'QuestionCard', icon: IconFile, href: './demo/question' },
];

export default function DemoMenu({ ...props }: Readonly<CardProps>) {
    const theme = useMantineTheme();

    const items = mockdata.map((item) => (
        <UnstyledButton component='a' href={item.href} key={item.title} className={classes.item}>
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