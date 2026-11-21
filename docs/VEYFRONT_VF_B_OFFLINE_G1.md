# VEYFRONT VF-B 服务端离线接线候选

## 可验证的范围

按 [Owner 接线裁决](https://github.com/gloweaseco-leo/VEYFRONT/pull/36#issuecomment-6996438589) 独立交付。VEYFRONT 基线为 PR #36 的 `e05557b6a9da6401903f9377ac3b7f3026bcdced`。VRAE 契约取自已验收主干 `2883a1dd0df07c4b1dfaf77b8fd8d93607eae34b` 的 [G1 联调交接](https://github.com/gloweaseco-leo/VRAE/blob/2883a1dd0df07c4b1dfaf77b8fd8d93607eae34b/docs/03-engineering/l2-g1/CONSUMER-HANDOFF.md)。

| 能力 | 当前实现与验收 |
| --- | --- |
| 传输 | Node 服务端使用固定私有 G1 HTTPS 端点、原媒体类型、CA 和证书摘要、VRAE 清洁源码 SHA 与离线范围。服务凭据留在服务端。 |
| 提交 | 受信侧签发的申请与租户、邀请、收件人、授权网址、站点许可和独立诊断同意绑定。重复传递原签名与幂等键，只有上游严格返回 202 才确认已受理。 |
| 状态与返回 | 先取得 challenge，再交换一次性返回凭证。原 Cookie 和 CSRF 留在服务端，按任务读取状态。过期、撤销和跨任务读取拒绝访问。 |
| 报告与对外路径 | G1 候选使用 OFFLINE_SYNTHETIC_NO_RELEASE。报告、Vercel 预览的诊断 API 和生产诊断入口保持关闭。原咨询使用已有流程。 |
| 多邀请 | 适配层逐份处理外部签发的邀请和许可。同一接口可用于不同收件人、网站和任务。邀请名单、数量与时点由 Owner 决定。 |

本地测试使用受控 HTTPS 替身验证实际 TLS 请求、两组相互独立的邀请、重试、一次性返回凭证、越权、过期、撤销、429、503 及报告门禁。当前环境没有已启动的 VRAE/PG 实例，测试结果仅涵盖 VEYFRONT 适配层。完整 G1 同仓实测需在 VRAE 已拥有的隔离命名空间运行。

## 在受控 G1 实例内核验

- 适配层专项命令为 `node --test tests/vrae-g1-server.test.mjs`。使用 Node 24 与 OpenSSL。
- `scripts/vrae-g1-offline.mjs` 只在请求端明确启用本地试用时运行。受控实例内将本轮运行者持有的私有 JSON 通过标准输入传入。文件结构包含 `transport` 为 `ca`、`certificateSha256`、`sourceSha`、`serviceToken`，`action` 为 `submit`、`status` 或 `exchange-and-status`。
- `submit` 另需 `authority`，字段与 `lib/vrae-g1-server.ts` 中受信授权一致。保留 G1 签发的原始 `signedSubmission` JSON。新任务与重试都由 VRAE 认定。其他操作分别使用当前 `session` 或尚未消费的一次性 `returnToken` 及任务引用。已有的私有 session 导出仅用于状态读取。
- 客户身份接入、真实站点授权签发与诊断同意、持久化分域会话、正式覆盖与报告投影、版本审核与可撤销分享等待 G2 接口批准。相关站点、模型、云环境和正式域名各自按 Owner 门禁开放。

## 浏览器到服务端的本地联调

本地开发运行可以在原诊断页面启用「本地 G1 离线联调」。Vercel 预览、生产构建与常规本地预览均关闭该入口。打开本地联调时，页面只提交与当前邀请码和受信签名完全匹配的示例网址。测试许可与诊断同意分别确认。申请收到 202 后可回读已有任务，示例报告继续是独立演示。

- 完整本地测试命令为 `VF_TEST_LOCAL_CHROMIUM=1 node --test tests/vrae-g1-server.test.mjs`。需要 Python Playwright 与 Chromium。测试在 loopback 启动 Next 和 HTTPS 替身，覆盖中英文两组非客户站点、跨站点和跨来源拒绝、202 接收、200 状态读取及报告关闭。此测试没有运行 VRAE/PG。
- 连接真实 G1 离线实例时，使用 VRAE 已有独立运行器与自有隔离命名空间，按 [G1 交接](https://github.com/gloweaseco-leo/VRAE/blob/2883a1dd0df07c4b1dfaf77b8fd8d93607eae34b/docs/03-engineering/l2-g1/CONSUMER-HANDOFF.md) 生成新合成任务与只读导出。VEYFRONT 进程绑定 `127.0.0.1`，带 `VF_B_OFFLINE_G1=1` 和 `VF_B_OFFLINE_G1_FIXTURES` 私有文件路径启动开发实例。服务端数据、上游和浏览器都留在同一隔离边界内。
- 私有文件包含 `transport` 与 `invitations`。每条邀请保存独立邀请码 SHA-256、到期时间、对应的 `authority` 和 `session`。原 `vf-submit.json` 作为签名正文，`current-session.json` 的 `cookies["__Host-vrae-g1"]` 和 `csrf` 只在服务端配给该任务引用。邀请码为每位测试人员单独生成，签名、Cookie、原始私有导出及其文件内容只在本实例处理。浏览器流程使用已经签发的任务和会话，可测试原意图重试和当前回读。
- 真实 G1 首次申请与首次交换须由运行实例提供相应的未消费任务和授权。既有会话导出的首次交换已消费。验收仍须记录真实 VRAE/PG 的受理、回读与同任务原证据。

## CI 记录

PR #36 两项作业均在运行步骤前被 GitHub Actions 账户账单策略拦截。运行注释提示近期付款失败或需提高支出上限。作业无步骤和可用日志，账户侧的具体触发项待有权限的账号确认。此次草稿没有调整账单或改写检查来替代自然 CI。 [原型检查](https://github.com/gloweaseco-leo/VEYFRONT/actions/runs/44352737631) · [Speed Insights](https://github.com/gloweaseco-leo/VEYFRONT/actions/runs/44352737830)
