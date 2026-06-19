# Guestbook backend

The homepage guestbook requires GitHub login for new public messages:

- Public messages are stored as comments on a GitHub Issue.
- The display name and avatar come from the signed-in GitHub account, so visitors cannot impersonate another name through the form.
- If the backend is not configured, messages stay in the visitor's browser `localStorage`.

Previously local-only messages cannot be collected from a visitor's device unless that visitor opens the site again. When the backend is available and the visitor is signed in with GitHub, the page will try to upload unsynced local messages from that browser under that GitHub account.

Older public messages that were posted before GitHub login existed can be upgraded automatically when the original browser still has matching local records. The page matches the local text, timestamp, and parent id, then adds the signed-in GitHub account and avatar to the old Issue comment.

## Enable public messages on Vercel

1. Create a GitHub Issue in `cedri-i/gravisHome`, for example with the title `Guestbook`.
2. Create a GitHub fine-grained personal access token with access to `cedri-i/gravisHome` and permission to read and write Issues.
3. Create a GitHub OAuth App. Set the callback URL to:

```txt
https://your-domain.example/api/github-auth
```

4. In Vercel project settings, add these environment variables:

```txt
GUESTBOOK_GITHUB_TOKEN=your GitHub token
GUESTBOOK_REPO=cedri-i/gravisHome
GUESTBOOK_ISSUE_NUMBER=the issue number
GUESTBOOK_ADMIN_TOKEN=your private moderation password
GITHUB_CLIENT_ID=your GitHub OAuth App client id
GITHUB_CLIENT_SECRET=your GitHub OAuth App client secret
GUESTBOOK_SESSION_SECRET=a long random string
```

5. Redeploy the site.

After deployment, visitors must sign in with GitHub before posting. The homepage status line should change from local-only mode to public guestbook mode.

## Hide comments

Click `Moderate` in the guestbook and enter `GUESTBOOK_ADMIN_TOKEN`. The browser keeps it in `sessionStorage` for the current tab session. After moderation is enabled, each public comment has a `Hide` button. Hiding a comment marks the GitHub Issue comment as hidden; public guestbook reads filter it out.
