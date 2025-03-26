
"use client";
import { Title, Text, MantineStyleProp, Center, Flex, SimpleGrid, rem } from "@mantine/core";
import classes from "./Home.module.css";
import { useTranslations } from "next-intl";
import { Session } from "next-auth";
import { chkP, getInitialsColor } from "../../../utils";
import LinkCard from "@/components/Cards/LinkCard/LinkCard";
import { usePathname } from "@/i18n/routing";
import { useCallback } from "react";
import { IconFile, IconGraph, IconLogout, IconSettings, IconUser, IconUserPlus } from "@tabler/icons-react";

interface HomeProps {
    style?: MantineStyleProp;
    session: Session
}

const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams()
    params.set(name, value)
    return params.toString()
}

export default function Home({ style, session }: Readonly<HomeProps>) {
    const t = useTranslations('Dashboard');
    const pathname = usePathname();

    return (
        <Flex direction="column" pt={{ base: 5, sm: 10 }} h="100%" pb="md" style={{ ...style }}>
            <Title w={"100%"} order={1} className={classes.title} ta="left" p={{ base: 25, sm: 35 }} fz={{
                base: rem(40),
                sm: rem(50),
                md: rem(60),
                lg: rem(70),
                xl: rem(80),
                xxl: rem(100)
            }} fw={800}>
                {t.rich('Home.welcome', { renderName: () => (<WelcomeMessage name={session.user.name ?? ''} />) })}
            </Title>
            <Center style={{ flexGrow: 1 }}>
                <SimpleGrid maw="100vw" verticalSpacing="lg" cols={2} w={{ base: "90%", xs: '80%', md: "60%", lg: '50%', xxl: '35%' }}>
                    <LinkCard design="compact" mih="100%" actionIcon={<IconFile />} name={t("Navbar.tests")} href={pathname + "?" + createQueryString("tab", "tests")} />
                    <LinkCard design="compact" mih="100%" actionIcon={<IconSettings />} name={t('Navbar.settings')} href={pathname + "?" + createQueryString("tab", "settings")} />
                    <LinkCard design="compact" mih="100%" actionIcon={<IconGraph />} name={t("Navbar.stats")} href={pathname + "?" + createQueryString("tab", "stats")} />
                    <LinkCard design="compact" mih="100%" actionIcon={<IconLogout color="red" />} name={t('Navbar.signout')} href="/api/auth/signout" />
                    {
                        chkP("user:manage", session.user) &&
                        <LinkCard withBorder design="compact" mih="100%" actionIcon={<IconUser />} badge="admin" name={t("Navbar.admin.users")} href={pathname + "?" + createQueryString("tab", "admin.users")} />
                    }
                    {
                        chkP("role:manage", session.user) &&
                        <LinkCard withBorder design="compact" mih="100%" actionIcon={<IconUserPlus />} badge="admin" name={t('Navbar.admin.roles')} href={pathname + "?" + createQueryString("tab", "admin.roles")} />
                    }
                </SimpleGrid>
            </Center>
        </Flex>
    );
}

function WelcomeMessage({ name }: Readonly<{ name: string }>) {
    const t = useTranslations('Dashboard');
    if (!name) return '';
    else
        return (
            <Text span inherit variant="gradient" gradient={{ from: getInitialsColor(name.split(" ")[0]), to: getInitialsColor(name + "_to") }}>
                {t('Home.nameFormatting', { name: name.split(' ')[0] })}
            </Text>
        );
}