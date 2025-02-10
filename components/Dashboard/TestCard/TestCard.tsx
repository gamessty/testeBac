"use client";
import { Card, Group, Badge, Button, Image, Text, Avatar } from "@mantine/core";
import { useTranslations } from "next-intl";
import clasess from './TestCard.module.css';
import { IconCodeAsterisk, IconFlask2, IconMicroscope, IconSchool } from "@tabler/icons-react";
import AvatarFallback from "../../AvatarFallback/AvatarFallback";
import { Link } from "../../../i18n/routing";

interface TestCardProps {
    category?: string;
    subject?: string;
    lastQuestion?: string;
    coverImage?: string;
    href?: string;
}

export default function TestCard ({ category, subject, coverImage, lastQuestion, href }: Readonly<TestCardProps>) {
    const t = useTranslations('Tests');

    function getAvatarIcon(subject: string) {
        switch (subject) {
            case 'biology':
                return <IconMicroscope />;
            case 'chemistry':
                return <IconFlask2 />;
            case 'informatics':
                return <IconCodeAsterisk />;
            default:
                return <IconSchool />;
        }
    }
    return (
        <Card component={Link} href={href ?? ''} style={{ position: 'relative' }} w={"100%"} display="inline-block" shadow="sm" padding="lg" pt={35} mr="30" radius="md" withBorder>
            { coverImage && <Card.Section mb="md">
                <Image
                    src={coverImage}
                    height={160}
                    alt="Cover image"
                />
                {category && <Badge className={clasess["card-badge"]} color="pink">{t(`Categories.${category}`)}</Badge>}
            </Card.Section>}

            {subject && <Group justify="left" mb="xs">
                {!coverImage && <AvatarFallback name={subject} color="initials">{getAvatarIcon(subject)}</AvatarFallback>}
                <Text fw={500}>{t(`Subjects.${subject}`)}</Text>
                {category && !coverImage && <Badge className={clasess["card-badge"]} color="pink">{t(`Categories.${category}`)}</Badge>}
            </Group>}

            {lastQuestion && <Text size="sm" fw="500" aria-label="Last Question" c="dimmed">
                {t('lastQuestion')}
            </Text>}

            {lastQuestion && <Text size="sm" aria-label="Last Question" c="dimmed">
                {lastQuestion}
            </Text>}

            <Button color="blue" fullWidth mt="md" radius="md">
                {t('resumeTest')}
            </Button>
        </Card>
    )
}