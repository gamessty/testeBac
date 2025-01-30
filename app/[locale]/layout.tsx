import "@mantine/core/styles.css";
import React from "react";
import { NextIntlClientProvider } from 'next-intl';
import { ModalsProvider } from '@mantine/modals';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';

import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "../../theme";

export const metadata = {
  title: "testeBac | Home",
  description: "Home page of the testeBac project",
};

export default async function Locale({ children, params: { locale } }: { children: React.ReactNode; params: { locale: string }}) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
          <NextIntlClientProvider messages={messages}>
            <MantineProvider theme={theme}>
              <ModalsProvider>{children}</ModalsProvider>
            </MantineProvider>
          </NextIntlClientProvider>
      </body>
    </html>
  );
}
