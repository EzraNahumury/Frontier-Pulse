import { Sidebar } from "@/components/docs/sidebar";
import { Header } from "@/components/docs/header";
import { TableOfContents } from "@/components/docs/toc";
import { ScrollProgress } from "@/components/docs/scroll-progress";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-space-950">
      <ScrollProgress />
      <Sidebar />

      <div className="lg:pl-72">
        <Header />
        <div className="flex gap-8 px-6 lg:px-10 pt-6 pb-24">
          <main className="flex-1 min-w-0 max-w-3xl">
            {children}
          </main>
          <TableOfContents />
        </div>
      </div>
    </div>
  );
}
