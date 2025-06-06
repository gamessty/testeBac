"use client";
import { Center, Paper, rem, Text, Button } from "@mantine/core"
import { useTranslations } from "next-intl";
import { Link } from "../../../i18n/routing";

export default function VerifyRequestPage() {
    const t = useTranslations("Authentication.customPages.verifyRequest");
    return (
        <Center ml="auto" mr="auto" maw={450} h="100vh" p="lg">
            <Paper radius="md" shadow="xl" p="xl" withBorder>
                <Text variant="gradient" fw={700} mb={15} size={rem(30)} gradient={{ from: 'pink', to: 'yellow' }}>
                    <Link href="/">
                        testeBac
                    </Link>
                </Text>
                <Text size="lg" fw={500}>
                    {t("title")}
                </Text>
                <Text mt="xs">
                    {t("message")}
                </Text>
                <Center mt="lg">
                    <Button
                        component={Link}
                        href="/"
                        variant="gradient"
                        gradient={{ from: 'purple', to: 'red' }}
                        radius="xl">
                            {t("backToHome")}
                    </Button>
                </Center>
            </Paper>
        </Center>
    )
}