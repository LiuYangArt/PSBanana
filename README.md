# Photoshop Banana

- Photoshop jsx 格式插件
- 用gemini nano banana api 在photoshop中生成图片

## 安装

将PS_Banana.jsx复制到ps的scripts文件夹下，例如：
C:\Program Files\Adobe\Adobe Photoshop 2023\Presets\Scripts\

## 使用
- File>Scripts>PS_Banana  运行插件<img width="635" height="377" alt="image" src="https://github.com/user-attachments/assets/62b5ab3e-3acd-4c12-bf02-b4ba7908f67c" />

- 可以给这个插件设置快捷键，以便快速使用。<img width="1269" height="740" alt="image" src="https://github.com/user-attachments/assets/c3f35c55-8f47-458e-ad64-eba64d296b7c" />


## 功能
- 支持图层模式， 使用 source  / reference  命名图层组， 可以得到类似chat中发送两张图的效果<img width="403" height="266" alt="image" src="https://github.com/user-attachments/assets/1d6967e0-b56e-4533-a017-0f448d099a4f" /><img width="929" height="796" alt="image" src="https://github.com/user-attachments/assets/41e8bb66-0cf2-4a25-9d71-33a71c1aecf8" />
- Direct Mode 文生图， 勾选使用上次结果可以把上次生成的图作为context<img width="875" height="635" alt="image" src="https://github.com/user-attachments/assets/a5c55269-76a4-461c-ba15-28c34f22a5e8" />
- 支持选区
- Prompt预设
- 自定义API提供商(目前只在yunwu/gptgod跑通，其它没测)

