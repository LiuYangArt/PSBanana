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
    debugMode: false,
    useJpeg: false,
    jpegQuality: 8
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

    // ========================================================================
    // Layer Mode UI
    // ========================================================================
    var pnlMode = tabGenerate.add("panel", undefined, "Mode");
    pnlMode.orientation = "column";
    pnlMode.alignChildren = ["left", "top"];
    pnlMode.margins = 10;
    var radFile = pnlMode.add("radiobutton", undefined, "File Mode (Merge All)");
    var radLayer = pnlMode.add("radiobutton", undefined, "Layer Mode (Selected Layers)");
    radFile.value = true;

    // Layer Selection Panel
    var pnlLayers = tabGenerate.add("panel", undefined, "Layer Selection");
    pnlLayers.orientation = "column";
    pnlLayers.alignChildren = ["fill", "top"];
    pnlLayers.preferredSize.height = 200;
    pnlLayers.margins = 10;

    // Source Layer
    var grpSource = pnlLayers.add("group");
    grpSource.orientation = "row";
    grpSource.add("statictext", undefined, "Source Layer:");
    var dropSource = grpSource.add("dropdownlist", undefined, []);
    dropSource.preferredSize.width = 250;

    // Reference Layers
    pnlLayers.add("statictext", undefined, "Reference Layers (Ctrl/Cmd+Click to select multiple):");
    var listRef = pnlLayers.add("listbox", undefined, [], { multiselect: true });
    listRef.preferredSize.height = 100;
    listRef.preferredSize.width = 380;

    var btnRefresh = pnlLayers.add("button", undefined, "Refresh Layers");

    // Layer Logic Variables
    var allLayers = [];

    var loadLayers = function () {
        if (!app.documents.length) return;
        var doc = app.activeDocument;

        // Flatten layer list for dropdowns
        allLayers = [];
        traverseLayers(doc, function (layer) {
            allLayers.push(layer);
        });

        // Populate Source Dropdown
        dropSource.removeAll();
        listRef.removeAll();

        var sourceIndex = -1;
        var refIndices = [];
        var activeLayer = doc.activeLayer;

        for (var i = 0; i < allLayers.length; i++) {
            var layer = allLayers[i];
            var name = layer.name;

            dropSource.add("item", name);
            listRef.add("item", name);

            // Auto-select logic
            var lowerName = name.toLowerCase();

            // Source: Priority to "source", then active layer
            if (lowerName.indexOf("source") !== -1) {
                if (sourceIndex === -1 || allLayers[sourceIndex].name.toLowerCase().indexOf("source") === -1) {
                    sourceIndex = i;
                }
            }

            // Ref: Priority to "reference"
            if (lowerName.indexOf("reference") !== -1) {
                refIndices.push(i);
            }
        }

        // Fallback for Source: Active Layer
        if (sourceIndex === -1 && activeLayer) {
            for (var j = 0; j < allLayers.length; j++) {
                if (allLayers[j] == activeLayer) {
                    sourceIndex = j;
                    break;
                }
            }
        }
        if (sourceIndex === -1 && allLayers.length > 0) sourceIndex = 0;

        // Set Selections
        if (sourceIndex !== -1) dropSource.selection = sourceIndex;

        for (var k = 0; k < refIndices.length; k++) {
            listRef.items[refIndices[k]].selected = true;
        }
    };

    var updateUI = function () {
        var isLayer = radLayer.value;
        pnlLayers.enabled = isLayer;
        pnlLayers.visible = isLayer; // Hide if not active to save space? Or just disable.
        // Layout fix if visibility changes
        // win.layout.layout(true); 
    };

    btnRefresh.onClick = loadLayers;
    radLayer.onClick = updateUI;
    radFile.onClick = updateUI;

    // Initial Load
    loadLayers();
    updateUI();

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

    var chkDebug = tabSettings.add("checkbox", undefined, "Enable Debug Mode (Log prompts & keep temp images)");
    chkDebug.value = settings.debugMode === true;

    // JPEG Compression
    var grpJpeg = tabSettings.add("group");
    grpJpeg.orientation = "row";
    var chkJpeg = grpJpeg.add("checkbox", undefined, "Use JPEG Compression (Faster, No Alpha)");
    chkJpeg.value = settings.useJpeg === true;

    var grpQuality = tabSettings.add("group");
    grpQuality.orientation = "row";
    grpQuality.add("statictext", undefined, "JPEG Quality (0-12):");
    var txtQuality = grpQuality.add("edittext", undefined, settings.jpegQuality || 8);
    txtQuality.preferredSize.width = 50;

    // Toggle Quality input visibility based on Checkbox
    var updateQualityVisibility = function () {
        grpQuality.visible = chkJpeg.value;
    };
    chkJpeg.onClick = updateQualityVisibility;
    updateQualityVisibility();

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
        settings.useJpeg = chkJpeg.value;
        settings.jpegQuality = parseInt(txtQuality.text) || 8;
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
        settings.model = txtModel.text;
        settings.debugMode = chkDebug.value;
        settings.useJpeg = chkJpeg.value;
        settings.jpegQuality = parseInt(txtQuality.text) || 8;

        try {
            var generationOptions = {
                mode: radFile.value ? "file" : "layer",
                sourceLayer: null,
                refLayers: []
            };

            if (generationOptions.mode === "layer") {
                if (!dropSource.selection) {
                    alert("Please select a Source Layer.");
                    return;
                }
                generationOptions.sourceLayer = allLayers[dropSource.selection.index];

                var selRef = listRef.selection;
                if (selRef) {
                    if (selRef instanceof Array) {
                        for (var i = 0; i < selRef.length; i++) {
                            generationOptions.refLayers.push(allLayers[selRef[i].index]);
                        }
                    } else {
                        generationOptions.refLayers.push(allLayers[selRef.index]);
                    }
                }
            }

            processGeneration(settings, txtPrompt.text, generationOptions);
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

function processGeneration(settings, promptText, options) {
    var doc;
    try {
        doc = app.activeDocument;
    } catch (e) {
        alert("No active document found.");
        return;
    }

    // 1. Determine Output File Paths
    // Use getAppDataFolder() for consistency
    var appDataFolder = getAppDataFolder();
    var responseFile = new File(appDataFolder.fsName + "/ps_ai_response.json");
    var payloadFile = new File(appDataFolder.fsName + "/ps_ai_payload.json");
    var timestamp = new Date().getTime();
    var resultImageFile = new File(appDataFolder.fsName + "/ps_ai_result_" + timestamp + ".png");

    // Determine extension and mime type based on settings
    var ext = settings.useJpeg ? ".jpg" : ".png";
    var mimeType = settings.useJpeg ? "image/jpeg" : "image/png";

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

        var maskImageFile = new File(appDataFolder.fsName + "/ps_ai_mask" + ext);
        var sourceImageFile = new File(appDataFolder.fsName + "/ps_ai_source" + ext);
        var refImageFile = new File(appDataFolder.fsName + "/ps_ai_ref" + ext);

        var base64Mask = null;
        var base64Source = null;
        var base64Ref = null;

        // 1. Handle Mask (Common for both modes if selection exists)
        // Save history state to revert mask layer creation
        var savedState = doc.activeHistoryState;

        if (hasSelection(doc)) {
            createMaskLayer(doc);
            // Mask is always black and white, PNG is usually better/safer for masks to avoid artifacts, 
            // but if user wants speed, JPEG is fine too. However, masks rely on pure black/white.
            // JPEG artifacts might introduce noise. Let's stick to PNG for MASK if possible, 
            // OR ensure high quality JPEG. 
            // Actually, for the API, it just needs an image.
            // Let's use the user preference for consistency, but maybe force PNG for mask if issues arise.
            // For now: Use settings.
            exportImage(doc, maskImageFile, settings);
            // Wait, exportCurrentStateToPng exports the whole doc flattened. 
            // In createMaskLayer, we fill selection. We need to ensure ONLY mask is visible?
            // Actually createMaskLayer makes a new layer on top. 
            // exportCurrentStateToPng duplicates and flattens. So it will see the mask layer on top.
            // Correct.

            base64Mask = encodeFileToBase64(maskImageFile);

            // Revert to original state (removes mask layer, restores selection)
            doc.activeHistoryState = savedState;

            // Cleanup mask if not debug
            if (maskImageFile.exists && !settings.debugMode) maskImageFile.remove();
        }

        // 2. Handle Images based on Mode
        if (options && options.mode === "layer") {
            // --- Layer Mode ---

            // Export Source Layer
            exportLayers(doc, [options.sourceLayer], sourceImageFile, settings);
            if (sourceImageFile.exists) {
                base64Source = encodeFileToBase64(sourceImageFile);
                if (!settings.debugMode) sourceImageFile.remove();
            }

            // Export Reference Layers
            if (options.refLayers.length > 0) {
                exportLayers(doc, options.refLayers, refImageFile, settings);
                if (refImageFile.exists) {
                    base64Ref = encodeFileToBase64(refImageFile);
                    if (!settings.debugMode) refImageFile.remove();
                }
            }

            // Debug Alert for Layer Mode
            if (settings.debugMode) {
                var msg = "Debug Mode - Layer Export:\n";
                msg += "Source: " + options.sourceLayer.name + "\nPath: " + sourceImageFile.fsName + "\n";
                if (options.refLayers.length > 0) {
                    msg += "References (" + options.refLayers.length + "):\nPath: " + refImageFile.fsName + "\n";
                    for (var i = 0; i < options.refLayers.length; i++) msg += "- " + options.refLayers[i].name + "\n";
                }
                if (base64Mask) msg += "Mask: Yes\nPath: " + maskImageFile.fsName;
                alert(msg);
            }

        } else {
            // --- File Mode (Default) ---
            exportImage(doc, sourceImageFile, settings);
            base64Source = encodeFileToBase64(sourceImageFile);
            if (!settings.debugMode) sourceImageFile.remove();
        }


        // 4. Construct Payload
        var parts = [{ text: promptText }];

        // Add System Prompt for Selection if mask exists
        if (base64Mask) {
            parts[0].text = "System Instruction: The first image provided is a black and white mask. White areas represent the selection where edits should be applied. Black areas should remain unchanged. | 提供的第一张图片是一个黑白蒙版。白色区域表示应应用编辑的选区。黑色区域应保持不变。\n\nUser Prompt: " + promptText;
        }

        // Order: Mask -> Source -> Ref
        if (base64Mask) {
            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: base64Mask
                }
            });
        }

        if (base64Source) {
            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: base64Source
                }
            });
        }

        if (base64Ref) {
            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: base64Ref
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
// Helper: Export current selection or document to PNG (Not used in Text-to-Image but ready for Img2Img)
// DEPRECATED: Use exportImage instead
function exportCurrentStateToPng(file) {
    // Redirect to new function with default settings (PNG)
    exportImage(app.activeDocument, file, { useJpeg: false });
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

// ============================================================================
// Layer Export Helpers (from LayerTest.jsx)
// ============================================================================

function exportLayers(originalDoc, layersToKeep, file, settings) {
    var dup = originalDoc.duplicate();

    // Resize if too large (max 4096px) to match exportCurrentStateToPng
    var maxDim = 4096;
    if (dup.width.as("px") > maxDim || dup.height.as("px") > maxDim) {
        if (dup.width.as("px") > dup.height.as("px")) {
            dup.resizeImage(UnitValue(maxDim, "px"), undefined, undefined, ResampleMethod.BICUBIC);
        } else {
            dup.resizeImage(undefined, UnitValue(maxDim, "px"), undefined, ResampleMethod.BICUBIC);
        }
    }

    var keepNames = {};
    for (var i = 0; i < layersToKeep.length; i++) {
        keepNames[layersToKeep[i].name] = true;
    }

    // 1. Set Visibility
    var visibleCount = recurseSetVisibility(dup, keepNames);

    // 2. Merge or Save
    if (visibleCount > 0) {
        // Fix for "Merge Visible" error:
        // Only merge if there is more than 1 visible layer.
        if (visibleCount > 1) {
            try {
                dup.mergeVisibleLayers();
            } catch (e) {
                // Ignore merge errors if they happen (e.g. weird layer states)
                // The file will still save the visible state.
            }
        }

        saveImage(dup, file, settings);
    } else {
        // alert("Warning: No matching layers found to export for " + file.name);
        // Create a blank/transparent image if nothing selected? Or just fail?
        // For now, let's save whatever is there (likely empty/transparent)
        saveImage(dup, file, settings);
    }

    dup.close(SaveOptions.DONOTSAVECHANGES);
}

function recurseSetVisibility(parent, keepNames) {
    var visibleCount = 0;
    try {
        for (var i = 0; i < parent.layers.length; i++) {
            var layer = parent.layers[i];

            if (keepNames[layer.name]) {
                layer.visible = true;
                visibleCount++;
            } else {
                if (layer.typename == "LayerSet") {
                    if (containsKeepers(layer, keepNames)) {
                        layer.visible = true;
                        visibleCount += recurseSetVisibility(layer, keepNames);
                    } else {
                        layer.visible = false;
                    }
                } else {
                    layer.visible = false;
                }
            }
        }
    } catch (e) {
        // Ignore errors accessing layers
    }
    return visibleCount;
}

function containsKeepers(layer, keepNames) {
    if (keepNames[layer.name]) return true;
    if (layer.typename == "LayerSet") {
        for (var i = 0; i < layer.layers.length; i++) {
            if (containsKeepers(layer.layers[i], keepNames)) return true;
        }
    }
    return false;
}

function traverseLayers(parent, callback) {
    try {
        for (var i = 0; i < parent.layers.length; i++) {
            var layer = parent.layers[i];
            callback(layer);
            if (layer.typename == "LayerSet") {
                traverseLayers(layer, callback);
            }
        }
    } catch (e) { }
}

function saveImage(doc, file, settings) {
    if (settings && settings.useJpeg) {
        saveJpeg(doc, file, settings.jpegQuality);
    } else {
        savePng(doc, file);
    }
}

function savePng(doc, file) {
    var opts = new PNGSaveOptions();
    opts.compression = 9;
    doc.saveAs(file, opts, true, Extension.LOWERCASE);
}

function saveJpeg(doc, file, quality) {
    var opts = new JPEGSaveOptions();
    opts.quality = quality || 8;
    opts.formatOptions = FormatOptions.STANDARDBASELINE;
    opts.matte = MatteType.WHITE; // Flatten transparency to white
    doc.saveAs(file, opts, true, Extension.LOWERCASE);
}

// Replaces exportCurrentStateToPng
function exportImage(doc, file, settings) {
    var dup = doc.duplicate();

    // Resize if too large (max 4096px)
    var maxDim = 4096;
    if (dup.width.as("px") > maxDim || dup.height.as("px") > maxDim) {
        if (dup.width.as("px") > dup.height.as("px")) {
            dup.resizeImage(UnitValue(maxDim, "px"), undefined, undefined, ResampleMethod.BICUBIC);
        } else {
            dup.resizeImage(undefined, UnitValue(maxDim, "px"), undefined, ResampleMethod.BICUBIC);
        }
    }

    dup.flatten(); // JPEGs must be flattened usually, but saveAs handles it. Explicit flatten is safer for consistency.
    saveImage(dup, file, settings);
    dup.close(SaveOptions.DONOTSAVECHANGES);
}


// Run
showDialog();
