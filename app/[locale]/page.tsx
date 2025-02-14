import { Alert, Center, Container, Group, Stack } from "@mantine/core";
import { Welcome } from "../../components/Welcome/Welcome";
import NavbarHomepage from "../../components/NavbarHomepage/NavbarHomepage";
import AppRedirect from "../../components/AppRedirect/AppRedirect";
import NotificationUnathorized from "../../components/NotificationUnauthorized/Notification";
import { auth } from "../../auth";
import { getTranslations } from "next-intl/server";
import Modal from "../../components/Modal/Modal";
import { IconAlertTriangleFilled, IconLogout } from "@tabler/icons-react";
import SignOutButtonClient from "../../components/SignOutButton/SignOutButton.client";
import RefreshButton from "../../components/RefreshButton/RefreshButton";

export default async function HomePage({ searchParams }: Readonly<{ searchParams: Promise<{ [key: string]: string | string[] | undefined }> }>) {
    const session = await auth();
    const params = await searchParams;
    const t = await getTranslations('Authentication');
    let show = false;
    let showSignOut = false;

    // Check if there is a query parameter in the URL called email_authorized and if it is false, display a message to the user with mantine notification system
    const { email_authorized, signedOut, notification } = params;
    if (!session?.user?.userAuthorized || email_authorized?.toString().toLowerCase() === 'false' || (typeof email_authorized === 'string' && !isNaN(Number(email_authorized)) && !!email_authorized)) {
        // Display a notification to the user with mantine notification system
        show = !!session?.user;
    }
    
    if (signedOut?.toString().toLowerCase() === 'true' && !session?.user) {
        showSignOut = true;
    }

    function getBooleanValue(value: string | string[] | number | undefined): boolean {
        if (value?.toString().toLowerCase() === 'true' || value === 1 || value === '1') return true;
        return false;
    }

    return (
        <Container display="flex" mih="100vh" style={{ flexDirection: "column" }} pt={30} fluid>
            <NavbarHomepage mx={{ xs: "3%", sm: "5%", md: "10%", lg: "15%", xl: "25%" }} />
            <Center style={{ flexGrow: 1 }}>
                <Stack
                    align="stretch"
                    justify="center"
                    gap="md"
                    //mt={{ base: "20vh", mt: "25vh" }}
                    mt="10"
                    mx="20"
                    mb="5vh"
                >
                    <Welcome />
                    <AppRedirect />
                </Stack>
                <NotificationUnathorized show={show && getBooleanValue(notification)} data={{
                    withBorder: true,
                    title: t('userNotAuthorized.title'),
                    message: t('userNotAuthorized.message', { email: "support@gamessty.eu" }),
                    color: 'red',
                    autoClose: false,
                    position: 'top-center',
                }} />
                <NotificationUnathorized show={showSignOut} data={{
                    withBorder: true,
                    title: t('userSignedOut.title'),
                    message: t('userSignedOut.message'),
                    color: 'green',
                    position: 'bottom-center',
                }} />
                <Modal show={show && !getBooleanValue(notification)} data={{
                    title: t('userNotAuthorized.title'),
                    children: (<><Alert variant="filled" color="red" icon={< IconAlertTriangleFilled />}>{t('userNotAuthorized.message', { email: "support@gamessty.eu" })}</Alert><Group align="center" mt={10} grow><RefreshButton /><SignOutButtonClient variant="gradient" gradient={{ from: "red", to: "purple" }} rightSection={<IconLogout />} session={session} /></Group></>),
                    withCloseButton: session?.user?.userAuthorized ?? false,
                    closeOnEscape: session?.user?.userAuthorized ?? false,
                    closeOnClickOutside: session?.user?.userAuthorized ?? false,
                }} />
            </Center>
        </Container>
    );
}