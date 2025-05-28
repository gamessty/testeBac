"use client";
import { Stack, TextInput, Group, Text } from "@mantine/core";
import { type providerMap } from "@/auth";
import validator from "validator";
import Link from "next/link";
import SubmitButton from "../SubmitButton/SubmitButton";
import { useForm } from "@mantine/form";
import signInAction from "./signIn";
import { useTranslations } from "next-intl";

export default function EmailForm({ provider, csrfToken, searchParams }: Readonly<{ provider: typeof providerMap[0], csrfToken: string, searchParams: { callbackUrl: string | undefined } }>) {
    const t = useTranslations("Authentication.customPages.signIn")
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
            csrfToken: csrfToken,
            redirectTo: searchParams?.callbackUrl ?? "",
        },

        validate: {
            email: (value) => (validator.isEmail(value) ? null : t("invalidEmail")),
        }
    })
    return (
        <form
            onSubmit={form.onSubmit((formData) => {
                signInAction(provider.id, formData)
            })}
        >
            <input type="hidden" name="csrfToken" value={csrfToken} key={form.key('csrfToken')} />
            <input type="hidden" name="redirectTo" value={searchParams?.callbackUrl ?? ""} key={form.key('redirectTo')} />
            <Stack>
                <TextInput
                    required
                    name="email"
                    key={form.key('email')}
                    label="Email"
                    placeholder="admis@gamessty.eu"
                    radius="md"
                    {...form.getInputProps('email')}
                />
                <Group justify="flex-end" gap="md" mt="xs">
                    <Text c="dimmed" size="xs" ta="right">
                        {t("disclaimer") + " "}
                        <Link href="/privacy-policy">{t("privacyPolicy")}</Link>
                    </Text>
                    <SubmitButton tt="capitalize" radius="xl" loading={form.submitting}>
                        sign in
                    </SubmitButton>
                </Group>
            </Stack>
        </form>
    )
}