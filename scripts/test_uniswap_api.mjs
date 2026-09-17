// Uniswap pools REST API with proper headers
async function test() {
  // The Uniswap app fetches from pools.uniswap.org - try with correct headers
  const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'origin': 'https://app.uniswap.org',
    'referer': 'https://app.uniswap.org/',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  };

  // Arc chain ID is 5042
  const urls = [
    'https://pools.uniswap.org/api/explore/v3/pools?chainId=5042',
    'https://pools.uniswap.org/api/explore/v4/pools?chainId=5042',
    // Try gateway with v2 REST
    'https://interface.gateway.uniswap.org/v2/graphql',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      console.log(url, '->', res.status, res.statusText);
      if (res.ok) {
        const text = await res.text();
        console.log('Response:', text.slice(0, 400));
      }
    } catch(e) {
      console.log(url, '-> ERROR:', e.message?.slice(0, 100));
    }
  }

  // Also try fetching a specific pool from Uniswap app backend
  try {
    const poolHash = '0x4ab249bacee1ed0854d1932fa4ae6880c0f8707c37b31a443a221315a7872c52';
    const res = await fetch(`https://interface.gateway.uniswap.org/v1/graphql`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'origin': 'https://app.uniswap.org',
        'referer': 'https://app.uniswap.org/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({
        query: `{ v4Pool(chain: ARC, poolId: "${poolHash}") { feeTier token0 { symbol } token1 { symbol } } }`
      })
    });
    const d = await res.json();
    console.log('Specific V4 pool query:', JSON.stringify(d).slice(0, 500));
  } catch(e) {
    console.log('Specific pool error:', e.message);
  }
}

test();
