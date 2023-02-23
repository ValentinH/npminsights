/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: `https://npminsights.com`,
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
