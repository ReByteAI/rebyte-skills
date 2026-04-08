---
name: form-builder
description: Build stylish, Typeform-like multi-step forms and surveys using the Rebyte Forms library (Composer API). Outputs standalone HTML files. Triggers include "create a form", "build a survey", "make a questionnaire", "feedback form", "contact form", "signup form", "onboarding flow", "multi-step form", "typeform-style", "data collection form". Do NOT use for simple single-field inputs or backend form processing.
---

# Rebyte Forms Builder

Build production-ready, Typeform-style forms using the Composer API.

{{include:non-technical-user.md}}

## ⚠️ CRITICAL: Completion Requirements

**A form task is NOT complete until:**
1. ✅ Form backend created (POST /api/forms/create)
2. ✅ HTML file saved as `index.html`
3. ✅ **Invoke the `rebyte-app-builder` skill** to deploy the form
4. ✅ BOTH URLs shared with user: **Form URL** (from deployment) AND **Admin URL** (from form creation API)

**NEVER tell the user the form is "done" without completing ALL steps.**

{{include:auth.md}}

## Boilerplate Template

```html
<!DOCTYPE html>
<html lang="en" spellcheck="false" class="fmd-root" data-fmd-color-scheme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/rebyte-forms@1.0.1/dist/css/formsmd.min.css">
</head>
<body class="fmd-body">
    <noscript>Please turn on JavaScript to see this page.</noscript>
    <div class="fmd-main">
        <div class="fmd-main-container">
            <div class="fmd-loader-container">
                <div class="fmd-loader-spinner" role="status" aria-label="Loading"></div>
            </div>
        </div>
    </div>

    <script src="https://unpkg.com/rebyte-forms@1.0.1/dist/js/composer.bundle.min.js"></script>
    <script src="https://unpkg.com/rebyte-forms@1.0.1/dist/js/formsmd.bundle.min.js"></script>
    <script>
        const composer = new Composer({
            title: "{{TITLE}}",
            colorScheme: "light",
            accent: "#6366f1",
            accentForeground: "#ffffff",
            backgroundColor: "#fafafa",
            color: "#18181b",
            fontFamily: "Inter, sans-serif",
            pageProgress: "show",
        });

        // Start slide
        composer.startSlide({ buttonText: "Get Started" });
        composer.h1("Welcome");
        composer.p("Introduction text here.");

        // Form slides go here...

        // End slide
        composer.endSlide();
        composer.h1("Thank you!");
        composer.p("Your response has been recorded.");

        // Initialize
        const formsmd = new Formsmd(composer.template, document, { isFullPage: true });
        formsmd.init();
    </script>
</body>
</html>
```

## Composer Settings

| Setting | Type | Description |
|---------|------|-------------|
| `title` | string | Page title |
| `colorScheme` | `"light"` \| `"dark"` | Default color scheme |
| `accent` | string | Primary color (hex) for buttons, fields |
| `accentForeground` | string | Text color on accent background |
| `backgroundColor` | string | Page background color |
| `color` | string | Text color |
| `backgroundImage` | string | CSS background-image (gradient or url) |
| `backdropOpacity` | string | Overlay opacity on background image (e.g., "0.4") |
| `fontFamily` | string | Font family |
| `fontSize` | `"sm"` \| `"lg"` | Font size |
| `rounded` | `"none"` \| `"pill"` | Button/UI rounding |
| `pageProgress` | `"hide"` \| `"show"` \| `"decorative"` | Progress bar style |
| `formStyle` | `"classic"` | Classic form field appearance |
| `postUrl` | string | URL to POST form responses |

## Field Types

### Text Input
```javascript
composer.textInput("fieldName", {
    question: "What's your name?",
    placeholder: "John Doe",
    required: true,
    description: "Optional helper text",
    multiline: true,  // for textarea
    maxlength: 500,
    autofocus: true,
    subfield: true,   // smaller label (for grouping)
});
```

### Email Input
```javascript
composer.emailInput("email", {
    question: "Your email address?",
    placeholder: "you@example.com",
    required: true,
});
```

### Phone Input
```javascript
composer.telInput("phone", {
    question: "Phone Number",
    country: "US",  // default country code
    required: true,
});
```

### URL Input
```javascript
composer.urlInput("website", {
    question: "Your website",
    placeholder: "https://example.com",
});
```

### Number Input
```javascript
composer.numberInput("salary", {
    question: "Expected salary (USD)",
    placeholder: "100000",
    unit: "$",
    min: 50000,
    max: 500000,
});
```

### Choice Input (Radio/Checkbox)
```javascript
// Simple choices
composer.choiceInput("role", {
    question: "What's your role?",
    choices: ["Developer", "Designer", "Manager", "Other"],
    required: true,
});

// With custom values
composer.choiceInput("ticket", {
    question: "Select ticket type",
    choices: [
        { label: "General - $99", value: "general" },
        { label: "VIP - $299", value: "vip" },
    ],
    required: true,
});

// Multiple selection
composer.choiceInput("skills", {
    question: "Select your skills",
    description: "Choose all that apply",
    choices: ["JavaScript", "Python", "Go", "Rust"],
    multiple: true,
});

// Horizontal layout
composer.choiceInput("size", {
    question: "T-Shirt Size",
    choices: ["S", "M", "L", "XL"],
    horizontal: true,
});
```

### Select Box (Dropdown)
```javascript
composer.selectBox("country", {
    question: "Select your country",
    placeholder: "Choose one",
    options: ["USA", "Canada", "UK", "Germany", "Other"],
});
```

### Rating Input
```javascript
composer.ratingInput("satisfaction", {
    question: "How satisfied are you?",
    outOf: 5,
    icon: "star",
    required: true,
});
```

### Opinion Scale (NPS)
```javascript
composer.opinionScale("nps", {
    question: "How likely are you to recommend us?",
    startAt: 0,
    outOf: 10,
    labelStart: "Not likely",
    labelEnd: "Very likely",
    required: true,
});
```

### File Upload
```javascript
composer.fileInput("resume", {
    question: "Upload your resume",
    description: "PDF format, max 10MB",
    sizeLimit: 10,
    required: true,
});
```

### Date/Time Inputs
```javascript
composer.dateInput("startDate", { question: "Start date" });
composer.timeInput("preferredTime", { question: "Preferred time" });
composer.datetimeInput("appointment", { question: "Select date and time" });
```

## Slide Structure

```javascript
// Start slide (intro)
composer.startSlide({ buttonText: "Begin" });
composer.h1("Title");
composer.p("Description");

// Regular slide
composer.slide();
composer.textInput("name", { question: "Your name?", required: true });

// Another slide with multiple fields
composer.slide();
composer.h2("Contact Details");
composer.emailInput("email", { question: "Email", required: true });
composer.telInput("phone", { question: "Phone", subfield: true });

// End slide
composer.endSlide();
composer.h1("Thanks!");
```

## Conditional Display

Show a field only when a condition is met:

```javascript
composer.choiceInput("wantFollowUp", {
    question: "Can we follow up?",
    choices: [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
    ],
});

composer.emailInput("followUpEmail", {
    question: "Your email for follow-up",
    displayCondition: {
        dependencies: ["wantFollowUp"],
        condition: "wantFollowUp == 'yes'",
    },
});
```

## Theme Presets

### Light Professional
```javascript
const composer = new Composer({
    colorScheme: "light",
    accent: "#18181b",
    accentForeground: "#fafafa",
    backgroundColor: "#fafafa",
    color: "#18181b",
    fontFamily: "DM Sans, sans-serif",
    formStyle: "classic",
    pageProgress: "show",
});
```

### Dark Modern
```javascript
const composer = new Composer({
    colorScheme: "dark",
    accent: "#a855f7",
    accentForeground: "#ffffff",
    backgroundColor: "#0f0a1e",
    color: "#e2e8f0",
    backgroundImage: "linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f0a1e 100%)",
    fontFamily: "Space Grotesk, sans-serif",
    rounded: "pill",
    pageProgress: "show",
});
```

### Warm Feedback
```javascript
const composer = new Composer({
    colorScheme: "light",
    accent: "#f97316",
    accentForeground: "#ffffff",
    backgroundColor: "#fffbeb",
    color: "#451a03",
    backgroundImage: "linear-gradient(180deg, #fef3c7 0%, #fffbeb 50%, #fff7ed 100%)",
    fontFamily: "Outfit, sans-serif",
    fontSize: "lg",
    pageProgress: "show",
});
```

### With Background Image
```javascript
const composer = new Composer({
    colorScheme: "dark",
    accent: "#f472b6",
    accentForeground: "#ffffff",
    backgroundColor: "#1e1b4b",
    color: "#f8fafc",
    backgroundImage: "url('https://images.unsplash.com/photo-xxx?w=1920&q=80')",
    backdropOpacity: "0.4",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    rounded: "pill",
});
```

## Collecting Form Submissions

To collect responses, you need to:
1. Create a form backend (stores submissions)
2. Add `postUrl` to your HTML form
3. Save HTML as `index.html`
4. **Invoke the `rebyte-app-builder` skill** to deploy

### Complete Workflow

#### Step 1: Create Form Backend

Call the Forms API to create a backend that stores submissions:

```bash
curl -X POST "$API_URL/api/forms/create" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Survey",
    "fields": ["name", "email", "rating", "feedback"]
  }'
```

**IMPORTANT:** The `fields` array must contain the exact field names you use in your form (e.g., `composer.textInput("name", ...)` means `"name"` goes in fields).

Response:
```json
{
  "formId": "abc123def456",
  "submitUrl": "https://.../api/forms/submit/abc123def456",
  "adminUrl": "https://.../forms/abc123def456",
  "fields": ["name", "email", "rating", "feedback"]
}
```

**Save these URLs:**
- **`submitUrl`**: Where form data is POSTed (use as `postUrl` in Composer)
- **`adminUrl`**: Spreadsheet UI to view all submissions (**share with form creator**)

#### Step 2: Configure Form HTML

Add the `submitUrl` as `postUrl` in your Composer settings:

```javascript
const composer = new Composer({
    title: "My Survey",
    postUrl: "<submitUrl from API response>",
    // ... other settings
});
```

#### Step 3: Save and Deploy

1. Save the form HTML as `index.html`
2. **Invoke the `rebyte-app-builder` skill** to deploy it
3. The skill will handle ZIP creation, upload, and deployment

### Final URLs to Share

After deployment, you'll have:
- **Form URL**: From the `rebyte-app-builder` skill output - Share with respondents
- **Admin URL**: From the form creation API response (Step 1) - View responses in spreadsheet

### Viewing Results

**Admin UI (Recommended)**: Open `adminUrl` in a browser to view responses in a spreadsheet interface with CSV/JSON export.

**API Endpoints** (for programmatic access):
- **JSON**: `GET $API_URL/api/forms/results/{formId}`
- **CSV**: `GET $API_URL/api/forms/results/{formId}/csv`

## IMPORTANT: Always Return Both URLs

When you finish building and deploying a form, you **MUST** tell the user both URLs:

1. **Form URL** (for respondents): From the `rebyte-app-builder` skill output
2. **Admin URL** (for viewing results): From the form creation API response (Step 1)

**Never forget the Admin URL** - without it, the user cannot see their form submissions!
