'use client';

import { Affix, AppShell, Badge, Button, Divider, Flex, Grid, Group, ScrollArea, Stack, Text, Tooltip, Transition, useMatches } from "@mantine/core";
import { Link, useRouter } from "../../../i18n/routing";
import { Suspense, useEffect, useRef, useState, Fragment } from "react";
import Navbar from "../../../components/AppShellDashboard/Navbar/Navbar";
import classes from '../../../components/AppShellDashboard/AppShellDashboard.module.css';
import { IconArrowUp } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import AvatarFallback from "../../../components/AvatarFallback/AvatarFallback";
import ColorSchemeToggleIcon from "../../../components/ColorSchemeToggleIcon/ColorSchemeToggleIcon";
import SignOutButtonClient from "../../../components/SignOutButton/SignOutButton.client";
import { chkP, enumToString, getInitialsColor } from "../../../utils";
import { useSession } from "next-auth/react";


export default function Layout({
    children,
    params
}: Readonly<{
    children: React.ReactNode,
    params: { tab: string[] }
}>) {
    const t = useTranslations('Dashboard');
    const { data: session } = useSession();
    const router = useRouter();

    const [time, setTime] = useState({ hour: (new Date()).getHours(), minute: (new Date()).getMinutes(), year: (new Date()).getFullYear() });
    useEffect(() => {
        setInterval(() => {
            setTime({ hour: (new Date()).getHours(), minute: (new Date()).getMinutes(), year: (new Date()).getFullYear() });
        }, 60000);
    });

    const affixPosition = useMatches({
        base: { bottom: 95, right: 20 },
        sm: { bottom: 20, right: 20 }
    })

    const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
    const viewport = useRef<HTMLDivElement>(null);

    const size = "calc(100vh - var(--app-shell-header-height, 0px))";
    const sizeMobile = "calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))";


    useEffect(() => {
        if (!session?.user || !session.user.userAuthorized) {
            router.push('/');
        }
    }, [session]);

    return (
        session?.user && <AppShell
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
                        {time.hour < 10 ? '0' + time.hour : time.hour}:{time.minute < 10 ? '0' + time.minute : time.minute}
                    </Text>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <AppShell.Section grow mt="md" component={ScrollArea}>
                    <Navbar />
                </AppShell.Section>
                <AppShell.Section>
                    <Grid>
                        <Grid.Col span="content">
                            <ColorSchemeToggleIcon my={10} />
                        </Grid.Col>
                        <Grid.Col span="auto">
                            <SignOutButtonClient justify="left" fullWidth my={10} h={35} variant="gradient" gradient={{ from: 'purple', to: 'pink' }} />
                        </Grid.Col>
                    </Grid>
                </AppShell.Section>
                <Divider />
                <AppShell.Section>
                    <Group justify="space-between" mt={10}>
                        <Text ta="center" size="sm">Ⓒ {time.year}</Text>
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
                        {children}
                    </Suspense>
                </ScrollArea>
            </AppShell.Main>
            <Affix position={affixPosition}>
                <Transition transition="slide-up" mounted={scrollPosition.y > 0}>
                    {(transitionStyles) => (
                        <Button
                            leftSection={<IconArrowUp size={16} />}
                            style={{ boxShadow: "var(--mantine-shadow-xl)", ...transitionStyles }}
                            onClick={
                                () =>
                                    viewport.current?.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                            variant="gradient"
                            gradient={{ from: 'purple', to: 'pink' }}
                        >
                            {t('backToTop')}
                        </Button>
                    )}
                </Transition>
            </Affix>
        </AppShell>
    )
}
