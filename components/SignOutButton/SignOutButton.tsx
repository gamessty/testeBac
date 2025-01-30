import { signOut, auth } from "../../auth"
import { Button, Group } from "@mantine/core"
import { getTranslations } from "next-intl/server";

export default async function SignOutButton() {
    const t = await getTranslations('Authentication');

    const session = await auth()
 
    if (!session?.user) return null
    return (
        <Group justify="center">
            <form
                action={async () => {
                    "use server"
                    await signOut()
                }}
            >
                <Button type="submit">{t('signOut')}</Button>
            </form>
        </Group>
    )
}