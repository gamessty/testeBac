import { redirect } from '../../../i18n/routing';
import { auth } from '../../../auth';
import AppShellDashboard from '../../../components/AppShellDashboard/AppShellDashboard';
import { getLocale } from 'next-intl/server';


export default async function AppDashboard() {
    const locale = await getLocale();
    const session = await auth();
    if(!session?.user) return redirect({ href: '/', locale});
    return (
        <AppShellDashboard session={session} />
    );
}
