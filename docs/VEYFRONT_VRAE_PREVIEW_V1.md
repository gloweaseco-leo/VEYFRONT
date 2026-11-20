# VEYFRONT 自动诊断｜内测交接

客户在既有诊断页填写自己的外贸网站、勾选一次授权，提交后查看任务、页面证据和改版建议。浏览器展示同一受信会话可读的自动诊断。人工审核客户报告仍走独立 Report Authority。

| 合同 | 源码基线 | 用途 |
| --- | --- | --- |
| 诊断 API | [VRAE PR #176](https://github.com/gloweaseco-leo/VRAE/pull/176) · `7a097486e36892484034e1ee69be7d6dff2c4dbe` | 读取 `automatic_diagnosis` 授权合同，提交真实任务，读取同一主体的自动结果 |
| 任务会话及恢复 | [VRAE PR #172](https://github.com/gloweaseco-leo/VRAE/pull/172) | 服务端兑换一次性邀请，保留原始幂等申请，签发和兑换受限恢复码 |
| 客户报告 API | [VRAE PR #169](https://github.com/gloweaseco-leo/VRAE/pull/169) | 独立 REVIEW mTLS、MFA、定向报告授权和发布校验，当前自动诊断页面无需此接口 |

## 预览配置

配置仅用于受 Vercel Authentication 保护的 PR #37 Preview 分支。真实内测从该部署自己的 URL 访问。正式域名关闭此入口。凭据通过部署环境变量交接。

| 环境变量 | 值 |
| --- | --- |
| `VF_VRAE_PREVIEW_ENABLED` | 联调放行时设为 `1` |
| `VRAE_DIAGNOSIS_BASE_URL` / `VRAE_REPORT_BASE_URL` | 各服务签发的 HTTPS origin。自动诊断仅需前者 |
| `VRAE_<DIAGNOSIS或REPORT>_CA_PEM` | 验证服务器证书的 CA PEM |
| `VRAE_<DIAGNOSIS或REPORT>_CLIENT_CERT_PEM` / `_CLIENT_KEY_PEM` | 对应服务身份的客户端证书及私钥 |
| `VRAE_<DIAGNOSIS或REPORT>_BEARER` / `_SOURCE_SHA` | 对应服务令牌以及实际部署的源码 SHA |
| `VF_VRAE_PREVIEW_SESSION_KEY` | 独立的 32 字节随机密钥，使用 64 个小写十六进制字符 |
| `VRAE_PREVIEW_INVITATION` | Sensitive 一次性、单主体邀请，由本轮受邀测试者首次提交时通过服务端兑换 |

预览请求先核对服务就绪状态、OpenAPI 和 `automatic_diagnosis` 授权版本。单次勾选包括限定范围的公开页面只读检查与模型证据处理。VF 只检查网址格式，VRAE 决定来源许可和采集范围，并执行目标网络和会话检查。VF 不再配置固定检测网址。单次邀请限定一次兑换。公众入口仍需要 VRAE 签发按客户隔离的受信会话或交接方式。

BFF 在调用 `POST /v1/diagnoses` 前将所确认的地址、版本、时间、语言和幂等键一并封装进 HttpOnly、Secure、SameSite=Strict 的短期加密 Cookie。重试提交原始请求。浏览器查询本地 BFF，服务端凭当前会话读取 `GET /v1/audits/{audit_ref}/diagnosis`。等待、失败和 AI 暂不可用分别显示。只有真实模型回执与可定位来源都成立时，BFF 才返回 AI 分析和建议。来源未获取时显示 UNKNOWN。

## 联调与回滚

VRAE 部署对应版本后，核对源 SHA、APP 证书及 Bearer、自动诊断委托和独立受邀会话。用主动授权的公开网站确认任务受理、页面证据、真实 AI 回执、断线重试和会话恢复。成功联调仍以实际部署上的真实网站与真实模型结果为准。

撤去预览分支的启用开关并重新部署即可回到网址格式检查和报告示例。如需立即停止 VRAE 侧访问，可撤销本轮邀请或服务身份。现有咨询、隐私请求及线索流程均使用独立入口。
