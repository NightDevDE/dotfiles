# Fax Template

This folder contains a portable HTML/CSS fax template with local IBM Plex Sans font files and a small renderer.

The IBM Plex Sans font files are stored locally so generated PDFs do not need external font loading. The upstream license is included in `fonts/IBM-Plex-LICENSE.txt`.

## Render

```bash
node ~/dotfiles/codex/templates/fax/render-fax.mjs ~/dotfiles/codex/templates/fax/examples/sample-fax.md
```

By default, the PDF is written to `~/Documents` with this naming pattern:

```text
YYYY-MM-DD_OUT_TYPE_CONTACT_SUBJECT.pdf
```

Use a custom output directory:

```bash
node ~/dotfiles/codex/templates/fax/render-fax.mjs input.md --out-dir /tmp
```

## Input Format

Create a Markdown file with YAML-style frontmatter:

```md
---
type: FAX
contact: Musterfirma
recipient: |
  Musterfirma GmbH
  Abteilung Kundenservice
fax: "+49 30 000000"
sender_name: Neo Beispiel
sender_address: Musterstrasse 12, 12345 Berlin
sender_contact: |
  Telefon: +49 30 123456
  E-Mail: neo@example.invalid
subject: Kuendigung-Vertrag-12345
date: 2026-06-07
---

Sehr geehrte Damen und Herren,

hier steht der eigentliche Faxtext.
```

The template file should stay unchanged. Create a new Markdown input file for each outgoing fax.
