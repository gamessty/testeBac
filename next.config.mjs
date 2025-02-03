import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks", "@mantine/modals", "@mantine/charts", "recharts@2", "@mantine/notifications"],
  },
};

export default withNextIntl(nextConfig);
