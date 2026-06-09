/**
 * Verify SMTP credentials without sending mail.
 * Usage: npx tsx scripts/test-smtp.ts
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

function checkEnv(): string[] {
  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  return missing;
}

async function main() {
  const missing = checkEnv();
  if (missing.length > 0) {
    console.error("Missing:", missing.join(", "));
    process.exit(1);
  }

  if (pass && pass.length < 16 && pass.includes("@")) {
    console.warn(
      "⚠️  SMTP_PASS looks like a normal Gmail password, not a 16-character App Password."
    );
    console.warn("   Gmail requires 2FA + an App Password: https://myaccount.google.com/apppasswords");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  console.log(`Verifying SMTP ${host}:${port} as ${user}...`);
  try {
    await transporter.verify();
    console.log("✅ SMTP connection and authentication succeeded.");
  } catch (err) {
    console.error("❌ SMTP verify failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
