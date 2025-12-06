- 此版本已不维护，新版： [https://github.com/LiuYangArt/PSBananaUXP](https://github.com/LiuYangArt/PSBananaUXP)
- this plugin is deprecated.

# Photoshop Banana

- Photoshop jsx 格式插件
- 用gemini nano banana api 在photoshop中生成图片
- 需自行购买第三方api

  ![generated_image_20251129224118](https://github.com/user-attachments/assets/34b02b7d-9588-4d95-97a6-a262f1e3f80b)


## 安装

将PS_Banana.jsx复制到ps的scripts文件夹下，例如：
C:\Program Files\Adobe\Adobe Photoshop 2023\Presets\Scripts\

## 使用
- File>Scripts>PS_Banana  运行插件<img width="635" height="377" alt="image" src="https://github.com/user-attachments/assets/62b5ab3e-3acd-4c12-bf02-b4ba7908f67c" />
- 可以给这个插件设置快捷键，以便快速使用。<img width="1269" height="740" alt="image" src="https://github.com/user-attachments/assets/c3f35c55-8f47-458e-ad64-eba64d296b7c" />
- 在Settings页面填入API。目前只在yunwu/gptgod跑通，google 官方的API我这边没有条件测。
  [yunwu](https://yunwu.ai/register?aff=VE3i) | [gptgod](https://gptgod.site/#/register?invite_code=5ax35dxlk4bys0j7jnzqypwkc)
  <img width="918" height="261" alt="image" src="https://github.com/user-attachments/assets/dc16aa88-1ac6-4648-9590-ac55b9262817" />



## 功能
- 支持图层模式， 使用 source  / reference  命名图层组， 可以得到类似chat中发送两张图的效果<img width="403" height="266" alt="image" src="https://github.com/user-attachments/assets/1d6967e0-b56e-4533-a017-0f448d099a4f" /><img width="929" height="796" alt="image" src="https://github.com/user-attachments/assets/41e8bb66-0cf2-4a25-9d71-33a71c1aecf8" />
- Direct Mode 文生图， 勾选使用上次结果可以把上次生成的图作为context<img width="875" height="635" alt="image" src="https://github.com/user-attachments/assets/a5c55269-76a4-461c-ba15-28c34f22a5e8" />
- 支持选区
- Prompt预设
- 自定义API提供商(目前只在yunwu/gptgod跑通，其它没测过)

## 已知问题
- jsx脚本插件会阻塞ps进程。运行时不能操作其它界面。这是jsx本身的限制。
- 暂时不支持官方api和openrouter的api， 目前没条件测试。 
---

![008vagubgy1i7okwufkdnj31wi0qn1kx](https://github.com/user-attachments/assets/28b154b7-4fcc-4e0b-b339-04d8ea58a8ae)
![008vagubgy1i7okwultrbj318q0p1b29](https://github.com/user-attachments/assets/fd04ee39-90a9-4135-b02f-794561ce9f0b)


## 免责声明
本插件功能依赖第三方 API 服务。在使用过程中，您的数据（包括但不限于图片、提示词）将被发送至第三方服务器进行处理。开发者不对第三方服务的数据安全性、隐私保护或服务稳定性承担任何责任。请勿上传包含敏感个人信息的内容，使用本插件产生的任何数据泄露风险由用户自行承担。
