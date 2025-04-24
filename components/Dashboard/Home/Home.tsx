
"use client";
import LinkCard from "@/components/Cards/LinkCard/LinkCard";
import { ITabModuleProps } from "@/data";
import { Center, Flex, SimpleGrid, Text, Title, rem } from "@mantine/core";
import { IconFile, IconLogout, IconSettings, IconUser, IconUserPlus } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { chkP, getInitialsColor } from "@/utils";
import classes from "./Home.module.css";

interface HomeProps extends ITabModuleProps {}

export default function Home({ style, session, settab }: Readonly<HomeProps>) {
    const t = useTranslations('Dashboard');

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
                <SimpleGrid maw="100vw" verticalSpacing="xs" cols={2} w={{ base: "90%", xs: '80%', md: "60%", lg: '50%', xxl: '35%' }}>
                    <LinkCard design="compact" pb="50px" actionIcon={<IconFile />} name={t("Navbar.tests")} onClick={() => { settab({ tab: 'tests' }) }} />
                    <LinkCard design="compact" pb="50px" actionIcon={<IconSettings />} name={t('Navbar.settings')} onClick={() => { settab({ tab: 'settings' }) }} />
                    <LinkCard design="compact" pb="50px" actionIcon={<IconLogout color="var(--mantine-color-red-5)" />} name={t('Navbar.signout')} href="/api/auth/signout" />
                    {
                        chkP("user:manage", session.user) &&
                        <LinkCard withBorder design="compact" pb="50px" actionIcon={<IconUser />} badge="admin" name={t("Navbar.admin.users")} onClick={() => { settab({ tab: 'admin.users' }) }} />
                    }
                    {
                        chkP("role:manage", session.user) &&
                        <LinkCard withBorder design="compact" pb="50px" actionIcon={<IconUserPlus />} badge="admin" name={t('Navbar.admin.roles')} onClick={() => { settab({ tab: 'admin.roles' }) }} />
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