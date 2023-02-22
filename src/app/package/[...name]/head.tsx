import { PackageProps } from './page';

export default function Head({ params }: PackageProps) {
  const { name } = params;
  const packageName = name.map(decodeURIComponent).join('/');
  return (
    <>
      <meta property="og:image" content={`/api/package/og-image/${packageName}`} />
    </>
  );
}
