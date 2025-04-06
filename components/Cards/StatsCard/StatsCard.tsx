import { Card, Center, Text } from "@mantine/core";
import { Link } from "../../../i18n/routing";

interface StatsCardProps {
    href?: string;
}

export default function StatsCard ({ href }: Readonly<StatsCardProps>) {

    return (
        <Card component={Link} href={href ?? '#'} style={{ position: 'relative' }} w={"100%"} display="inline-block" shadow="sm" padding="lg" pb={0} pt={20} mr="30" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs" mb="md">
                <Text fw={500}>Materii</Text>
            </Card.Section>

            <Card.Section>
                <Center>
                </Center>
            </Card.Section>
        </Card>
    )
}