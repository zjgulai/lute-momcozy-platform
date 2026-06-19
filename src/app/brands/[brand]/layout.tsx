import { Sidebar } from "@/components/layout/Sidebar";
import { getBrand, BRANDS } from "@/lib/data/brands";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return BRANDS.map((brand) => ({ brand: brand.id }));
}

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const brand = getBrand(brandId);
  if (!brand) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar brand={brand} />
      <main
        className="flex-1 min-h-screen"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        {children}
      </main>
    </div>
  );
}
