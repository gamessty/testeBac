"use client";
import { Card, Group, Badge, Button, Image, Text, Avatar, CardProps } from "@mantine/core";
import { useTranslations } from "next-intl";
import classes from './TestCard.module.css';
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

export default function TestCard ({ category, subject, coverImage, lastQuestion, href, ...rest }: Readonly<TestCardProps & CardProps>) {
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
        <Card {...rest} component={Link} href={href ?? ''} className={classes['test-card']} style={{ position: 'relative' }} w={"100%"} display="inline-block" shadow="sm" padding="lg" pt={35} mr="30" radius="md" withBorder>
            { coverImage && <Card.Section inheritPadding pb="md">
                <Image
                    src={coverImage}
                    height={160}
                    alt="Cover image"
                />
                {category && <Badge className={classes["card-badge"]} color="pink">{t("category", { category })}</Badge>}
            </Card.Section>}

            <Card.Section inheritPadding py="md">
            {subject && <Group justify="left" mb="xs">
                {!coverImage && <AvatarFallback name={subject} color="initials">{getAvatarIcon(subject)}</AvatarFallback>}
                <Text fw={500}>{t(`Subjects.${subject}`)}</Text>
                {category && !coverImage && <Badge className={classes["card-badge"]} color="pink">{t("category", { category })}</Badge>}
            </Group>}

            {lastQuestion && <Text size="sm" fw="500" aria-label="Last Question" c="dimmed">
                {t('lastQuestion')}
            </Text>}
            </Card.Section>

            <Card.Section className={classes["test-card_button_section"]} inheritPadding pb="md">
                <Button color="blue" fullWidth radius="md" style={{ position: 'relative' }}>
                    {t('resumeTest')}
                </Button>
            </Card.Section>
        </Card>
    )
}

//<TestCard href="#" subject="biology" category="bac" lastQuestion="Maltoza este:" />