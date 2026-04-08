---
name: google-workspace-workflow
description: Google Workspace workflow for Drive, Docs, Sheets, Gmail, Calendar. Supports two modes - CLI (gws with service account or access token) and Browser (sync Google session via Browser Sync, then automate with Chrome DevTools MCP). Ask the user which method they prefer.
---

# Google Workspace Workflow

This skill enables Google Workspace access (Drive, Docs, Sheets, Gmail, Calendar, and 40+ Google APIs) inside cloud VMs. It supports two methods — ask the user which one they want to use.

## Choose a Method

**Ask the user:**

> To work with Google Workspace, I can use one of two methods:
>
> 1. **CLI mode** — I'll use the [Google Workspace CLI (gws)](https://github.com/googleworkspace/cli) to interact with Google APIs programmatically. You'll need to provide a **service account JSON** or an **access token**. Best for automation, data processing, and bulk operations.
>
> 2. **Browser mode** — I'll use the remote browser to interact with Google Workspace apps (Docs, Sheets, Drive, Gmail, Calendar) directly in the browser UI. You'll need to **sync your Google session** via the Browser Sync extension in the Remote Browser tab. Best for visual tasks like editing documents, composing emails, and reviewing spreadsheets.
>
> Which method would you like to use?

---

## Method 1: CLI Mode (gws)

Use this for programmatic API access — listing files, reading spreadsheets, sending emails, managing calendar events, etc.

### 1. Install gws

```bash
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/googleworkspace/cli/releases/latest/download/gws-installer.sh | sh
```

### 2. Install official gws skills

Install all gws skills at once:

```bash
npx skills add https://github.com/googleworkspace/cli
```

Or pick specific ones:

```bash
npx skills add https://github.com/googleworkspace/cli/tree/main/skills/gws-drive
npx skills add https://github.com/googleworkspace/cli/tree/main/skills/gws-gmail
npx skills add https://github.com/googleworkspace/cli/tree/main/skills/gws-sheets
npx skills add https://github.com/googleworkspace/cli/tree/main/skills/gws-calendar
```

### 3. Authenticate

**The user must provide credentials.** For full details, see the [gws Authentication Guide](https://github.com/googleworkspace/cli?tab=readme-ov-file#authentication).

#### Option A: Service Account (recommended for automation)

No interactive login needed. The user provides a service account JSON key file.

**Ask the user:**

> To use Google Workspace via CLI, I need a service account credential. Please provide your service account JSON.
>
> To create one, follow the [gws Service Account guide](https://github.com/googleworkspace/cli?tab=readme-ov-file#authentication) or go to [Google Cloud Console → Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts), create a key, and download the JSON file.

Once the user provides the JSON, write it to the VM:

```bash
mkdir -p ~/.config/gws
cat > ~/.config/gws/service-account.json << 'CREDENTIALS'
{paste the JSON here}
CREDENTIALS

# Set the environment variable persistently
echo 'export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE=~/.config/gws/service-account.json' >> ~/.bashrc
export GOOGLE_WORKSPACE_CLI_CREDENTIALS_FILE=~/.config/gws/service-account.json
```

**Note:** For Google Workspace APIs (Drive, Gmail, Calendar), the service account must have [domain-wide delegation](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority) enabled, and the admin must grant it the required scopes.

#### Option B: Pre-obtained Access Token

If the user already has an access token (e.g., from `gcloud auth print-access-token`), use it directly.

**Ask the user:**

> To use Google Workspace via CLI, I need a Google OAuth access token. You can get one by:
>
> - Running `gcloud auth print-access-token` on your local machine
> - Running `gws auth login` locally and then `gws auth export`
> - Any OAuth flow that grants the scopes you need
>
> See the [gws Authentication Guide](https://github.com/googleworkspace/cli?tab=readme-ov-file#authentication) for all options.

Once the user provides the token:

```bash
echo 'export GOOGLE_WORKSPACE_CLI_TOKEN=<token>' >> ~/.bashrc
export GOOGLE_WORKSPACE_CLI_TOKEN=<token>
```

**Note:** Access tokens expire after ~1 hour. For long-running tasks, prefer a service account.

### 4. Verify authentication

```bash
gws drive files list --params '{"pageSize": 3}'
```

### 5. Usage

The gws CLI follows this pattern:

```
gws <service> <resource> <method> [--params JSON] [--json JSON]
```

Quick reference:

| Task | Command |
|------|---------|
| List Drive files | `gws drive files list --params '{"pageSize": 10}'` |
| Read a spreadsheet | `gws sheets spreadsheets.values get --params '{"spreadsheetId": "ID", "range": "Sheet1!A1:D10"}'` |
| List Gmail messages | `gws gmail users.messages list --params '{"userId": "me", "maxResults": 5}'` |
| List calendar events | `gws calendar events list --params '{"calendarId": "primary", "maxResults": 10}'` |
| Create a document | `gws docs documents create --json '{"title": "My Doc"}'` |
| Explore any API | `gws <service> --help` |

All output is JSON. Use `--dry-run` to preview requests, `--page-all` to auto-paginate.

---

## Method 2: Browser Mode (Browser Sync)

Use this for visual interaction with Google Workspace apps — editing documents, composing emails, managing files in Drive, reviewing spreadsheets, etc. No API keys or service accounts needed.

### 1. Sync the Google session

**Ask the user:**

> To use Google Workspace via the browser, I need your Google session synced to the remote browser.
>
> Please do the following:
> 1. Open the **Remote Browser** tab in the task view
> 2. Navigate the remote browser to **https://accounts.google.com**
> 3. Click the **Sync** button (provided by the Browser Sync extension) to transfer your local Google session to the remote browser
> 4. After syncing, the remote browser should show you as logged in to Google
>
> Let me know once you've synced, and I'll verify the login.

### 2. Verify the Google login

After the user confirms they've synced, verify the session is active:

```
navigate_page url="https://drive.google.com"
wait_for text="My Drive" timeout=10000
take_snapshot
```

If the snapshot shows "My Drive" or the user's files, the session is active. If it shows a login page, ask the user to re-sync.

### 3. Usage

Use Chrome DevTools MCP tools (`mcp__chrome-devtools__*`) to interact with Google Workspace apps directly:

#### Google Drive — Browse and manage files

```
navigate_page url="https://drive.google.com"
wait_for text="My Drive"
take_snapshot
# Click on folders, files, or use the search bar
```

#### Google Docs — Create and edit documents

```
# Create a new document
navigate_page url="https://docs.google.com/document/create"
wait_for text="Untitled document"
take_snapshot
# Click on title, type content, use toolbar buttons
```

#### Google Sheets — Create and edit spreadsheets

```
# Create a new spreadsheet
navigate_page url="https://sheets.google.com/create"
wait_for text="Untitled spreadsheet"
take_snapshot
# Click cells, enter data, use formulas
```

#### Gmail — Read and compose emails

```
navigate_page url="https://mail.google.com"
wait_for text="Inbox"
take_snapshot
# Click on emails, compose new messages, manage labels
```

#### Google Calendar — View and create events

```
navigate_page url="https://calendar.google.com"
wait_for text="Calendar"
take_snapshot
# Navigate dates, create events, check schedule
```

### Browser Mode Best Practices

- **Always `take_snapshot` after navigation** — UIDs change when the page updates
- **Use `wait_for`** before interacting — Google apps load dynamically
- **Use `evaluate_script`** for complex data extraction (e.g., reading spreadsheet data)
- **Keep tabs minimal** — close tabs you're done with to save memory
- **Session expiry** — Google sessions typically last hours/days, but if you get a login page, ask the user to re-sync via Browser Sync

---

## Important Notes

- **CLI mode** credentials persist in `~/.bashrc` across shell sessions
- **Browser mode** sessions persist in the browser profile across restarts
- Service accounts don't expire; access tokens expire after ~1 hour
- gws dynamically discovers all Google APIs — run `gws --help` to see available services
- For browser mode, the `browser-automation` skill must also be installed (provides Chrome DevTools MCP)
