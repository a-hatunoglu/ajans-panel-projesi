/** @type {import('next').NextConfig} */
const apiRewriteTarget = process.env.API_REWRITE_TARGET?.replace(/\/$/, "");

const nextConfig = {
	async rewrites() {
		if (!apiRewriteTarget) {
			return [];
		}

		return [
			{
				source: "/api/v1/:path*",
				destination: `${apiRewriteTarget}/api/v1/:path*`,
			},
		];
	},
};

export default nextConfig;
