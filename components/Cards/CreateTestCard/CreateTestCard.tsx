'use client';
import { Card, CardProps, LoadingOverlay, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "../../../i18n/routing";

interface CreateTestCardProps extends CardProps {
    href?: string;
    onClick?: () => void;
    toggleLoading?: boolean;
}

export default function CreateTestCard({ href, toggleLoading, onClick }: Readonly<CreateTestCardProps>) {
    const t = useTranslations('Dashboard.Tests');
    const [visible, { open, toggle }] = useDisclosure(false);

    return (
        <Card component={Link} href={href ?? '#'} pos="relative" w={"100%"} pb="lg" onClick={() => { toggleLoading ? toggle() : open(); if (onClick) onClick(); }} withBorder>
            <Card.Section inheritPadding py="xs">
                <LoadingOverlay visible={visible} zIndex={1000} loaderProps={{ color: 'grey', type: 'dots' }} overlayProps={{ radius: "sm", blur: 2 }} />
                <IconPlus />
                <Text variant="gradient"
                    gradient={{ from: 'green', to: 'grape', deg: 75 }} fw={800} size="xl">{t('generateTestTitle')}</Text>
            </Card.Section>
        </Card>
    )
}