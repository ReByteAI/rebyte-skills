## Authentication

**IMPORTANT:** All API requests require authentication. Get your auth token and API URL by running:

```bash
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")
```

Include the token in all API requests as a Bearer token, and use `$API_URL` as the base for all API endpoints.

