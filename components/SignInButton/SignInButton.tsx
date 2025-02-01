import { signIn, auth } from "../../auth"
import { Button, Group } from "@mantine/core"
import { getLocale, getTranslations } from "next-intl/server";

export default async function SignInButton() {
    const t = await getTranslations('Authentication');
    const locale = await getLocale();

    const session = await auth()
 
    if (session?.user) return null
    return (
        <Group justify="center">
            <form
                action={async () => {
                    "use server"
                    await signIn(undefined,{ redirectTo: `/${locale}/app`})
                }}
            >
                <Button type="submit" variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>{t('signIn')}</Button>
            </form>
        </Group>
    )
}