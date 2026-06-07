#!/usr/bin/env node
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const templateDir = dirname(new URL(import.meta.url).pathname);
const templatePath = join(templateDir, "fax-template.html");

function usage() {
  console.error("Usage: render-fax.mjs <input.md> [--out-dir <dir>]");
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.length < 1 || args.includes("--help") || args.includes("-h")) usage();

const inputPath = resolve(args[0]);
let outDir = join(homedir(), "Documents");
const outDirIndex = args.indexOf("--out-dir");
if (outDirIndex !== -1) {
  if (!args[outDirIndex + 1]) usage();
  outDir = resolve(args[outDirIndex + 1]);
}

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Input must start with YAML-style frontmatter.");

  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const keyValue = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (!keyValue) continue;

    const key = keyValue[1];
    let value = keyValue[2] ?? "";

    if (value === "|") {
      const block = [];
      while (i + 1 < lines.length && /^(  |\t)/.test(lines[i + 1])) {
        i += 1;
        block.push(lines[i].replace(/^(  |\t)/, ""));
      }
      value = block.join("\n");
    }

    data[key] = value.replace(/^["']|["']$/g, "");
  }

  return { data, body: match[2].trim() };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function linesToHtml(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function markdownToHtml(markdown) {
  const blocks = markdown.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return blocks.map((block) => {
    if (block.startsWith("## ")) return `<h2>${escapeHtml(block.slice(3))}</h2>`;
    if (/^[-*] /m.test(block)) {
      const items = block.split(/\r?\n/).filter((line) => /^[-*] /.test(line));
      return `<ul>${items.map((line) => `<li>${escapeHtml(line.slice(2))}</li>`).join("")}</ul>`;
    }
    return `<p>${escapeHtml(block).replace(/\r?\n/g, "<br>")}</p>`;
  }).join("\n");
}

function sanitizePart(value, fallback) {
  const normalized = String(value || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[Ä]/g, "Ae")
    .replace(/[Ö]/g, "Oe")
    .replace(/[Ü]/g, "Ue")
    .replace(/[ä]/g, "ae")
    .replace(/[ö]/g, "oe")
    .replace(/[ü]/g, "ue")
    .replace(/[ß]/g, "ss")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return normalized || fallback;
}

function formatDateDe(date) {
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year}`;
}

function replaceTokens(template, values) {
  return template
    .replace(/\{\{\{([A-Za-z0-9_]+)\}\}\}/g, (_, key) => String(values[key] ?? ""))
    .replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (_, key) => escapeHtml(values[key] ?? ""));
}

const source = readFileSync(inputPath, "utf8");
const { data, body } = parseFrontmatter(source);
const today = new Date().toISOString().slice(0, 10);
const date = data.date || today;
const type = (data.type || "FAX").toUpperCase();
const subject = data.subject || basename(inputPath, ".md");
const contact = data.contact || data.recipient?.split(/\r?\n/)[0] || "Kontakt";
const senderName = data.sender_name || data.sender || "Neo";
const senderAddress = data.sender_address || "";
const senderContact = data.sender_contact || "";

const outputName = [
  date,
  "OUT",
  sanitizePart(type, "FAX").toUpperCase(),
  sanitizePart(contact, "Kontakt"),
  sanitizePart(subject, "Betreff"),
].join("_") + ".pdf";

const values = {
  type,
  subject,
  subject_display: subject.replaceAll("-", " "),
  date_de: formatDateDe(date),
  fax: data.fax || "",
  sender_name: senderName,
  sender_address: senderAddress,
  sender_contact: senderContact,
  sender_contact_html: linesToHtml(senderContact),
  recipient_html: linesToHtml(data.recipient || contact),
  body: markdownToHtml(body),
};

const template = readFileSync(templatePath, "utf8");
const renderedHtml = replaceTokens(template, values);
const tempHtml = join(mkdtempSync(join(tmpdir(), "codex-fax-")), "fax.html");
writeFileSync(tempHtml, renderedHtml);

const outputPath = join(outDir, outputName);
const result = spawnSync("weasyprint", ["--base-url", templateDir, tempHtml, outputPath], { encoding: "utf8" });
if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status || 1);
}

console.log(outputPath);
