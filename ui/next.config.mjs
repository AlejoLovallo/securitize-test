/** @type {import('next').NextConfig} */
const nextConfig = {
      typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // TODO: remove this option when all type errors are fixed
    ignoreBuildErrors: true
  },
  output: 'standalone'
}

export default nextConfig
