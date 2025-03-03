'use client';
import { Stack, Divider, Button, Text } from "@mantine/core";
import { Fragment, use, useEffect, useState } from "react";
import tabsData from "../../tabs";
import { chkP, enumToString, getInitialsColor } from "../../../utils";
import { Link, usePathname } from "../../../i18n/routing";
import { getTranslations } from "next-intl/server";
import { SessionProvider, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function Navbar() {
    const t = useTranslations('Dashboard');
    const session = useSession();
    const pathname = usePathname()

    const [tab, setTab] = useState(getTabSlug(pathname, '.') ?? 'home');

    function getTabSlug(pathname: string, joined?: string) {
        const segments = pathname?.split("/").filter(Boolean);

        const appIndex = segments.indexOf("app");
        const tab = appIndex !== -1 ? segments.slice(appIndex + 1) : [];
        return joined ? tab.join(joined): tab;
    }

    useEffect(() => {
        setTab(getTabSlug(pathname, '.') ?? 'home');
    }, [pathname]);

    return (
        <Stack
            align="stretch"
            justify="space-around"
            gap="md"
            pb={25}
        >
            {
                // sort the tabsData by category order and by category and add a divider and the title of the category before the first tab of the category if the category has the showLabel property set to true
                tabsData
                    .toSorted((a, b) => a.category.order - b.category.order)
                    .map((tabD, index, array) => {
                        const prevCategory = array[index - 1]?.category.name;
                        const showCategoryLabel =
                            tabD.category.showLabel &&
                            (index === 0 || prevCategory !== tabD.category.name);

                        const hasCategoryPermission = !tabD.category.permissionNeeded
                            || chkP(enumToString(tabD.category.permissionNeeded), session.data?.user);

                        const hasTabPermission = chkP(enumToString(tabD.permissionNeeded), session.data?.user);

                        return hasTabPermission ? (
                            <Fragment key={tabD.category.name + index}>
                                {showCategoryLabel && hasCategoryPermission && (
                                    <>
                                        {index !== 0 && <Divider />}
                                        <Text c="dimmed" ta="left">
                                            {t(`Navbar.${tabD.category.name}.title`)}
                                        </Text>
                                    </>
                                )}
                                <Button
                                    component={Link}
                                    style={{ boxShadow: "var(--mantine-shadow-xl)" }}
                                    key={tabD.tab}
                                    color={tabD.color ?? getInitialsColor(tabD.tab)}
                                    href={'/app/' + tabD.tab.replace('.', '/')}
                                    variant={tabD.tab === tab ? "light" : "outline"}
                                    justify="left"
                                    h={35}
                                    leftSection={<tabD.icon size={17} />}
                                >
                                    {t(`Navbar.${tabD.tab}`)}
                                </Button>
                            </Fragment>
                        ) : null;
                    })
            }
        </Stack>
    )
}