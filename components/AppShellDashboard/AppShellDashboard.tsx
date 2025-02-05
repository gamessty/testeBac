'use client';
import { AppShell, Group, Button, ActionIcon, Text, Avatar, Divider, Stack, Grid, UnstyledButton, Affix, Transition, Badge, Flex, Tooltip, useMatches, Menu } from "@mantine/core";
import { useDidUpdate, useDocumentTitle, useSetState, useWindowScroll } from "@mantine/hooks";
import { IconHome, IconFile, IconSettingsCog, IconChecklist, IconChartInfographic, IconArrowUp, IconMessageCircle, IconPhoto, IconSearch, IconUsers } from "@tabler/icons-react";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import ColorSchemeToggleIcon from "../ColorSchemeToggleIcon/ColorSchemeToggleIcon";
import { signOut } from "next-auth/react";
import Home from "../Dashboard/Home/Home";
import { useSearchParams } from "next/navigation";
import Settings from "../Dashboard/Settings/Settings";
import Stats from "../Dashboard/Stats/Stats";
import Tests from "../Dashboard/Tests/Tests";
import { getInitialsColor } from "../../utils";
import { useEffect } from "react";
import UserManager from "../Dashboard/Admin/UserManager/UserManager";

interface AppShellDashboardProps {
    session: Session | null | undefined;
}
interface SettingsSetState {
    tab: string;
    title: string;
    avatarError: boolean;
    hour: number;
    minute: number;
    year: number;
}

export default function AppShellDashboard({ session }: Readonly<AppShellDashboardProps>) {
    const searchParams = useSearchParams();

    const t = useTranslations('Dashboard');
    const ta = useTranslations('Authentication');

    const [settings, setSettings] = useSetState<SettingsSetState>({
        tab: searchParams.get('tab') ?? 'home',
        title: 'testeBac | ' + t('Navbar.' + (searchParams.get('tab') ?? 'home')),
        avatarError: false,
        hour: (new Date()).getHours(),
        minute: (new Date()).getMinutes(),
        year: (new Date()).getUTCFullYear()
    });
    useDocumentTitle(settings.title);

    const [scroll, scrollTo] = useWindowScroll();

    useDidUpdate(() => {
        setSettings({ title: 'testeBac | ' + t('Navbar.' + (searchParams.get('tab') ?? 'home')), tab: searchParams.get('tab') ?? 'home' });
    }, [searchParams.get('tab')]);

    useEffect(() => {
        setInterval(() => {
            setSettings({ hour: (new Date()).getHours(), minute: (new Date()).getMinutes() });
        }, 60000);
    });

    function handleTabChange({ tab }: { tab: string }) {
        setSettings({ tab, title: 'testeBac | ' + t('Navbar.' + tab) });
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        if (typeof window !== 'undefined') window.history.pushState(null, '', `?${params.toString()}`);
    }

    const affixPosition = useMatches({
        base: { bottom: 95, right: 20 },
        sm: { bottom: 20, right: 20 }
    })

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: true } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Text variant="gradient" fw={700} size="xl" component="a" href="./" gradient={{ from: 'pink', to: 'yellow' }}>
                        testeBac
                    </Text>
                    <Text fw={700} size="xl">
                        {settings.hour < 10 ? '0' + settings.hour : settings.hour}:{settings.minute < 10 ? '0' + settings.minute : settings.minute}
                    </Text>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <AppShell.Section grow my="md">
                    <Stack
                        align="stretch"
                        justify="space-around"
                        gap="md"
                    >
                        <Button color="orange" onClick={() => handleTabChange({ tab: 'home' })} variant={settings.tab == 'home' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconHome size={17} />}>{t('Navbar.home')}</Button>
                        <Button color="grape" onClick={() => handleTabChange({ tab: 'tests' })} variant={settings.tab == 'tests' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconFile size={17} />}>{t('Navbar.tests')}</Button>
                        <Button color="green" onClick={() => handleTabChange({ tab: 'stats' })} variant={settings.tab == 'stats' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconChartInfographic size={17} />}>{t('Navbar.stats')}</Button>
                        <Button color="pink" onClick={() => handleTabChange({ tab: 'settings' })} variant={settings.tab == 'settings' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconSettingsCog size={17} />}>{t('Navbar.settings')}</Button>
                        {session?.user.roles.includes("admin") && <><Divider />{t('Navbar.admin.title')}</>}
                        {session?.user.roles.includes("admin") && <Button color="red" onClick={() => handleTabChange({ tab: 'admin.users' })} variant={settings.tab == 'admin.users' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconSettingsCog size={17} />}>{t('Navbar.admin.users')}</Button>}
                    </Stack>
                </AppShell.Section>
                <AppShell.Section>
                    <Button justify="left" fullWidth my={10} h={35} onClick={() => signOut()} variant="gradient" gradient={{ from: 'purple', to: 'pink' }}>{ta('signOut')}</Button>
                </AppShell.Section>
                <Divider />
                <AppShell.Section my={10}>
                    <Flex gap="md" align="center">
                        <Avatar
                            onError={({ currentTarget }) => { currentTarget.onerror = null; setSettings({ avatarError: true }); }}
                            key={session?.user?.email}
                            src={settings.avatarError ? undefined : session?.user?.image ?? undefined}
                            name={session?.user?.username ?? session?.user?.email ?? undefined}
                            color='initials'
                        />
                        <Stack gap={2} justify="center" w="100%">
                            <Text fw={500} ta="left">
                                {session?.user?.username ?? session?.user?.email}
                            </Text>
                            <Text c="dimmed" size='sm' mt={-5} display={{ base: session?.user?.username ? "inherit" : "none" }}>
                                {session?.user?.email}
                            </Text>
                            <Grid gutter={3} w="100%">
                                {
                                    session?.user?.roles?.map((name) => (
                                        <Grid.Col pt={0} mt={-6} span="content" key={name}>
                                            <Tooltip tt="capitalize" label={name} color={getInitialsColor(name)} withArrow>
                                                <Badge size="sm" variant="dot" color={getInitialsColor(name)} radius="xs" tt="capitalize">{name}</Badge>
                                            </Tooltip>
                                        </Grid.Col>
                                    ))
                                }
                            </Grid>
                        </Stack>
                    </Flex>
                </AppShell.Section>
                <Divider />
                <AppShell.Section>
                    <Group justify="space-between" mt={10}>
                        <Text ta="center">Ⓒ {settings.year}</Text>
                        <ColorSchemeToggleIcon />
                    </Group>
                </AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Main>
                <Transition transition="fade-right" timingFunction="ease" duration={600} mounted={settings.tab == 'home'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'home' && <Home style={transitionStyles} />}
                        </>
                    )}
                </Transition>
                <Transition transition="fade-right" timingFunction="ease" duration={600} mounted={settings.tab == 'tests'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'tests' && <Tests style={transitionStyles} />}
                        </>
                    )}
                </Transition>
                <Transition transition="fade-right" timingFunction="ease" duration={600} mounted={settings.tab == 'stats'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'stats' && <Stats style={transitionStyles} />}
                        </>
                    )}
                </Transition>
                <Transition transition="fade-right" timingFunction="ease" duration={600} mounted={settings.tab == 'settings'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'settings' && <Settings style={transitionStyles} session={session} />}
                        </>
                    )}
                </Transition>
                <Transition transition="fade-right" timingFunction="ease" duration={600} mounted={settings.tab == 'admin.users'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'admin.users' && <UserManager session={session} style={transitionStyles} />}
                        </>
                    )}
                </Transition>
            </AppShell.Main>
            <AppShell.Footer p={15} display={{ sm: "none" }}>
                <Grid grow>
                    <Grid.Col span={1}>
                        <Menu shadow="md" position="top-start" offset={20} transitionProps={{ transition: 'pop-bottom-left', duration: 200 }}>
                            <Menu.Target>
                                <UnstyledButton>
                                    <Avatar onError={({ currentTarget }) => { currentTarget.onerror = null; setSettings({ avatarError: true }); }} key={session?.user?.email} src={settings.avatarError ? undefined : session?.user?.image ?? undefined} name={session?.user?.username ?? session?.user?.email ?? undefined} color='initials' />
                                </UnstyledButton>
                            </Menu.Target>

                            <Menu.Dropdown w={160}>
                                {(session?.user.roles.includes("admin") || session?.user.roles.includes("owner")) &&
                                    <>
                                        <Menu.Label>{t('Navbar.admin.shortTitle')}</Menu.Label>
                                        <Menu.Item onClick={() => handleTabChange({ tab: 'admin.users' })} leftSection={<IconUsers size={14} />}>
                                            {t('Navbar.admin.users')}
                                        </Menu.Item>
                                        <Menu.Divider />
                                    </>
                                }

                                <Menu.Item onClick={() => handleTabChange({ tab: 'stats' })} leftSection={<IconChartInfographic size={14} />}>
                                    {t('Navbar.stats')}
                                </Menu.Item>

                            </Menu.Dropdown>
                        </Menu>
                    </Grid.Col>
                    <Grid.Col span={10}>
                        <Group justify="space-between" grow>
                            <ActionIcon
                                variant='transparent'
                                aria-label='HomePage'
                                size="lg"
                                onClick={() => handleTabChange({ tab: 'home' })}
                                color={settings.tab == 'home' ? undefined : 'gray'}
                            >
                                <IconHome />
                            </ActionIcon>
                            <ActionIcon
                                variant='transparent'
                                aria-label='Tests'
                                size="lg"
                                onClick={() => handleTabChange({ tab: 'tests' })}
                                color={settings.tab == 'tests' ? undefined : 'gray'}
                            >
                                <IconChecklist />
                            </ActionIcon>
                            <ActionIcon
                                variant='transparent'
                                aria-label='Settings'
                                size="lg"
                                onClick={() => handleTabChange({ tab: 'settings' })}
                                color={settings.tab == 'settings' ? undefined : 'gray'}
                            >
                                <IconSettingsCog />
                            </ActionIcon>
                        </Group>
                    </Grid.Col>
                </Grid>

            </AppShell.Footer>
            <Affix position={affixPosition}>
                <Transition transition="slide-up" mounted={scroll.y > 0}>
                    {(transitionStyles) => (
                        <Button
                            leftSection={<IconArrowUp size={16} />}
                            style={transitionStyles}
                            onClick={() => scrollTo({ y: 0 })}
                        >
                            {t('backToTop')}
                        </Button>
                    )}
                </Transition>
            </Affix>
        </AppShell>
    );
}

