"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import ErrorCard from "@/components/ErrorCard/ErrorCard";

export default function AuthErrorPage() {
  const t = useTranslations('Authentication.customPages.error');
  const tGeneral = useTranslations('General');
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";

  // Get localized error information, fallback to Default if not found
  const hasErrorTranslation = t.has(`${error}.title`);
  const errorTitle = hasErrorTranslation ? t(`${error}.title`) : t('Default.title');
  const errorDescription = hasErrorTranslation ? t(`${error}.description`) : t('Default.description');

  return (
    <ErrorCard
      title={errorTitle}
      description={errorDescription}
      errorCode={error !== "Default" ? error : undefined}
      primaryButtonText={tGeneral('return')}
      onPrimaryButtonClick={() => router.push("/")}
      fullHeight
    />
  );
}
