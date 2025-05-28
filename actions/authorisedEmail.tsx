"use server";
import { render } from '@react-email/components';
import { getTranslations } from "next-intl/server";
import { MagicLinkEmail } from '@/emails/authorised';

export async function sendAuthorisedEmail(identifier: string, localeLanguage?: string) {
    const { identifier: to, provider, url } = { identifier: identifier, provider: { from: process.env.MAILGUN_FROM ?? 'noreply@mg.gamessty.eu', apiKey: process.env.AUTH_MAILGUN_KEY }, url: `https://testebac.eu/` };
    const { host } = new URL(url)
    const domain = provider.from.split("@").at(1)
    console.log("domain", provider.apiKey)
  
    if (!domain) throw new Error("malformed Mailgun domain")
  
    let locale = localeLanguage ?? 'fr'
  
    const t = await getTranslations({ locale, namespace: 'Email.Authorised' })
    const emailHtml = await render(<MagicLinkEmail locale={locale} host={host} t={t} url={url} />);
  
    const form = new FormData()
    //form.append("from", `${provider.name} <${provider.from}>`)
    form.append("from", `testeBac Login <${provider.from}>`)
    form.append("to", to)
    form.append("h:Reply-To", process.env.EMAIL_SUPPORT ?? provider.from)
    form.append("subject", t('subject'))
    form.append("html", emailHtml)
    form.append("text", text({ host, url, text: t('text') }))
  
    const apiKey = `api:${provider.apiKey}`
  
    const res = await fetch(`https://api.eu.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(apiKey)}`,
      },
      body: form,
    })
  
    if (!res.ok) throw new Error("Mailgun error: " + (await res.text()))
  }

  // Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
  function text({ url, host, text = 'Sign in to' }: { url: string; host: string, text?: string }) {
    return `${text} ${host}\n${url}\n\n`
  }
  
  