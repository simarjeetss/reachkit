"use client";

import { useState, useTransition, useRef } from "react";
import { saveEmailTemplate } from "@/lib/supabase/email-templates";
import { generateEmailWithAI } from "@/lib/ai/generate-email";
import type { EmailTemplate } from "@/lib/supabase/email-templates";
import type { Contact } from "@/lib/supabase/campaigns";

// ── Helpers ───────────────────────────────────────────────────────────────────

const VARIABLES = ["{{first_name}}", "{{last_name}}", "{{company}}", "{{sender_name}}"];

function applyPreview(text: string, contact: Contact | null): string {
  if (!contact) return text;
  return text
    .replace(/\{\{first_name\}\}/g, contact.first_name ?? "there")
    .replace(/\{\{last_name\}\}/g,  contact.last_name  ?? "")
    .replace(/\{\{company\}\}/g,    contact.company    ?? "your company")
    .replace(/\{\{sender_name\}\}/g, "You");
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EmailComposer({
  campaignId,
  campaignName,
  campaignDescription,
  initialTemplate,
  previewContacts,
}: {
  campaignId: string;
  campaignName: string;
  campaignDescription?: string | null;
  initialTemplate: EmailTemplate | null;
  previewContacts: Contact[];
}) {
  const [subject,     setSubject]     = useState(initialTemplate?.subject ?? "");
  const [body,        setBody]        = useState(initialTemplate?.body    ?? "");
  const [tab,         setTab]         = useState<"compose" | "preview">("compose");
  const [previewIdx,  setPreviewIdx]  = useState(0);
  const [saveStatus,  setSaveStatus]  = useState<"idle" | "saved" | "error">("idle");
  const [saveError,   setSaveError]   = useState("");
  const [aiError,     setAiError]     = useState("");
  const [isSaving,    startSave]      = useTransition();
  const [isGenerating,startGenerate]  = useTransition();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const previewContact = previewContacts[previewIdx] ?? null;
  const isDirty = subject !== (initialTemplate?.subject ?? "") || body !== (initialTemplate?.body ?? "");

  // Insert variable at cursor in body textarea
  function insertVariable(v: string) {
    const el = bodyRef.current;
    if (!el) { setBody((b) => b + v); return; }
    const start = el.selectionStart ?? body.length;
    const end   = el.selectionEnd   ?? body.length;
    const next  = body.slice(0, start) + v + body.slice(end);
    setBody(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + v.length, start + v.length);
    }, 0);
  }

  function handleSave() {
    setSaveStatus("idle");
    setSaveError("");
    startSave(async () => {
      const { error } = await saveEmailTemplate(campaignId, subject, body);
      if (error) { setSaveStatus("error"); setSaveError(error); }
      else        setSaveStatus("saved");
    });
  }

  function handleGenerate() {
    setAiError("");
    startGenerate(async () => {
      const sample = previewContacts[0] ?? null;
      const result = await generateEmailWithAI({
        campaignName,
        campaignDescription,
        contactFirstName: sample?.first_name,
        contactLastName:  sample?.last_name,
        contactCompany:   sample?.company,
      });
      if (result.error) { setAiError(result.error); return; }
      setSubject(result.subject);
      setBody(result.body);
      setSaveStatus("idle");
    });
  }

  return (
    <div className="space-y-4">
      {/* ── Header bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Tab switcher */}
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--rk-border)", background: "var(--rk-surface)" }}
        >
          {(["compose", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 text-xs capitalize transition-colors"
              style={{
                background:  tab === t ? "rgba(212,168,83,0.12)" : "transparent",
                color:       tab === t ? "var(--rk-gold)"        : "var(--rk-text-muted)",
                fontWeight:  tab === t ? 600 : 400,
                border:      "none",
                cursor:      "pointer",
                borderRight: t === "compose" ? "1px solid var(--rk-border)" : "none",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* AI Generate */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: isGenerating ? "rgba(212,168,83,0.06)" : "rgba(212,168,83,0.1)",
              border: "1px solid rgba(212,168,83,0.3)",
              color: "var(--rk-gold)",
              cursor: isGenerating ? "not-allowed" : "pointer",
              opacity: isGenerating ? 0.7 : 1,
            }}
          >
            {isGenerating ? (
              <>
                <SpinnerIcon />
                Generating…
              </>
            ) : (
              <>
                <SparkleIcon />
                Generate with AI
              </>
            )}
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving || isGenerating || !isDirty}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: "var(--rk-surface)",
              border: "1px solid var(--rk-border)",
              color: isDirty ? "var(--rk-text-muted)" : "var(--rk-text-sub)",
              cursor: (!isDirty || isSaving) ? "not-allowed" : "pointer",
              opacity: (!isDirty || isSaving) ? 0.5 : 1,
            }}
          >
            {isSaving ? "Saving…" : "Save template"}
          </button>
        </div>
      </div>

      {/* ── AI error ────────────────────────────────────────────────────── */}
      {aiError && (
        <div
          className="rk-fade-in px-4 py-3 rounded-lg text-xs"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
        >
          {aiError}
        </div>
      )}

      {/* ── Save feedback ────────────────────────────────────────────────── */}
      {saveStatus === "saved" && (
        <div
          className="rk-fade-in px-4 py-2.5 rounded-lg text-xs flex items-center gap-2"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Template saved
        </div>
      )}
      {saveStatus === "error" && (
        <div
          className="rk-fade-in px-4 py-2.5 rounded-lg text-xs"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
        >
          {saveError}
        </div>
      )}

      {/* ── COMPOSE tab ─────────────────────────────────────────────────── */}
      {tab === "compose" && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--rk-surface)", border: "1px solid var(--rk-border)" }}
        >
          {/* Subject */}
          <div style={{ borderBottom: "1px solid var(--rk-border)" }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-[10px] uppercase tracking-widest shrink-0 w-12" style={{ color: "var(--rk-text-sub)" }}>
                Subject
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setSaveStatus("idle"); }}
                placeholder="Your subject line…"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "var(--rk-text)", caretColor: "var(--rk-gold)" }}
                aria-label="Email subject"
              />
              <span
                className="text-[10px] shrink-0"
                style={{ color: subject.length > 60 ? "#f87171" : "var(--rk-text-sub)" }}
              >
                {subject.length}/60
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="relative">
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => { setBody(e.target.value); setSaveStatus("idle"); }}
              placeholder={"Write your email body here…\n\nTip: Use {{first_name}}, {{company}}, {{sender_name}} as placeholders."}
              rows={14}
              className="w-full bg-transparent text-sm outline-none resize-none px-4 py-4 leading-relaxed"
              style={{ color: "var(--rk-text)", caretColor: "var(--rk-gold)" }}
              aria-label="Email body"
            />
          </div>

          {/* Variable chips */}
          <div
            className="flex items-center gap-2 px-4 py-2.5 flex-wrap"
            style={{ borderTop: "1px solid var(--rk-border)" }}
          >
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--rk-text-sub)" }}>
              Insert
            </span>
            {VARIABLES.map((v) => (
              <button
                key={v}
                onClick={() => insertVariable(v)}
                className="text-[11px] px-2 py-0.5 rounded-md font-mono transition-colors"
                style={{
                  background: "rgba(212,168,83,0.08)",
                  border: "1px solid rgba(212,168,83,0.2)",
                  color: "var(--rk-gold)",
                  cursor: "pointer",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── PREVIEW tab ─────────────────────────────────────────────────── */}
      {tab === "preview" && (
        <div className="space-y-3">
          {/* Contact picker */}
          {previewContacts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px]" style={{ color: "var(--rk-text-sub)" }}>Preview as:</span>
              <div className="flex gap-1.5 flex-wrap">
                {previewContacts.slice(0, 5).map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setPreviewIdx(i)}
                    className="text-[11px] px-2.5 py-1 rounded-full transition-colors"
                    style={{
                      background:  previewIdx === i ? "rgba(212,168,83,0.12)" : "var(--rk-surface)",
                      border:      previewIdx === i ? "1px solid rgba(212,168,83,0.35)" : "1px solid var(--rk-border)",
                      color:       previewIdx === i ? "var(--rk-gold)" : "var(--rk-text-muted)",
                      cursor:      "pointer",
                      fontWeight:  previewIdx === i ? 600 : 400,
                    }}
                  >
                    {c.first_name ?? c.email.split("@")[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rendered preview */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--rk-surface)", border: "1px solid var(--rk-border)" }}
          >
            {/* Subject preview */}
            <div
              className="px-5 py-3.5"
              style={{ borderBottom: "1px solid var(--rk-border)" }}
            >
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "var(--rk-text-sub)" }}>Subject</div>
              <div className="text-sm font-medium" style={{ color: "var(--rk-text)" }}>
                {subject ? applyPreview(subject, previewContact) : (
                  <span style={{ color: "var(--rk-text-sub)", fontStyle: "italic" }}>No subject yet</span>
                )}
              </div>
            </div>

            {/* Body preview */}
            <div className="px-5 py-5">
              {body ? (
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: "var(--rk-text-muted)" }}
                >
                  {applyPreview(body, previewContact)}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: "var(--rk-text-sub)", fontStyle: "italic" }}>
                    No body yet — write something in the Compose tab
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Variable legend */}
          {previewContact && (
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: "var(--rk-surface-2)", border: "1px solid var(--rk-border)" }}
            >
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--rk-text-sub)" }}>
                Variable values for this contact
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[
                  ["{{first_name}}", previewContact.first_name ?? "—"],
                  ["{{last_name}}",  previewContact.last_name  ?? "—"],
                  ["{{company}}",    previewContact.company    ?? "—"],
                  ["{{sender_name}}", "You"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center gap-1.5 text-[11px]">
                    <code style={{ color: "var(--rk-gold)", fontFamily: "monospace" }}>{k}</code>
                    <span style={{ color: "var(--rk-text-sub)" }}>→</span>
                    <span style={{ color: "var(--rk-text-muted)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewContacts.length === 0 && (
            <p className="text-xs text-center py-2" style={{ color: "var(--rk-text-sub)" }}>
              Add contacts to this campaign to preview personalised output
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 L13.5 8.5 L19 10 L13.5 11.5 L12 17 L10.5 11.5 L5 10 L10.5 8.5 Z" />
      <path d="M5 3 L5.75 5.25 L8 6 L5.75 6.75 L5 9 L4.25 6.75 L2 6 L4.25 5.25 Z" />
      <path d="M19 15 L19.75 17.25 L22 18 L19.75 18.75 L19 21 L18.25 18.75 L16 18 L18.25 17.25 Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className="animate-spin"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
