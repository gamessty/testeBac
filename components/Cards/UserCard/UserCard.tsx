import { Avatar, Badge, Button, Card, Grid, Group, MantineStyleProp, Stack, Text, Tooltip, Skeleton, Box } from '@mantine/core';
import { User } from 'next-auth';
import classes from './UserCard.module.css';
import { getInitialsColor } from '../../../utils';
import { useTranslations } from 'next-intl';
import { useState, type MouseEventHandler } from 'react';
import AvatarFallback from '../../AvatarFallback/AvatarFallback';

interface DefaultUserCardProps {
    skeleton?: boolean;
}

interface UserCardProps extends DefaultUserCardProps {
    skeleton?: false;
    user: User;
    style?: MantineStyleProp;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

interface SkeletonUserCardProps extends DefaultUserCardProps {
    skeleton: true;
    style?: MantineStyleProp;
    user?: User;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function UserCard({ user, style, onClick, skeleton = false }: Readonly<UserCardProps | SkeletonUserCardProps>) {
    const t = useTranslations('Dashboard.UserManager');
    return <Skeleton visible={skeleton}>
        <Card h="100%" shadow="sm" className={classes["user-card"]} padding="lg" radius="md" withBorder style={style}>
            {user?.userAuthorized ? <Badge className={classes["card-badge"]} color="teal">{t('authorized')}</Badge> : <Badge className={classes["card-badge"]} color="red">{t('unauthorized')}</Badge>}
            <Card.Section inheritPadding pb="md">
                <Group justify="flex-start" mt="md" mb="xs">
                    <AvatarFallback name={user?.username ?? user?.email ?? undefined} src={user?.image ?? undefined} color="initials" />
                    <Stack
                        gap={0}
                        align="flex-start"
                        justify="center"
                        w="100%"
                    >
                        <Box w="100%">
                            <Text fw={500} mb={-5}>{user?.username ?? user?.email}</Text>
                        </Box>
                        <Box w="100%">
                            <Text truncate="end" c="dimmed" size='sm' display={{ base: user?.username ? "inherit" : "none" }}>{user?.email}</Text>
                        </Box>
                    </Stack>
                </Group>
            </Card.Section>

            <Card.Section inheritPadding pb="md">
                <Grid gutter={3} w="100%" pb="md">
                    {
                        user?.roles?.map((role) => (
                            <Grid.Col pt={0} mt={-4} span="content" key={role.id}>
                                <Tooltip tt="capitalize" label={role.name} color={getInitialsColor(role.name)} withArrow>
                                    <Badge size="sm" variant="dot" color={getInitialsColor(role.name)} radius="xs" tt="capitalize">{role.name}</Badge>
                                </Tooltip>
                            </Grid.Col>
                        ))
                    }
                </Grid>
            </Card.Section>

            <Card.Section className={classes["user-card_button_section"]} inheritPadding pb="md">
                <Button color="blue" fullWidth onClick={onClick} radius="md" style={{ position: 'relative' }}>
                    {t('viewProfile')}
                </Button>
            </Card.Section>
        </Card>
    </Skeleton>;
}
