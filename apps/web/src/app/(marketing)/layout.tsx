import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

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

