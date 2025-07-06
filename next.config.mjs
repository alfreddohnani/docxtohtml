/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    //required by react-pdf - https://github.com/wojtekmaj/react-pdf#nextjs
    config.resolve.alias.canvas = false;
    config.module.rules.push({
      test: /\.min.mjs$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "[name].[hash].[ext]",
            outputPath: "static/js/",
            publicPath: "/_next/static/js/",
          },
        },
      ],
    });

    return config;
  },
  swcMinify: false, // required by react-pdf - https://github.com/wojtekmaj/react-pdf#nextjs
};

export default nextConfig;
