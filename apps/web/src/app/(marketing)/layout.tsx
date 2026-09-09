import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@warkop-yareh/ui";
import { ScrollToTop } from "@warkop-yareh/ui";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollProgress />
      <main id="main-content" role="main" className="pb-28 md:pb-12">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
}

