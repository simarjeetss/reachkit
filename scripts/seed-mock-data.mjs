import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL ?? "simarjeetms@gmail.com";
const RESET = process.env.SEED_RESET === "true";

const CAMPAIGN_COUNT = Number(process.env.SEED_CAMPAIGN_COUNT ?? 6);
const CONTACTS_PER_CAMPAIGN = Number(process.env.SEED_CONTACTS_PER_CAMPAIGN ?? 45);
const SENT_EMAILS_PER_CAMPAIGN = Number(process.env.SEED_SENT_EMAILS_PER_CAMPAIGN ?? 120);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const firstNames = [
  "Ava",
  "Liam",
  "Noah",
  "Mia",
  "Ethan",
  "Olivia",
  "Lucas",
  "Ivy",
  "Aria",
  "Logan",
  "Nora",
  "Elijah",
  "Zara",
  "Mason",
  "Leah",
  "Kai",
  "Ruby",
  "Owen",
  "Maya",
  "Ezra",
];

const lastNames = [
  "Patel",
  "Nguyen",
  "Carter",
  "Gomez",
  "Kim",
  "Rossi",
  "Singh",
  "Hughes",
  "Walker",
  "Chen",
  "Diaz",
  "Morgan",
  "Alvarez",
  "Wright",
  "Hassan",
  "Baker",
  "Lewis",
  "Scott",
  "Ward",
  "Reed",
];

const companies = [
  "Northwind",
  "Vercel",
  "Airtable",
  "Linear",
  "Retool",
  "Figma",
  "Notion",
  "Superhuman",
  "Slack",
  "Ramp",
  "Mercury",
  "Coda",
  "Gong",
  "Asana",
  "Webflow",
  "Zapier",
  "Segment",
  "Intercom",
  "HubSpot",
  "Amplitude",
];

const campaignNames = [
  "Q2 Product Outreach",
  "Growth Experiment: Fintech",
  "Outbound — SaaS Leaders",
  "Founders Discovery",
  "Pipeline Recovery",
  "Product-Led Expansion",
  "Enterprise Accounts",
  "APAC Mid-Market",
];

const templateSubjects = [
  "Quick idea for {{company}}",
  "{{first_name}}, noticed something about {{company}}",
  "A tiny win for {{company}}",
];

const templateBodies = [
  "Hi {{first_name}},\n\nWe work with teams like {{company}} to streamline outbound and improve reply rates. Happy to share what we saw that might help.\n\n– {{sender_name}}",
  "Hey {{first_name}},\n\nNoticed {{company}} is growing fast. We mapped a quick 3-step flow that lifted opens by 18%. Worth a peek?\n\n– {{sender_name}}",
  "{{first_name}},\n\nWe help revenue teams automate follow-ups without losing the personal touch. If you want, I can send over a short breakdown.\n\n– {{sender_name}}",
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function findUserIdByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (!match) {
    throw new Error(`No Supabase user found for ${email}`);
  }
  return match.id;
}

async function insertInChunks(table, rows, chunkSize = 200) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) throw error;
  }
}

async function seed() {
  const userId = await findUserIdByEmail(SEED_USER_EMAIL);

  if (RESET) {
    await supabase.from("sent_emails").delete().eq("user_id", userId);
    await supabase.from("contacts").delete().eq("user_id", userId);
    await supabase.from("campaigns").delete().eq("user_id", userId);
    await supabase.from("email_templates").delete().eq("user_id", userId);
    await supabase.from("user_profiles").delete().eq("id", userId);
  }

  const profile = {
    id: userId,
    full_name: "Simarjeet Singh",
    company: "ReachKit AI",
  };
  await supabase.from("user_profiles").upsert(profile, { onConflict: "id" });

  const campaignRows = Array.from({ length: CAMPAIGN_COUNT }).map((_, index) => ({
    user_id: userId,
    name: campaignNames[index % campaignNames.length],
    description: "High intent outreach for demo prospects.",
    status: index % 3 === 0 ? "draft" : index % 3 === 1 ? "active" : "paused",
  }));

  const { data: campaigns, error: campaignError } = await supabase
    .from("campaigns")
    .insert(campaignRows)
    .select("id, name");

  if (campaignError) throw campaignError;

  const contacts = [];
  const contactIdsByCampaign = new Map();

  campaigns.forEach((campaign, idx) => {
    const contactIds = [];
    for (let i = 0; i < CONTACTS_PER_CAMPAIGN; i += 1) {
      const first = pick(firstNames);
      const last = pick(lastNames);
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${idx}${i}@demo-${campaign.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}.com`;
      const row = {
        user_id: userId,
        campaign_id: campaign.id,
        email,
        first_name: first,
        last_name: last,
        company: pick(companies),
        created_at: daysAgo(randomInt(3, 90)).toISOString(),
      };
      contacts.push(row);
      contactIds.push(row);
    }
    contactIdsByCampaign.set(campaign.id, contactIds);
  });

  await insertInChunks("contacts", contacts);

  const { data: contactRows, error: contactError } = await supabase
    .from("contacts")
    .select("id, campaign_id")
    .eq("user_id", userId);

  if (contactError) throw contactError;

  const templateRows = templateSubjects.map((subject, index) => ({
    user_id: userId,
    name: `Demo Template ${index + 1}`,
    subject,
    body: templateBodies[index],
  }));

  await supabase.from("email_templates").insert(templateRows);

  const sentEmails = [];
  const contactsByCampaign = new Map();
  contactRows.forEach((row) => {
    const list = contactsByCampaign.get(row.campaign_id) ?? [];
    list.push(row.id);
    contactsByCampaign.set(row.campaign_id, list);
  });

  campaigns.forEach((campaign, index) => {
    const contactIds = contactsByCampaign.get(campaign.id) ?? [];
    for (let i = 0; i < SENT_EMAILS_PER_CAMPAIGN; i += 1) {
      const contactId = contactIds[i % contactIds.length];
      const statusRoll = Math.random();
      const status = statusRoll < 0.08 ? "failed" : "sent";
      const sentDate = daysAgo(randomInt(1, 60));
      const opened = status === "sent" && Math.random() < 0.62;
      const clicked = opened && Math.random() < 0.35;

      sentEmails.push({
        user_id: userId,
        campaign_id: campaign.id,
        contact_id: contactId,
        subject: templateSubjects[index % templateSubjects.length],
        body: templateBodies[index % templateBodies.length],
        status,
        sent_at: sentDate.toISOString(),
        opened_at: opened ? new Date(sentDate.getTime() + randomInt(2, 72) * 60 * 60 * 1000).toISOString() : null,
        clicked_at: clicked ? new Date(sentDate.getTime() + randomInt(10, 120) * 60 * 60 * 1000).toISOString() : null,
        created_at: sentDate.toISOString(),
      });
    }
  });

  await insertInChunks("sent_emails", sentEmails, 250);

  console.log("Seed complete:");
  console.log(`Campaigns: ${campaigns.length}`);
  console.log(`Contacts: ${contacts.length}`);
  console.log(`Sent emails: ${sentEmails.length}`);
}

seed().catch((error) => {
  console.error("Seed failed:", error.message ?? error);
  process.exit(1);
});
