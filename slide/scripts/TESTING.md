# Testing the slide scripts

End-to-end tests for `export-pages.sh` and any other VM-side script in this
directory. Each test provisions a **fresh VM**, uploads a fixture, runs the
script, pulls the PNGs back, scores each page with a vision model against an
expected description, and writes a markdown report.

This is the only honest way to check these scripts. A warm VM that already has
Chrome running on 9222 will mask cold-boot bugs.

---

## One test, one command

From the **cctools** repo root:

```bash
export OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' relay/.env.development | cut -d= -f2)

pnpm vm-test \
  ../rebyte-skills/slide/scripts/export-pages.test \
  --org <your-org-id>
```

What happens:

1. Reads `test.yaml` in the test dir
2. Provisions a fresh sandbox from the default template
3. Uploads the fixture (`fixture/`) into the VM
4. Uploads the script under test (`../export-pages.sh`) into the skill path
5. Runs the command defined in `run:`
6. Pulls collected PNGs back to `<test-dir>/out/`
7. Scores each page via GPT-4o against its expected `description`
8. Writes `<test-dir>/out/report.md` and exits 0 on pass, 1 on any failure
9. Pauses the sandbox

Cold-boot overhead is ~12s (VM create + Chrome launch). A 5-slide export then
finishes in 1–2s on top of that.

## Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `--org <id>` | `$VM_TEST_ORG_ID` | Org the fresh sandbox is created under. **Required.** |
| `--vm <id>` | — | Skip provisioning, reuse an existing sandbox. Debug-only. |
| `--keep` | off | Don't pause the sandbox after the run. Useful if you want to SSH in and poke around. |
| `--verbose` | off | Stream VM stdout/stderr live instead of dumping it at the end. |

## Tests in this directory

| Test | Exercises |
|------|-----------|
| `export-pages.test` | Real 5-slide deck. Photos + flat-color slide. Validates end-to-end capture. |
| `export-pages-progressive.test` | **Rule 1:** click-to-reveal slide. Script must NOT advance state — capture first-screen only. |
| `export-pages-delayed.test` | Images whose `src` is injected after `setTimeout(1.5–2.4s)`. Validates readiness probe waits for decode. |
| `export-pages-animations.test` | 2-second CSS entrance animations on every element. Validates the animation-kill override snaps to final state. |

## Run them all

```bash
export OPENAI_API_KEY=$(grep '^OPENAI_API_KEY=' relay/.env.development | cut -d= -f2)
ORG=<your-org-id>

for t in export-pages.test export-pages-progressive.test export-pages-delayed.test export-pages-animations.test; do
  echo ""
  echo "=== $t ==="
  pnpm vm-test ../rebyte-skills/slide/scripts/$t --org "$ORG" || echo "^^ FAILED"
done
```

Each test provisions its own VM. Sequential run takes ~5 min for the four
tests (4 × VM create + 4 × GPT-4o scoring).

## Reading a report

`<test-dir>/out/report.md` is the deliverable. Open it in a markdown viewer
or in GitHub to see:

- A **table** with per-page score + defects
- Per-page sections with the **expected** description, the **observed**
  description (what the vision model saw), and the model's rationale
- Embedded PNGs so you can eyeball what actually rendered
- Collapsed `<details>` blocks with the VM's stdout/stderr

A page scoring below `expect.minScore` (default 7) fails the test. The
rationale in `report.md` names exactly why.

## Adding a new test

```
scripts/
  <script-name>.test/
    test.yaml           # manifest (schema in cctools/scripts/vm-test/README.md)
    fixture/            # everything uploaded to the VM
      index.html        # or whatever your script takes as input
    out/                # auto-populated on each run — in .gitignore
```

Minimal `test.yaml`:

```yaml
name: my new test

fixture:
  src: ./fixture
  dst: /code/slides/my-test

script:
  src: ../export-pages.sh
  dst: /home/user/.skills/slide/scripts/export-pages.sh

run: bash /home/user/.skills/slide/scripts/export-pages.sh $FIXTURE/index.html
timeoutMs: 180000

collect:
  - remote: /code/slides/my-test/*.png
    local: ./out

pages:
  - name: 01.png
    description: |
      Describe the slide as a reviewer would: what text, what layout,
      what colors, what images. Be specific — the vision model compares
      observation against this description.

expect:
  exitCode: 0
  files:
    - name: 01.png
      imageMinDim: [1800, 1000]
  uniquePngHashes: true
  minScore: 7
```

Then:

```bash
pnpm vm-test ../rebyte-skills/slide/scripts/my-new.test --org "$ORG"
```

## Common failure modes

- **`OPENAI_API_KEY not set`** — the vision layer is required when `pages:` is
  defined. Export the key or drop the `pages:` block.
- **Sandbox provisioning timeout** — the template may be cold in the region.
  Retry. Tests are idempotent, previous runs' state is in their own sandboxes.
- **`score X/10 below threshold 7`** — a real visual defect was caught, or your
  description doesn't match reality. Open `report.md`, compare the expected
  and observed paragraphs, and decide which side is wrong.
- **`script readiness timeout` warning in stdout** — the deck's per-slide
  readiness probe hit 30s without all images decoding. The screenshot fires
  anyway; check the collected PNG to see if it's legitimately broken.

## Why fresh VMs

Reusing a warm VM hides cold-boot bugs. `export-pages.sh` previously passed
30/30 on a reused VM but produced a 68-byte empty PNG on a real agent's
freshly-provisioned VM, because the reused VM had Chrome already running
on 9222 and the fresh one didn't.

The harness's default is to provision. `--vm <id>` exists but is for poking
at a specific broken VM, not for CI.
