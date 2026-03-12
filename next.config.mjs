/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // oracledb i jsonwebtoken su native/CommonJS moduli - ne bundlati
  serverExternalPackages: ['oracledb', 'jsonwebtoken'],
}

export default nextConfig
