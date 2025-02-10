import { signIn, providerMap } from "../../../auth"
import {
    Text,
    Center,
    Divider,
    Group,
    Paper,
} from '@mantine/core';
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { Link } from "../../../i18n/routing";
import SubmitButton from "../../../components/SubmitButton/SubmitButton";
import { cookies } from "next/headers";
import EmailForm from "../../../components/EmailForm/EmailForm";
import { getTranslations } from "next-intl/server";
import ErrorAlert from "../../../components/ErrorAlert/ErrorAlert";

export default async function SignInPage(props: Readonly<{ searchParams: Promise<{ callbackUrl: string | undefined, error?: string }> }>) {
    const { searchParams: searchParamsPromise } = props
    const t = await getTranslations("Authentication.customPages");
    const searchParams = await searchParamsPromise
    const csrfToken = (await cookies()).get("signIn.authjs.csrf-token")?.value ?? "";
    return (
        <Center ml="auto" mr="auto" maw={450} h="100vh" p="lg">
            <Paper shadow="xl" radius="md" p="xl" withBorder>
                <Text size="lg" fw={500}>
                    {t("signIn.welcome")} <Text span variant="gradient" fw={700} gradient={{ from: 'pink', to: 'yellow' }}>
                        <Link href="/">
                            testeBac
                        </Link>
                    </Text>, {t("signIn.signIn")}
                </Text>
                <Group grow mb="md" mt="md">
                    {
                        Object.values(providerMap.filter(provider => ["oauth", "oidc", "webauthn"].includes(provider.type))).map((provider) => (
                            <form
                                key={provider.id}
                                action={async () => {
                                    "use server"
                                    await signIn(provider.id, { redirectTo: searchParams?.callbackUrl ?? "", csrfToken })
                                }}
                            >
                                <SubmitButton fullWidth variant="default" radius="xl" key={provider.id} leftSection={provider.id === "google" ? <IconBrandGoogleFilled /> : undefined}>
                                    {provider.name}
                                </SubmitButton>
                            </form>
                        ))
                    }
                </Group>
                <Divider label={t("signIn.or")} labelPosition="center" my="lg" />
                {
                    Object.values(providerMap.filter(provider => ["email"].includes(provider.type))).map((provider) => (
                        <EmailForm key={provider.id} provider={provider} csrfToken={csrfToken} searchParams={searchParams} />
                    ))
                }
                {
                    searchParams?.error && (
                        <ErrorAlert title={t("error."+ searchParams.error + ".title")}>
                            {t("error."+ searchParams.error + ".description")}
                        </ErrorAlert>)
                }
            </Paper>
        </Center>
    )
}