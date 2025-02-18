import { Role } from "@prisma/client";
import { ActionIcon, Badge, Box, Card, CardProps, Group, Skeleton, Stack, Text } from "@mantine/core";
import { getInitialsColor } from "../../../utils";
import { IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import deleteRole from "../../../actions/PrismaFunctions/deleteRole";
import { useTranslations } from "next-intl";

export default function RoleCard({ role, skeleton = false, ...props }: Readonly<{ role?: Role, skeleton?: boolean } & CardProps>) {
    const t = useTranslations('Dashboard.RoleManager');
    const handleRoleDelete = async () => {
        if (!role?.id) return;
        try {
            const res = await deleteRole({ id: role.id });
            if (res && 'message' in res) {
                throw new Error(res.message);
            }
            else {
                notifications.show({
                    title: t('success.delete.title'),
                    message: t('success.delete.message', { name: role.name }),
                    color: "green",
                    autoClose: false
                })
            }
        } catch (error: any) {
            notifications.show({
                title: t('errors.fetch.title', { error: error.message }),
                message: t("errors.fetch.message", { error: error.message }) + " " + t("errors.role.message", { name: role.name }),
                color: "red"
            })
        }
    };

    return (
        <Skeleton visible={skeleton}>
            <Card {...props} shadow="xs" padding="md" pt={27} radius="md" style={{ cursor: "pointer" }} withBorder>
                <Stack justify="space-between" h="100%">
                    <Box>
                        <Card.Section inheritPadding pb="xs">
                            <Group justify="space-between">
                                <Text fw={500} size="lg">{role?.name}</Text>
                            </Group>
                            <Group gap={5}>
                                <Badge radius="sm" color={getInitialsColor(role?.category)}>{role?.category}</Badge>
                                <Badge radius="sm" color={getInitialsColor(role?.priority.toString())}>{role?.priority}</Badge>
                            </Group>
                        </Card.Section>

                        {role?.description && <Card.Section inheritPadding pb="md">
                            <Text size="sm" tt="none">{role?.description}</Text>
                        </Card.Section>}
                    </Box>

                    <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                            {t('roleCard.createdAt')}: {role?.createdAt.toLocaleDateString()}<br />
                            {t('roleCard.updatedAt')}: {role?.updatedAt.toLocaleDateString()}
                        </Text>
                        <ActionIcon ml="auto" mr={0} variant="subtle" color="red" onClick={() => {
                            modals.openConfirmModal({
                                title: t('confirm.delete.title'),
                                children: (
                                    <Text size="sm">
                                        {t('confirm.delete.message', { name: role?.name })}
                                    </Text>
                                ),
                                labels: { confirm: "Delete", cancel: "Cancel" },
                                onConfirm: () => { handleRoleDelete() }
                            })
                        }} title="Delete role" aria-label="Delete role">
                            <IconTrash />
                        </ActionIcon>
                    </Group>
                </Stack>
            </Card>
        </Skeleton>
    )
}