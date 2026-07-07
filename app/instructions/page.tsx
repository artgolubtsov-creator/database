import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { canManageOffers } from "@/lib/roles";
import { FileSpreadsheet, Table2, Settings2, Upload, CheckCircle2 } from "lucide-react";

function Step({ n, icon: Icon, title, children }: {
  n: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div className="flex flex-col items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-white" />
        </div>
        <div className="w-px flex-1 bg-neutral-100 min-h-4" />
      </div>
      <div className="pb-8 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-neutral-400">Step {n}</span>
        </div>
        <h3 className="text-base font-semibold text-neutral-900 mb-2">{title}</h3>
        <div className="text-sm text-neutral-600 leading-relaxed flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}

function CodeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-xs font-mono">
      <span className="text-neutral-400 shrink-0 w-32">{label}</span>
      <span className="text-neutral-700">{value}</span>
    </div>
  );
}

export default async function InstructionsPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!canManageOffers(role)) redirect("/dashboard");

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">

        <div className="mb-10">
          <h1 className="text-2xl font-bold text-neutral-900">Instructions</h1>
          <p className="text-sm text-neutral-500 mt-1">How to import offers from Google Sheets</p>
        </div>

        {/* Step 1 */}
        <Step n={1} icon={Table2} title="Prepare the sheet tab">
          <p>
            Each offer campaign lives in its own tab in the Google Sheet. The tab must follow this exact structure:
          </p>
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col gap-1.5">
            <CodeRow label="Row 1, col B–C" value='Date from: · 21.05.2026' />
            <CodeRow label="Row 2, col B–C" value='Date to: · 28.05.2026' />
            <CodeRow label="Row 3" value="(Ticket / any label — skipped)" />
            <CodeRow label="Row 4, col A" value="Platform note, e.g. Web, Smart TV…" />
            <CodeRow label="Row 5, col C–D" value="Eng · Arabic  (header row)" />
            <div className="mt-1 pt-2 border-t border-neutral-200">
              <CodeRow label="Row 6+, col A" value='"Button text" — col B: country, col C: EN, col D: AR' />
              <CodeRow label="Next row, col A" value='"Text under the button" — col C: EN, col D: AR' />
              <CodeRow label="…" value="Repeat for each country" />
            </div>
          </div>
          <p>
            The key rule: a row with a country in column B starts a new country block. The following row (empty col B) is the disclaimer text for that country.
          </p>
        </Step>

        {/* Step 2 */}
        <Step n={2} icon={FileSpreadsheet} title="Open Import from Sheet">
          <p>
            Go to <strong>Admin</strong> → find the <strong>Offers</strong> section → click{" "}
            <strong>Import from Sheet</strong> in the top-right of that section.
          </p>
          <p>
            The page loads all tab names directly from the spreadsheet. This takes a few seconds — the app downloads the full file from Google Drive.
          </p>
        </Step>

        {/* Step 3 */}
        <Step n={3} icon={Table2} title="Select a tab and check the preview">
          <p>
            Choose the tab from the dropdown. The app parses it and shows:
          </p>
          <ul className="list-disc pl-4 flex flex-col gap-1">
            <li>Date from / Date to detected from rows 1–2</li>
            <li>A preview table: country, button text and disclaimer in EN and AR</li>
          </ul>
          <p>
            If any country rows are missing, check that the sheet tab matches the structure above. Empty button text cells will import as blank — that's OK.
          </p>
        </Step>

        {/* Step 4 */}
        <Step n={4} icon={Settings2} title="Configure import settings">
          <p>Fill in the fields before importing:</p>
          <ul className="list-disc pl-4 flex flex-col gap-1.5">
            <li><strong>Offer name</strong> — how this offer will appear in the admin table (pre-filled with the tab name)</li>
            <li><strong>Type</strong> — Current, Future, or Old</li>
            <li><strong>Tariff</strong> — Basic, Premium, or Crunchyroll (not in the sheet, set manually)</li>
            <li><strong>Platforms</strong> — check the platforms this offer applies to (iOS / Android / Native). One record is created per country per platform.</li>
            <li><strong>Date from / Date to</strong> — pre-filled from the sheet, edit if needed</li>
          </ul>
          <p>
            The counter at the bottom shows how many records will be created: <em>countries × platforms</em>.
          </p>
        </Step>

        {/* Step 5 */}
        <Step n={5} icon={Upload} title="Click Import">
          <p>
            Press <strong>Import N records</strong>. All records are created in bulk with:
          </p>
          <ul className="list-disc pl-4 flex flex-col gap-1">
            <li>Offer kind: <strong>Main product</strong> (always)</li>
            <li>Source: <strong>Google Sheet</strong></li>
            <li>Button text and disclaimer in EN and AR from the sheet</li>
          </ul>
        </Step>

        {/* Step 6 — final */}
        <div className="flex gap-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} className="text-white" />
          </div>
          <div className="pb-8 flex-1">
            <h3 className="text-base font-semibold text-neutral-900 mb-2">Done</h3>
            <p className="text-sm text-neutral-600">
              The records appear in the <strong>Offers</strong> section in Admin and are immediately visible on the <strong>/offers</strong> page. You can edit any individual record from the admin table if something needs adjusting.
            </p>
          </div>
        </div>

      </main>
  );
}
