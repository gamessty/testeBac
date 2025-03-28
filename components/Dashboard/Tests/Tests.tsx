import { Box, Center, Container, ContainerProps, Divider, Flex, MantineStyleProp, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import TestCard from "../../Cards/TestCard/TestCard";
import CreateTestCard from "../../Cards/CreateTestCard/CreateTestCard";
import { Session } from "next-auth";
import { Fragment, useEffect, useState } from "react";
import { useShallowEffect } from "@mantine/hooks";

export default function Tests({ session, settab, ...props }: Readonly<{ session: Session, settab: ({ tab }: { tab: string }) => void } & ContainerProps>) {
    const t = useTranslations('Dashboard.Tests');

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
                        { // add the test logic later
                        }
                        <CreateTestCard onClick={
                            () => { setTimeout(() => settab({ tab: 'test.generator' }), 400) }
                        } />
                        <Divider />
                        {
                            session.user.activeTests?.map((test) => {
                                return (
                                    <Fragment key={test.id}>
                                        {// NOT DONE - LOGIC IS A MESS, NEEDS TO IMPLEMENT TRANSLATIONS FOR FOLDER AND SUBJECT NAMES AND PROBABLY OTHER THINGS
                                        //TEST CREATION LOGIC IS A MESS IN MY MIND, NEEDS TO BE DONE ASAP
                                        }
                                        <TestCard design="compact" mih="100%" category={test.folder} subject={test.subject.join(" | ")} progress={test.selectedAnswers.length / test.questions.length * 100} />
                                        <Divider />
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