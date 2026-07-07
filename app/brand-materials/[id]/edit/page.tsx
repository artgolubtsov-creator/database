import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BrandMaterialForm } from "@/components/BrandMaterialForm";
import { canManageContent } from "@/lib/roles";

export default async function EditBrandMaterialPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = session?.user?.role;
  if (!canManageContent(role)) redirect("/dashboard");

  const { id } = await params;
  const material = await prisma.brandMaterial.findUnique({ where: { id } });
  if (!material) notFound();

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <Breadcrumbs items={[
            { label: "Brand Materials", href: "/brand-materials" },
            { label: material.title },
          ]} />
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Edit Material</h1>
            <p className="text-sm text-neutral-500 mt-0.5 truncate">{material.title}</p>
          </div>
          <div className="bg-white rounded-2xl card-shadow p-7">
            <BrandMaterialForm
              mode="edit"
              materialId={material.id}
              redirectTo="/brand-materials"
              initialValues={{
                title: material.title,
                description: material.description ?? "",
                link: material.link ?? "",
                category: material.category as "GUIDE" | "LOGO" | "PRESENTATION" | "ACTIVE_OFFER",
                owner: material.owner ?? "",
                isPublic: material.isPublic,
              }}
            />
          </div>
        </div>
      </main>
  );
}
