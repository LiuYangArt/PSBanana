# Photoshop AI Plugin (JSX)

A standalone ExtendScript (.jsx) plugin for Photoshop 2022/2023 that integrates Google Gemini and OpenRouter for AI image generation.

## Features
- **Text-to-Image Generation**: Generate images directly into your Photoshop document.
- **Selection Support**: Generated images are pasted into your active selection.
- **Multi-Provider**: Supports Google Gemini (Imagen 3) and OpenRouter (Stable Diffusion, DALL-E, etc.).
- **Preset Management**: Save and reuse your favorite prompts.

## Prerequisites
1.  **Photoshop 2022 or newer** (Tested on 2023).
2.  **Windows OS** (Uses `curl` and `certutil` built into Windows).
    -   Ensure `curl` is accessible from Command Prompt (try running `curl --version`).

## Installation
1.  Download `AI_Generator.jsx`.
2.  Place it in your Photoshop Scripts folder:
    -   `C:\Program Files\Adobe\Adobe Photoshop 2023\Presets\Scripts\`
    -   Or keep it anywhere and run via **File > Scripts > Browse...**

## Usage
1.  Open Photoshop and create a document.
2.  (Optional) Make a selection where you want the image to appear.
3.  Run the script: **File > Scripts > AI_Generator** (or Browse).
4.  **First Time Setup**:
    -   Go to the **Settings** tab.
    -   Select your **Provider** (e.g., OpenRouter).
    -   Enter your **API Key**.
    -   (Optional) Update **Model ID** if needed.
    -   Click **Save Settings**.
5.  **Generate**:
    -   Go to the **Generate** tab.
    -   Enter a prompt (e.g., "A futuristic city, cyberpunk style").
    -   Click **Generate Image**.
    -   Wait for a few seconds. The image will appear as a new layer.

## API Configuration
### Google Gemini
-   **Base URL**: `https://generativelanguage.googleapis.com/v1beta`
-   **Model ID**: `imagen-3.0-generate-001` (or check Google AI Studio for latest).
-   **API Key**: Get from [Google AI Studio](https://aistudio.google.com/).

### OpenRouter
-   **Base URL**: `https://openrouter.ai/api/v1`
-   **Model ID**: `google/gemini-pro-vision` (Note: For image generation, use a supported image model like `stabilityai/stable-diffusion-xl-base-1.0` or `openai/dall-e-3`).
-   **API Key**: Get from [OpenRouter](https://openrouter.ai/).

## Troubleshooting
-   **"API call failed"**: Check your API key and Internet connection.
-   **"Failed to save result image"**: Ensure you have write permissions to your temporary folder.
-   **Console Errors**: The script uses `curl` via command line. Ensure no firewall is blocking `curl`.
