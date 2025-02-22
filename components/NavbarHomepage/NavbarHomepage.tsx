import { Flex, Grid, Text, GridCol, GridProps } from "@mantine/core";
import ProfileEmail from "../ProfileEmail/ProfileEmail";
import SignOutButton from "../SignOutButton/SignOutButton";
import SignInButton from "../SignInButton/SignInButton";
import ColorSchemeToggleIcon from "../ColorSchemeToggleIcon/ColorSchemeToggleIcon";
import LocalSelect from "../LocaleSelect/LocaleSelect";
import { auth } from "../../auth";
import { Link } from "../../i18n/routing";
import SignOutButtonClient from "../SignOutButton/SignOutButton.client";
import styles from './NavbarHomepage.module.scss';

export default async function NavbarHomepage(props: Readonly<GridProps>) {
    const session = await auth();
    return (
        <Grid {...props}>
            <GridCol span="content">
                <Flex className={`${styles.flex} ${styles['flex-justify-start']}`}>
                    <Text className={styles.text}>
                        <Link href="/">
                            testeBac
                        </Link>
                    </Text>
                </Flex>
            </GridCol>
            <GridCol span="auto">
                <Flex className={`${styles.flex} ${styles['flex-gap-md']} ${styles['flex-justify-end']}`}>
                    {!session?.user && <SignInButton />}
                    {session?.user && <ProfileEmail session={session} />}
                    <SignOutButtonClient session={session} visibleFrom="md"/>
                    <ColorSchemeToggleIcon />
                    <LocalSelect />
                </Flex>
            </GridCol>
        </Grid>
    );
}