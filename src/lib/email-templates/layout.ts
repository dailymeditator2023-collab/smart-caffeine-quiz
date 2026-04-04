const PRODUCT_URL = "https://getsmartcaffeine.com/products/smart-caffeine";
const QUIZ_URL = "https://smartcaffeine-quiz.vercel.app";

export function trackUrl(url: string, campaign: string, content: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=quiz_email&utm_medium=email&utm_campaign=${campaign}&utm_content=${content}`;
}

export function promoBlock(campaign: string): string {
  const buyUrl = trackUrl(`${PRODUCT_URL}?order=true`, campaign, "buy_button");
  return `
    <div style="background: linear-gradient(135deg, #1a0a00, #2a1000); border-radius:16px; padding:24px; margin-top:24px; border:1px solid #ff6633;">
      <div style="text-align:center; margin-bottom:16px;">
        <img src="https://smartcaffeine-quiz.vercel.app/smart-caffeine-product.webp" alt="Smart Caffeine" width="280" style="width:280px; height:auto; border-radius:12px;">
      </div>
      <div style="text-align:center;">
        <p style="color:#ff6633; font-weight:700; font-size:20px; margin:0 0 8px;">
          Fuel Your Brain with Smart Caffeine
        </p>
        <p style="color:#9ca3af; font-size:14px; margin:0 0 16px;">
          L-Theanine + Caffeine for calm, focused energy. No jitters, no crash.
        </p>
        <a href="${buyUrl}" style="display:inline-block; padding:14px 36px; background-color:#ff6633; color:#fff; font-weight:700; font-size:16px; text-decoration:none; border-radius:12px;">
          Order Now →
        </a>
      </div>
    </div>`;
}

export function wrapInLayout({ title, bodyHtml, campaign = "general" }: { title: string; bodyHtml: string; campaign?: string }): string {
  const quizUrl = trackUrl(QUIZ_URL, campaign, "footer_quiz");
  const storeUrl = trackUrl("https://getsmartcaffeine.com", campaign, "footer_store");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#121212; font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#121212;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 0; text-align:center;">
              <span style="font-size:28px;">☕</span>
              <span style="font-size:20px; font-weight:700; color:#ff6633; margin-left:8px;">Smart Caffeine Quiz</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#1e1e1e; border-radius:16px; padding:32px 24px;">
              ${bodyHtml}
              ${promoBlock(campaign)}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 0; text-align:center;">
              <p style="color:#666; font-size:12px; margin:0 0 8px;">
                <a href="${quizUrl}" style="color:#ff6633; text-decoration:none;">Play the quiz</a>
                &nbsp;&middot;&nbsp;
                <a href="${storeUrl}" style="color:#ff6633; text-decoration:none;">Visit our store</a>
              </p>
              <p style="color:#444; font-size:11px; margin:0;">
                &copy; ${new Date().getFullYear()} Smart Caffeine. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function button(text: string, url: string, color: string = "#ff6633"): string {
  return `<a href="${url}" style="display:inline-block; padding:14px 28px; background-color:${color}; color:#fff; font-weight:700; font-size:15px; text-decoration:none; border-radius:12px; text-align:center;">${text}</a>`;
}

export function divider(): string {
  return `<hr style="border:none; border-top:1px solid #333; margin:24px 0;">`;
}
