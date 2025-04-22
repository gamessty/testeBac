"use client";
import { ActionIcon, Badge, Box, Button, Card, CardProps, Flex, Image, Stack, Text } from "@mantine/core";
import { IconLink } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { MouseEventHandler } from "react";
import { getInitialsColor } from "../../../utils";
import AvatarFallback from "../../AvatarFallback/AvatarFallback";
import classes from './LinkCard.module.css';

interface LinkCardProps {
    name?: string;
    badge?: string;
    coverImage?: string;
    href?: string;
    design?: 'default' | 'compact';
    avatarIcon?: React.ReactNode;
    actionIcon?: React.ReactNode;
    withBorder?: boolean;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export default function LinkCard({ name, badge, avatarIcon, actionIcon, coverImage, design, withBorder, href, onClick, ...rest }: Readonly<LinkCardProps & CardProps>) {
    const t = useTranslations("General")

    switch (design) {
        case 'compact':
            return (
                <Card {...rest} className={`${classes["link-card"]} ${classes["compact"]}`} component={Link} onClick={onClick} href={href ?? '#'} w={"100%"} shadow="lg" radius="sm" withBorder={withBorder}>
                    <Stack justify="space-between" h="100%" w="100%">
                        <Box w="100%">
                            {coverImage && coverImage !== 'none' && <Card.Section>
                                <Image
                                    src={coverImage}
                                    height={70}
                                    alt={"Cover image link " + name}
                                />
                                {badge && <Badge radius="sm" className={classes["card-badge"]} color={getInitialsColor(badge)}>{badge}</Badge>}
                            </Card.Section>}

                            <Card.Section inheritPadding py="md" w="100%">
                                {name && <Flex justify="left" align="center" mb="xs" gap={10} w="100%">
                                    {!coverImage && avatarIcon && <AvatarFallback name={name} color="initials">{avatarIcon}</AvatarFallback>}
                                    <Stack gap={7} w="100%">
                                        <Text className={classes["title"]} truncate="end" w="100%" mb='-6' fw={500}>{name}</Text>
                                        {!coverImage && badge && <Badge radius="xs" size="sm" color={getInitialsColor(badge)} variant="light" mr={5}>{badge}</Badge>}
                                    </Stack>
                                </Flex>}

                                {coverImage !== 'none' && <ActionIcon className={classes["action-button"]} variant="transparent" color="gray">{actionIcon ?? <IconLink />}</ActionIcon>}
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
                                    alt={"Cover image link " + name}
                                />
                                {badge && <Badge radius="sm" className={classes["card-badge"]} color={getInitialsColor(badge)}>{badge}</Badge>}
                            </Card.Section>}

                            <Card.Section inheritPadding py="md" w="100%">
                                {name && <Flex justify="left" align="center" mb="xs" gap={10} w="100%">
                                    {!coverImage && avatarIcon && <AvatarFallback name={name} color="initials">{avatarIcon}</AvatarFallback>}
                                    <Stack gap={1} w="100%">
                                        <Box w="100%">
                                            <Text truncate="end" w="100%" fw={500}>{name}</Text>
                                        </Box>
                                        {!coverImage && badge && <Badge radius="xs" size="sm" variant="light" mr={5} color={getInitialsColor(badge)}>{badge}</Badge>}
                                    </Stack>
                                </Flex>}
                            </Card.Section>
                        </Box>

                        <Card.Section inheritPadding pb="sm">
                            <Button color="blue" fullWidth radius="md">
                                <Text truncate inherit>
                                    {t('launch')}
                                </Text>
                            </Button>
                        </Card.Section>
                    </Stack>
                </Card>
            );
    }
}

//<LinkCard href="#" subject="biology" category="bac" lastQuestion="Maltoza este:" />