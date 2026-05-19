import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BrandMaterialForm } from "@/components/BrandMaterialForm";
import { canManageContent } from "@/lib/roles";

export default async function NewBrandMaterialPublicPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!canManageContent(role)) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <Breadcrumbs items={[
            { label: "Brand Materials", href: "/brand-materials" },
            { label: "New Material" },
          ]} />
          <div>
            <h1 className="text-xl font-bold text-neutral-900">New Brand Material</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Add a brand asset or offer</p>
          </div>
          <div className="bg-white rounded-2xl card-shadow p-7">
            <BrandMaterialForm mode="create" redirectTo="/brand-materials" />
          </div>
        </div>
      </main>
    </div>
  );
}
