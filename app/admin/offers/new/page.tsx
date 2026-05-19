import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { OfferForm } from "@/components/OfferForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { canManageOffers } from "@/lib/roles";

export default async function NewOfferPage() {
  const session = await auth();
  const role = session?.user.role;
  if (!canManageOffers(role)) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Link href="/admin#offers">
              <Button variant="ghost" size="sm"><ArrowLeft size={15} /> Back</Button>
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">New Offer</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Add a subscription offer to the hub</p>
          </div>
          <div className="bg-white rounded-2xl card-shadow p-7">
            <OfferForm mode="create" />
          </div>
        </div>
      </main>
    </div>
  );
}
