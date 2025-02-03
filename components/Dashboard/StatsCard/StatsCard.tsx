import { DonutChart } from "@mantine/charts";
import { Card, Center, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { data } from "./data.example";

interface StatsCardProps {
    href?: string;
}

export default function StatsCard ({ href }: Readonly<StatsCardProps>) {

    return (
        <Card component="a" href={href} style={{ position: 'relative' }} w={"100%"} display="inline-block" shadow="sm" padding="lg" pb={0} pt={20} mr="30" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="xs" mb="md">
                <Text fw={500}>Materii</Text>
            </Card.Section>

            <Card.Section>
                <Center>
                    <DonutChart data={data} startAngle={180} endAngle={0} />
                </Center>
            </Card.Section>
        </Card>
    )
}