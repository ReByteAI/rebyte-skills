# Deploying as a Standalone URL

When the user wants a shareable URL, save the widget HTML to a file and deploy it.

## Workflow

1. **Create project and save the presentation:**

```bash
mkdir -p /code/<name>
```

Save the single HTML file (the same content you output as a widget) to `/code/<name>/index.html`.

2. **Deploy:**

```bash
cd /code/<name> && rebyte deploy
```

3. **Iterate:** Edit `index.html`, redeploy.
