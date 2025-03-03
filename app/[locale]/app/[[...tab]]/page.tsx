import { Metadata } from "next";
import tabsData from "../../../../components/tabs";
import { getTranslations } from "next-intl/server";
import { Transition } from "@mantine/core";
import NotFound from "../../../../components/404/404";
import { auth } from "../../../../auth";

type Props = {
    params: Promise<{ tab: string[] }>
};

export async function generateMetadata({
    params,
}: Props): Promise<Metadata> {
    const t = await getTranslations('Dashboard.Tabs');
    const tabName = (await params).tab?.join('.') ?? 'home';
    const tab = tabsData.find(tab => tab.tab == tabName)?.tab ?? 'notFound';
    return {
        title: t(tab + '.title'),
        description: t(tab + '.description'),
    };
}


export default async function Page({
    params
}: Readonly<Props>) {
    const tabName = (await params).tab?.join('.') ?? 'home';
    console.log(tabName);
    const tab = tabsData.find(tab => tab.tab == tabName);
    if (!tab?.component) return <NotFound />;
    const session = await auth();
    return (tab.component && <tab.component session={session}/>)
}

/*
<Transition transition="fade-right" timingFunction="ease" duration={500} mounted={true} >
        {(transitionStyles) => (
        )}
    </Transition>


*/