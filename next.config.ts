import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";
const basePath = isGitHubPages ? "/rin3" : "";

const nextConfig: NextConfig = {
  output: "export",
  // 网站直接消费本地 workspace 的 TypeScript 源码，package 不依赖 Next.js 构建产物。
  transpilePackages: ["@rin/document"],
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
