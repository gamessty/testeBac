import { Title, Text, Grid, MantineStyleProp } from "@mantine/core";
import classes from "./Home.module.css";
import { useTranslations } from "next-intl";
import TestCard from "../TestCard/TestCard";

interface HomeProps {
    style?: MantineStyleProp;
}

export default function Home({ style }: Readonly<HomeProps>) {
    const t = useTranslations('Dashboard');
    return (
        <Grid p={{base: 25, sm: 35}} pt={{ base: 5, sm: 10 }} style={style}>
            <Grid.Col span={12} >
                <Title order={1} className={classes.title} ta="left">
                    <Text inherit variant="gradient" gradient={{ from: 'green', to: 'yellow', deg: 180 }}>
                        {t('Home.welcome')}
                    </Text>
                </Title>
            </Grid.Col>
            <Grid.Col span={{base: 12, lg: 5, xl: 4, xxl: 3, xxxl: 2}} >
                <Title order={2} mb={10} ta="left">
                    {t('Home.lastTest')}
                </Title>
                <TestCard href="#" subject="informatics" category="entrance" lastQuestion="Maltoza este:" />
            </Grid.Col>
        </Grid>
    );
}