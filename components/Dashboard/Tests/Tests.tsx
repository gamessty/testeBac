import { Center, Container, ContainerProps, Flex, MantineStyleProp, SimpleGrid, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import TestCard from "../../Cards/TestCard/TestCard";
import CreateTestCard from "../../Cards/CreateTestCard/CreateTestCard";

export default function Tests({ session, ...props }: Readonly<{ session: any } & { props?: ContainerProps }>) {
    const t = useTranslations('Dashboard.Tests');
    return (
        <Container fluid p={{ base: 30, sm: 35 }} pt={{ base: 20, sm: 25 }} {...props}>
            <Title order={1} w="100%" ta="left" mb={20}>
                {t('title')}
                <Text c="dimmed" ml={5} ta="left">
                    {t('tests', { count: 0 })}
                </Text>
            </Title>
            <Flex direction="column" pt={{ base: 5, sm: 10 }} h="100%" pb="md">
                <Center style={{ flexGrow: 1 }}>
                    <SimpleGrid maw="100vw" cols={1} w={{ base: "95%", md: "70%", lg: '60%'}}>
                        { // add the test logic later
                        }
                        <CreateTestCard />
                        <TestCard design="compact" mih="100%" progress={50} category="bac" subject="biology" href="./#" lastQuestion="Ce este biologia?" />
                        <TestCard mih="100%" category="admission" subject="chemistry" href="#" />
                        <TestCard mih="100%" category="admission" subject="informatics" href="#" />
                        <TestCard mih="100%" category="bac" subject="chemistry" href="#" />
                        <TestCard mih="100%" category="bac" subject="informatics" href="#" />
                        <TestCard mih="100%" category="admission" subject="chemistry" href="#" />
                    </SimpleGrid>
                </Center>
            </Flex>
        </Container>
    );
}