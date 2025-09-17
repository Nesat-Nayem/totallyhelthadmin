/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'res.cloudinary.com',
      'totallyhelth.apuae.com',
      'localhost',
    ],
  },
};

export default nextConfig;
