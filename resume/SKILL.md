---
version: 1
name: resume
description: CV or résumé — single or two-page document presenting work history, skills, and accomplishments. Numbers beat adjectives. Use when the user asks for a resume, CV, or curriculum vitae.
user-invocable: true
---

# resume

Produce a CV that passes a 6-second skim.

## Variants
- **Default**: chronological work history (most recent first)
- **Functional**: skills-first (only if user asks)

## Structure
1. **Name + headline** — role + one-line value claim
2. **Contact** — email, location, LinkedIn (optional: phone, portfolio)
3. **Experience** — role · company · dates · 2–4 bullets per role
4. **Education** — degree · school · year
5. **Skills** — tight list, no bars or stars

## Writing rules
- Numbers beat adjectives: "Reduced load time 40%" not "Improved performance significantly"
- Past-tense action verbs ("Led", "Shipped", "Reduced")
- Tailor bullets to the role the user is targeting if known

## Form-specific verification
- Fits on 1 page (junior/mid) or 2 pages (senior)
- Every bullet has at least one number, scope, or outcome
- No photo unless culturally expected (EU)
- ATS-friendly: no tables, no text boxes, semantic HTML
