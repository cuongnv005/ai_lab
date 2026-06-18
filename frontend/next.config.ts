import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
let apiHost = "";
let apiProtocol: "http" | "https" = "https";

if (apiUrl) {
  try {
    const url = new URL(apiUrl);
    apiHost = url.hostname;
    if (url.protocol === "http:" || url.protocol === "https:") {
      apiProtocol = url.protocol.replace(":", "") as "http" | "https";
    }
  } catch {
    // Ignore invalid URL
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  images: {
    remotePatterns: apiHost
      ? [
          {
            protocol: apiProtocol,
            hostname: apiHost,
            port: "",
            pathname: "/**",
          },
        ]
      : [],
  },
  async headers() {
    const connectSrc = `connect-src 'self' ${apiUrl} https://api.imgbb.com`.trim();
    const imgSrc = `img-src 'self' blob: data: https: http: ${apiUrl}`.trim();
    const isDev = process.env.NODE_ENV === 'development';
    const upgradeInsecure = isDev ? '' : 'upgrade-insecure-requests;';
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; ${connectSrc}; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; ${imgSrc}; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; ${upgradeInsecure}`.trim(),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
