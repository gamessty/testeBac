'use client';
import { AppShell, Group, Button, ActionIcon, Text, Divider, Stack, Grid, UnstyledButton, Affix, Transition, Badge, Flex, Tooltip, useMatches, Menu } from "@mantine/core";
import { useDidUpdate, useDocumentTitle, useSetState, useWindowScroll } from "@mantine/hooks";
import { IconHome, IconFile, IconSettingsCog, IconChecklist, IconChartInfographic, IconArrowUp, IconUsers, IconLogout } from "@tabler/icons-react";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import ColorSchemeToggleIcon from "../ColorSchemeToggleIcon/ColorSchemeToggleIcon";
import { signOut } from "next-auth/react";
import Home from "../Dashboard/Home/Home";
import { useSearchParams } from "next/navigation";
import Settings from "../Dashboard/Settings/Settings";
import Stats from "../Dashboard/Stats/Stats";
import Tests from "../Dashboard/Tests/Tests";
import { chkP, enumToString, getInitialsColor } from "../../utils";
import React, { useEffect } from "react";
import UserManager from "../Dashboard/Admin/UserManager/UserManager";
import { ITabData, Permissions } from "../../data";
import AvatarFallback from "../AvatarFallback/AvatarFallback";
import AvatarMenu from "../AvatarMenu/AvatarMenu";
import { Link } from "../../i18n/routing";

interface AppShellDashboardProps {
    session: Session | null | undefined;
}
interface SettingsSetState {
    tab: string;
    title: string;
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
                    <Text variant="gradient" fw={700} size="xl" gradient={{ from: 'pink', to: 'yellow' }}>
                        <Link href="/">
                            testeBac
                        </Link>
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
                        {
                            // sort the tabsData by category order and by category and add a divider and the title of the category before the first tab of the category if the category has the showLabel property set to true
                            tabsData.toSorted((a, b) => a.category.order - b.category.order).map((tab, index, array) => {
                                if ((tab.category.showLabel && index == 0) || (tab.category.showLabel && index > 0 && array[index - 1].category.name != tab.category.name)) {
                                    return (
                                        <React.Fragment key={tab.category.name + index}>
                                            {tab.category.permissionNeeded && chkP(enumToString(tab.category.permissionNeeded), session?.user) &&
                                                <>
                                                    {index !== 0 && <Divider />}
                                                    <Text c="dimmed" ta="left">{t(`Navbar.${tab.category.name}.title`)}</Text>
                                                </>
                                            }
                                            {chkP(enumToString(tab.permissionNeeded), session?.user) && <Button key={tab.tab} color={tab.color ?? getInitialsColor(tab.tab)} onClick={() => handleTabChange({ tab: tab.tab })} variant={settings.tab == tab.tab ? 'light' : 'outline'} justify="left" h={35} leftSection={tab.icon}>{t(`Navbar.${tab.tab}`)}</Button>}
                                        </React.Fragment>
                                    )
                                } else {
                                    return (chkP(enumToString(tab.permissionNeeded), session?.user) && <Button key={tab.tab} color={tab.color ?? getInitialsColor(tab.tab)} onClick={() => handleTabChange({ tab: tab.tab })} variant={settings.tab == tab.tab ? 'light' : 'outline'} justify="left" h={35} leftSection={tab.icon}>{t(`Navbar.${tab.tab}`)}</Button>)
                                }
                            })
                        }
                    </Stack>
                </AppShell.Section>
                <AppShell.Section>
                    <Grid>
                        <Grid.Col span="content">
                            <ColorSchemeToggleIcon my={10} />
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <Button justify="left" fullWidth my={10} h={35} onClick={() => signOut()} variant="gradient" gradient={{ from: 'purple', to: 'pink' }}>{ta('signOut')}</Button>
                        </Grid.Col>
                    </Grid>
                </AppShell.Section>
                <Divider />
                <AppShell.Section my={10}>
                    <Flex gap="md" align="center">
                        <AvatarFallback
                            key={session?.user?.email}
                            src={session?.user?.image ?? undefined}
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
                                    session?.user?.roles?.map((role) => (
                                        <Grid.Col pt={0} mt={-6} span="content" key={role.id}>
                                            <Tooltip tt="capitalize" label={role.name} color={getInitialsColor(role.name)} withArrow>
                                                <Badge size="sm" variant="dot" color={getInitialsColor(role.name)} radius="xs" tt="capitalize">{role.name}</Badge>
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
                        <Text ta="center" size="sm">Ⓒ {settings.year}</Text>
                        <Text ta="center" size="sm" component="a" href="/privacy-policy">{t('privacyPolicy')}</Text>

                    </Group>
                </AppShell.Section>
            </AppShell.Navbar>
            <AppShell.Main>
                {
                    // NEED TO AUTOMATE THIS MAIN SECTION USING THE NEW tabData ARRAY, how.... I do not know yet
                }
                {
                    tabsData.map((tab) => (
                        <Transition key={tab.tab + "_tabComponent"} transition="fade-right" timingFunction="ease" duration={500} mounted={settings.tab == tab.tab}>
                            {(transitionStyles) => (
                                <>
                                    {settings.tab == tab.tab && tab.component && <tab.component session={session} style={transitionStyles} />}
                                </>
                            )}
                        </Transition>
                    ))
                }
            </AppShell.Main>
            <AppShell.Footer p={15} display={{ sm: "none" }}>
                <Grid grow>
                    <Grid.Col span={1}>
                        <AvatarMenu shadow="md" position="top-start" offset={20} transitionProps={{ transition: 'pop-bottom-left', duration: 200 }} AvatarProps={{ src: session?.user?.image ?? undefined, name: session?.user?.username ?? session?.user?.email ?? undefined, color: 'initials' }}>
                            {(chkP('user:manage', session?.user)) &&
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

                            <Menu.Divider />

                            <Menu.Item color="red" onClick={() => signOut()} leftSection={<IconLogout size={14} />}>
                                {ta('signOut')}
                            </Menu.Item>
                        </AvatarMenu>
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

export const tabsData: ITabData[] = [
    {
        "tab": "home",
        "icon": (<IconHome size={17} />),
        "component": Home,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "tests",
        "icon": (<IconFile size={17} />),
        "component": Tests,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "stats",
        "icon": (<IconChartInfographic size={17} />),
        "component": Stats,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "settings",
        "icon": (<IconSettingsCog size={17} />),
        "component": Settings,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "admin.users",
        "icon": (<IconUsers size={17} />),
        "component": UserManager,
        "category": {
            "name": "admin",
            "order": 1,
            "namespaced": true,
            "showLabel": true,
            "permissionNeeded": Permissions["user:*"]
        },
        "permissionNeeded": Permissions["user:manage"]
    }
]
