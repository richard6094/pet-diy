# 宠物创意工作室 🐾

一个基于 React + Vite + Tailwind CSS 打造的前端应用，帮助用户上传宠物照片、撰写设计提示词，并通过 Google Gemini 图像模型生成适合印制在 T 恤上的独特图案。项目同时内置背景透明处理工具，方便快速清理图片背景。

## ✨ 核心功能

- **AI T 恤设计师**：上传宠物照片、填写提示词，一键调用 Gemini 模型生成 PNG 图案。
- **交互式排版**：在白色 T 恤底图上实时拖拽与缩放图案，确认印刷位置与大小。
- **背景透明化**：自动清理模型输出图片的背景，必要时回退到原始图像。
- **背景移除工具页**：独立页面提供手动背景透明处理，可下载透明 PNG。
- **提示词与历史管理**：内置提示词建议、重用历史记录，提升创作效率。
- **API Key 管理中心**：支持环境变量、会话内临时 Key、本地存储三种持久方式。
- **多图上传与管理**：批量上传宠物图像、快速预览缩略图并删除不需要的素材。

## 🧰 技术栈

- **前端框架**：React 19 + React Router 7
- **构建工具**：Vite 4
- **样式方案**：Tailwind CSS 3 + 自定义组件样式
- **文件上传**：react-dropzone
- **图像处理**：@imgly/background-removal
- **质量保障**：ESLint 9（含 React Hooks/Refresh 规则）

## 📂 项目结构

```text
pet-diy/
├── public/                     # 静态资源
├── src/
│   ├── assets/                 # 底图与装饰素材
│   ├── components/             # 复用组件（上传、预览、API Key 等）
│   ├── config/                 # 配置与存储工具（如 apiKeyStore）
│   ├── hooks/                  # 自定义 Hook（useApiKey）
│   ├── pages/                  # 页面级组件（T 恤设计、背景移除）
│   ├── services/               # 与模型/图像处理相关的服务层
│   ├── App.jsx                 # 路由与全局布局
│   ├── App.css / index.css     # 全局样式
│   └── main.jsx                # 应用入口
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js ≥ 20.9.0
- npm ≥ 10.1.0

### 安装与本地运行

```powershell
npm install
npm run dev
```

开发服务器默认运行在 <http://localhost:5173>。

### 构建与预览

```powershell
npm run build      # 产出 dist/ 静态文件
npm run preview    # 在本地预览生产构建
```

### 代码质量检查

```powershell
npm run lint
```

## 🔑 环境变量与密钥管理

应用默认从浏览器本地存储或 `.env` 文件读取 Google Gemini/Nano Banana API Key：

```bash
# .env.local 示例
VITE_GOOGLE_API_KEY=your-gemini-api-key

# 可选，覆盖默认模型 ID
VITE_GEMINI_IMAGE_MODEL=models/gemini-2.5-flash-image-preview:generateContent
```

- 本地开发可通过页面右下角的 **API Key 管理** 面板输入 Key，并选择是否持久化到浏览器。
- 正式部署时建议改用服务端代理或只在环境变量中注入，避免在客户端暴露敏感凭据。

## 🖼️ 页面概览

| 页面 | 说明 |
| --- | --- |
| `T恤设计师` | 组合图片上传、提示词输入、历史记录与 AI 生成结果展示，支持对图案进行拖拽排版与一键下载。 |
| `背景透明工具` | 使用 `@imgly/background-removal` 对任意图片进行抠图，生成带透明背景的 PNG，并可直接下载。 |

## 🤖 工作流速览

1. 上传宠物照片，可一次上传多张并在侧栏管理。
2. 选择建议提示词或自定义描述，提交后触发 Gemini 模型生成 PNG。
3. 自动尝试移除背景；若失败则保留原图并提示。
4. 在 T 恤预览中拖拽/缩放设计，确认位置后可导出完整合成图。
5. 历史记录与提示词重用功能帮助快速调整风格方向。

## ☁️ 部署到 Azure Static Web Apps

1. 安装 CLI 并初始化配置（CLI 将生成 `staticwebapp.config.json`，无需手动创建）：
   ```powershell
   npm install -g @azure/static-web-apps-cli
   npx swa init --yes
   ```
2. **推荐**：在 Azure Portal 创建 Static Web App，选择 GitHub 仓库与分支，Build Preset 选 `Vite`，`app_location` 设为 `/`、`output_location` 设为 `dist`。Azure 会自动生成 GitHub Actions 工作流，持续部署。
3. **命令行一次性部署**（适合临时预览）：
   ```powershell
   npx swa build
   npx swa deploy --env production
   ```
   部署成功后 CLI 会输出访问 URL。
4. 自定义域名与 HTTPS 可在 Azure Portal 的 Static Web App 设置中完成，免费证书会自动续期。

如需运行在其他 Azure 服务（App Service、Storage Static Website 等），可直接部署 `dist/` 静态文件目录，并按照服务指引绑定自定义域名与 CDN。

## 📅 规划中的功能

- [ ] 服务端代理与多租户 API Key 管理
- [ ] 多种 T 恤底图与样式模板
- [ ] 用户账户与作品库
- [ ] 生成结果持久化与分享链接
- [ ] 在线下单/支付流程打通

## 📝 许可证

MIT License
