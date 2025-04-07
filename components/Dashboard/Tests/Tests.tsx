import { UserActiveTest } from "@/auth";
import { Center, Container, ContainerProps, Divider, Flex, Stack, Text, Title } from "@mantine/core";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { Fragment } from "react";
import CreateTestCard from "../../Cards/CreateTestCard/CreateTestCard";
import TestCard from "../../Cards/TestCard/TestCard";

export default function Tests({ session, settab, ...props }: Readonly<{ session: Session, settab: ({ tab }: { tab: string }) => void } & ContainerProps>) {
    const t = useTranslations('Dashboard.Tests');

    function getLastQuestionText(test: UserActiveTest) {
        return test.questions.filter(q => test.selectedAnswers.findIndex(s => s.questionId == q.id) != -1).sort((a, b) => {
            const aIndex = test.selectedAnswers.findIndex(s => s.questionId == a.id);
            const bIndex = test.selectedAnswers.findIndex(s => s.questionId == b.id);
            return bIndex - aIndex;
        })[0]?.question ?? test.questions[0]?.question
    }

    return (
        <Container fluid p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} {...props}>
            <Title order={1} w="100%" ta="left" mb={20}>
                {t('title')}
                <Text c="dimmed" ml={5} ta="left">
                    {t('tests', { count: session.user.activeTests?.length ?? 0 })}
                </Text>
            </Title>
            <Flex direction="column" pt={{ base: 5, sm: 10 }} h="100%" pb="md">
                <Center style={{ flexGrow: 1 }}>
                    <Stack maw="100vw" w={{ base: "100%", md: "70%", lg: '60%' }}>
                        <CreateTestCard onClick={
                            () => { setTimeout(() => settab({ tab: 'test.generator' }), 400) }
                        } />
                        <Divider />
                        {
                            session.user.activeTests?.map((test) => {
                                return (
                                    <Fragment key={test.id}>
                                        <TestCard design="compact" mih="100%" category={test.folder?.category} subject={test.subjects?.map(sj => sj.name?.toLowerCase())} progress={test.selectedAnswers.length / test.questions.length * 100} href={`/app/test/${test.id}`} lastQuestion={getLastQuestionText(test)} />
                                        <Divider variant="dashed"/>
                                    </Fragment>
                                )
                            })
                        }
                        <TestCard design="compact" mih="100%" progress={50} category="bac" subject="biology" href="#" lastQuestion="Ce este biologia?" />
                        <Divider variant="dashed" />
                        <TestCard design="compact" mih="100%" category="admission" subject="chemistry" href="#" />
                        <Divider variant="dashed" />
                        <TestCard design="compact" mih="100%" category="admission" subject="informatics" href="#" />
                    </Stack>
                </Center>
            </Flex>
        </Container>
    );
}
