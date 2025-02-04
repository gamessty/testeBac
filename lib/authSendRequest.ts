import { getTranslations } from "next-intl/server"
import { getPathsFromURL, getQueryParamsFromURL, isSupportedLocale } from "../utils"
import { unescape } from "querystring"

export async function sendVerificationRequest(params: any) {
  const { identifier: to, provider, url, theme } = params
  const { host } = new URL(url)
  const domain = provider.from.split("@").at(1)

  if (!domain) throw new Error("malformed Mailgun domain")

  console.log()



  let locale = isSupportedLocale(getPathsFromURL(unescape(getQueryParamsFromURL(url).get('callbackUrl') ?? ''))[1]) ? getPathsFromURL(unescape(getQueryParamsFromURL(url).get('callbackUrl') ?? ''))[1] : 'en'
  console.log(locale)
  const t = await getTranslations({ locale, namespace: 'Email.MagicLink' })

  const form = new FormData()
  //form.append("from", `${provider.name} <${provider.from}>`)
  form.append("from", `testeBac Login <${provider.from}>`)
  form.append("to", to)
  form.append("reply-to", process.env.MAILGUN_REPLY_TO ?? provider.from)
  form.append("subject", t('subject'))
  form.append("html", html({ host, url, theme, t}))
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

function html(params: { url: string; host: string; theme: Theme, t: any }) {
  const { url, host, theme, t } = params

  const escapedHost = host.replace(/\./g, "&#8203;.")

  const brandColor = theme.brandColor || "#346df1"
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || "#fff",
  }

  return `
  <body style="background: ${color.background}; padding-top: 50px; padding-bottom: 50px;">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          ${t.markup('title', { host: escapedHost, strong: (chuncks: any) => `<strong>${chuncks}</strong>` })}
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          ${t('message', { email: 'support@gamessty.eu' })}
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">${t('signIn')}</a></td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          ${t('disclaimer', { email: 'support@gamessty.eu' })}
        </td>
      </tr>
    </table>
  </body>
  `
}

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
function text({ url, host, text = 'Sign in to' }: { url: string; host: string, text?: string }) {
  return `${text} ${host}\n${url}\n\n`
}

