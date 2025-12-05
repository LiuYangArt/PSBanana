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

---


# Photoshop Banana

- Photoshop JSX format plugin
- Generates images in Photoshop using the Gemini Nano Banana API
- Requires you to purchase a third-party API

## Installation

Copy `PS_Banana.jsx` to Photoshop's scripts folder, for example:
C:\Program Files\Adobe\Adobe Photoshop 2023\Presets\Scripts\

## Usage

- File > Scripts > PS_Banana to run the plugin  
  ![image](https://github.com/user-attachments/assets/62b5ab3e-3acd-4c12-bf02-b4ba7908f67c)
  
- You can set a shortcut key for this plugin for quicker access.  
  ![image](https://github.com/user-attachments/assets/c3f35c55-8f47-458e-ad64-eba64d296b7c)

- Fill in the API in the Settings page. Currently, it works with yunwu/gptgod, and I haven't tested Google's official API.  
  [yunwu](https://yunwu.ai/register?aff=VE3i) | [gptgod](https://gptgod.site/#/register?invite_code=5ax35dxlk4bys0j7jnzqypwkc)  
  ![image](https://github.com/user-attachments/assets/dc16aa88-1ac6-4648-9590-ac55b9262817)

## Features

- Supports layer mode. Use source/reference to name layer groups to achieve similar effects as sending two images in a chat.  
  ![image](https://github.com/user-attachments/assets/1d6967e0-b56e-4533-a017-0f448d099a4f)  
  ![image](https://github.com/user-attachments/assets/41e8bb66-0cf2-4a25-9d71-33a71c1aecf8)

- Direct Mode for generating images. Check "Use last result" to use the previously generated image as context.  
  ![image](https://github.com/user-attachments/assets/a5c55269-76a4-461c-ba15-28c34f22a5e8)

- Supports selection areas
- Prompt presets
- Custom API providers (currently only works with yunwu/gptgod, untested with others)

## Known Issues

- The JSX script plugin blocks the PS process. You cannot operate other interfaces while it's running. This is a limitation of JSX itself.
- Official APIs and OpenRouter APIs are currently unsupported, as I don't have the conditions to test them.

---
