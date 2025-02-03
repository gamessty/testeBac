import { Button, Group, Tooltip } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { auth } from "../../auth";
import { IconLayoutDashboardFilled, IconArrowRight } from '@tabler/icons-react'

export default async function AppRedirect() {
    const t = await getTranslations('HomePage');
    const session = await auth();
    if(!session?.user) return null;
    return (
        <Group justify="center" mt={30}>
            <Tooltip label={t('userNotAuthorized.short')} withArrow disabled={session?.user.userAuthorized}>
                <Button component="a"
                    leftSection={<IconLayoutDashboardFilled size={14} />}
                    rightSection={<IconArrowRight size={14} />}
                    href={!session?.user.userAuthorized ? undefined : "/app"} variant="gradient" gradient={{ from: 'blue', to: 'purple' }} disabled={!session?.user.userAuthorized}>
                    {t('redirectApp')}
                </Button>
            </Tooltip>
        </Group>
    );
}