# VEYFRONT 受邀诊断｜预览接入

本分支对接 VRAE 诊断 API v1 及独立报告 API 的服务端合同。默认预览提供网址格式检查和报告示例，咨询原入口继续可用。预览不改变 veyfront.com 的域名或发布状态。

| 合同 | 源码基线 | 能力 |
| --- | --- | --- |
| 诊断 API | [VRAE PR #172](https://github.com/gloweaseco-leo/VRAE/pull/172) · [接口交接](https://github.com/gloweaseco-leo/VRAE/blob/bd2c21792e78c60d534466a7030ecdc6c56ad5c8/docs/03-engineering/vf-preview-173/HANDOFF.md) | 受邀会话、动态申请及授权、VRAE 实时签发、任务状态、一次性任务恢复 |
| 客户报告 API | [VRAE PR #169](https://github.com/gloweaseco-leo/VRAE/pull/169) | 独立 REVIEW mTLS、MFA 挑战和会话交换、授权读取、版本及正式发布校验。浏览器客户报告入口等待真实 MFA、定向许可和报告字段验收。 |

## 预览配置

以下环境变量仅配置到此 PR 的 **Vercel Preview 分支**。生产环境不开放接口。不得使用 `NEXT_PUBLIC_` 环境变量或将凭据填入 PR。

| 环境变量 | 值 |
| --- | --- |
| `VF_VRAE_PREVIEW_ENABLED` | 真实联调放行后设为 `1`，缺失或配置不完整时关闭 |
| `VRAE_DIAGNOSIS_BASE_URL` / `VRAE_REPORT_BASE_URL` | 各服务实际签发的 HTTPS origin |
| `VRAE_<DIAGNOSIS或REPORT>_CA_PEM` | 用于验证服务器证书的 CA PEM |
| `VRAE_<DIAGNOSIS或REPORT>_CLIENT_CERT_PEM` / `_CLIENT_KEY_PEM` | 对应服务身份的客户端证书和私钥 PEM |
| `VRAE_<DIAGNOSIS或REPORT>_BEARER` / `_SOURCE_SHA` | 与客户端证书绑定的服务令牌和实际部署源码 SHA |
| `VF_VRAE_PREVIEW_SESSION_KEY` | 独立的 32 字节随机密钥，使用 64 个小写十六进制字符，供短期会话及恢复码加密 |
| `VF_VRAE_PREVIEW_TARGET_URL` | 唯一批准的 VRAE 自控测试站点 HTTPS 根地址，必须带结尾 `/` |

验证一次性邀请前，BFF 先检查 `/health/ready`、`/v1/openapi.json` 和 `/v1/target-intake-contract`。用户看到当次部署的授权原文，确认后才调用 `/v1/target-applications` 和 `/v1/target-applications/authorize`。首测限定于唯一设置的自控根地址，VRAE 必须返回其自控来源证明与当前授权，额外路径为空。

授权后，测试者再次主动确认诊断。BFF 记录真实确认时间和固定幂等键，先写入浏览器的加密会话，再向 `/v1/diagnoses` 发送完整原意图；发送或响应中断时可继续发送原意图。签名由 VRAE 实时生成，过期或不匹配时拒绝。原预签名数组已退出此 Preview 流程，独立离线 G1 路径另有自己的配置。

测试者从受控渠道获得一次性邀请。上游 Cookie 和 CSRF 只由 BFF 读取及发送。浏览器保存 HttpOnly、Secure、SameSite=Strict 的加密会话；恢复码最多有效 5 分钟，用于任务恢复。未发布草稿和任务完成状态均不产生报告读取权。Reviewer 的决策、改稿、签发及撤销仍走 VRAE 的权限流程。

## 实际服务联调与回滚

在配置启用前确认 `/health/ready`、`/v1/openapi.json` 与部署 SHA，并在有目标授权的测试站验证邀请、原始提交幂等、恢复、403/409/429/503。报告服务合并部署后，确认独立 `/v1/report-authority/health` 返回客户发布能力，再由 VRAE 交接真实 MFA 与客户定向授权，验证越权、过期、撤销、变更版本以及客户字段呈现。

停用时撤去分支的启用开关并重新部署预览。需立即收口时同时在 VRAE 撤销对应联调服务身份及授权。现有咨询、隐私请求和线索系统走独立流程。
