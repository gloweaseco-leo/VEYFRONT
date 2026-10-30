# L2M-Web2 → VEYFRONT copy status

Source: `chatgpters6/L2M-Web2`, branch `stage-3-visual-final`, SHA `25ca2ef0454228182f65f8912eb326c85ea551fa`.

Destination: `gloweaseco-leo/VEYFRONT` (private), `main`.

This is a **file snapshot**, not a Git-history mirror or the completed VEYFRONT brand implementation.

## Verified copy

- 65 of 67 source files were transferred and their Git blob SHAs matched.
- The two remaining source files are binary assets larger than the connector's single-file retrieval limit:
  - `public/demo/valve.png` (source Git blob `7b04bd00606d90c2a3dcd9d0c5496c1de598531d`)
  - `docs/stage-2r/screenshots/en-1440-full.png` (source Git blob `689c062b0af9c257e14d4ba021cf3a1e119fec1f`)
- A temporary GitHub Actions import was attempted twice but failed before the runner started; it was removed to avoid repeated failed workflows.
- The website is **not ready to run without the missing demo image**. Copy it before build/visual QA.

## Finish the two missing files

In an authenticated developer environment, clone both repositories, then:

```bash
git clone https://github.com/chatgpters6/L2M-Web2.git l2m-web2-source
cd l2m-web2-source && git checkout 25ca2ef0454228182f65f8912eb326c85ea551fa && cd ..
git clone https://github.com/gloweaseco-leo/VEYFRONT.git veyfront-target
mkdir -p veyfront-target/public/demo veyfront-target/docs/stage-2r/screenshots
cp l2m-web2-source/public/demo/valve.png veyfront-target/public/demo/valve.png
cp l2m-web2-source/docs/stage-2r/screenshots/en-1440-full.png veyfront-target/docs/stage-2r/screenshots/en-1440-full.png
git -C veyfront-target hash-object public/demo/valve.png
git -C veyfront-target hash-object docs/stage-2r/screenshots/en-1440-full.png
git -C veyfront-target add public/demo/valve.png docs/stage-2r/screenshots/en-1440-full.png
git -C veyfront-target commit -m "chore: complete L2M-Web2 source snapshot"
git -C veyfront-target push origin main
```

The hash-object output must equal the respective blob SHA above before pushing.

After both assets are present, compare all 67 source paths and Git blob SHA values. The design prototype is not production-approved; official VEYFRONT SVG brand assets and the proposed brand refactor are separate work.
