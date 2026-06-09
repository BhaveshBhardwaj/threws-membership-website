import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageBackdrop } from '@/components/layout/PageBackdrop';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 72px - 300px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <PageBackdrop>{children}</PageBackdrop>
      </main>
      <Footer />
    </>
  );
}
