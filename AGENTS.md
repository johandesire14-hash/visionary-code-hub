<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The imported Mansa app lives in src/mansa and is rendered client-only from src/routes/index.tsx — it relies on browser APIs and Firebase client SDK during migration.
- lucide-react is pinned to 0.546.0 — newer versions removed brand icons (Instagram etc.) the Mansa UI imports.
- Public-home styling uses scoped store semantic tokens and shared Button variants so changes do not retheme the imported seller screens.
