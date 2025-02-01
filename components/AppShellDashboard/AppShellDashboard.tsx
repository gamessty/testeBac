'use client';
import { AppShell, Group, ScrollArea, Button, ActionIcon, Text, Avatar, Divider, Stack, Grid, UnstyledButton, Affix, Transition } from "@mantine/core";
import { useDidUpdate, useDocumentTitle, useSetState, useWindowScroll } from "@mantine/hooks";
import { IconHome, IconFile, IconSettingsCog, IconChecklist, IconChartInfographic, IconArrowUp } from "@tabler/icons-react";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import ColorSchemeToggleIcon from "../ColorSchemeToggleIcon/ColorSchemeToggleIcon";
import { signOut } from "next-auth/react";
import Home from "../Dashboard/Home/Home";
import { useSearchParams } from "next/navigation";
import Settings from "../Dashboard/Settings/Settings";
import Stats from "../Dashboard/Stats/Stats";
import Tests from "../Dashboard/Tests/Tests";

interface AppShellDashboardProps {
    session: Session | null | undefined;
}

export default function AppShellDashboard({ session }: Readonly<AppShellDashboardProps>) {
    const searchParams = useSearchParams();

    const t = useTranslations('Dashboard');
    const ta = useTranslations('Authentication');

    const [settings, setSettings] = useSetState({
        tab: searchParams.get('tab') ?? 'home',
        title: 'testeBac | ' + t('Navbar.' + (searchParams.get('tab') ?? 'home')),
        avatarError: false
    });
    useDocumentTitle(settings.title);

    const [scroll, scrollTo] = useWindowScroll();

    useDidUpdate(() => {
        setSettings({ title: 'testeBac | ' + t('Navbar.' + (searchParams.get('tab') ?? 'home')), tab: searchParams.get('tab') ?? 'home' });
    }, [searchParams.get('tab')]);

    function handleTabChange({ tab }: { tab: string }) {
        setSettings({ tab, title: 'testeBac | ' + t('Navbar.' + tab) });
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tab);
        window.history.pushState(null, '', `?${params.toString()}`);
    }

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
                        {(new Date()).getHours()}:{(new Date()).getMinutes()}
                    </Text>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <AppShell.Section grow my="md" component={ScrollArea}>
                    <Stack
                        align="stretch"
                        justify="space-around"
                        gap="md"
                    >
                        <Button onClick={() => handleTabChange({ tab: 'home' })} variant={settings.tab == 'home' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconHome size={17} />}>{t('Navbar.home')}</Button>
                        <Button onClick={() => handleTabChange({ tab: 'tests' })} variant={settings.tab == 'tests' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconFile size={17} />}>{t('Navbar.tests')}</Button>
                        <Button onClick={() => handleTabChange({ tab: 'stats' })} variant={settings.tab == 'stats' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconChartInfographic size={17} />}>{t('Navbar.stats')}</Button>
                        <Button onClick={() => handleTabChange({ tab: 'settings' })} variant={settings.tab == 'settings' ? 'light' : 'outline'} justify="left" h={35} leftSection={<IconSettingsCog size={17} />}>{t('Navbar.settings')}</Button>
                    </Stack>
                </AppShell.Section>
                <AppShell.Section>
                    <Button justify="left" fullWidth my={10} h={35} onClick={() => signOut()} variant="gradient" gradient={{ from: 'purple', to: 'pink' }}>{ta('signOut')}</Button>
                </AppShell.Section>
                <Divider />
                <AppShell.Section my={10}><Group justify="flex-start"><Avatar onError={({ currentTarget }) => { currentTarget.onerror = null; setSettings({ avatarError: true }); }} key={session?.user?.email} src={settings.avatarError ? undefined : session?.user?.image ?? undefined} name={session?.user?.email ?? undefined} color='initials' /> <Text fw={500} ta="center">{session?.user?.email}</Text></Group></AppShell.Section>
                <Divider />
                <AppShell.Section>
                    <Group justify="space-between" mt={10}>
                        <Text ta="center">Ⓒ {(new Date()).getUTCFullYear()}</Text>
                        <ColorSchemeToggleIcon />
                    </Group>
                </AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Main>
                <Transition transition="fade-right" timingFunction="ease" duration={500} mounted={settings.tab == 'home'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'home' && <Home style={transitionStyles} />}
                        </>
                    )}
                </Transition>
                <Transition transition="fade-right" timingFunction="ease" duration={500} mounted={settings.tab == 'tests'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'tests' && <Tests style={transitionStyles} />}
                        </>
                    )}
                </Transition>
                <Transition transition="fade-right" timingFunction="ease" duration={500} mounted={settings.tab == 'stats'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'stats' && <Stats style={transitionStyles} />}
                        </>
                    )}
                </Transition>
                <Transition transition="fade-right" timingFunction="ease" duration={500} mounted={settings.tab == 'settings'}>
                    {(transitionStyles) => (
                        <>
                            {settings.tab == 'settings' && <Settings style={transitionStyles} session={session} />}
                        </>
                    )}
                </Transition>
            </AppShell.Main>
            <AppShell.Footer p={15} display={{ sm: "none" }}>
                <Grid grow>
                    <Grid.Col span={1}>
                        <UnstyledButton disabled>
                            <Avatar onError={({ currentTarget }) => { currentTarget.onerror = null; setSettings({ avatarError: true }); }} key={session?.user?.email} src={settings.avatarError ? undefined : session?.user?.image ?? undefined} name={session?.user?.email ?? undefined} color='initials' />
                        </UnstyledButton>
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
            <Affix position={{ bottom: 20, right: 20 }}>
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