# Migration record — L2M-Web2 to VEYFRONT

Target `gloweaseco-leo/VEYFRONT`, copied from `chatgpters6/L2M-Web2` at `25ca2ef0454228182f65f8912eb326c85ea551fa`.
65 of 67 source blob hashes matched. The two source-only missing files were `public/demo/valve.png` and `docs/stage-2r/screenshots/en-1440-full.png`.

The screenshot is historical and may remain absent. The user supplied a new `valve.png` image; this branch uses an unchanged SHA-pinned public raw URL as a **temporary display fallback** because direct binary transfer via the connected GitHub API is unavailable. Upload the supplied image to `public/demo/valve.png` and point `lib/demo-facts.ts` back to the local path before final release.

The original repository was not changed. The target repository becomes the development source of truth for the VEYFRONT commercial website. Brand rework was made on `feature/veyfront-brand-v1`, not on `main`.
