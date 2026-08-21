# Guijia Zhang — Personal Homepage

个人学术主页，纯静态 HTML/CSS，无需任何构建工具，直接托管在 GitHub Pages。

顶部固定导航 + 宽幅内容区。视觉保留深蓝与金色作为学术强调色，
论文与软件入口优先于装饰。内容拆分为五个独立页面：

- `index.html` — About + Selected Research + News
- `publications.html` — 论文列表
- `experience.html` — 科研经历 + 教育背景
- `projects.html` — 研究软件与工程项目
- `awards.html` — 奖项与培训

公共样式在 `style.css`。修改导航或联系方式时，五个页面需要同步更新。

## 本地预览

直接双击 `index.html`，或：

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 部署

GitHub 仓库：<https://github.com/123zgj123/123zgj123.github.io>

用户主页地址：<https://123zgj123.github.io/>。

## 后续可补充

- ECA（2605.19192）与 STARS（2604.10286）已标为 EMNLP 2026 Findings；
  GUI Agents（2607.04334）仍为 preprint。正式 ACL anthology 链接公布后可替换 arXiv。
- FarField：<https://github.com/123zgj123/FarField>
- “Agent Skill Regulation” 和 “EchoRAG” 两篇暂无公开链接
- 简历已放在 `assets/cv.pdf`
- 当前头像采用 30 号圆章；如需本人照片，可放入 `assets/avatar.jpg` 并修改导航头像
