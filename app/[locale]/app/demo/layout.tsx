import { getLocale } from "next-intl/server";
import { auth } from "../../../../auth"
import { redirect } from "../../../../i18n/routing";
import { chkP } from "../../../../utils";
import classes from "./layout.module.css";
import { Button } from "@mantine/core";
import { IconArrowBackUp } from "@tabler/icons-react";
import ReturnButton from "../../../../components/ReturnButton/ReturnButton";

export default async function DemoLayout({
    children,
  }: Readonly<{
    children: React.ReactNode
  }>) {
    const locale = await getLocale();
    const session = await auth();
    if(!session?.user) return redirect({ href: '/', locale});
    if(!session?.user.userAuthorized || !chkP('developer:debug', session.user)) return redirect({ href: '/', locale});
    return <>
        <ReturnButton hideFrom="demo" className={classes["return-button"]} />
        {children}
    </>
  }