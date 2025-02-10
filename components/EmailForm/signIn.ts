"use server";
import { signIn } from "../../auth";

export default async function signInAction(providerId: string, formData: any): Promise<any> {
    return await signIn(providerId, formData)
}