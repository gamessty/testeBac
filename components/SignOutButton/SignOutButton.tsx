import { ButtonProps, Group, GroupProps } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { auth, signOut } from "@/auth";
import SubmitButton from "../SubmitButton/SubmitButton";

export default async function SignOutButton({ groupProps, buttonProps }: Readonly<{ groupProps?: Omit<GroupProps, 'children' | 'justify'>, buttonProps?: ButtonProps}>) {
    const t = await getTranslations('Authentication');

    const session = await auth()
 
    if (!session?.user) return null
    return (
        <Group justify="center" {...groupProps}>
            <form
                action={
                    async () => {
                    "use server"
                    await signOut()
                }}
            >
                <SubmitButton type="full" {...buttonProps}>{t('signOut')}</SubmitButton>
            </form>
        </Group>
    )
}