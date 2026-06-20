import type { NextConfig } from "next";
import path from "path";
import webpack from "webpack";

const nextConfig: NextConfig = {
  // Yerel ağdan mobil test için IP erişimine izin ver
  allowedDevOrigins: ['192.168.1.111', '192.168.*'],
  typescript: {
    // Mobil taraftaki React Native'e özel TS hatalarının web derlemesini bozmasını önlemek için
    ignoreBuildErrors: true,
  },
  // Mobil cihazlarda CORS sorununu önlemek için API isteklerini proxy'le
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'https://api.service.menuland.net/:path*',
      },
    ];
  },
  webpack: (config, { dev }) => {
    config.resolve.alias["@react-native-async-storage/async-storage"] = path.resolve(
      __dirname,
      "./lib/asyncStorageMock.ts"
    );
    
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(dev),
      })
    );

    return config;
  },
};

export default nextConfig;
