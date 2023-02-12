import './globals.css';

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head />
      <body className="h-screen w-full bg-gray-900 text-white">
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
