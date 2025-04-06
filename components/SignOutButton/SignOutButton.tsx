import { Group, GroupProps } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { auth, signOut } from "../../auth";
import SubmitButton from "../SubmitButton/SubmitButton";

export default async function SignOutButton(props: Readonly<Omit<GroupProps, 'children' | 'justify'>>) {
    const t = await getTranslations('Authentication');

    const session = await auth()
 
    if (!session?.user) return null
    return (
        <Group justify="center" {...props}>
            <form
                action={
                    async () => {
                    "use server"
                    await signOut()
                }}
            >
                <SubmitButton type="full">{t('signOut')}</SubmitButton>
            </form>
        </Group>
    )
}