import { Flex, Grid, Text, GridCol, GridProps } from "@mantine/core";
import ProfileEmail from "../ProfileEmail/ProfileEmail";
import SignOutButton from "../SignOutButton/SignOutButton";
import SignInButton from "../SignInButton/SignInButton";
import ColorSchemeToggleIcon from "../ColorSchemeToggleIcon/ColorSchemeToggleIcon";
import LocalSelect from "../LocaleSelect/LocaleSelect";
import { auth } from "../../auth";
import { Link } from "../../i18n/routing";
import SignOutButtonClient from "../SignOutButton/SignOutButton.client";

export default async function NavbarHomepage(props: Readonly<GridProps>) {
    const session = await auth();
    return (
        <Grid {...props}>
            <GridCol span="content">
                <Flex direction="row" align="center" justify="flex-start">
                    <Text variant="gradient" fw={700} size="xl" gradient={{ from: 'pink', to: 'yellow' }}>
                        <Link href="/">
                            testeBac
                        </Link>
                    </Text>
                </Flex>
            </GridCol>
            <GridCol span="auto">
                <Flex direction="row" align="center" gap="md" justify="flex-end">
                    {!session?.user && <SignInButton />}
                    {session?.user && <ProfileEmail session={session} />}
                    <SignOutButtonClient session={session} display={{ base: "none", md: 'initial' }} />
                    <ColorSchemeToggleIcon />
                    <LocalSelect />
                </Flex>
            </GridCol>
        </Grid>
    );
}