type OmEmailArgs = {
  buyerName: string
  dealTitle: string
  dealAddress: string | null
  omUrl: string
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function buildOmEmailHtml({
  buyerName,
  dealTitle,
  dealAddress,
  omUrl,
}: OmEmailArgs) {
  const safeBuyerName = escapeHtml(buyerName)
  const safeDealTitle = escapeHtml(dealTitle)
  const safeDealAddress = dealAddress ? escapeHtml(dealAddress) : null
  const safeOmUrl = escapeHtml(omUrl)

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f4f4f5;color:#18181b;font-family:Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;">
                <tr>
                  <td style="padding:28px 28px 12px;">
                    <p style="margin:0 0 16px;color:#71717a;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;">Offering Memorandum</p>
                    <h1 style="margin:0;color:#18181b;font-size:24px;line-height:1.25;">${safeDealTitle}</h1>
                    ${safeDealAddress ? `<p style="margin:8px 0 0;color:#52525b;font-size:15px;">${safeDealAddress}</p>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 28px 28px;">
                    <p style="margin:0 0 18px;color:#3f3f46;font-size:15px;line-height:1.6;">Hi ${safeBuyerName},</p>
                    <p style="margin:0 0 22px;color:#3f3f46;font-size:15px;line-height:1.6;">
                      I wanted to share the offering memorandum for this opportunity. You can review the hosted package using the secure link below.
                    </p>
                    <a href="${safeOmUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 16px;border-radius:6px;">View OM</a>
                    <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.5;">
                      Please reply directly if you would like the full package or have questions.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export function buildOmEmailText({
  buyerName,
  dealTitle,
  dealAddress,
  omUrl,
}: OmEmailArgs) {
  return [
    `Hi ${buyerName},`,
    '',
    `I wanted to share the offering memorandum for ${dealTitle}${dealAddress ? ` at ${dealAddress}` : ''}.`,
    '',
    `View OM: ${omUrl}`,
    '',
    'Please reply directly if you would like the full package or have questions.',
  ].join('\n')
}
