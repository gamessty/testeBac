import { Box, Center, Container, ContainerProps, Divider, Flex, MantineStyleProp, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import TestCard from "../../Cards/TestCard/TestCard";
import CreateTestCard from "../../Cards/CreateTestCard/CreateTestCard";
import { Session } from "next-auth";
import { Fragment, useEffect, useState } from "react";
import { useShallowEffect } from "@mantine/hooks";
import { getFolderNamesByIds } from "../../../actions/PrismaFunctions/getManyFolder";
import { getSubjectNamesByIds } from "../../../actions/PrismaFunctions/getSubjects";

export default function Tests({ session, settab, ...props }: Readonly<{ session: Session, settab: ({ tab }: { tab: string }) => void } & ContainerProps>) {
    const t = useTranslations('Dashboard.Tests');
    const [folderNames, setFolderNames] = useState<{ [key: string]: string }>({});
    const [subjectNames, setSubjectNames] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        async function fetchFolderNames() {
            const folderIds = session.user.activeTests?.map(test => test.folderId) ?? [];
            const fetchedFolderNames = await getFolderNamesByIds(folderIds);
            if (!('message' in fetchedFolderNames)) {
                setFolderNames(fetchedFolderNames);
            }
        }
        fetchFolderNames();
    }, [session.user.activeTests]);

    useEffect(() => {
        async function fetchSubjectNames() {
            const subjectIds = session.user.activeTests?.flatMap(test => test.subjectIds) ?? [];
            const fetchedSubjectNames = await getSubjectNamesByIds(subjectIds);
            if (!('message' in fetchedSubjectNames)) {
                setSubjectNames(fetchedSubjectNames);
            }
        }
        fetchSubjectNames();
    }, [session.user.activeTests]);

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
                                        <TestCard design="compact" mih="100%" category={folderNames[test.folderId]} subject={test.subjectIds.map(id => subjectNames[id]).join(" | ")} progress={test.selectedAnswers.length / test.questions.length * 100} />
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
