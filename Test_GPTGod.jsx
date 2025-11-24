#target photoshop

// ============================================================================
// 简化的JSON支持（使用eval和手写stringify）
// ============================================================================
if (typeof JSON !== 'object') {
    JSON = {};
}

if (typeof JSON.parse !== 'function') {
    JSON.parse = function (text) {
        return eval('(' + text + ')');
    };
}

if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (obj) {
        var t = typeof obj;
        if (t != "object" || obj === null) {
            if (t == "string") return '"' + obj + '"';
            return String(obj);
        } else {
            var n, v, json = [], arr = (obj && obj.constructor == Array);
            for (n in obj) {
                v = obj[n];
                t = typeof v;
                if (t == "string") v = '"' + v + '"';
                else if (t == "object" && v !== null) v = JSON.stringify(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };
}

// ============================================================================
// UI & Logic
// ============================================================================

function showDialog() {
    var win = new Window("dialog", "GPTGod API Test");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 16;

    // API Key
    var grpKey = win.add("group");
    grpKey.orientation = "row";
    grpKey.add("statictext", undefined, "API Key:");
    var txtApiKey = grpKey.add("edittext", undefined, "");
    txtApiKey.preferredSize.width = 300;

    // Model ID
    var grpModel = win.add("group");
    grpModel.orientation = "row";
    grpModel.add("statictext", undefined, "Model ID:");
    var txtModel = grpModel.add("edittext", undefined, "gemini-3-pro-image-preview");
    txtModel.preferredSize.width = 300;

    // Prompt
    win.add("statictext", undefined, "Prompt:");
    var txtPrompt = win.add("edittext", undefined, "A cute banana character, 3d render", { multiline: true });
    txtPrompt.preferredSize.height = 60;

    // Buttons
    var grpBtns = win.add("group");
    grpBtns.orientation = "row";
    var btnTestConn = grpBtns.add("button", undefined, "Test Connection");
    var btnTestGen = grpBtns.add("button", undefined, "Test Image Gen");

    // Log Output
    win.add("statictext", undefined, "Logs:");
    var txtLog = win.add("edittext", undefined, "", { multiline: true, scrolling: true });
    txtLog.preferredSize.height = 200;
    txtLog.preferredSize.width = 400;

    function log(msg) {
        var time = new Date().toTimeString().split(' ')[0];
        txtLog.text = "[" + time + "] " + msg + "\r\n" + txtLog.text;
    }

    // --- Logic ---

    btnTestConn.onClick = function () {
        var apiKey = txtApiKey.text;
        if (!apiKey) {
            alert("Please enter API Key");
            return;
        }

        log("Testing connection...");

        var url = "https://api.gptgod.online/v1/models";

        var cmd = 'curl -X GET "' + url + '" -H "Authorization: Bearer ' + apiKey + '"';

        var response = runCurl(cmd);
        if (response) {
            try {
                var json = JSON.parse(response);
                if (json && (json.data || json.object === "list")) {
                    log("Connection Success! Found " + (json.data ? json.data.length : "some") + " models.");
                } else if (json && json.error) {
                    log("API Error: " + json.error.message);
                } else {
                    log("Unknown response: " + response.substring(0, 100));
                }
            } catch (e) {
                log("JSON Parse Error: " + e.message);
                log("Raw: " + response.substring(0, 200));
            }
        } else {
            log("Network request failed (empty response).");
        }
    };

    btnTestGen.onClick = function () {
        var apiKey = txtApiKey.text;
        var model = txtModel.text;
        var prompt = txtPrompt.text;

        if (!apiKey) { alert("Please enter API Key"); return; }
        if (!prompt) { alert("Please enter Prompt"); return; }

        log("Starting Image Gen Test...");

        var url = "https://api.gptgod.online/v1/chat/completions";

        // 根据参考代码添加指令
        var finalPrompt = prompt + "\n请生成 1 张图片。";

        var payload = {
            model: model,
            messages: [
                {
                    role: "user",
                    content: finalPrompt
                }
            ],
            stream: false,
            n: 1
        };

        var tempFolder = Folder.temp;
        var payloadFile = new File(tempFolder.fsName + "/gptgod_test_payload.json");
        payloadFile.encoding = "UTF-8";
        payloadFile.open("w");
        payloadFile.write(JSON.stringify(payload));
        payloadFile.close();

        var responseFile = new File(tempFolder.fsName + "/gptgod_test_response.json");
        if (responseFile.exists) responseFile.remove();

        var cmd = 'curl -X POST "' + url + '"';
        cmd += ' -H "Content-Type: application/json"';
        cmd += ' -H "Authorization: Bearer ' + apiKey + '"';
        cmd += ' -d "@' + payloadFile.fsName + '"';
        cmd += ' -o "' + responseFile.fsName + '"';

        log("Sending request...");
        app.system(cmd);

        if (responseFile.exists) {
            responseFile.open("r");
            var responseText = responseFile.read();
            responseFile.close();

            try {
                var json = JSON.parse(responseText);
                log("Response received.");

                var imageUrl = null;

                // 1. 检查直接的 image/images 字段
                if (json.image) imageUrl = json.image;
                else if (json.images && json.images.length > 0) imageUrl = json.images[0];

                // 2. 检查 choices 中的 content
                if (!imageUrl && json.choices && json.choices.length > 0) {
                    var content = json.choices[0].message.content;
                    log("Content: " + (typeof content === 'string' ? content.substring(0, 50) + "..." : "Object"));

                    if (typeof content === 'string') {
                        // 正则匹配 markdown 图片或 URL
                        var match = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
                        if (match) imageUrl = match[1];
                        else {
                            match = content.match(/(https?:\/\/[^\s]+\.(png|jpg|jpeg|webp|gif))/i);
                            if (match) imageUrl = match[1];
                        }
                    }
                }

                if (imageUrl) {
                    log("SUCCESS! Image URL found: " + imageUrl);
                } else {
                    log("Failed to find image URL in response.");
                    log("Full Response: " + responseText.substring(0, 500));
                }

            } catch (e) {
                log("JSON Parse Error: " + e.message);
                log("Raw: " + responseText.substring(0, 200));
            }
        } else {
            log("Request failed. No response file.");
        }
    };

    function runCurl(cmd) {
        var tempFolder = Folder.temp;
        var outFile = new File(tempFolder.fsName + "/curl_output.txt");
        if (outFile.exists) outFile.remove();
        cmd += ' -o "' + outFile.fsName + '"';

        app.system(cmd);

        if (outFile.exists) {
            outFile.open("r");
            var res = outFile.read();
            outFile.close();
            return res;
        }
        return null;
    }

    win.show();
}

showDialog();
