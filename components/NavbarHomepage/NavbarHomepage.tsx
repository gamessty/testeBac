import { Flex, SimpleGrid, Text } from "@mantine/core";
import ProfileEmail from "../ProfileEmail/ProfileEmail";
import SignOutButton from "../SignOutButton/SignOutButton";
import SignInButton from "../SignInButton/SignInButton";
import ColorSchemeToggleIcon from "../ColorSchemeToggleIcon/ColorSchemeToggleIcon";
import LocalSelect from "../LocaleSelect/LocaleSelect";

export default function NavbarHomepage() {
    return (
        <SimpleGrid cols={2} spacing="md">
            <Flex direction="row" align="center" justify="flex-start">
                <Text variant="gradient" fw={700} size="xl" component="a" href="./" gradient={{ from: 'pink', to: 'yellow' }}>
                    testeBac
                </Text>
            </Flex>
            <Flex direction="row" align="center" gap="md" justify="flex-end">
                <SignInButton />
                <ProfileEmail />
                <SignOutButton />
                <ColorSchemeToggleIcon />
                <LocalSelect />
            </Flex>
        </SimpleGrid>
    );
}