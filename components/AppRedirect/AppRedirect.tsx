import { Button, Group } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { auth } from "../../auth";
import { IconLayoutDashboardFilled, IconArrowRight } from '@tabler/icons-react'

export default async function AppRedirect() {
    const t = await getTranslations('HomePage');
    const session = await auth();
    if(!session?.user) return null;
    return (
        <Group justify="center" mt={30}>
            <Button component="a"
                leftSection={<IconLayoutDashboardFilled size={14} />}
                rightSection={<IconArrowRight size={14} />}
                href="/app" variant="gradient" gradient={{ from: 'blue', to: 'purple' }}>
                {t('redirectApp')}
            </Button>
        </Group>
    );
}