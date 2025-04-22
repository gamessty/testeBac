import { auth } from "@/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const locale = await getLocale();
    const session = await auth();
    if(!session?.user) return redirect({ href: '/', locale});
    if(!session?.user.userAuthorized) return redirect({ href: '/', locale});

    return (
        <>
            {children}
        </>
    );
}
