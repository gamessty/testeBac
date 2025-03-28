import { Center, Paper, rem, Text, Container } from "@mantine/core"
import { Link } from "../../../i18n/routing";
import classes from './signout.module.css';
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import { signOut } from "@/auth";
import { IconLogout, IconUserOff } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";

export default async function SignOutPage() {
    const t = await getTranslations("Authentication.customPages.signOut");
    return (
        <Container className={classes["container"]} fluid >
            <Center h="100%">
                <Paper className={classes["paper"]} radius="md" shadow="xl" mx="sm" p="lg" withBorder>
                    <Text variant="gradient" fw={700} mb={15} size={rem(25)} gradient={{ from: 'pink', to: 'yellow' }}>
                        <Link href="/">
                            testeBac
                        </Link>
                    </Text>
                    <Text size="lg" fw={500} className={classes["signout-title"]}>
                        <IconUserOff color="white" stroke={1.5}/>
                        {t("title")}
                    </Text>
                    <Text c="dimmed">
                        {t("confirm")}
                    </Text>
                    <Center mt="lg">
                        <form
                            action={async (formData) => {
                                "use server"
                                await signOut()
                            }}
                        >
                            <SubmitButton
                                type="full"
                                size="md"
                                classNames={{ root: classes["signout-button"] }}
                            >
                                <Text inherit fw={500}>
                                    {t("signOut")}
                                </Text>
                            </SubmitButton>
                        </form>
                    </Center>
                </Paper>
            </Center>
        </Container>
    )
}