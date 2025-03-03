'use client';
import { Button, Group, Tooltip } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { auth } from "../../auth";
import { IconLayoutDashboardFilled, IconArrowRight } from '@tabler/icons-react';
import { Link, useRouter } from "../../i18n/routing";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function AppRedirect({ session }: Readonly<{ session: Session | null }>) {
    const t = useTranslations('HomePage');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    return (
        <Group justify="center" mt={30}>
            <Tooltip label={t('userNotAuthorized.short')} withArrow disabled={session?.user.userAuthorized}>
                    <Button
                        onClick={() => {setLoading(true); router.push('/app');}}
                        loading={loading}
                        leftSection={<IconLayoutDashboardFilled size={14} />}
                        rightSection={<IconArrowRight size={14} />}
                        variant="gradient" gradient={{ from: 'blue', to: 'purple' }} disabled={!session?.user.userAuthorized}>
                        {t('redirectApp')}
                    </Button>
            </Tooltip>
        </Group>
    );
}