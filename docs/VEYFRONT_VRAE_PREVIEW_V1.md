# VEYFRONT 受邀诊断｜预览接入

本分支对接 VRAE 诊断 API v1 及独立报告 API 的服务端合同。默认预览提供网址格式检查和报告示例，咨询原入口继续可用。预览不改变 veyfront.com 的域名或发布状态。

| 合同 | 源码基线 | 能力 |
| --- | --- | --- |
| 诊断 API | [VRAE main fbefba0](https://github.com/gloweaseco-leo/VRAE/blob/fbefba03c393bd1a0013f4a42d8e5765248fe2bb/docs/03-engineering/authorized-targets/DIAGNOSIS-API.md) | 受邀会话、当前目标授权、原始签名提交、任务状态、一次性任务恢复 |
| 客户报告 API | [VRAE Draft PR #169](https://github.com/gloweaseco-leo/VRAE/pull/169) · `00431c308d69c20f1b6dae6890ee26b93eb40008` | 独立 REVIEW mTLS、MFA 挑战和会话交换、授权读取、版本及正式发布校验。浏览器客户报告入口等待真实 MFA 和定向许可交接，以及获准报告字段的联调验收。 |

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
| `VF_VRAE_PREVIEW_SIGNED_SUBMISSIONS` | 小批受邀联调用的私有 JSON 数组。每项包含 `targetId`、`expiresAt`、`consentText`、`signedSubmission` |

`signedSubmission` 是经受信签发方授权的完整 VFSubmit 原始 JSON **字符串**，包含目标来源许可及已有诊断同意证明。签发方需提供与证明哈希匹配的完整授权文案。页面确认用于确认同一份申请。签名和幂等键保持原样，当前目标、受邀主体、语言和网站地址必须一致。网址只与授权源比较，并且不参与服务器目标寻址。

预览页面向已受邀测试者。测试者从受控渠道获得对应的一次性邀请和目标编号。任务查询使用 HttpOnly、Secure、SameSite=Strict 的加密会话。恢复码最多有效 5 分钟，只用于任务恢复。未发布的草稿和任务完成状态均不取得报告读取权。报告客户端只接受当前正式发布且版本与审核决定一致的响应，原始报告不进入浏览器。Reviewer 的决策、改稿、签发及撤销仍走 VRAE 的权限流程。

## 实际服务联调与回滚

在配置启用前确认 `/health/ready`、`/v1/openapi.json` 与部署 SHA，并在有目标授权的测试站验证邀请、原始提交幂等、恢复、403/409/429/503。报告服务合并部署后，确认独立 `/v1/report-authority/health` 返回客户发布能力，再由 VRAE 交接真实 MFA 与客户定向授权，验证越权、过期、撤销、变更版本以及客户字段呈现。

停用时撤去分支的启用开关并重新部署预览。需立即收口时同时在 VRAE 撤销对应联调服务身份及授权。现有咨询、隐私请求和线索系统走独立流程。
