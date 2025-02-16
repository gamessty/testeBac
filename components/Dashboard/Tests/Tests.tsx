import { Container, ContainerProps, MantineStyleProp, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";

export default function Tests(props: Readonly<ContainerProps>) {
    const t = useTranslations('Dashboard.Tests');
    return (
        <Container fluid p={{ base: 25, sm: 35 }} pt={{ base: 10, sm: 25 }} {...props}>
            <Title order={1} w="100%" ta="left" mb={20}>
                {t('title')}
                <Text c="dimmed" ml={5} ta="left">
                    {t('tests', { count: 0 })}
                </Text>
            </Title>
        </Container>
    );
}