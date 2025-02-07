import { Flex, Grid, Text, GridCol } from "@mantine/core";
import ProfileEmail from "../ProfileEmail/ProfileEmail";
import SignOutButton from "../SignOutButton/SignOutButton";
import SignInButton from "../SignInButton/SignInButton";
import ColorSchemeToggleIcon from "../ColorSchemeToggleIcon/ColorSchemeToggleIcon";
import LocalSelect from "../LocaleSelect/LocaleSelect";

export default function NavbarHomepage() {
    return (
        <Grid>
            <GridCol span="content">
                <Flex direction="row" align="center" justify="flex-start">
                    <Text variant="gradient" fw={700} size="xl" component="a" href="./" gradient={{ from: 'pink', to: 'yellow' }}>
                        testeBac
                    </Text>
                </Flex>
            </GridCol>
            <GridCol span="auto">
                <Flex direction="row" align="center" gap="md" justify="flex-end">
                    <SignInButton />
                    <ProfileEmail />
                    <SignOutButton />
                    <ColorSchemeToggleIcon />
                    <LocalSelect />
                </Flex>
            </GridCol>
        </Grid>
    );
}