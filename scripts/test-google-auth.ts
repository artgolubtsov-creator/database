import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    console.error("❌ GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY not set in .env");
    process.exit(1);
  }

  console.log(`🔑 Using service account: ${email}`);

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  try {
    const token = await auth.getAccessToken();
    console.log("✅ Auth OK — access token received");
    console.log(`   Token type: Bearer, expires in ~${Math.round((token.res?.data?.expires_in ?? 0) / 60)} min`);
  } catch (err: unknown) {
    console.error("❌ Auth failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
