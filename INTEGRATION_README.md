# LEM AI Production Studio — Jordan Hayes Integration

## Before deploying
1. In Supabase SQL Editor, run `supabase/002_ai_generation_rpc.sql` (after the already-applied 001 migration).
2. Confirm Vercel has `OPENAI_API_KEY` as a server-side environment variable. Never commit API keys to GitHub.
3. Replace repository contents with this ZIP's project files (preserve the existing GitHub repository and its Vercel connection), commit to `main`, and wait for Vercel to deploy.

## First test
1. Open dashboard and click a sermon title.
2. Paste transcript/notes, then click **Save Sermon Content**.
3. Open the Jordan Hayes task assigned to that sermon (or create one using New Assignment).
4. Click **Generate YouTube Description** once. The call uses `gpt-4.1-mini` with `store:false` and a capped output.
5. Review the saved description; approve or request revision.

## Notes
- The generated_drafts table has no client write policy; two role-checking PostgreSQL RPC functions write/review it.
- This first version supports Jordan Hayes only, and no automated publishing or file uploads.
- Regeneration replaces the existing draft for a task, so copy an approved version elsewhere before regenerating.
- This uses API credits on each generation request. The key is never sent to the browser.
- No `service_role` key is needed.
- The dashboard's approvals counter is still based on the original `approvals` table; the new review buttons operate on `generated_drafts` in the task details page.
