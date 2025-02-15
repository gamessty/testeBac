"use server";
import { signIn } from "../../auth"

export default async function handleOAuthSignIn(formData: FormData): Promise<void> {
    const providerId = formData.get('providerId') as string
    if (!providerId) {
        return;
    }
    formData.delete('providerId')
    return await signIn(providerId, formData)
}

export { handleOAuthSignIn };