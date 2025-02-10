import { signIn, providerMap } from "../../../auth"
import {
    Text,
    Center,
    Divider,
    Group,
    Paper
} from '@mantine/core';
import { IconBrandGoogleFilled } from "@tabler/icons-react";
import { Link } from "../../../i18n/routing";
import SubmitButton from "../../../components/SubmitButton/SubmitButton";
import { cookies } from "next/headers";
import EmailForm from "../../../components/EmailForm/EmailForm";
import { getTranslations } from "next-intl/server";

/*const getCsrfTokenServerSide = async (NextAuthBaseUrl: string) => {
    //const NextAuthBaseUrl t= "";// process.env.NEXTAUTH_URL;
    const allCookies = await cookies();

    const cookieHeader = allCookies.getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join('; ');

    const csrfResponse = await fetch(`${NextAuthBaseUrl}/csrf`, {
        headers: {
            Cookie: cookieHeader,
        },
    });

    if (!csrfResponse.ok) {
        return;
    }

    const csrfToken: string = await csrfResponse.json().then(resp => resp.csrfToken);

    return csrfToken;
}
*/

export default async function SignInPage(props: Readonly<{ searchParams: Promise<{ callbackUrl: string | undefined }> }>) {
    const { searchParams: searchParamsPromise } = props
    const t = await getTranslations("Authentication.customPages.signIn");
    const searchParams = await searchParamsPromise
    const csrfToken = (await cookies()).get("authjs.csrf-token")?.value ?? "";
    /*const headersList = await headers();
    const host = headersList.get('X-Forwarded-Host');
    const proto = headersList.get('X-Forwarded-Proto');
    const csrfToken = await getCsrfTokenServerSide(proto+"://"+host+"/api/auth");*/
    return (
        <Center ml="auto" mr="auto" maw={450} h="100vh" p="lg">
            <Paper shadow="xl" radius="md" p="xl" withBorder>
                <Text size="lg" fw={500}>
                    {t("welcome")} <Text span variant="gradient" fw={700} gradient={{ from: 'pink', to: 'yellow' }}>
                        <Link href="/">
                            testeBac
                        </Link>
                    </Text>, {t("signIn")}
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
                <Divider label={t("or")} labelPosition="center" my="lg" />
                {
                    Object.values(providerMap.filter(provider => ["email"].includes(provider.type))).map((provider) => (
                        <EmailForm key={provider.id} provider={provider} csrfToken={csrfToken} searchParams={searchParams} />
                    ))
                }
            </Paper>
        </Center>
    )
}