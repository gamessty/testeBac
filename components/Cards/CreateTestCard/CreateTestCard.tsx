'use client';
import { Card, Center, LoadingOverlay, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
interface StatsCardProps {
    href?: string;
}

export default function CreateTestCard({ href }: Readonly<StatsCardProps>) {
    const t = useTranslations('Dashboard.Tests');
    const [visible, { toggle }] = useDisclosure(false);

    return (
        <Card component="a" href={href} pos="relative" w={"100%"} pb="lg" onClick={() => { toggle() }} withBorder>
            <Card.Section inheritPadding py="xs">
                <LoadingOverlay visible={visible} zIndex={1000} loaderProps={{ color: 'grey', type: 'dots' }} overlayProps={{ radius: "sm", blur: 2 }} />
                <IconPlus />
                <Text variant="gradient"
                    gradient={{ from: 'orange', to: 'grape', deg: 55 }} fw={800} size="xl">{t('generateTestTitle')}</Text>
            </Card.Section>
        </Card>
    )
}