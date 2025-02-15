import { Title, Text, Grid, MantineStyleProp, Center, Flex } from "@mantine/core";
import classes from "./Home.module.css";
import { useTranslations } from "next-intl";
import TestCard from "../TestCard/TestCard";
import { Session } from "next-auth";

interface HomeProps {
    style?: MantineStyleProp;
    session: Session
}

export default function Home({ style, session }: Readonly<HomeProps>) {
    const t = useTranslations('Dashboard');
    return (
        <Flex direction="column" p={{ base: 15, sm: 35 }} pt={{ base: 1, sm: 10 }} h="calc(100vh - var(--app-shell-header-height, 0px))" style={{ ...style }}>
            <Title w={"100%"} order={1} className={classes.title} ta="left">
                <Text inherit variant="gradient" gradient={{ from: 'green', to: 'yellow', deg: 180 }}>
                    {t.rich('Home.welcome', { name: () => session.user.name ? t('Home.nameFormatting', { name: session.user.name?.split(" ")[0] }) : '' })}
                </Text>
            </Title>
            <Center style={{ flexGrow: 1 }}>
                <Grid columns={2} w={{ base: "100%",  xs: '80%', sm: '75%', md: "50%", lg: '40%', xxl: '25%' }} gutter={15}>
                    <Grid.Col span={1}>
                        <TestCard mih="100%" category="bac" subject="biology" href="#" />
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <TestCard mih="100%" category="entrance" subject="chemistry" href="#" />
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <TestCard mih="100%" category="entrance" subject="informatics" href="#" />
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <TestCard mih="100%" category="bac" subject="chemistry" href="#" />
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <TestCard mih="100%" category="bac" subject="informatics" href="#" />
                    </Grid.Col>
                    <Grid.Col span={1}>
                        <TestCard mih="100%" category="entrance" subject="chemistry" href="#" />
                    </Grid.Col>
                </Grid>
            </Center>
        </Flex>
    );
}