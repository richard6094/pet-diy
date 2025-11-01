# 宠物T恤设计师 🐾

一个基于React的宠物照片T恤设计网站，提供上传宠物照片并通过AI生成T恤设计的功能。

## 功能特性

- **📸 图片上传**：支持拖拽上传宠物照片，显示缩略图预览
- **🎨 设计展示**：展示AI生成的T恤设计成果
- **✍️ 提示词输入**：输入设计风格描述，支持建议提示词
- **📝 历史记录**：保存和重用历史提示词
- **📱 响应式设计**：支持桌面和移动设备

## 技术栈

- **前端框架**：React 19.1.1
- **构建工具**：Vite 4.5.5
- **样式框架**：Tailwind CSS 3.4.0
- **文件上传**：React Dropzone 14.2.3
- **开发语言**：JavaScript (ES6+)

## 项目结构

```
webApp/
├── public/                 # 静态资源文件
├── src/
│   ├── components/         # React组件
│   │   ├── ImageUpload.jsx    # 图片上传组件
│   │   ├── DesignDisplay.jsx  # 设计展示组件
│   │   └── PromptInput.jsx    # 提示词输入组件
│   ├── App.jsx            # 主应用组件
│   ├── main.jsx           # 应用入口
│   └── index.css          # 全局样式
├── .github/               # GitHub配置
├── package.json           # 项目依赖
├── vite.config.js         # Vite配置
├── tailwind.config.js     # Tailwind配置
└── README.md             # 项目说明
```

## 快速开始

### 环境要求

- Node.js 20.9.0+ 
- npm 10.1.0+

### 安装和运行

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```
   
   服务器将在 `http://localhost:5173` 启动

3. **构建生产版本**
   ```bash
   npm run build
   ```

4. **预览生产构建**
   ```bash
   npm run preview
   ```

## 组件说明

### ImageUpload 组件
- 支持拖拽和点击上传图片
- 显示已上传图片的缩略图
- 限制图片格式：JPG、PNG、GIF、WebP

### DesignDisplay 组件
- 展示T恤设计结果
- 支持加载状态显示
- 提供下载和重新生成按钮

### PromptInput 组件
- 提示词输入和提交
- 建议提示词快速选择
- 历史记录管理和重用

## 待实现功能

- [ ] 后端API集成
- [ ] GPT图像API调用
- [ ] 文件存储服务
- [ ] 用户账户系统
- [ ] 设计模板库
- [ ] 支付功能

## 开发说明

项目目前只包含前端界面，后端API和AI调用功能暂未实现。模拟数据用于展示界面效果。

## 许可证

MIT License+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
