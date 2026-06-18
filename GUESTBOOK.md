# Guestbook backend

The homepage guestbook works in two modes:

- If `/api/guestbook` is configured, messages are public and stored as comments on a GitHub Issue.
- If the backend is not configured, messages stay in the visitor's browser `localStorage`.

Previously local-only messages cannot be collected from a visitor's device unless that visitor opens the site again. When the backend is available, the page will try to upload unsynced local messages from that browser.

## Enable public messages on Vercel

1. Create a GitHub Issue in `cedri-i/gravisHome`, for example with the title `Guestbook`.
2. Create a GitHub fine-grained personal access token with access to `cedri-i/gravisHome` and permission to read and write Issues.
3. In Vercel project settings, add these environment variables:

```txt
GUESTBOOK_GITHUB_TOKEN=your GitHub token
GUESTBOOK_REPO=cedri-i/gravisHome
GUESTBOOK_ISSUE_NUMBER=the issue number
```

4. Redeploy the site.

After deployment, the homepage status line should change from local-only mode to public guestbook mode.
