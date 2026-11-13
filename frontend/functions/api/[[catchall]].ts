interface Env {
  BACKEND_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const backendBase = context.env?.BACKEND_URL || 'https://sweatbox-whn5.onrender.com';
  const targetUrl = `${backendBase}${url.pathname}${url.search}`;

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': context.request.headers.get('Origin') || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-chapa-signature',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const reqHeaders = new Headers(context.request.headers);
  reqHeaders.set('host', new URL(backendBase).host);

  const requestInit: RequestInit = {
    method: context.request.method,
    headers: reqHeaders,
    redirect: 'follow',
  };

  if (!['GET', 'HEAD'].includes(context.request.method)) {
    requestInit.body = context.request.body;
  }

  try {
    const response = await fetch(targetUrl, requestInit);
    const resHeaders = new Headers(response.headers);
    resHeaders.set('Access-Control-Allow-Origin', context.request.headers.get('Origin') || '*');
    resHeaders.set('Access-Control-Allow-Credentials', 'true');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'PROXY_GATEWAY_ERROR',
          message: `Unable to connect to backend: ${err.message || 'Connection refused'}`,
        },
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
