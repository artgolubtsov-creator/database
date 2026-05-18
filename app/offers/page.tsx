import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";
import { OffersClient } from "./OffersClient";

export default async function OffersPage() {
  const session = await auth();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={session!.user.role} name={session!.user.name} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <OffersClient />
      </main>
    </div>
  );
}
