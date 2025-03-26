import { Center, Paper, rem, Text, Button } from "@mantine/core"
import { Link } from "../../../i18n/routing";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import classes from './signout.module.css';
import SubmitButton from "@/components/SubmitButton/SubmitButton";

export default async function SignOutPage() {
    const t = await getTranslations("Authentication.customPages.signOut");

    const cookiesRequest = await cookies();
    const csrfToken = cookiesRequest.get("next-auth.csrf-token")?.value ?? "";
    return (
        <Center ml="auto" mr="auto" maw={450} h="100vh" p="lg">
            <Paper radius="md" shadow="xl" p="xl" withBorder>
                <Text variant="gradient" fw={700} mb={15} size={rem(30)} gradient={{ from: 'pink', to: 'yellow' }}>
                    <Link href="/">
                        testeBac
                    </Link>
                </Text>
                <Text size="lg" fw={500}>
                    {t("title")}
                </Text>
                <Center mt="lg">
                    <form
                        action="/api/auth/signout"
                        method="POST"
                    >
                        <input type="hidden" name="csrfToken" value={csrfToken} />
                        <SubmitButton
                            size="lg"
                            variant="gradient"
                            classNames={{ root: classes["signout-button"]}}
                            gradient={{ from: 'purple', to: 'red' }}>
                            {t("confirm")}
                        </SubmitButton>
                    </form>
                </Center>
            </Paper>
        </Center>
    )
}