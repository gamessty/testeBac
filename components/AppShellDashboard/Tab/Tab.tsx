"use client";

import { Session } from "next-auth";
import { Transition } from "@mantine/core";
import tabsData from "../../tabs";

export default function AppShellDashboardTabs({ tabName, session }: Readonly<{ tabName: string, session: Session | null }>) {
    return (
        <>
            {
                tabsData.map((tab) => (
                    <Transition key={tab.tab + "_tabComponent"} transition="fade-right" timingFunction="ease" duration={500} mounted={tab.tab === tabName} >
                        {(transitionStyles) => (
                            <>
                                {tab.component && <tab.component session={session} style={transitionStyles} />}
                            </>
                        )}
                    </Transition>
                ))
            }
        </>
    );
}