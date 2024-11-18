# DHuman

这是一个展示3D数字人的网页应用，主要展示OBJ模型，后端使用Python Flask框架，前端使用Three.js构建。应用场景对比各种算法生成的OBJ模型。

## 项目结构

- `app.py`: Flask应用的主文件。
- `templates/`: 存放HTML文件的文件夹。
- `public/`: 存放静态文件，如模型和纹理。
  - `models/`: 存放3D模型文件。

## 功能描述

- 3D场景展示
- 模型交互
- 自适应窗口大小
- 场景光照

## 开发记录

本文档将记录所有重要的开发步骤和更新。

## 启动应用

1. 激活虚拟环境：
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
2. 运行应用：`python app.py`
3. 访问 `http://127.0.0.1:5000/` 查看应用。

## 注意事项

- 确保GLB模型文件放置在正确的目录中
- 检查浏览器控制台是否有错误信息
- 如果模型加载失败，检查网络请求和文件路径