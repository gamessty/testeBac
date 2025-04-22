"use server";
import { auth } from '../../../auth';
import AppShellDashboard from '../../../components/AppShellDashboard/AppShellDashboard';


export default async function AppDashboard() {
    const session = await auth();
    return (
        <AppShellDashboard session={session} />
    );
}
