import { Center, Container, ScrollArea } from "@mantine/core";
import classes from "./testDetails.module.css";
import { auth } from "@/auth";
import TestDisplay from "@/components/TestDisplay/TestDisplay";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import ErrorOverlay from "@/components/ErrorOverlay/ErrorOverlay";

export const metadata = {
    title: "testeBac | test details",
    description: "Details of the test",
};

export default async function TestPage({
    params
}: Readonly<{ params: Promise<{ testId: string }> }>) {
    let { testId } = await params;
    const locale = await getLocale();
    const session = await auth();
    if (!session?.user) {
        redirect({ 'href': '/auth/signin?callbackUrl=/app/test/' + testId, 'locale': locale });
        return undefined;
    }

    let error = ''
    const testDetails = session.user.activeTests?.find(test => test.id === testId);

    if (!testDetails) {
        error = 'NOT_FOUND';
    }

    console.log(testDetails);

    return (
        <Container className={classes.container}>
            <ScrollArea classNames={{
                root: classes.scrollAreaRoot,
            }}>
                <ErrorOverlay error={error} />
                <TestDisplay testDetails={testDetails} />
            </ScrollArea>
        </Container>
    )
}