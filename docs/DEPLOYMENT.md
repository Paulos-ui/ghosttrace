# GHOSTTRACE, GitHub and Vercel deployment

## 1. Push to a brand-new GitHub repository

Create a new, empty public repository named **ghosttrace** at https://github.com/new. This is not the RUPTUREMAP repo.

Download `ghosttrace-v2-claude-open-weight.zip` to your Windows Desktop. In a WSL terminal:

```bash
mkdir -p "/mnt/c/Users/MY PC/Desktop/ghosttrace"
cd "/mnt/c/Users/MY PC/Desktop/ghosttrace"
unzip -oq "/mnt/c/Users/MY PC/Desktop/ghosttrace-v2-claude-open-weight.zip" -d . && rm -f "/mnt/c/Users/MY PC/Desktop/ghosttrace-v2-claude-open-weight.zip"
git init -b main
git remote add origin https://github.com/paulos-ui/ghosttrace.git
git add -A
git commit -m "GHOSTTRACE"
git push -u origin HEAD
```

If you previously created the repo, **do not repeat** `git init` or `git remote add`. Simply overwrite the source with the ZIP, stage, commit and push. Set your Git `user.name` and verified `user.email` before committing if needed. Windows Git Bash uses `/c/Users/...` instead of `/mnt/c/Users/...`.

## 2. Obtain Claude API credentials

Go to https://console.anthropic.com/settings/keys and generate a private API key. API usage **can cost money**; check current Anthropic billing and limits. Never paste a key into ChatGPT, GitHub or client-side code.

## 3. Vercel deployment

1. https://vercel.com/new → Import `paulos-ui/ghosttrace`.
2. Framework **Next.js**; root `./`; default build `npm run build`.
3. Project → Settings → Environment Variables (or add during import):

```env
ANTHROPIC_API_KEY=YOUR_PRIVATE_KEY
CLAUDE_MODEL=claude-sonnet-4-6
```

The first variable is required only for Claude reconstruction, not for the local open evidence lens. Do **not** set `NEXT_PUBLIC_ANTHROPIC_API_KEY`. Redeploy after changing variables.

4. Check `https://YOUR-DEPLOYMENT.vercel.app/api/health` and `/api/status`.
5. Open the real website; select a fictional archive, use **Open evidence lens**. The first attempt may download model weights from Hugging Face and take longer. Confirm ranked passages are displayed.
6. Click **Reconstruct with Claude**. Confirm `LIVE MODEL OUTPUT`, inspect the graph and check source evidence.
7. Test Memory Vigil, archive save, refresh, and dossier export.

## 4. Common failures

- **Vercel build error:** Inspect the first failed command in Build Logs; don't assume npm warnings are fatal. The package was prepared without access to npm registry, so a production build has not been confirmed here.
- **Claude not configured:** Add `ANTHROPIC_API_KEY` to the correct Vercel environment and redeploy. `/api/status` must return `configured:true`.
- **Claude 401:** Check key and account. **402:** check billing/credits. **429:** rate limiting. **404:** check the configured model identifier and your account's availability.
- **Open evidence lens fails:** Browser must download open-weight MiniLM model assets on first use, including access to Hugging Face. Try a modern desktop browser with stable internet; avoid strict content blockers and private network restrictions.
- **Inference slow:** First open-model download is separate from Claude processing. Keep report to ~1–2 pages for the demo.
- **.tech:** See `docs/CUSTOM_DOMAIN.md`; it is optional for the overall prize.

## 5. Final competition proof

Show (a) real client-side open-weight evidence scores, (b) real Claude reconstruction, (c) source quote verification, (d) a hypothetical containment, and (e) a source-backed Memory Vigil lantern. Do not describe Claude as open-weight. Use fresh project code created in Week 4, October 26–31, 2026.
