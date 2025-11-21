#target photoshop

// ============================================================================
// JSON Polyfill (Required for ExtendScript)
// ============================================================================
if (typeof JSON !== 'object') {
    JSON = {};
}
(function () {
    'use strict';
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) ? '"' + string.replace(rx_escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap, partial, value = holder[key];
        if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case 'string': return quote(value);
            case 'number': return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null': return String(value);
            case 'object':
                if (!value) return 'null';
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }
    var gap, indent, rep;
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', { '': value });
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            rx_lastIndex = 0;
            if (rx_one.test(text.replace(rx_two, '@').replace(rx_three, ']').replace(rx_four, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function' ? walk({ '': j }, '') : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
    var rx_lastIndex = 0;
}());

// ============================================================================
// ============================================================================
// Global Variables & Settings
// ============================================================================
var SETTINGS_FILE_NAME = "PS_AI_Plugin_Settings.json";
var PRESETS_FILE_NAME = "PS_AI_Plugin_Presets.json";

var defaultSettings = {
    provider: "Google Gemini",
    apiKey: "",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-flash-image",
    debugMode: false
};

var defaultPresets = [
    { name: "Enhance Details", prompt: "Enhance the details of this image, make it high resolution, 8k, realistic texture." },
    { name: "Remove Background", prompt: "Remove the background, keep the subject only, white background." }
];

// ============================================================================
// Helper Functions
// ============================================================================

function getAppDataFolder() {
    var folder = new Folder(Folder.userData.fsName + "/PS_AI_Plugin");
    if (!folder.exists) folder.create();
    return folder;
}

function loadJsonFile(fileName, defaultValue) {
    var file = new File(getAppDataFolder().fsName + "/" + fileName);
    if (!file.exists) return defaultValue;
    file.open("r");
    var content = file.read();
    file.close();
    try {
        return JSON.parse(content);
    } catch (e) {
        return defaultValue;
    }
}

function saveJsonFile(fileName, data) {
    var file = new File(getAppDataFolder().fsName + "/" + fileName);
    file.open("w");
    file.write(JSON.stringify(data, null, 4));
    file.close();
}

// ============================================================================
// Main UI
// ============================================================================

function showDialog() {
    var settings = loadJsonFile(SETTINGS_FILE_NAME, defaultSettings);
    var presets = loadJsonFile(PRESETS_FILE_NAME, defaultPresets);

    var win = new Window("dialog", "Photoshop Banana");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 16;

    var tabs = win.add("tabbedpanel");
    tabs.alignChildren = ["fill", "fill"];
    tabs.preferredSize = [500, 400];

    // --- Tab 1: Generate ---
    var tabGenerate = tabs.add("tab", undefined, "Generate");
    tabGenerate.orientation = "column";
    tabGenerate.alignChildren = ["fill", "top"];
    tabGenerate.spacing = 10;
    tabGenerate.margins = 10;

    // Presets Group
    var grpPresets = tabGenerate.add("group");
    grpPresets.orientation = "row";
    grpPresets.add("statictext", undefined, "Presets:");
    var dropPresets = grpPresets.add("dropdownlist", undefined, []);
    dropPresets.preferredSize.width = 250;

    // Populate presets
    for (var i = 0; i < presets.length; i++) {
        dropPresets.add("item", presets[i].name);
    }

    var btnLoadPreset = grpPresets.add("button", undefined, "Use");
    var btnSavePreset = grpPresets.add("button", undefined, "Save");
    var btnDeletePreset = grpPresets.add("button", undefined, "Del");

    // Prompt Input
    tabGenerate.add("statictext", undefined, "Prompt:");
    var txtPrompt = tabGenerate.add("edittext", undefined, "", { multiline: true, scrolling: true });
    txtPrompt.preferredSize.height = 150;

    // Generate Button
    var btnGenerate = tabGenerate.add("button", undefined, "Generate Image");
    btnGenerate.preferredSize.height = 40;

    // --- Tab 2: Settings ---
    var tabSettings = tabs.add("tab", undefined, "Settings");
    tabSettings.orientation = "column";
    tabSettings.alignChildren = ["fill", "top"];
    tabSettings.spacing = 10;
    tabSettings.margins = 10;

    // Provider
    var grpProvider = tabSettings.add("group");
    grpProvider.orientation = "row";
    grpProvider.add("statictext", undefined, "Provider:");
    var dropProvider = grpProvider.add("dropdownlist", undefined, ["Google Gemini", "OpenRouter", "Yunwu Gemini", "Custom"]);
    dropProvider.selection = 0; // Default
    // Set selection based on settings
    if (settings.provider === "Google Gemini") dropProvider.selection = 0;
    else if (settings.provider === "OpenRouter") dropProvider.selection = 1;
    else dropProvider.selection = 2;

    // API Key
    var grpKey = tabSettings.add("group");
    grpKey.orientation = "row";
    grpKey.add("statictext", undefined, "API Key:");
    var txtApiKey = grpKey.add("edittext", undefined, settings.apiKey);
    txtApiKey.preferredSize.width = 300;

    // Base URL
    var grpUrl = tabSettings.add("group");
    grpUrl.orientation = "row";
    grpUrl.add("statictext", undefined, "Base URL:");
    var txtBaseUrl = grpUrl.add("edittext", undefined, settings.baseUrl);
    txtBaseUrl.preferredSize.width = 300;

    // Model
    var grpModel = tabSettings.add("group");
    grpModel.orientation = "row";
    grpModel.add("statictext", undefined, "Model ID:");
    var txtModel = grpModel.add("edittext", undefined, settings.model);
    txtModel.preferredSize.width = 300;

    // Debug Mode
    var chkDebug = tabSettings.add("checkbox", undefined, "Enable Debug Mode (Log prompts & keep temp images)");
    chkDebug.value = settings.debugMode === true;

    var grpActions = tabSettings.add("group");
    grpActions.orientation = "row";
    var btnTest = grpActions.add("button", undefined, "Test Connection");
    var btnSaveSettings = grpActions.add("button", undefined, "Save Settings");

    // Footer (Close Button)
    var grpFooter = win.add("group");
    grpFooter.orientation = "row";
    grpFooter.alignChildren = ["right", "center"];
    grpFooter.alignment = ["fill", "bottom"];
    var btnClose = grpFooter.add("button", undefined, "Close");
    btnClose.preferredSize.width = 100;

    // ============================================================================
    // Event Listeners
    // ============================================================================

    // Preset Logic
    btnLoadPreset.onClick = function () {
        if (dropPresets.selection) {
            var idx = dropPresets.selection.index;
            txtPrompt.text = presets[idx].prompt;
        }
    };

    btnSavePreset.onClick = function () {
        var name = prompt("Enter preset name:", "New Preset");
        if (name) {
            presets.push({ name: name, prompt: txtPrompt.text });
            saveJsonFile(PRESETS_FILE_NAME, presets);
            dropPresets.add("item", name);
            dropPresets.selection = dropPresets.items.length - 1;
        }
    };

    btnDeletePreset.onClick = function () {
        if (dropPresets.selection) {
            var idx = dropPresets.selection.index;
            presets.splice(idx, 1);
            saveJsonFile(PRESETS_FILE_NAME, presets);
            dropPresets.remove(idx);
            dropPresets.selection = null;
        }
    };

    // Settings Logic
    dropProvider.onChange = function () {
        var p = dropProvider.selection.text;
        if (p === "Google Gemini") {
            txtBaseUrl.text = "https://generativelanguage.googleapis.com/v1beta";
            txtModel.text = "gemini-2.5-flash-image";
        } else if (p === "OpenRouter") {
            txtBaseUrl.text = "https://openrouter.ai/api/v1";
            txtModel.text = "google/gemini-pro-vision";
        } else if (p === "Custom") {
            txtBaseUrl.text = "https://yunwu.zeabur.app/v1beta";
            txtModel.text = "gemini-3-pro-image-preview";
            if (txtApiKey.text === "") txtApiKey.text = "sk-";
        }
    };

    btnTest.onClick = function () {
        var testSettings = {
            provider: dropProvider.selection.text,
            apiKey: txtApiKey.text,
            baseUrl: txtBaseUrl.text,
            model: txtModel.text
        };

        try {
            var result = testApiConnection(testSettings);
            if (result.success) {
                alert("Success! Connection verified.\n" + result.message);
            } else {
                alert("Connection Failed:\n" + result.message);
            }
        } catch (e) {
            alert("Error during test: " + e.message);
        }
    };

    btnSaveSettings.onClick = function () {
        settings.provider = dropProvider.selection.text;
        settings.apiKey = txtApiKey.text;
        settings.baseUrl = txtBaseUrl.text;
        settings.baseUrl = txtBaseUrl.text;
        settings.model = txtModel.text;
        settings.debugMode = chkDebug.value;
        saveJsonFile(SETTINGS_FILE_NAME, settings);
        alert("Settings saved!");
    };

    btnClose.onClick = function () {
        win.close();
    };

    // Generate Logic
    btnGenerate.onClick = function () {
        if (txtPrompt.text === "") {
            alert("Please enter a prompt.");
            return;
        }

        // Save settings temporarily to ensure we use latest
        settings.provider = dropProvider.selection.text;
        settings.apiKey = txtApiKey.text;
        settings.baseUrl = txtBaseUrl.text;
        settings.baseUrl = txtBaseUrl.text;
        settings.model = txtModel.text;
        settings.debugMode = chkDebug.value;

        try {
            processGeneration(settings, txtPrompt.text);
            // win.close(); // Prevent auto-close
        } catch (e) {
            alert("Error: " + e.message);
        }
    };

    tabs.selection = 0;
    win.show();
}

// ============================================================================
// Core Logic
// ============================================================================

function processGeneration(settings, promptText) {
    var doc;
    try {
        doc = app.activeDocument;
    } catch (e) {
        alert("No active document found.");
        return;
    }

    // 1. Determine Output File Paths
    var tempFolder = Folder.temp;
    var responseFile = new File(tempFolder.fsName + "/ps_ai_response.json");
    var payloadFile = new File(tempFolder.fsName + "/ps_ai_payload.json");
    var timestamp = new Date().getTime();
    var resultImageFile = new File(tempFolder.fsName + "/ps_ai_result_" + timestamp + ".png");

    // 2. Construct Payload based on Provider
    var payload = {};
    var apiUrl = settings.baseUrl;
    var headers = [
        "Content-Type: application/json; charset=utf-8"
    ];

    if (settings.provider === "Google Gemini") {
        // Gemini API (generateContent)
        apiUrl = settings.baseUrl + "/models/" + settings.model + ":generateContent?key=" + settings.apiKey;

        payload = {
            contents: [{
                parts: [{
                    text: promptText
                }]
            }]
        };

    } else if (settings.provider === "Yunwu Gemini") {
        // Yunwu Gemini (Gemini 2.5 Flash Image)
        apiUrl = settings.baseUrl + "/models/" + settings.model + ":generateContent?key=" + settings.apiKey;

        // 1. Export current document to temp PNG
        var inputImageFile = new File(tempFolder.fsName + "/ps_ai_input.png");
        var maskImageFile = new File(tempFolder.fsName + "/ps_ai_mask.png");
        var base64Mask = null;
        var base64Image = null;

        // Save history state to revert mask layer creation
        var savedState = doc.activeHistoryState;

        // Check for Selection and Create Mask
        if (hasSelection(doc)) {
            createMaskLayer(doc);
            exportCurrentStateToPng(maskImageFile);
            base64Mask = encodeFileToBase64(maskImageFile);

            // Revert to original state (removes mask layer, restores selection)
            doc.activeHistoryState = savedState;

            // Cleanup mask if not debug
            if (maskImageFile.exists && !settings.debugMode) maskImageFile.remove();
        }

        // Export Input Image (Clean state)
        exportCurrentStateToPng(inputImageFile);
        base64Image = encodeFileToBase64(inputImageFile);

        // Cleanup input image
        if (inputImageFile.exists && !settings.debugMode) inputImageFile.remove();

        // 4. Construct Payload
        var parts = [{ text: promptText }];

        // Add System Prompt for Selection if mask exists
        if (base64Mask) {
            // Prepend instruction to prompt or use system_instruction if supported (Gemini 1.5+ supports it, sticking to prompt for safety)
            parts[0].text = "System Instruction: The second image provided is a black and white mask. White areas represent the selection where edits should be applied. Black areas should remain unchanged. | 提供的第二张图片是一个黑白蒙版。白色区域表示应应用编辑的选区。黑色区域应保持不变。\n\nUser Prompt: " + promptText;
        }

        if (base64Image) {
            parts.push({
                inline_data: {
                    mime_type: "image/png",
                    data: base64Image
                }
            });
        }

        if (base64Mask) {
            parts.push({
                inline_data: {
                    mime_type: "image/png",
                    data: base64Mask
                }
            });
        }

        payload = {
            contents: [{
                parts: parts
            }],
            generationConfig: {
                responseModalities: ["image"]
            }
        };

        // Cleanup input image (Already handled above)
        // if (inputImageFile.exists && !settings.debugMode) inputImageFile.remove(); 

    } else {
        // OpenRouter / OpenAI Compatible
        if (apiUrl.indexOf("/images/generations") === -1) {
            if (apiUrl.slice(-1) !== "/") apiUrl += "/";
            apiUrl += "images/generations";
        }

        headers.push("Authorization: Bearer " + settings.apiKey);
        headers.push("HTTP-Referer: https://github.com/antigravity/ps-plugin");
        headers.push("X-Title: Photoshop AI Plugin");

        payload = {
            prompt: promptText,
            model: settings.model,
            response_format: "b64_json",
            n: 1
        };
    }

    // 3. Write Payload to File
    payloadFile.encoding = "UTF-8";
    payloadFile.open("w");
    payloadFile.write(JSON.stringify(payload));
    payloadFile.close();

    // 4. Construct cURL Command
    var curlCmd = 'curl -X POST "' + apiUrl + '"';
    for (var i = 0; i < headers.length; i++) {
        curlCmd += ' -H "' + headers[i] + '"';
    }
    curlCmd += ' -d "@' + payloadFile.fsName + '"';
    curlCmd += ' -o "' + responseFile.fsName + '"';

    // 5. Execute
    app.system(curlCmd);

    // Debug Logging
    if (settings.debugMode) {
        var logFile = new File(getAppDataFolder().fsName + "/ps_ai_debug_log.txt");
        logFile.encoding = "UTF-8";
        logFile.open("a"); // Append mode
        var logMsg = "\n\n========================================\n";
        logMsg += "Timestamp: " + new Date().toString() + "\n";
        logMsg += "Original Doc Size: " + doc.width.as("px") + "x" + doc.height.as("px") + " px\n";
        logMsg += "Provider: " + settings.provider + "\n";
        logMsg += "Model: " + settings.model + "\n";
        logMsg += "API URL: " + apiUrl + "\n";
        logMsg += "Payload File: " + payloadFile.fsName + "\n";
        logMsg += "Response File: " + responseFile.fsName + "\n";
        logMsg += "Input Image: " + (typeof inputImageFile !== 'undefined' ? inputImageFile.fsName : "N/A") + "\n";
        logMsg += "Mask Image: " + (typeof maskImageFile !== 'undefined' ? maskImageFile.fsName : "N/A") + "\n";
        logMsg += "Payload Content:\n" + JSON.stringify(payload, null, 2) + "\n";
        logFile.write(logMsg);
        logFile.close();
    }

    // 6. Parse Response
    if (!responseFile.exists) {
        alert("API call failed. No response file created.");
        return;
    }

    responseFile.encoding = "UTF-8";
    responseFile.open("r");
    var responseText = responseFile.read();
    responseFile.close();

    var response;
    try {
        response = JSON.parse(responseText);
    } catch (e) {
        var shownText = responseText.length > 500 ? responseText.substring(0, 500) + "..." : responseText;
        alert("Failed to parse API response. The server returned:\n\n" + shownText);
        return;
    }

    // 7. Extract Image Data (Base64)
    var b64Data = null;

    if (settings.provider === "Google Gemini") {
        // Structure: candidates[0].content.parts[].inlineData.data
        if (response.candidates && response.candidates.length > 0) {
            var parts = response.candidates[0].content.parts;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].inlineData && parts[i].inlineData.data) {
                    b64Data = parts[i].inlineData.data;
                    break;
                }
            }
        }

        if (!b64Data) {
            if (response.error) {
                alert("Gemini API Error:\nCode: " + response.error.code + "\nMessage: " + response.error.message);
            } else {
                alert("Unexpected Gemini Response (No image found):\n" + JSON.stringify(response, null, 2));
            }
            return;
        }
    } else if (settings.provider === "Yunwu Gemini") {
        // Structure: candidates[0].content.parts[].inlineData.data
        // Same structure as Google Gemini for response
        if (response.candidates && response.candidates.length > 0) {
            var parts = response.candidates[0].content.parts;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].inlineData && parts[i].inlineData.data) {
                    b64Data = parts[i].inlineData.data;
                    break;
                }
            }
        }

        if (!b64Data) {
            if (response.error) {
                alert("Yunwu API Error:\nCode: " + response.error.code + "\nMessage: " + response.error.message);
            } else {
                alert("Unexpected Yunwu Response (No image found):\n" + JSON.stringify(response, null, 2));
            }
            return;
        }
    } else {
        if (response.data && response.data.length > 0 && response.data[0].b64_json) {
            b64Data = response.data[0].b64_json;
        } else if (response.error) {
            alert("API Error:\n" + response.error.message);
            return;
        } else {
            alert("Unexpected Response:\n" + JSON.stringify(response, null, 2));
            return;
        }
    }

    // 8. Save Base64 to PNG
    saveBase64ToPng(b64Data, resultImageFile);

    // 9. Import to Photoshop
    if (resultImageFile.exists) {
        placeImage(doc, resultImageFile);
        app.refresh(); // Force UI update
        if (!settings.debugMode) resultImageFile.remove(); // Cleanup
    } else {
        alert("Failed to save result image.");
    }
}

// Helper: Save Base64 string to PNG file using certutil (Windows)
function saveBase64ToPng(b64String, outputFile) {
    if (outputFile.exists) outputFile.remove();
    var tempB64File = new File(Folder.temp.fsName + "/ps_ai_temp.b64");

    tempB64File.open("w");
    tempB64File.write("-----BEGIN CERTIFICATE-----\n");
    tempB64File.write(b64String);
    tempB64File.write("\n-----END CERTIFICATE-----");
    tempB64File.close();

    var cmd = 'certutil -decode "' + tempB64File.fsName + '" "' + outputFile.fsName + '"';
    app.system(cmd);

    tempB64File.remove();
}

// Helper: Encode file to Base64 string using certutil (Windows)
function encodeFileToBase64(inputFile) {
    var tempB64File = new File(Folder.temp.fsName + "/ps_ai_temp_encode.b64");
    // certutil -f -encode input output (Force overwrite to prevent hang)
    var cmd = 'certutil -f -encode "' + inputFile.fsName + '" "' + tempB64File.fsName + '"';
    app.system(cmd);

    if (!tempB64File.exists) return null;

    tempB64File.open("r");
    var b64Data = "";
    // Read line by line to skip headers (-----BEGIN...)
    while (!tempB64File.eof) {
        var line = tempB64File.readln();
        if (line.indexOf("-----") === -1) {
            b64Data += line;
        }
    }
    tempB64File.close();
    tempB64File.remove();
    return b64Data;
}

// Helper: Place image into document
function placeImage(doc, file) {
    var targetWidth = doc.width;
    var targetHeight = doc.height;

    var newDoc = open(file);

    // Resize to match original document dimensions exactly
    newDoc.resizeImage(targetWidth, targetHeight, undefined, ResampleMethod.BICUBIC);

    newDoc.selection.selectAll();
    newDoc.selection.copy();
    newDoc.close(SaveOptions.DONOTSAVECHANGES);

    app.activeDocument = doc;

    try {
        doc.paste();
    } catch (e) {
        alert("Failed to paste image: " + e.message);
    }
}

// Helper: Check if there is an active selection
function hasSelection(doc) {
    try {
        doc.selection.bounds;
        return true;
    } catch (e) {
        return false;
    }
}

// Helper: Export current selection or document to PNG (Not used in Text-to-Image but ready for Img2Img)
function exportCurrentStateToPng(file) {
    var doc = app.activeDocument;
    var dup = doc.duplicate();

    // Resize if too large (max 2048px) to prevent massive payloads and freezing
    var maxDim = 4096;
    if (dup.width.as("px") > maxDim || dup.height.as("px") > maxDim) {
        if (dup.width.as("px") > dup.height.as("px")) {
            dup.resizeImage(UnitValue(maxDim, "px"), undefined, undefined, ResampleMethod.BICUBIC);
        } else {
            dup.resizeImage(undefined, UnitValue(maxDim, "px"), undefined, ResampleMethod.BICUBIC);
        }
    }

    dup.flatten();
    var opts = new PNGSaveOptions();
    opts.compression = 9;
    dup.saveAs(file, opts, true, Extension.LOWERCASE);
    dup.close(SaveOptions.DONOTSAVECHANGES);
}

function testApiConnection(settings) {
    var apiUrl = "";
    var headers = ["Content-Type: application/json"];
    var responseFile = new File(Folder.temp.fsName + "/ps_ai_api_test_response.json");
    if (responseFile.exists) responseFile.remove();

    if (settings.provider === "Google Gemini") {
        // Test by listing models or simple check
        apiUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" + settings.apiKey;
    } else if (settings.provider === "Yunwu Gemini") {
        // Test by listing models or simple check
        apiUrl = settings.baseUrl + "/models?key=" + settings.apiKey;
    } else if (settings.provider === "OpenRouter") {
        // OpenRouter Auth Check
        apiUrl = "https://openrouter.ai/api/v1/auth/key";
        headers.push("Authorization: Bearer " + settings.apiKey);
    } else {
        // Custom: We don't know the auth check endpoint.
        // Try a generic GET /models if they follow OpenAI standard, otherwise just return warning.
        if (settings.baseUrl.indexOf("v1") !== -1) {
            apiUrl = settings.baseUrl;
            if (apiUrl.slice(-1) !== "/") apiUrl += "/";
            apiUrl += "models";
        } else {
            return { success: true, message: "Custom provider: Cannot automatically test. Please verify manually." };
        }
        headers.push("Authorization: Bearer " + settings.apiKey);
    }

    var curlCmd = 'curl -X GET "' + apiUrl + '"';
    for (var i = 0; i < headers.length; i++) {
        curlCmd += ' -H "' + headers[i] + '"';
    }
    curlCmd += ' -o "' + responseFile.fsName + '"';

    app.system(curlCmd);

    if (!responseFile.exists) {
        return { success: false, message: "Network request failed. No response." };
    }

    responseFile.open("r");
    var responseText = responseFile.read();
    responseFile.close();

    try {
        var json = JSON.parse(responseText);

        if (settings.provider === "Google Gemini") {
            if (json.models) return { success: true, message: "Gemini API Key is valid." };
            if (json.error) return { success: false, message: json.error.message };
        } else if (settings.provider === "Yunwu Gemini") {
            if (json.models) return { success: true, message: "Yunwu Gemini API Key is valid." };
            if (json.error) return { success: false, message: json.error.message };
        } else if (settings.provider === "OpenRouter") {
            if (json.data && json.data.limit) return { success: true, message: "OpenRouter Key Valid. Limit: " + json.data.limit }; // auth/key returns usage info
            if (json.error) return { success: false, message: json.error.message };
            // Fallback if using models endpoint
            if (json.data) return { success: true, message: "OpenRouter/Custom API reachable." };
        } else {
            if (json.data || json.models) return { success: true, message: "Custom API reachable." };
            if (json.error) return { success: false, message: json.error.message };
        }

        return { success: false, message: "Unexpected response format:\n" + responseText.substring(0, 100) };
    } catch (e) {
        return { success: false, message: "Invalid JSON response:\n" + responseText.substring(0, 100) };
    }
}

function createMaskLayer(doc) {
    var layer = doc.artLayers.add();
    layer.name = "PS_AI_Mask_Temp";

    var white = new SolidColor();
    white.rgb.red = 255; white.rgb.green = 255; white.rgb.blue = 255;

    var black = new SolidColor();
    black.rgb.red = 0; black.rgb.green = 0; black.rgb.blue = 0;

    // Fill Selection with White
    doc.selection.fill(white);

    // Invert and Fill with Black
    doc.selection.invert();
    doc.selection.fill(black);

    // Deselect to show full mask
    doc.selection.deselect();
}


// Run
showDialog();
