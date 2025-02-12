// This file is used to configure the Next.js app. It is used to enable experimental features, plugins, and other configurations.
import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';
 
const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})


/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    buildActivityPosition: 'top-right'
  },
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "@mantine/modals", "@mantine/notifications", "@tabler/icons-react"],
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
