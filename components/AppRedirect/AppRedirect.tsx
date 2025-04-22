"use client"
import { Button, Group, Tooltip } from "@mantine/core";
import { IconArrowRight, IconLayoutDashboardFilled } from '@tabler/icons-react';
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { Link } from "../../i18n/routing";

export default function AppRedirect({ session }: Readonly<{ session: Session | null }>) {
    const t = useTranslations('HomePage');
    if (!session?.user) return null;
    return (
        <Group justify="center" mt={30}>
            <Tooltip label={t('userNotAuthorized.short')} withArrow disabled={session?.user.userAuthorized}>
                    <Button
                        component={Link}
                        href={!session?.user.userAuthorized ? '/' : '/app'}
                        leftSection={<IconLayoutDashboardFilled size={14} />}
                        rightSection={<IconArrowRight size={14} />}
                        variant="gradient" gradient={{ from: 'blue', to: 'purple' }} disabled={!session?.user.userAuthorized}>
                        {t('redirectApp')}
                    </Button>
            </Tooltip>
        </Group>
    );
}