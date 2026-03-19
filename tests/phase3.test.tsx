/**
 * Phase 3 Tests — AI Email Generation
 *
 * Suites:
 *  1. generateEmailWithAI — mock-call assertions
 *  2. getEmailTemplate    — returns null, returns data, returns error
 *  3. saveEmailTemplate   — validates, upserts, error on DB failure
 *  4. EmailComposer UI    — renders, AI generate, save, variable chips, preview tab
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { EmailTemplate } from "@/lib/supabase/email-templates";
import type { Contact } from "@/lib/supabase/campaigns";

// ─── Module-level mocks ────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/dashboard"),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock the server actions used by EmailComposer
const mockGenerateEmailWithAI = vi.fn();
const mockSaveEmailTemplate   = vi.fn();
const mockGetEmailTemplate    = vi.fn();

vi.mock("@/lib/ai/generate-email", () => ({
  generateEmailWithAI: (...args: unknown[]) => mockGenerateEmailWithAI(...args),
}));
vi.mock("@/lib/supabase/email-templates", () => ({
  saveEmailTemplate: (...args: unknown[]) => mockSaveEmailTemplate(...args),
  getEmailTemplate:  (...args: unknown[]) => mockGetEmailTemplate(...args),
}));

// ─── Static imports (after mocks) ─────────────────────────────────────────────

import EmailComposer from "@/components/campaigns/email-composer";
import { generateEmailWithAI } from "@/lib/ai/generate-email";
import { saveEmailTemplate, getEmailTemplate } from "@/lib/supabase/email-templates";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeTemplate(overrides: Partial<EmailTemplate> = {}): EmailTemplate {
  return {
    id:          "tmpl-1",
    campaign_id: "camp-1",
    user_id:     "user-1",
    subject:     "Hello {{first_name}}",
    body:        "Hi {{first_name}}, welcome to {{company}}.",
    created_at:  new Date().toISOString(),
    updated_at:  new Date().toISOString(),
    ...overrides,
  };
}

function makeContacts(n: number): Contact[] {
  return Array.from({ length: n }, (_, i) => ({
    id:          `c-${i}`,
    campaign_id: "camp-1",
    user_id:     "user-1",
    email:       `alice${i}@example.com`,
    first_name:  `Alice${i}`,
    last_name:   `Smith${i}`,
    company:     `Acme${i}`,
    created_at:  new Date().toISOString(),
  }));
}

function renderComposer(opts: {
  template?: EmailTemplate | null;
  contacts?: Contact[];
} = {}) {
  render(
    <EmailComposer
      campaignId="camp-1"
      campaignName="Winter Sale"
      campaignDescription="Our annual sale."
      initialTemplate={opts.template ?? null}
      previewContacts={opts.contacts ?? makeContacts(2)}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — generateEmailWithAI call behaviour
// ─────────────────────────────────────────────────────────────────────────────

describe("generateEmailWithAI", () => {
  beforeEach(() => vi.clearAllMocks());

  it("is called with campaignName", async () => {
    mockGenerateEmailWithAI.mockResolvedValueOnce({ subject: "S", body: "B" });
    await generateEmailWithAI({ campaignName: "Test Camp" });
    expect(mockGenerateEmailWithAI).toHaveBeenCalledWith(
      expect.objectContaining({ campaignName: "Test Camp" })
    );
  });

  it("passes optional contact fields when provided", async () => {
    mockGenerateEmailWithAI.mockResolvedValueOnce({ subject: "Hi", body: "Body" });
    await generateEmailWithAI({
      campaignName: "Camp",
      contactFirstName: "Alice",
      contactCompany: "Acme",
    });
    expect(mockGenerateEmailWithAI).toHaveBeenCalledWith(
      expect.objectContaining({ contactFirstName: "Alice", contactCompany: "Acme" })
    );
  });

  it("returns subject and body on success", async () => {
    mockGenerateEmailWithAI.mockResolvedValueOnce({ subject: "Great!", body: "Hello {{first_name}}" });
    const result = await generateEmailWithAI({ campaignName: "Launch" });
    expect((result as { subject: string }).subject).toBe("Great!");
    expect((result as { body: string }).body).toBe("Hello {{first_name}}");
  });

  it("returns an error field on failure", async () => {
    mockGenerateEmailWithAI.mockResolvedValueOnce({ subject: "", body: "", error: "API key missing" });
    const result = await generateEmailWithAI({ campaignName: "Fail" });
    expect((result as { error: string }).error).toBe("API key missing");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — getEmailTemplate
// ─────────────────────────────────────────────────────────────────────────────

describe("getEmailTemplate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null data when no template exists", async () => {
    mockGetEmailTemplate.mockResolvedValueOnce({ data: null, error: null });
    const result = await getEmailTemplate("camp-999");
    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  it("returns template data when one exists", async () => {
    const tmpl = makeTemplate();
    mockGetEmailTemplate.mockResolvedValueOnce({ data: tmpl, error: null });
    const result = await getEmailTemplate("camp-1");
    expect(result.data?.subject).toBe(tmpl.subject);
    expect(result.data?.body).toBe(tmpl.body);
  });

  it("returns error string on DB failure", async () => {
    mockGetEmailTemplate.mockResolvedValueOnce({ data: null, error: "Connection refused" });
    const result = await getEmailTemplate("camp-1");
    expect(result.error).toBe("Connection refused");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — saveEmailTemplate
// ─────────────────────────────────────────────────────────────────────────────

describe("saveEmailTemplate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns error when subject is empty", async () => {
    mockSaveEmailTemplate.mockResolvedValueOnce({ data: null, error: "Subject is required." });
    const result = await saveEmailTemplate("camp-1", "", "body text");
    expect(result.error).toBeTruthy();
  });

  it("returns error when body is empty", async () => {
    mockSaveEmailTemplate.mockResolvedValueOnce({ data: null, error: "Body is required." });
    const result = await saveEmailTemplate("camp-1", "Subject", "");
    expect(result.error).toBeTruthy();
  });

  it("returns null error on successful save", async () => {
    const tmpl = makeTemplate({ subject: "Great subject", body: "Body text here" });
    mockSaveEmailTemplate.mockResolvedValueOnce({ data: tmpl, error: null });
    const result = await saveEmailTemplate("camp-1", "Great subject", "Body text here");
    expect(result.error).toBeNull();
    expect(result.data?.subject).toBe("Great subject");
  });

  it("returns error when DB upsert fails", async () => {
    mockSaveEmailTemplate.mockResolvedValueOnce({ data: null, error: "DB constraint" });
    const result = await saveEmailTemplate("camp-1", "Subject", "Body");
    expect(result.error).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — EmailComposer UI
// ─────────────────────────────────────────────────────────────────────────────

describe("EmailComposer", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── Rendering ─────────────────────────────────────────────────────────────

  it("renders subject input and body textarea", () => {
    renderComposer();
    expect(screen.getByRole("textbox", { name: /email subject/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /email body/i })).toBeInTheDocument();
  });

  it("pre-fills fields from initialTemplate", () => {
    renderComposer({ template: makeTemplate({ subject: "Pre-filled subject", body: "Pre-filled body" }) });
    expect(screen.getByDisplayValue("Pre-filled subject")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pre-filled body")).toBeInTheDocument();
  });

  it("renders Generate with AI button", () => {
    renderComposer();
    expect(screen.getByRole("button", { name: /generate with ai/i })).toBeInTheDocument();
  });

  it("renders Save template button", () => {
    renderComposer();
    expect(screen.getByRole("button", { name: /save template/i })).toBeInTheDocument();
  });

  it("renders Compose and Preview tabs", () => {
    renderComposer();
    expect(screen.getByRole("button", { name: /compose/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /preview/i })).toBeInTheDocument();
  });

  it("does NOT mention any AI company name in the UI", () => {
    renderComposer();
    expect(screen.queryByText(/openai/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gemini/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/anthropic/i)).not.toBeInTheDocument();
  });

  // ── Variable chips ────────────────────────────────────────────────────────

  it("renders all variable insert chips", () => {
    renderComposer();
    expect(screen.getByRole("button", { name: "{{first_name}}" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "{{last_name}}"  })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "{{company}}"    })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "{{sender_name}}"})).toBeInTheDocument();
  });

  it("appends variable to body when chip is clicked", async () => {
    renderComposer();
    const bodyEl = screen.getByRole("textbox", { name: /email body/i }) as HTMLTextAreaElement;
    await userEvent.clear(bodyEl);
    await userEvent.type(bodyEl, "Hello ");
    await userEvent.click(screen.getByRole("button", { name: "{{first_name}}" }));
    expect(bodyEl.value).toContain("{{first_name}}");
  });

  // ── Character counter ─────────────────────────────────────────────────────

  it("shows character count for subject", async () => {
    renderComposer();
    const subjectEl = screen.getByRole("textbox", { name: /email subject/i });
    await userEvent.clear(subjectEl);
    await userEvent.type(subjectEl, "Hello");
    expect(screen.getByText("5/60")).toBeInTheDocument();
  });

  // ── Save button state ─────────────────────────────────────────────────────

  it("Save template is disabled when form is not dirty", () => {
    renderComposer({ template: makeTemplate() });
    expect(screen.getByRole("button", { name: /save template/i })).toBeDisabled();
  });

  it("Save template is enabled after editing subject", async () => {
    renderComposer({ template: makeTemplate({ subject: "Old", body: "Old body" }) });
    await userEvent.type(screen.getByRole("textbox", { name: /email subject/i }), "x");
    expect(screen.getByRole("button", { name: /save template/i })).not.toBeDisabled();
  });

  // ── AI Generation ─────────────────────────────────────────────────────────

  it("calls generateEmailWithAI and populates fields on success", async () => {
    mockGenerateEmailWithAI.mockResolvedValueOnce({ subject: "AI Subject", body: "AI body text" });
    renderComposer();
    await userEvent.click(screen.getByRole("button", { name: /generate with ai/i }));
    await waitFor(() => expect(mockGenerateEmailWithAI).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByDisplayValue("AI Subject")).toBeInTheDocument());
    expect(screen.getByDisplayValue("AI body text")).toBeInTheDocument();
  });

  it("shows error when AI generation returns an error", async () => {
    mockGenerateEmailWithAI.mockResolvedValueOnce({ subject: "", body: "", error: "API key invalid" });
    renderComposer();
    await userEvent.click(screen.getByRole("button", { name: /generate with ai/i }));
    await waitFor(() => expect(screen.getByText(/API key invalid/i)).toBeInTheDocument());
  });

  // ── Save Template ─────────────────────────────────────────────────────────

  it("calls saveEmailTemplate when Save button is clicked after editing", async () => {
    mockSaveEmailTemplate.mockResolvedValueOnce({ data: makeTemplate(), error: null });
    renderComposer();
    await userEvent.type(screen.getByRole("textbox", { name: /email subject/i }), "New subject");
    await userEvent.click(screen.getByRole("button", { name: /save template/i }));
    await waitFor(() => expect(mockSaveEmailTemplate).toHaveBeenCalledOnce());
  });

  it("shows Template saved confirmation after successful save", async () => {
    mockSaveEmailTemplate.mockResolvedValueOnce({ data: makeTemplate(), error: null });
    renderComposer();
    await userEvent.type(screen.getByRole("textbox", { name: /email subject/i }), "My subject");
    await userEvent.click(screen.getByRole("button", { name: /save template/i }));
    await waitFor(() => expect(screen.getByText(/template saved/i)).toBeInTheDocument());
  });

  it("shows error message when save fails", async () => {
    mockSaveEmailTemplate.mockResolvedValueOnce({ data: null, error: "Database error" });
    renderComposer();
    await userEvent.type(screen.getByRole("textbox", { name: /email subject/i }), "My subject");
    await userEvent.click(screen.getByRole("button", { name: /save template/i }));
    await waitFor(() => expect(screen.getByText(/database error/i)).toBeInTheDocument());
  });

  // ── Preview tab ───────────────────────────────────────────────────────────

  it("switches to Preview tab on click", async () => {
    renderComposer({ template: makeTemplate() });
    await userEvent.click(screen.getByRole("button", { name: /preview/i }));
    await waitFor(() => expect(screen.getByText(/subject/i)).toBeInTheDocument());
  });

  it("substitutes {{first_name}} with contact name in preview", async () => {
    renderComposer({
      template: makeTemplate({ subject: "Hello {{first_name}}", body: "Dear {{first_name}}" }),
      contacts: makeContacts(1),
    });
    await userEvent.click(screen.getByRole("button", { name: /preview/i }));
    await waitFor(() => expect(screen.getByText("Hello Alice0")).toBeInTheDocument());
  });

  it("substitutes {{company}} in preview body", async () => {
    renderComposer({
      template: makeTemplate({ subject: "Hi", body: "Welcome {{company}}!" }),
      contacts: makeContacts(1),
    });
    await userEvent.click(screen.getByRole("button", { name: /preview/i }));
    await waitFor(() => expect(screen.getByText(/Welcome Acme0!/i)).toBeInTheDocument());
  });

  it("shows contact picker buttons in preview tab", async () => {
    renderComposer({ contacts: makeContacts(3) });
    await userEvent.click(screen.getByRole("button", { name: /preview/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Alice0" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Alice2" })).toBeInTheDocument();
    });
  });

  it("shows empty-body message when no body is set", async () => {
    renderComposer({ template: makeTemplate({ subject: "Sub", body: "" }), contacts: [] });
    await userEvent.click(screen.getByRole("button", { name: /preview/i }));
    await waitFor(() => expect(screen.getByText(/no body yet/i)).toBeInTheDocument());
  });

  it("shows hint to add contacts when contact list is empty", async () => {
    renderComposer({ contacts: [] });
    await userEvent.click(screen.getByRole("button", { name: /preview/i }));
    await waitFor(() => expect(screen.getByText(/add contacts/i)).toBeInTheDocument());
  });

  it("shows variable legend for selected contact", async () => {
    renderComposer({ template: makeTemplate(), contacts: makeContacts(2) });
    await userEvent.click(screen.getByRole("button", { name: /preview/i }));
    await waitFor(() => expect(screen.getByText("{{first_name}}")).toBeInTheDocument());
  });

  it("switches preview contact when a picker button is clicked", async () => {
    renderComposer({ template: makeTemplate({ subject: "Hi {{first_name}}" }), contacts: makeContacts(3) });
    await userEvent.click(screen.getByRole("button", { name: /preview/i }));
    await waitFor(() => screen.getByRole("button", { name: "Alice1" }));
    await userEvent.click(screen.getByRole("button", { name: "Alice1" }));
    await waitFor(() => expect(screen.getByText("Hi Alice1")).toBeInTheDocument());
  });
});
