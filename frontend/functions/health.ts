export const onRequest: PagesFunction = async () => {
  try {
    const res = await fetch('https://sweatbox-whn5.onrender.com/health');
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ status: 'unhealthy', error: err.message || 'Cannot reach Render backend' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
