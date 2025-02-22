// This file is used to configure the Next.js app. It is used to enable experimental features, plugins, and other configurations.
import createNextIntlPlugin from 'next-intl/plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';
import path from 'node:path';

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
  sassOptions: {
    implementation: 'sass-embedded',
    additionalData: `@use "${path.join(process.cwd(), '_mantine').replace(/\\/g, '/')}" as mantine;`,
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
