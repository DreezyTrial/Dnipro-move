type LeadBody = {
  name?: unknown;
  phone?: unknown;
  comment?: unknown;
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function asText(value: unknown, max = 2000): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function buildMessage(name: string, phone: string, comment: string): string {
  return [
    'Нова заявка з сайту Dnipro Move',
    '',
    `Ім'я: ${name}`,
    `Телефон: ${phone}`,
    `Звідки і куди: ${comment || 'не вказано'}`,
  ].join('\n');
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return OPTIONS();
  }
  if (request.method !== 'POST') {
    return json(405, { ok: false, error: 'method_not_allowed' });
  }

  const token = process.env['TELEGRAM_BOT_TOKEN']?.trim();
  const chatId = process.env['TELEGRAM_CHAT_ID']?.trim();
  if (!token || !chatId) {
    return json(500, { ok: false, error: 'telegram_not_configured' });
  }

  let body: LeadBody;
  try {
    body = (await request.json()) as LeadBody;
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  const name = asText(body.name, 80);
  const phone = asText(body.phone, 40);
  const comment = asText(body.comment);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 9) {
    return json(400, { ok: false, error: 'invalid_contacts' });
  }

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: buildMessage(name, phone, comment),
      disable_web_page_preview: true,
    }),
  });

  if (!telegramResponse.ok) {
    return json(502, { ok: false, error: 'telegram_failed' });
  }

  return json(200, { ok: true });
}
