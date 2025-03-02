'use client';
import { AppShell, Group, Button, ActionIcon, Text, Divider, Stack, Grid, Affix, Transition, Badge, Flex, Tooltip, useMatches, Menu, ScrollArea } from "@mantine/core";
import { useDidUpdate, useDocumentTitle, useSetState } from "@mantine/hooks";
import { IconHome, IconSettingsCog, IconChecklist, IconChartInfographic, IconArrowUp, IconUsers, IconLogout, IconUserPlus } from "@tabler/icons-react";
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
import React, { Suspense, useEffect, useRef, useState } from "react";
import UserManager from "../Dashboard/Admin/UserManager/UserManager";
import { ITabData, Permissions } from "../../data";
import AvatarFallback from "../AvatarFallback/AvatarFallback";
import AvatarMenu from "../AvatarMenu/AvatarMenu";
import { Link } from "../../i18n/routing";
import RoleManager from "../Dashboard/Admin/RoleManager/RoleManager";
import SignOutButtonClient from "../SignOutButton/SignOutButton.client";
import classes from './AppShellDashboard.module.css';

interface AppShellDashboardProps {
    session: Session | null | undefined;
    children: React.ReactNode;
}
interface SettingsSetState {
    tab: string;
    title: string;
    hour: number;
    minute: number;
    year: number;
}

export default function AppShellDashboard({ session, children }: Readonly<AppShellDashboardProps>) {
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

    const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
    const viewport = useRef<HTMLDivElement>(null);


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

    const size = "calc(100vh - var(--app-shell-header-height, 0px))";
    const sizeMobile = "calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))";

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: true } }}
            padding={0}
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
                <AppShell.Section grow mt="md" component={ScrollArea}>
                    <Stack
                        align="stretch"
                        justify="space-around"
                        gap="md"
                        pb={25}
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
                                            {chkP(enumToString(tab.permissionNeeded), session?.user) && <Button style={{ boxShadow: "var(--mantine-shadow-xl)" }} key={tab.tab} color={tab.color ?? getInitialsColor(tab.tab)} onClick={() => handleTabChange({ tab: tab.tab })} variant={settings.tab == tab.tab ? 'light' : 'outline'} justify="left" h={35} leftSection={<tab.icon size={17} />}>{t(`Navbar.${tab.tab}`)}</Button>}
                                        </React.Fragment>
                                    )
                                } else {
                                    return (chkP(enumToString(tab.permissionNeeded), session?.user) && <Button style={{ boxShadow: "var(--mantine-shadow-xl)" }} key={tab.tab} color={tab.color ?? getInitialsColor(tab.tab)} onClick={() => handleTabChange({ tab: tab.tab })} variant={settings.tab == tab.tab ? 'light' : 'outline'} justify="left" h={35} leftSection={<tab.icon size={17} />}>{t(`Navbar.${tab.tab}`)}</Button>)
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
                            <SignOutButtonClient session={session} justify="left" fullWidth my={10} h={35} variant="gradient" gradient={{ from: 'purple', to: 'pink' }} />
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
                <ScrollArea
                    onScrollPositionChange={setScrollPosition}
                    h={{ base: sizeMobile, sm: size }}
                    viewportRef={viewport}
                    classNames={{
                        viewport: classes.appShellScrollArea
                    }}>
                    <Suspense>
                        {
                            tabsData.map((tab) => (
                                <Transition key={tab.tab + "_tabComponent"} transition="fade-right" timingFunction="ease" duration={500} mounted={settings.tab == tab.tab} >
                                    {(transitionStyles) => (
                                        <>
                                            {settings.tab == tab.tab && tab.component && <tab.component session={session} style={transitionStyles} />}
                                        </>
                                    )}
                                </Transition>
                            ))
                        }
                    </Suspense>
                </ScrollArea>
            </AppShell.Main>
            <AppShell.Footer p={15} display={{ sm: "none" }}>
                <Grid grow>
                    <Grid.Col span={1}>
                        <AvatarMenu shadow="md" position="top-start" offset={20} transitionProps={{ transition: 'pop-bottom-left', duration: 200 }} AvatarProps={{ src: session?.user?.image ?? undefined, name: session?.user?.username ?? session?.user?.email ?? undefined, color: 'initials' }}>
                            {tabsData.filter(t => !t.mobile && chkP(enumToString(t.permissionNeeded), session?.user)).toSorted((a, b) => b.category.order - a.category.order).map((tab, index, array) => (
                                <React.Fragment key={tab.tab + "_menu"}>
                                    {((index > 0 && array[index - 1].category.name != tab.category.name) || index == 0) && (!tab.category.permissionNeeded || chkP(enumToString(tab.category.permissionNeeded), session?.user)) &&
                                        <>
                                            {tab.category.showLabel && <Menu.Label tt="capitalize">{t(`Navbar.${tab.category.name}.title`)}</Menu.Label>}
                                            {index > 0 && <Menu.Divider />}
                                        </>
                                    }
                                    <Menu.Item onClick={() => handleTabChange({ tab: tab.tab })} leftSection={<tab.icon size={14} />}>
                                        {t(`Navbar.${tab.tab}`)}
                                    </Menu.Item>
                                </React.Fragment>
                            ))}

                            <Menu.Divider />

                            <Menu.Item color="red" onClick={() => signOut()} leftSection={<IconLogout size={14} />}>
                                {ta('signOut')}
                            </Menu.Item>
                        </AvatarMenu>
                    </Grid.Col>
                    <Grid.Col span={10}>
                        <Group justify="space-between" grow>
                            {tabsData.filter(t => t.mobile && chkP(enumToString(t.permissionNeeded), session?.user)).map((tab) => (
                                <ActionIcon
                                    key={tab.tab}
                                    variant='transparent'
                                    aria-label={tab.tab}
                                    size="lg"
                                    onClick={() => handleTabChange({ tab: tab.tab })}
                                    color={settings.tab == tab.tab ? undefined : 'gray'}
                                >
                                    <tab.icon />
                                </ActionIcon>
                            ))}
                        </Group>
                    </Grid.Col>
                </Grid>
            </AppShell.Footer>
            <Affix position={affixPosition}>
                <Transition transition="slide-up" mounted={false}>
                    {(transitionStyles) => (
                        <Button
                            leftSection={<IconArrowUp size={16} />}
                            style={{ boxShadow: "var(--mantine-shadow-xl)", ...transitionStyles }}
                            /*onClick={
                                () => 
                                    viewport.current?.scrollTo({ top: 0, behavior: 'smooth' })
                            }*/
                            variant="gradient"
                            gradient={{ from: 'purple', to: 'pink' }}
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
        "icon": IconHome,
        "component": Home,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "mobile": true,
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "tests",
        "icon": IconChecklist,
        "component": Tests,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "mobile": true,
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "stats",
        "icon": IconChartInfographic,
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
        "icon": IconSettingsCog,
        "component": Settings,
        "category": {
            "name": "general",
            "order": 0,
            "namespaced": false,
            "showLabel": false
        },
        "mobile": true,
        "permissionNeeded": Permissions["general:*"]
    },
    {
        "tab": "admin.users",
        "icon": IconUsers,
        "component": UserManager,
        "category": {
            "name": "admin",
            "order": 1,
            "namespaced": true,
            "showLabel": true,
            "permissionNeeded": [Permissions["user:*"], Permissions["role:*"]]
        },
        "permissionNeeded": Permissions["user:manage"]
    },
    {
        "tab": "admin.roles",
        "icon": IconUserPlus,
        "component": RoleManager,
        "category": {
            "name": "admin",
            "order": 1,
            "namespaced": true,
            "showLabel": true,
            "permissionNeeded": [Permissions["user:*"], Permissions["role:*"]]
        },
        "permissionNeeded": Permissions["role:manage"]
    }
]
