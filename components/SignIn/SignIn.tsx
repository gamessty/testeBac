"use server";
import { Button, Group, TextInput } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { auth, signIn } from "../../auth";

export default async function SignIn() {
    const { fullWidth } = { fullWidth: false };
    const t = await getTranslations('Authentication');

    const session = await auth()

    if (session?.user) return null
    return (
        <form
            action={async (formData) => {
                "use server"
                await signIn("mailgun", formData)
            }}
        >
            <Group justify="center" mt="xl">
                <TextInput label="Email" data-autofocus type="text" name="email" placeholder="Email" />
                <Button type="submit" mt={fullWidth ? 'md' : ''} fullWidth={fullWidth}>{t('signInMail')}</Button>
            </Group>
        </form>
    )
}