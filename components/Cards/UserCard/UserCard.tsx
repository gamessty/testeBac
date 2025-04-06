import { ActionIcon, Badge, Box, Button, Card, CardProps, Grid, Group, MantineStyleProp, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { IconUser } from '@tabler/icons-react';
import { User } from 'next-auth';
import { useTranslations } from 'next-intl';
import { type MouseEventHandler } from 'react';
import { getInitialsColor } from '../../../utils';
import AvatarFallback from '../../AvatarFallback/AvatarFallback';
import classes from './UserCard.module.css';

interface DefaultUserCardProps extends CardProps {
    skeleton?: boolean;
    variant?: 'default' | 'compact' | 'old';
    actionIcon?: React.ReactNode;
    withBorder?: boolean;
}

interface UserCardProps extends DefaultUserCardProps {
    skeleton?: false;
    user: User;
    style?: MantineStyleProp;
    onClick?: MouseEventHandler<HTMLDivElement | HTMLButtonElement>;
}

interface SkeletonUserCardProps extends DefaultUserCardProps {
    skeleton: true;
    style?: MantineStyleProp;
    user?: User;
    onClick?: MouseEventHandler<HTMLButtonElement | HTMLDivElement>;
}

export default function UserCard({ user, variant = 'compact', actionIcon, withBorder, skeleton = false, ...rest }: Readonly<UserCardProps | SkeletonUserCardProps>) {
    const t = useTranslations('Dashboard.UserManager');

    function getCardStyle() {
        switch (variant) {
            case 'old':
                return (
                    <Card h="100%" shadow="sm" className={classes["user-card"]} padding="lg" radius="md" withBorder {...rest}>
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
                            <Button color="blue" fullWidth onClick={rest.onClick} radius="md" style={{ position: 'relative' }}>
                                {t('viewProfile')}
                            </Button>
                        </Card.Section>
                    </Card>
                );
            case 'compact':
            case 'default':
            default:
                return (
                    <Card shadow="lg" className={`${classes["user-card"]} ${classes["compact"]}`} padding="lg" radius="sm" withBorder={withBorder} {...rest}>
                        {user?.userAuthorized ? <Badge className={classes["card-badge"]} color="teal">{t('authorized')}</Badge> : <Badge className={classes["card-badge"]} color="red">{t('unauthorized')}</Badge>}
                        <Card.Section inheritPadding mb="xs">
                            <Group justify="flex-start" mt="md">
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

                        <Card.Section inheritPadding>
                            <Grid gutter={3} w="100%" pb="lg" mt={-4}>
                                {
                                    !(user?.roles?.length == 1 && user?.roles[0].priority == 0) && user?.roles?.map((role) => (
                                        <Grid.Col pt={0}  span="content" key={role.id}>
                                            <Tooltip tt="capitalize" label={role.name} color={getInitialsColor(role.name)} withArrow>
                                                <Badge size="sm" variant="dot" color={getInitialsColor(role.name)} radius="xs" tt="capitalize">{role.name}</Badge>
                                            </Tooltip>
                                        </Grid.Col>
                                    ))
                                }
                            </Grid>
                        </Card.Section>
                        <ActionIcon className={classes["action-button"]} variant="transparent" color="gray">{actionIcon ?? <IconUser />}</ActionIcon>
                    </Card>);

        }
    }

    return (
        <Skeleton visible={skeleton}>
            {
                skeleton ?
                    undefined : getCardStyle()
            }
        </Skeleton>
    );
}
