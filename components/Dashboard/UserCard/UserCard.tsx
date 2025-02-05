import { Avatar, Badge, Button, Card, Grid, Group, MantineStyleProp, Stack, Text, Tooltip, Skeleton } from '@mantine/core';
import { User } from 'next-auth';
import classes from './UserCard.module.css';
import { getInitialsColor } from '../../../utils';
import { useTranslations } from 'next-intl';
import { type MouseEventHandler } from 'react';

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

export default function UserCard({ user, style, onClick, skeleton = false}: Readonly<UserCardProps | SkeletonUserCardProps>) {
    const t = useTranslations('Dashboard.UserManager');
    return <Skeleton visible={skeleton}>
        <Card h="100%" shadow="sm" className={classes["user-card"]} padding="lg" radius="md" withBorder style={style}>
            {user?.userAuthorized ? <Badge className={classes["card-badge"]} color="teal">{t('authorized')}</Badge> : <Badge className={classes["card-badge"]} color="red">{t('unauthorized')}</Badge>}
            <Group justify="flex-start" mt="md" mb="xs">
                <Avatar name={user?.username ?? user?.email ?? undefined} src={user?.image ?? undefined} color="initials" />
                <Stack
                    gap={0}
                    align="flex-start"
                    justify="center"
                >
                    <Text fw={500} mb={-5} ta="center">{user?.username ?? user?.email}</Text>
                    <Text c="dimmed" size='sm' ta="center" display={{ base: user?.username ? "inherit" : "none" }}>{user?.email}</Text>
                </Stack>
            </Group>

            <Card.Section inheritPadding pb="md">
                <Grid gutter={3} w="100%" pb="md">
                    {
                        user?.roles?.map((name: string) => (
                            <Grid.Col pt={0} mt={-4} span="content" key={name}>
                                <Tooltip tt="capitalize" label={name} color={getInitialsColor(name)} withArrow>
                                    <Badge size="md" variant="dot" color={getInitialsColor(name)} radius="xs" tt="capitalize">{name}</Badge>
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
