# W0-A GitHub main protection constraint and compensating controls

2026-11-02, repo gloweaseco-leo/VEYFRONT, main SHA 527e86bdc9a13754b45c8b3154ff6953bd6a27eb.

- GitHub GET branches/main: `protected=false`.
- GitHub repository `rulesets` returned HTTP 403: "Upgrade to GitHub Pro or make this repository public to enable this feature."
- GitHub branches/main/protection returned HTTP 403: "Resource not accessible by integration".
- The integration offers no authorized branch-protection write operation. **No permissions, GitHub subscription, repo visibility, or settings were changed.**

### Compensating review controls (NOT equivalent to enforcement)

1. Keep feature work in Draft PR; main unchanged. CI `validate` runs on PR and push to main.
2. Require successful GitHub Actions and matching Vercel protected Preview commit, acceptance artifacts and independent authorized release check before any merge.
3. With rules not enforced, a user with direct push permission can still bypass PR. The release owner must explicitly avoid direct pushes and verify `main` SHA before any production deployment.
4. A repository admin may resolve using a supported plan/visibility setting and the GitHub UI, but **do not make the repository public or purchase a subscription without explicit authorization**.
5. Until enforceable branch protection is configured and proven, keep W0-A formal gate PENDING, regardless of successful local browser QA.

### Additional W0-A gaps

- Authenticated protected Vercel Preview browsing: pending; unauthenticated extraction returned login_required.
- Rollback owner + past READY deployment verification/redeployment drill: pending.
- Exact code-commit Chrome CI browser QA: 260/260 PASS, evidence on GitHub Actions, but protected Vercel browsing is a separate requirement.
