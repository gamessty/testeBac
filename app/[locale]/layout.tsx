import './global.css'
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import '@mantine/code-highlight/styles.css';

import React from "react";
import { NextIntlClientProvider } from 'next-intl';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';

import {
  MantineProvider,
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";

import { theme, resolver } from "../../theme";

export const metadata = {
  title: "testeBac | Home",
  description: "Home page of the testeBac project",
};


export default async function Locale({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <html lang={locale} {...mantineHtmlProps} suppressHydrationWarning>
      <head>

        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <MantineProvider defaultColorScheme="auto" theme={theme} cssVariablesResolver={resolver}>
            <Notifications />
            <ModalsProvider>
              {children}
            </ModalsProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
