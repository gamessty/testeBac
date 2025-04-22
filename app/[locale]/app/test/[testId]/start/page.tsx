import { auth } from "@/auth";
import ClientTestInterface from "@/components/ClientTestInterface/ClientTestInterface";
import ErrorOverlay from "@/components/ErrorOverlay/ErrorOverlay";
import { redirect } from "@/i18n/routing";
import { Container } from "@mantine/core";
import { getLocale } from "next-intl/server";

export default async function TestStart({
    params
}: Readonly<{ params: Promise<{ testId: string }> }>)
{
    let { testId } = await params;
    const locale = await getLocale();
    const session = await auth();
    if (!session?.user) {
        redirect({ 'href': '/auth/signin?callbackUrl=/app/test/' + testId, 'locale': locale });
        return undefined;
    }

    let error = '';
    const testDetails = session.user.activeTests?.find(test => test.id === testId);

    if (!testDetails) {
        error = 'NOT_FOUND';
        return (
            <Container>
                <ErrorOverlay error={error} />
            </Container>
        );
    }

    // Render the client-side test interface
    return <ClientTestInterface testId={testId} codeLanguage={session.user.preferences.codingLanguage} />;
}