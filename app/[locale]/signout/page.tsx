import { Center, Paper, rem, Text, Container, Button } from "@mantine/core"
import { Link } from "@/i18n/routing";
import classes from './signout.module.css';
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { signOut } from "@/auth";
import { IconUserOff } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";
import SignOutButton from "@/components/SignOutButton/SignOutButton";
import ReturnButton from "@/components/ReturnButton/ReturnButton";

export default async function SignOutPage() {
    const t = await getTranslations("Authentication.customPages.signOut");
    return (
        <Container className={classes["container"]} fluid>
            <Center h="100%" className={classes["center"]}>
                <ReturnButton size={"xl"} justIcon classNames={{ root: classes['return-button'] }} />
                <Center>
                    <Paper className={classes["paper"]} radius="md" shadow="xl" mx="sm" p="lg" withBorder>
                        <Text variant="gradient" fw={700} mb={15} size={rem(25)} gradient={{ from: 'pink', to: 'yellow' }}>
                            <Link href="/">
                                testeBac
                            </Link>
                        </Text>
                        <Text size="lg" fw={500} className={classes["signout-title"]}>
                            <IconUserOff color="white" stroke={1.5} />
                            {t("title")}
                        </Text>
                        <Text c="dimmed">
                            {t("confirm")}
                        </Text>
                        <Center mt="lg">
                            <SignOutButton buttonProps={{ classNames: { root: classes["signout-button"] } }} />
                        </Center>
                    </Paper>
                </Center>
            </Center>
        </Container>
    )
}