# Google / YouTube 分流

Google 搜索、账号登录、Google API、Gemini、AI Studio、Antigravity、NotebookLM、Jules 和共用资源统一收在 `Google.list`，由一个 `Google` 策略组选择出口。YouTube 保持独立。

在 Surge Mac 和 iPhone 的 `[Rule]` 中按以下顺序引用；放在 AI 合集、Proxy、google.com / googleapis.com 等通用规则和 FINAL 之前：

```ini
RULE-SET,https://raw.githubusercontent.com/0ee/Rules/Surge/Media/Youtube.list,YouTube
RULE-SET,https://raw.githubusercontent.com/0ee/Rules/Surge/Google.list,Google
```

策略组名称必须与你自己的 `[Proxy Group]` 一致。`Google` 应选择可用的同一出口，避免登录与 AI 后端分散到不同国家；不自动修改订阅、节点或账号地区。

删除或改写更靠前的 Google / Gemini / Antigravity / AI Studio / NotebookLM / Jules 单独规则，否则可能抢先匹配。Google 规则已从本仓库 `AI.list` 和 `Proxy.list` 移出，升级时要同时加入 `Google.list`。

该文件是人工维护的规则快照，不会自动同步上游。主体域名参考 blackmatrix7/ios_rule_script 的 Surge Google 列表，并合入 Sukka 的 Google AI 规则以及本仓库原有条目；保留来源注释。跨设备规则不含 Chrome 等浏览器进程匹配和依赖 MITM 的 URL 匹配。Google IP 范围与部分资源可能被多个 Google 产品共用，YouTube 的明确域名规则须在前。
