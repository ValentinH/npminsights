import { PackageProps } from './page';

export default function Head({ params }: PackageProps) {
  const { name } = params;
  const packageName = name.map(decodeURIComponent).join('/');
  return (
    <>
      <title>{`${packageName} - npminsights.com`}</title>
      <meta property="og:image" content={`/api/package/og-image/${packageName}`} />
    </>
  );
}
