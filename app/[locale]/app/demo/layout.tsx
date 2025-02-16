import { getLocale } from "next-intl/server";
import { auth } from "../../../../auth"
import { redirect } from "../../../../i18n/routing";
import { chkP } from "../../../../utils";

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
        {children}
    </>
  }