import classes from "./testStart.module.css";

import { auth } from "@/auth";
import ErrorOverlay from "@/components/ErrorOverlay/ErrorOverlay";
import useUserTest from "@/hooks/useUserTest";
import { redirect } from "@/i18n/routing";
import { Container, Loader, Text } from "@mantine/core";
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

    let error = ''
    const testDetails = session.user.activeTests?.find(test => test.id === testId);

    if (!testDetails) {
        error = 'NOT_FOUND';
    }
    /*let test = useUserTest(testId);
    if (test.loading) {
        return (
            <Container className={classes.container}>
                <Loader size="xl" />
                <Text>Loading test...</Text>
            </Container>
        );
    }

    if (test.error) {
        return (
            <Container className={classes.container}>
                <ErrorOverlay error={test.error} />
            </Container>
        );
    }
    const currentQuestion = test.getCurrentQuestion();
    const firstUnansweredQuestion = test.getFirstUnansweredQuestion();


*/

    //create a function to start the test
    // first determine if the test is already started
    // if it is, continue, determine the last question, if there is a timeLimit, check if the time is up
    // if it is, redirect to the test results page and finish the test
    // create a serverAction to end the test in the current point
    // if it is not started, start the test and determine that last question
    // implement the startTest function in the test controller
    // maybe create a hook to handle the test state and the time limit
    //  const test = useUserTest(testId);
    // test.startTest();
    // test.getLastQuestion(); // returns the last question object
    // test.getTimeLimit();
    // test.endTest();
    // test.nextQuestion();
    // test.previousQuestion();
    // test.getQuestion(questionIndex?: number);



    return (
        <Container className={classes.container}>
            <ErrorOverlay error={error} />
            <Text>Test Start</Text>
            {/*<Text>Current question: {currentQuestion?.text}</Text>
            <Text>First unansweredQuestion: {firstUnansweredQuestion?.text}</Text>*/}
        </Container>
    );
}