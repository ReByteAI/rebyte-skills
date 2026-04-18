---
version: 1
name: form-workflow
description: Build forms, surveys, quizzes, and registration pages with multi-step flows, conditional logic, and response collection. Use when user wants to create a form, survey, questionnaire, quiz, signup flow, feedback form, or registration page. Triggers include "create form", "build survey", "make questionnaire", "registration form", "feedback form", "signup flow", "quiz", "typeform", "multi-step form".
---

# Form & Survey Workflow

Build production-ready forms and surveys — multi-step, themed, with conditional logic and response collection — then deploy as shareable links.

## Sub-Skills

- `rebyteai/form-builder` — Typeform-style form composer API. Creates standalone HTML forms with multi-step flows, themes, conditional display, field types (text, email, choice, rating, file upload, scale, date), and a submission backend with admin UI for viewing responses.
- `rebyteai/internet-search` — Research for form content: industry-standard questions, best practices, compliance requirements, or competitor form examples.
- `rebyteai/rebyte-app-builder` — Deploy forms as web apps on rebyte.pro when the form needs custom branding, embedding, or a more complex surrounding page.

## Workflow

### Step 1: Understand the Form

Parse what the user wants. Identify:
- **Type** — Feedback, survey, registration, application, quiz, order form, booking, lead gen?
- **Fields** — What information to collect? How many questions?
- **Flow** — Single page or multi-step? Any conditional logic (show/hide fields based on answers)?
- **Style** — Theme preference? Brand colors? Formal or casual?

If the request is clear, proceed directly. If vague (e.g., "make me a survey"), ask:
1. What's the purpose? (feedback, research, signup, etc.)
2. Who's filling it out? (customers, employees, applicants, etc.)
3. Roughly how many questions?

### Step 2: Research (if needed)

Use `internet-search` when the form needs domain-specific content:
- NPS survey best practices (standard wording, scale design)
- HIPAA-compliant patient intake questions
- Industry-standard employee engagement survey items
- Event registration form conventions

Skip for straightforward forms where the user specifies all fields.

### Step 3: Design the Form

Plan the form structure before building:

1. **Group related fields** into logical sections (personal info → preferences → feedback)
2. **Choose field types** that match the data:
   - Short text: names, emails, single-line answers
   - Long text: comments, descriptions, open-ended feedback
   - Single choice: gender, yes/no, satisfaction level
   - Multiple choice: interests, skills, features wanted
   - Rating/scale: satisfaction (1-5 stars), NPS (0-10), Likert
   - Date: appointments, birthdays, deadlines
   - File upload: resumes, photos, documents
   - Dropdown: long lists (countries, departments, categories)
3. **Add conditional logic** where it makes the form smarter (e.g., show "Please describe" only if user selects "Other")
4. **Set required vs optional** — keep required fields minimal to improve completion rates

### Step 4: Build

Use `form-builder` to create the form:
- Select a theme that matches the purpose (professional for business, friendly for feedback)
- Configure each field with proper labels, placeholders, and validation
- Set up multi-step flow with progress indicator for longer forms (5+ questions)
- Add a thank-you/confirmation screen

For forms that need custom surrounding pages (landing page with form embedded, form + marketing copy), use `rebyte-app-builder` instead to build a full web page with the form integrated.

### Step 5: Deliver

- Share the form URL directly
- If built with `rebyte-app-builder`, share the deployed rebyte.pro URL
- Mention that responses can be viewed in the admin UI
- Note any fields that collect sensitive data (PII, health info) so the user is aware

## Decision Points

- **"form-builder or rebyte-app-builder?"** — Use `form-builder` for standalone forms (most cases). Use `rebyte-app-builder` when the form needs to be part of a larger page (landing page + form, custom branding beyond themes, multi-form pages).

- **"Multi-step or single page?"** — Multi-step for 5+ questions (reduces overwhelm). Single page for short forms (contact, newsletter, quick feedback).

- **"How many questions?"** — Fewer is better. Target: feedback forms 3-5 questions, surveys 8-15, applications 15-25. Cut anything that's "nice to have" but not essential.
