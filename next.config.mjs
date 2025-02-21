/** @type {import('next').NextConfig} */
//versión nextjs14
// const nextConfig = {
//     images: {
//         domains: ['via.placeholder.com'],
//       },
// };

// export default nextConfig;
// next.config.mjs

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost', // O el dominio de tu servidor
        port: '3000', // Puerto si estás en desarrollo
        pathname: '/api/getAvatar',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // Reemplazar con mi dominio
        pathname: '/avatars/**',   // Ruta relativa donde están tus avatares
      }
    ],
  },
};

export default nextConfig;
