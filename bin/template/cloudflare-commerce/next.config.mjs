import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()
const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['next-mdx-remote'],
  reactStrictMode: false,
}

export default withNextIntl(withMDX(nextConfig))

if (process.env.NODE_ENV === 'development') {
  // `await`ing the call is not necessary but it helps making sure that the setup has succeeded.
  //  If you cannot use top level awaits you could use the following to avoid an unhandled rejection:
  //  `setupDevPlatform().catch(e => console.error(e));`
  await setupDevPlatform({ persist: true })
}
