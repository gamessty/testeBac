
"use client";
import { Title, Text, Grid, MantineStyleProp, Center, Flex, useMatches, SimpleGrid, rem } from "@mantine/core";
import classes from "./Home.module.css";
import { useTranslations } from "next-intl";
import TestCard from "../TestCard/TestCard";
import { Session } from "next-auth";
import { getInitialsColor } from "../../../utils";

interface HomeProps {
    style?: MantineStyleProp;
    session: Session
}

export default function Home({ style, session }: Readonly<HomeProps>) {
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
                <SimpleGrid maw="100vw" cols={2} w={{ base: "95%", xs: '90%', md: "60%", lg: '50%', xxl: '35%' }}>
                    <TestCard mih="100%" category="bac" subject="biology" href="./#" />
                    <TestCard mih="100%" category="admission" subject="chemistry" href="#" />
                    <TestCard mih="100%" category="admission" subject="informatics" href="#" />
                    <TestCard mih="100%" category="bac" subject="chemistry" href="#" />
                    <TestCard mih="100%" category="bac" subject="informatics" href="#" />
                    <TestCard mih="100%" category="admission" subject="chemistry" href="#" />
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