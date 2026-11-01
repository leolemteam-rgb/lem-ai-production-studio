# Larry Elder Ministries AI Production Studio — Milestone 1 starter

This is a **development starter**, not a deployed or production-ready system. It includes a responsive dashboard, email/password login, protected routes, initial data model, and read-only project views. Sermon file upload, invitation UI, assignment mutations, approval decisions, AI agents, and publishing are **not implemented** yet.

## Setup
1. Create a private GitHub repository and add these files.
2. Create a Supabase project. In Supabase SQL Editor, run `supabase/schema.sql`.
3. In Supabase Auth settings, disable public user signup. Invite/create team users using the Supabase administrator dashboard. Enable MFA policies as appropriate.
4. In Authentication > Users, find your user UUID. In SQL Editor run `insert into public.memberships(user_id,role) values ('YOUR_AUTH_USER_UUID','admin');` (replace placeholder).
5. Copy `.env.example` to `.env.local` and supply Supabase Project URL and publishable/anon key. **Never put a service-role key in a NEXT_PUBLIC variable.**
6. Run `npm install` and `npm run dev`, then visit `http://localhost:3000`.
7. In Vercel, import your private GitHub repository. Add both environment variables under Project Settings > Environment Variables, then deploy to a temporary `.vercel.app` address.
8. Confirm anonymous users cannot reach `/dashboard`, and authenticated users without an active membership cannot read ministry data. Test on mobile and desktop.
9. Only after review, add `studio.larryelderministries.com` in Vercel and use Vercel's provided DNS record in the authoritative DNS zone. **Do not change existing root or www records.**

## Security and scope warnings
- Authenticated non-members can currently reach the dashboard shell, but RLS prevents reading ministry data. Before production, add an active-membership gate to protected routes and APIs.
- This is a starter schema. Team-wide read policies are deliberate for MVP; add per-project access before sensitive multi-team use.
- Do not enable publishing until approval enforcement is implemented server-side with atomic state transitions.
- Never expose service role credentials, private file buckets, or public file URLs.
- Use signed URLs and validated uploads when implementing storage. Configure size limits, antivirus scanning where practical, and multipart/resumable uploads for large sermon videos.
- Add automated tests, error monitoring, backups, rate limiting, and robust audit writes before production use.
