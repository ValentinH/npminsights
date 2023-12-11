/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: `https://npminsights.vercel.app`,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        [process.env.VERCEL_ENV === 'production' ? 'allow' : 'disallow']: '/',
      },
    ],
  },
};
