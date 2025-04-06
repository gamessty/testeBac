"use client";
import { ActionIcon, Badge, Box, Button, Card, CardProps, Flex, Image, Progress, Stack, Text } from "@mantine/core";
import { IconCodeAsterisk, IconFlask2, IconMicroscope, IconPencil, IconSchool } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Link } from "../../../i18n/routing";
import { getInitialsColor } from "../../../utils";
import AvatarFallback from "../../AvatarFallback/AvatarFallback";
import classes from './TestCard.module.css';

interface TestCardProps {
    category?: string;
    subject?: string;
    lastQuestion?: string;
    coverImage?: string;
    href?: string;
    design?: 'default' | 'compact';
    progress?: number;
    tooltipText?: boolean;
}

export default function TestCard({ category, subject, coverImage, lastQuestion, progress, design, tooltipText, href, ...rest }: Readonly<TestCardProps & CardProps>) {
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
    switch (design) {
        case 'compact':
            return (
                <Card {...rest} className={`${classes["test-card"]} ${classes["compact"]}`} component={Link} href={href ?? ''} w={"100%"} shadow="lg" radius="sm" >
                    <Stack justify="space-between" h="100%" w="100%">
                        <Box w="100%">
                            {coverImage && coverImage !== 'none' && <Card.Section>
                                <Image
                                    src={coverImage}
                                    height={70}
                                    alt={"Cover image test " + subject}
                                />
                                {category && <Badge radius="sm" className={classes["card-badge"]} color={getInitialsColor(category)}>{t("category", { category })}</Badge>}
                            </Card.Section>}

                            <Card.Section inheritPadding py="md" w="100%">
                                {subject && <Flex justify="left" align="center" mb="xs" gap={10} w="100%">
                                    {!coverImage && <AvatarFallback name={subject} color="initials">{getAvatarIcon(subject)}</AvatarFallback>}
                                    <Stack gap={7} w="100%">
                                        <Text truncate="end" w="100%" mb='-6' fw={500}>{t(`Subjects.${subject}`)}</Text>
                                        {!coverImage && category && <Badge radius="xs" size="sm" variant="light" mr={5} color="cyan">{t("category", { category })}</Badge>}
                                        {progress && <Progress value={progress} radius="xs" />}
                                    </Stack>
                                </Flex>}


                                {lastQuestion && <Box>
                                    <Text size="sm" fw="500" aria-label="Last Question" c="dimmed">
                                        {t('lastQuestion')}
                                    </Text>
                                    <Text size="sm" fw="500" aria-label="Last Question">
                                        {lastQuestion}
                                    </Text>
                                </Box>

                                }
                                {coverImage !== 'none' && <ActionIcon className={classes["action-button"]} variant="transparent" color="gray"><IconPencil style={{ width: '80%', height: '80%' }} stroke={1.5} /></ActionIcon>}
                            </Card.Section>
                        </Box>
                    </Stack>
                </Card>
            );
        case 'default':
        default:
            return (
                <Card {...rest} component={Link} href={href ?? ''} w={"100%"} shadow="sm" mr="30" radius="md" withBorder>
                    <Stack justify="space-between" h="100%" w="100%">
                        <Box w="100%">
                            {coverImage && <Card.Section>
                                <Image
                                    src={coverImage}
                                    height={70}
                                    alt={"Cover image test " + subject}
                                />
                                {category && <Badge radius="sm" className={classes["card-badge"]} color={getInitialsColor(category)}>{t("category", { category })}</Badge>}
                            </Card.Section>}

                            <Card.Section inheritPadding py="md" w="100%">
                                {subject && <Flex justify="left" align="center" mb="xs" gap={10} w="100%">
                                    {!coverImage && <AvatarFallback name={subject} color="initials">{getAvatarIcon(subject)}</AvatarFallback>}
                                    <Stack gap={1} w="100%">
                                        <Box w="100%">
                                            <Text truncate="end" w="100%" fw={500}>{t(`Subjects.${subject}`)}</Text>
                                        </Box>
                                        {!coverImage && category && <Badge radius="xs" size="sm" variant="light" mr={5} color="cyan">{t("category", { category })}</Badge>}
                                    </Stack>
                                </Flex>}


                                {lastQuestion && <Text size="sm" fw="500" aria-label="Last Question" c="dimmed">
                                    {t('lastQuestion')}
                                </Text>}
                            </Card.Section>
                        </Box>

                        <Card.Section inheritPadding pb="sm">
                            <Button color="blue" fullWidth radius="md">
                                <Text truncate inherit>
                                    {t('resumeTest')}
                                </Text>
                            </Button>
                        </Card.Section>
                    </Stack>
                </Card>
            );
    }
}

//<TestCard href="#" subject="biology" category="bac" lastQuestion="Maltoza este:" />