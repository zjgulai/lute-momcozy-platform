# Momcozy 诊断监控360平台

**生产地址**：https://shopify.lute-tlz-dddd.top  
**数据来源**：[lute-momcozy-audit](https://github.com/zjgulai/lute-momcozy-audit)  
**技术栈**：Next.js 16 · Tailwind CSS v4 · Recharts · TypeScript · 静态导出

---

## 项目定位

面向 Momcozy DTC 团队 owner 的私密经营洞察与优化决策平台。  
集成 **SCQA+MECE 8问题诊断叙事**、**10竞品技术+GEO对标**、**30指标字典**、**360框架 G1-G11 覆盖**。

所有页面 `noindex, nofollow`，仅供团队内部访问。

---

## 页面结构

| 路由 | 页面 | 核心内容 |
|---|---|---|
| `/brands/momcozy` | I · 总览 | SCQA 总框架 + 8问题损失排行 + 数据可信度矩阵 |
| `/brands/momcozy/metrics` | II · 指标口径 | 30指标字典 + P3/P5 行动 + KPI对比 |
| `/brands/momcozy/forensics` | III · 风险归因 | P1/P2/P4/P6/P8 证据 + G7/G9/G11 |
| `/brands/momcozy/trends` | IV · 趋势证据 | 7次采集历史 + 置信度说明 |
| `/brands/momcozy/cross-audit` | V · 决策矩阵 | P7 SEO/GEO + 硬结论 + 执行战单 |
| `/brands/momcozy/competitors` | VI · 竞品对比 | 10竞品 GEO格局 + 技术指标 + 核心洞察 |
| `/brands/momcozy/360` | VII · 360框架 | G1-G11 全量覆盖状态 + 操作步骤 |
| `/brands/momcozy/collection` | VIII · 采集管理 | Session历史 + LCP说明 + 采集命令 |
| `/brands/momcozy/execution` | IX · 执行战单 | Sprint Now/Next/Later 分组 + 验收门禁 |

---

## 本地开发

### 前提条件

- Node.js 22+
- 已克隆 [lute-momcozy-audit](https://github.com/zjgulai/lute-momcozy-audit) 到同级目录

### 数据同步（首次 + 每次 audit 数据更新后）

```bash
# 在 lute-momcozy-platform 目录下执行
mkdir -p src/data
cp -r ../lute-momcozy-audit/src/_data/. src/data/
```

> `src/data/` 被 `.gitignore` 忽略，每次开发前需手动同步。  
> CI 环境会自动 checkout audit 仓库并复制数据。

### 启动开发服务器

```bash
npm install
npm run dev
# 访问 http://localhost:3000/brands/momcozy
```

### 运行测试

```bash
# 数据完整性测试（需先同步 src/data/）
npm test

# 构建验证
npm run build
```

---

## 部署

### 自动部署（推荐）

推送到 `main` → GitHub Actions `tencent.yml` 自动：
1. Checkout lute-momcozy-audit 获取最新数据
2. `npm run build` 静态导出到 `out/`
3. tar 打包 → scp 上传 → rsync 部署到腾讯云
4. nginx reload
5. Smoke test：验证 `/brands/momcozy` 返回 200

### 手动触发

```bash
# GitHub Actions UI → Build and Deploy to Tencent Cloud → Run workflow
```

### 所需 GitHub Secrets

| Secret | 说明 |
|---|---|
| `DEPLOY_HOST` | 腾讯云服务器 IP |
| `DEPLOY_USER` | 部署用户名（通常 `ubuntu`）|
| `DEPLOY_ROOT` | 部署根路径（通常 `/opt/momcozy-audit`）|
| `DEPLOY_SSH_KEY` | SSH 私钥 |

---

## 数据架构

```
lute-momcozy-audit/src/_data/        ← 数据源（CI 时 checkout）
├── public-cross-audit.json           ← 主数据（161KB+）
│   ├── diagnosticNarrative           ← 8问题 SCQA+MECE
│   ├── metricDictionary              ← 30指标定义
│   ├── diagnosticGaps360             ← G1-G11 框架
│   ├── geoCompetitorLandscape        ← 10竞品 GEO 格局
│   └── competitorEvidence            ← 竞品采集汇总
├── sessions/                         ← 性能采集历史（7个）
└── competitors/                      ← 竞品快照（3个）

lute-momcozy-platform/src/data/      ← 构建时复制（gitignored）
```

**数据加载**：`src/lib/data/loader.ts` — 读 `src/data/`，SSG 时嵌入 HTML。

---

## 技术说明

- **静态导出**：`next.config.ts output: "export"`，部署为纯静态文件
- **SSG 限制**：Recharts 等依赖 DOM 的组件在 SSG 时无法渲染，需用 `"use client"` + dynamic import
- **多品牌扩展**：`src/lib/data/brands.ts` 增加品牌配置，路由自动支持

---


### B1 自动联动配置（audit 数据更新 → 自动触发 platform 重建）

`lute-momcozy-audit/pages.yml` 已配置 `repository_dispatch`，但需要添加一个 GitHub Personal Access Token：

1. 在 GitHub 生成 PAT：Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Repository: `lute-momcozy-platform`
   - Permissions: `Actions: Write`

2. 在 `lute-momcozy-audit` 仓库添加 Secret：
   Settings → Secrets → Actions → New secret
   - Name: `PLATFORM_TRIGGER_TOKEN`
   - Value: 刚生成的 PAT

配置后，每次 audit 数据推送到 main → platform 自动重建部署，无需手动触发。

## 已知限制 / 技术债

| 问题 | 状态 | 计划 |
|---|---|---|
| Trends 页折线图为空（Recharts SSG 限制） | 🟡 已知 | Batch B2：改用 client 组件 |
| audit → platform 数据更新无自动联动 | 🟡 已知 | Batch B1：repository_dispatch |
| `as any` 类型覆盖全平台 | 🟢 低优先 | 逐步替换为具体类型 |
