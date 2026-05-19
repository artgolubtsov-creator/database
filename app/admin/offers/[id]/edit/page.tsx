import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { OfferForm } from "@/components/OfferForm";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = session?.user.role;
  if (role !== "ADMIN" && role !== "EDITOR") redirect("/dashboard");

  const { id } = await params;
  const offer = await prisma.offerRecord.findUnique({ where: { id } });
  if (!offer) notFound();

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
            <h1 className="text-xl font-bold text-neutral-900">Edit Offer</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{offer.offerName} · {offer.country} · {offer.platform}</p>
          </div>
          <div className="bg-white rounded-2xl card-shadow p-7">
            <OfferForm
              mode="edit"
              offerId={offer.id}
              initialValues={{
                type:         offer.type as "future" | "current" | "old",
                country:      offer.country,
                tariff:       offer.tariff as "Basic" | "Premium" | "Crunchyroll",
                platform:     offer.platform as "iOS" | "Android" | "Native",
                offerName:    offer.offerName,
                date:         offer.date ?? undefined,
                offerValue:   offer.offerValue ?? undefined,
                price:        offer.price ?? undefined,
                duration:     offer.duration ?? undefined,
                promoCode:    offer.promoCode ?? undefined,
                description:  offer.description ?? undefined,
                dateFrom:     offer.dateFrom ?? undefined,
                dateTo:       offer.dateTo ?? undefined,
                comment:      offer.comment ?? undefined,
                status:       offer.status ?? undefined,
                buttonTextEn: offer.buttonTextEn ?? undefined,
                buttonTextAr: offer.buttonTextAr ?? undefined,
                disclaimerEn: offer.disclaimerEn ?? undefined,
                disclaimerAr: offer.disclaimerAr ?? undefined,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
