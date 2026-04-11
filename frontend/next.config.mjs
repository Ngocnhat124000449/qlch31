/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/dashboard",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/dashboard/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
