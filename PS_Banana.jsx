#target photoshop

// Author: LiuYang
// Version: 1.0
// Description: PSBanana

// ============================================================================
// Script Folder Path (Must be set before any other code)
// ============================================================================
var SCRIPT_FOLDER = (function () {
    try {
        // Try to get the script file path
        var scriptFile = new File($.fileName);
        // Check if we're running from a temp location (VSCode extension)
        if (scriptFile.parent.fsName.indexOf("antigravity") !== -1 ||
            scriptFile.parent.fsName.indexOf("vscode") !== -1) {
            // We're running from VSCode extension, use a hardcoded path
            // This should be updated to match your actual script location
            return new Folder("e:/SF_ActiveDocs/PSBanana");
        }
        return scriptFile.parent;
    } catch (e) {
        // Fallback to a default location
        return new Folder("e:/SF_ActiveDocs/PSBanana");
    }
})();

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
var SETTINGS_FILE_NAME = "PS_Banana_Settings.json";
var PRESETS_FILE_NAME = "PS_Banana_Presets.json";
var PROVIDERS_FILE_NAME = "PS_Banana_Providers.json";

var defaultSettings = {
    provider: "Google Gemini",
    apiKey: "",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-flash-image",
    debugMode: false,
    useJpeg: true,
    jpegQuality: 8,
    maxSize: 1024,
    resolution: "1K",
    autoClose: false
};

var defaultPresets = [
    { name: "Enhance Details", prompt: "Enhance the details of this image, make it high resolution, 8k, realistic texture.", mode: "file" },
    { name: "Remove Background", prompt: "Remove the background, keep the subject only, white background.", mode: "file" }
];

var defaultProviders = [
    {
        name: "Google Gemini",
        apiKey: "",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        model: "gemini-2.5-flash-image"
    },
    {
        name: "Yunwu Gemini",
        apiKey: "",
        baseUrl: "https://yunwu.zeabur.app/v1beta",
        model: "gemini-3-pro-image-preview"
    },
    {
        name: "GPTGod NanoBanana Pro",
        apiKey: "",
        baseUrl: "https://api.gptgod.online/v1/chat/completions",
        model: "gemini-3-pro-image-preview"
    }
];

// ============================================================================
// Helper Functions
// ============================================================================

function getConfigFolder() {
    // Configuration files go in the script folder
    return SCRIPT_FOLDER;
}

function getTempFolder() {
    // Temporary files go in AppData\Local\PS_Banana
    var folder = new Folder(Folder.temp.parent.fsName + "/PS_Banana");
    if (!folder.exists) folder.create();
    return folder;
}

// Deprecated: kept for backward compatibility, redirects to config folder
function getAppDataFolder() {
    return getConfigFolder();
}

function loadJsonFile(fileName, defaultValue) {
    var file = new File(getConfigFolder().fsName + "/" + fileName);
    if (!file.exists) return defaultValue;
    file.encoding = "UTF-8";
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
    var file = new File(getConfigFolder().fsName + "/" + fileName);
    file.encoding = "UTF-8";
    file.open("w");
    file.write(JSON.stringify(data, null, 4));
    file.close();
}

function getLastGeneratedImages() {
    var tempFolder = getTempFolder();
    var payloadFile = new File(tempFolder.fullName + "/ps_ai_payload.json");

    if (!payloadFile.exists) {
        // Debug: check if temp folder exists
        // alert("Temp folder: " + tempFolder.fullName + "\nPayload file: " + payloadFile.fullName + "\nExists: " + payloadFile.exists);
        return null;
    }

    payloadFile.encoding = "UTF-8";
    payloadFile.open("r");
    var content = payloadFile.read();
    payloadFile.close();

    try {
        var payload = JSON.parse(content);
        var cached = {
            mask: null,
            source: null,
            ref: null
        };

        // Extract images from payload structure
        // 1. Gemini Structure
        if (payload.contents && payload.contents[0] && payload.contents[0].parts) {
            var parts = payload.contents[0].parts;
            var imgCount = 0;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].inline_data) {
                    imgCount++;
                    var textPart = parts[0].text;
                    if (textPart) {
                        if (textPart.indexOf("Image " + imgCount + " is a black and white selection mask") !== -1) {
                            cached.mask = parts[i].inline_data.data;
                        } else if (textPart.indexOf("Image " + imgCount + " is the Source Layer") !== -1) {
                            cached.source = parts[i].inline_data.data;
                        } else if (textPart.indexOf("Image " + imgCount + " is the Reference Layer") !== -1) {
                            cached.ref = parts[i].inline_data.data;
                        }
                    }
                }
            }
        }
        // 2. OpenAI / GPTGod Structure
        else if (payload.messages && payload.messages[0] && payload.messages[0].content) {
            var content = payload.messages[0].content;
            if (content instanceof Array) {
                var imgCount = 0;
                // Find the text prompt first to parse descriptions
                var textPrompt = "";
                for (var i = 0; i < content.length; i++) {
                    if (content[i].type === "text") {
                        textPrompt = content[i].text;
                        break;
                    }
                }

                for (var i = 0; i < content.length; i++) {
                    if (content[i].type === "image_url" && content[i].image_url && content[i].image_url.url) {
                        imgCount++;
                        var dataUrl = content[i].image_url.url;
                        var base64 = "";
                        if (dataUrl.indexOf("base64,") !== -1) {
                            base64 = dataUrl.split("base64,")[1];
                        } else {
                            continue; // Skip if not base64
                        }

                        // Match image type based on the text description
                        if (textPrompt.indexOf("[Attached Image " + imgCount + ": Mask]") !== -1) {
                            cached.mask = base64;
                        } else if (textPrompt.indexOf("[Attached Image " + imgCount + ": Source]") !== -1) {
                            cached.source = base64;
                        } else if (textPrompt.indexOf("[Attached Image " + imgCount + ": Reference]") !== -1) {
                            cached.ref = base64;
                        } else if (textPrompt.indexOf("[Attached Image: Input Image (Previous Result)]") !== -1) {
                            cached.source = base64; // Direct mode input
                        }
                    }
                }
            }
        }

        // If we found nothing, maybe it was a different payload structure?
        // For now, return what we found.
        if (!cached.mask && !cached.source && !cached.ref) {
            // alert("No images found in payload. Structure: " + (payload.contents ? "Gemini" : (payload.messages ? "OpenAI" : "Unknown")));
            return null;
        }

        return cached;

    } catch (e) {
        // alert("Error parsing payload: " + e.message);
        return null;
    }
}

// ============================================================================
// Main UI
// ============================================================================

function showDialog() {
    var settings = loadJsonFile(SETTINGS_FILE_NAME, defaultSettings);
    var presets = loadJsonFile(PRESETS_FILE_NAME, defaultPresets);
    var providers = loadJsonFile(PROVIDERS_FILE_NAME, defaultProviders);

    var win = new Window("dialog", "Photoshop Banana v1.0 by LiuYang");
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
    grpPresets.add("statictext", undefined, "Prompt Presets:");
    var dropPresets = grpPresets.add("dropdownlist", undefined, []);
    dropPresets.preferredSize.width = 200;

    // Populate presets
    for (var i = 0; i < presets.length; i++) {
        dropPresets.add("item", presets[i].name);
    }

    var btnAddPreset = grpPresets.add("button", undefined, "+");
    btnAddPreset.preferredSize.width = 30;
    var btnSavePreset = grpPresets.add("button", undefined, "Save");
    btnSavePreset.preferredSize.width = 50;
    var btnRenamePreset = grpPresets.add("button", undefined, "Rename");
    btnRenamePreset.preferredSize.width = 60;
    var btnDeletePreset = grpPresets.add("button", undefined, "Del");
    btnDeletePreset.preferredSize.width = 40;

    // Prompt Input
    tabGenerate.add("statictext", undefined, "Prompt:");
    var txtPrompt = tabGenerate.add("edittext", undefined, "", { multiline: true, scrolling: true });
    txtPrompt.preferredSize.height = 150;

    // Search Web Toggle
    var chkSearch = tabGenerate.add("checkbox", undefined, "Search Web (Grounding)");
    chkSearch.value = false;

    // Generate Button
    var grpGenButtons = tabGenerate.add("group");
    grpGenButtons.orientation = "row";
    var btnGenerate = grpGenButtons.add("button", undefined, "Generate Image");
    btnGenerate.preferredSize.height = 40;
    btnGenerate.preferredSize.width = 200;

    var btnRegenerate = grpGenButtons.add("button", undefined, "Regenerate");
    btnRegenerate.preferredSize.height = 40;
    btnRegenerate.preferredSize.width = 100;
    btnRegenerate.helpTip = "Reuse the last generated image content with new prompt/settings.";

    // ========================================================================
    // Layer Mode UI
    // ========================================================================
    var pnlMode = tabGenerate.add("panel", undefined, "Mode");
    pnlMode.orientation = "column";
    pnlMode.alignChildren = ["left", "top"];
    pnlMode.margins = 10;
    var radFile = pnlMode.add("radiobutton", undefined, "File Mode (Merge All)");
    var radLayer = pnlMode.add("radiobutton", undefined, "Layer Mode (Selected Layers)");
    var radDirect = pnlMode.add("radiobutton", undefined, "Direct Mode (Text To Image)");
    var chkUseLastResult = pnlMode.add("checkbox", undefined, "Use Last Result as Input");
    chkUseLastResult.visible = false; // Hidden by default, shown when Direct Mode is active
    radFile.value = true;

    // Layer Selection Panel
    var pnlLayers = tabGenerate.add("panel", undefined, "Layer Selection");
    pnlLayers.orientation = "column";
    pnlLayers.alignChildren = ["fill", "top"];
    pnlLayers.preferredSize.height = 300;
    pnlLayers.margins = 10;

    // Current Selection Display
    var grpSourceDisplay = pnlLayers.add("group");
    grpSourceDisplay.orientation = "row";
    grpSourceDisplay.add("statictext", undefined, "Source Layer:");
    var txtSourceSelection = grpSourceDisplay.add("statictext", undefined, "None");
    txtSourceSelection.preferredSize.width = 300;

    var grpRefDisplay = pnlLayers.add("group");
    grpRefDisplay.orientation = "row";
    grpRefDisplay.add("statictext", undefined, "Reference Layers:");
    var txtRefSelection = grpRefDisplay.add("statictext", undefined, "None");
    txtRefSelection.preferredSize.width = 300;

    // Layer List
    var listLayers = pnlLayers.add("listbox", undefined, [], { multiselect: true });
    listLayers.preferredSize.height = 150;
    listLayers.preferredSize.width = 400;

    // Action Buttons
    var grpLayerActions = pnlLayers.add("group");
    grpLayerActions.orientation = "row";
    var btnRefresh = grpLayerActions.add("button", undefined, "Refresh Layers");
    var btnSetSource = grpLayerActions.add("button", undefined, "Set Source Layers");
    var btnSetRef = grpLayerActions.add("button", undefined, "Set Ref Layers");

    // Layer Logic Variables
    var allLayers = []; // Flat list of layer objects corresponding to listbox items
    var selectedSourceLayers = [];
    var selectedRefLayers = [];

    var updateSelectionLabels = function () {
        if (selectedSourceLayers.length === 0) {
            txtSourceSelection.text = "None";
        } else {
            var names = [];
            for (var i = 0; i < selectedSourceLayers.length; i++) names.push(selectedSourceLayers[i].name);
            txtSourceSelection.text = names.join(", ");
        }

        if (selectedRefLayers.length === 0) {
            txtRefSelection.text = "None";
        } else {
            var names = [];
            for (var i = 0; i < selectedRefLayers.length; i++) names.push(selectedRefLayers[i].name);
            txtRefSelection.text = names.join(", ");
        }
    };

    var loadLayers = function () {
        if (!app.documents.length) return;
        var doc = app.activeDocument;

        allLayers = [];
        listLayers.removeAll();
        selectedSourceLayers = [];
        selectedRefLayers = [];

        // Recursive function to flatten layers and handle groups
        var scanLayers = function (parent, pathPrefix) {
            for (var i = 0; i < parent.layers.length; i++) {
                var layer = parent.layers[i];
                var currentName = pathPrefix + layer.name;

                // Check for Group Auto-detection
                if (layer.typename == "LayerSet") {
                    var lowerName = layer.name.toLowerCase();
                    if (lowerName === "source") {
                        // Add all children to source
                        var children = expandLayerSet(layer);
                        for (var j = 0; j < children.length; j++) selectedSourceLayers.push(children[j]);
                    } else if (lowerName === "reference") {
                        // Add all children to ref
                        var children = expandLayerSet(layer);
                        for (var k = 0; k < children.length; k++) selectedRefLayers.push(children[k]);
                    }

                    // Recurse
                    scanLayers(layer, currentName + " | ");
                } else {
                    // It's a layer, add to list
                    allLayers.push(layer);
                    listLayers.add("item", currentName);
                }
            }
        };

        scanLayers(doc, "");

        // Fallback: If no group detected, try to find by name in flattened list
        if (selectedSourceLayers.length === 0) {
            for (var i = 0; i < allLayers.length; i++) {
                if (allLayers[i].name.toLowerCase().indexOf("source") !== -1) {
                    selectedSourceLayers.push(allLayers[i]);
                    // Only take the first one found as primary source if not group? 
                    // Or all? Let's stick to "all layers named source" if no group found?
                    // Original logic was "last selected" or "priority". 
                    // Let's just pick the first one found for now to be safe, or all.
                    // User said: "No corresponding group... search by name".
                    // Let's add all matching "source" keyword.
                }
            }
        }
        // If still empty, maybe active layer?
        if (selectedSourceLayers.length === 0 && doc.activeLayer) {
            // Check if active layer is in our list (it might be a group, which we don't list directly)
            // If active layer is a LayerSet, we should probably expand it?
            // For simplicity, let's just leave it empty and let user select.
            // Or default to first layer.
            if (allLayers.length > 0) {
                // selectedSourceLayers.push(allLayers[0]); 
            }
        }

        if (selectedRefLayers.length === 0) {
            for (var i = 0; i < allLayers.length; i++) {
                if (allLayers[i].name.toLowerCase().indexOf("reference") !== -1) {
                    selectedRefLayers.push(allLayers[i]);
                }
            }
        }

        updateSelectionLabels();
    };

    var updateUI = function () {
        var isLayer = radLayer.value;
        pnlLayers.enabled = isLayer;
        pnlLayers.enabled = isLayer;
        pnlLayers.visible = isLayer;

        // Show/Hide "Use Last Result" based on Direct Mode
        chkUseLastResult.visible = radDirect.value;
    };

    btnRefresh.onClick = loadLayers;

    btnSetSource.onClick = function () {
        var sel = listLayers.selection;
        if (!sel) return;
        selectedSourceLayers = [];
        if (sel instanceof Array) {
            for (var i = 0; i < sel.length; i++) selectedSourceLayers.push(allLayers[sel[i].index]);
        } else {
            selectedSourceLayers.push(allLayers[sel.index]);
        }
        updateSelectionLabels();
    };

    btnSetRef.onClick = function () {
        var sel = listLayers.selection;
        if (!sel) return;
        selectedRefLayers = [];
        if (sel instanceof Array) {
            for (var i = 0; i < sel.length; i++) selectedRefLayers.push(allLayers[sel[i].index]);
        } else {
            selectedRefLayers.push(allLayers[sel.index]);
        }
        updateSelectionLabels();
    };

    radLayer.onClick = updateUI;
    radFile.onClick = updateUI;
    radDirect.onClick = updateUI;

    // Initial Load
    loadLayers();
    updateUI();

    // --- Tab 3: Utilities ---
    var tabUtilities = tabs.add("tab", undefined, "Utilities");
    tabUtilities.orientation = "column";
    tabUtilities.alignChildren = ["fill", "top"];
    tabUtilities.spacing = 10;
    tabUtilities.margins = 10;

    var pnlCanvas = tabUtilities.add("panel", undefined, "Canvas Tools");
    pnlCanvas.orientation = "column";
    pnlCanvas.alignChildren = ["left", "top"];
    pnlCanvas.margins = 10;

    pnlCanvas.add("statictext", undefined, "Nano Banana Pro Aspect Ratios:");
    pnlCanvas.add("statictext", undefined, "1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 5:4, 4:5, 21:9");

    var btnSmartResize = pnlCanvas.add("button", undefined, "Smart Resize Canvas");
    btnSmartResize.preferredSize.width = 200;
    btnSmartResize.helpTip = "Adjusts canvas to the nearest supported aspect ratio while keeping the long edge fixed.";

    btnSmartResize.onClick = function () {
        try {
            if (app.documents.length === 0) {
                alert("No active document.");
                return;
            }
            smartResizeCanvas(app.activeDocument);
        } catch (e) {
            alert("Error resizing canvas: " + e.message);
        }
    };

    var btnCreateGroups = pnlCanvas.add("button", undefined, "Create Source/Ref Groups");
    btnCreateGroups.preferredSize.width = 200;
    btnCreateGroups.helpTip = "Creates 'source' (Green) and 'reference' (Violet) groups if they don't exist.";

    btnCreateGroups.onClick = function () {
        try {
            if (app.documents.length === 0) {
                alert("No active document.");
                return;
            }
            createSourceRefGroups(app.activeDocument);
            alert("Groups checked/created successfully!");
            // Refresh layer list if on layer tab
            if (radLayer.value) loadLayers();
        } catch (e) {
            alert("Error creating groups: " + e.message);
        }
    };

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
    var dropProvider = grpProvider.add("dropdownlist", undefined, []);
    dropProvider.preferredSize.width = 200;

    var btnAddProvider = grpProvider.add("button", undefined, "+");
    btnAddProvider.preferredSize.width = 30;
    var btnSaveProvider = grpProvider.add("button", undefined, "Save");
    btnSaveProvider.preferredSize.width = 50;
    var btnDeleteProvider = grpProvider.add("button", undefined, "Del");
    btnDeleteProvider.preferredSize.width = 40;
    var btnTest = grpProvider.add("button", undefined, "Test Connection");
    btnTest.preferredSize.width = 120;

    // Populate Providers
    var populateProviders = function () {
        dropProvider.removeAll();
        for (var i = 0; i < providers.length; i++) {
            dropProvider.add("item", providers[i].name);
        }
        // Select active provider
        var selectedIndex = 0;
        for (var j = 0; j < providers.length; j++) {
            if (providers[j].name === settings.provider) {
                selectedIndex = j;
                break;
            }
        }
        if (dropProvider.items.length > 0) {
            dropProvider.selection = selectedIndex;
        }
    };
    populateProviders();

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

    var chkAutoClose = tabSettings.add("checkbox", undefined, "Auto Close Window After Generation");
    chkAutoClose.value = settings.autoClose === true;

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

    // Max Size (Input)
    var grpSize = tabSettings.add("group");
    grpSize.orientation = "row";
    grpSize.add("statictext", undefined, "Input Image Max Size (px):");
    var txtMaxSize = grpSize.add("edittext", undefined, settings.maxSize || 1024);
    txtMaxSize.preferredSize.width = 60;
    grpSize.add("statictext", undefined, "(Images for AI to process)");

    // Resolution (Output)
    var grpRes = tabSettings.add("group");
    grpRes.orientation = "row";
    grpRes.add("statictext", undefined, "Output Resolution:");
    var dropResolution = grpRes.add("dropdownlist", undefined, ["1K", "2K", "4K"]);
    dropResolution.selection = (settings.resolution === "2K") ? 1 : ((settings.resolution === "4K") ? 2 : 0);


    // Toggle Quality input visibility based on Checkbox
    var updateQualityVisibility = function () {
        grpQuality.visible = chkJpeg.value;
    };
    chkJpeg.onClick = updateQualityVisibility;
    updateQualityVisibility();

    var btnSaveSettings = tabSettings.add("button", undefined, "Save Settings");

    // Footer (Status Bar & Close Button)
    var grpFooter = win.add("group");
    grpFooter.orientation = "row";
    grpFooter.alignChildren = ["fill", "center"];
    grpFooter.alignment = ["fill", "bottom"];

    // Status Bar
    var pnlStatus = grpFooter.add("panel");
    pnlStatus.alignment = ["fill", "center"];
    pnlStatus.preferredSize.height = 30;
    var lblStatus = pnlStatus.add("statictext", undefined, "Ready");
    lblStatus.alignment = ["fill", "center"];

    // Close Button
    var btnClose = grpFooter.add("button", undefined, "Close");
    btnClose.preferredSize.width = 100;

    // ============================================================================
    // Event Listeners
    // ============================================================================

    // Preset Logic - Auto-load on selection
    dropPresets.onChange = function () {
        if (dropPresets.selection) {
            var idx = dropPresets.selection.index;
            txtPrompt.text = presets[idx].prompt;

            // Switch mode if present
            if (presets[idx].mode) {
                if (presets[idx].mode === "layer") {
                    radLayer.value = true;
                    radFile.value = false;
                    radDirect.value = false;
                } else if (presets[idx].mode === "direct") {
                    radDirect.value = true;
                    radFile.value = false;
                    radLayer.value = false;
                } else {
                    radFile.value = true;
                    radLayer.value = false;
                    radDirect.value = false;
                }
                updateUI(); // Refresh layer panel visibility
            }
        }
    };

    btnAddPreset.onClick = function () {
        var name = prompt("Enter preset name:", "New Preset");
        if (name) {
            var currentMode = radLayer.value ? "layer" : (radDirect.value ? "direct" : "file");
            presets.push({ name: name, prompt: txtPrompt.text, mode: currentMode });
            saveJsonFile(PRESETS_FILE_NAME, presets);
            dropPresets.add("item", name);
            dropPresets.selection = dropPresets.items.length - 1;
        }
    };

    btnSavePreset.onClick = function () {
        if (!dropPresets.selection) return;
        var idx = dropPresets.selection.index;

        presets[idx].prompt = txtPrompt.text;
        presets[idx].mode = radLayer.value ? "layer" : (radDirect.value ? "direct" : "file");

        saveJsonFile(PRESETS_FILE_NAME, presets);
        alert("Preset saved!");
    };

    btnRenamePreset.onClick = function () {
        if (!dropPresets.selection) return;
        var idx = dropPresets.selection.index;
        var oldName = presets[idx].name;

        var newName = prompt("Enter new name for preset:", oldName);
        if (newName && newName !== oldName) {
            presets[idx].name = newName;
            saveJsonFile(PRESETS_FILE_NAME, presets);

            // Update UI
            dropPresets.items[idx].text = newName;
            // dropPresets.selection = idx; // Selection should stay same
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
        if (!dropProvider.selection) return;
        var selectedName = dropProvider.selection.text;

        // Find provider config
        var providerConfig = null;
        for (var i = 0; i < providers.length; i++) {
            if (providers[i].name === selectedName) {
                providerConfig = providers[i];
                break;
            }
        }

        if (providerConfig) {
            txtApiKey.text = providerConfig.apiKey;
            txtBaseUrl.text = providerConfig.baseUrl;
            txtModel.text = providerConfig.model;
        }
    };

    btnAddProvider.onClick = function () {
        var name = prompt("Enter new provider name:", "New Provider");
        if (name) {
            // Check if exists
            for (var i = 0; i < providers.length; i++) {
                if (providers[i].name === name) {
                    alert("Provider name already exists!");
                    return;
                }
            }

            var newProvider = {
                name: name,
                apiKey: "",
                baseUrl: "",
                model: ""
            };
            providers.push(newProvider);
            saveJsonFile(PROVIDERS_FILE_NAME, providers);

            dropProvider.add("item", name);
            dropProvider.selection = dropProvider.items.length - 1;
            // Trigger change to clear fields for new provider? Or keep previous?
            // Let's clear them or set to empty
            txtApiKey.text = "";
            txtBaseUrl.text = "";
            txtModel.text = "";
        }
    };

    btnSaveProvider.onClick = function () {
        if (!dropProvider.selection) return;
        var idx = dropProvider.selection.index;

        // Update the provider object with current text fields
        providers[idx].apiKey = txtApiKey.text;
        providers[idx].baseUrl = txtBaseUrl.text;
        providers[idx].model = txtModel.text;

        saveJsonFile(PROVIDERS_FILE_NAME, providers);
        alert("Provider configuration saved!");
    };

    btnDeleteProvider.onClick = function () {
        if (!dropProvider.selection) return;
        if (providers.length <= 1) {
            alert("Cannot delete the last provider.");
            return;
        }

        var confirm = Window.confirm("Are you sure you want to delete this provider?");
        if (!confirm) return;

        var idx = dropProvider.selection.index;
        providers.splice(idx, 1);
        saveJsonFile(PROVIDERS_FILE_NAME, providers);

        dropProvider.remove(idx);
        dropProvider.selection = 0;
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
        settings.maxSize = parseInt(txtMaxSize.text) || 1024;
        settings.resolution = dropResolution.selection.text;
        settings.autoClose = chkAutoClose.value;
        saveJsonFile(SETTINGS_FILE_NAME, settings);
        alert("Settings saved!");
    };

    btnClose.onClick = function () {
        win.close();
    };

    // Generate Logic
    btnGenerate.onClick = function () {
        handleGeneration(false);
    };

    btnRegenerate.onClick = function () {
        handleGeneration(true);
    };

    function handleGeneration(isRegenerate) {
        if (txtPrompt.text === "") {
            alert("Please enter a prompt.");
            return;
        }

        // Save settings temporarily to ensure we use latest
        settings.provider = dropProvider.selection.text;
        settings.apiKey = txtApiKey.text;
        settings.baseUrl = txtBaseUrl.text;
        settings.model = txtModel.text;
        settings.debugMode = chkDebug.value;
        settings.useJpeg = chkJpeg.value;
        settings.jpegQuality = parseInt(txtQuality.text) || 8;
        settings.maxSize = parseInt(txtMaxSize.text) || 1024;
        settings.autoClose = chkAutoClose.value;
        settings.resolution = dropResolution.selection.text; // Ensure resolution is updated

        try {
            var generationOptions = {
                mode: radDirect.value ? "direct" : (radFile.value ? "file" : "layer"),
                searchMode: chkSearch.value,
                useLastResult: chkUseLastResult.value,
                sourceLayers: [],
                refLayers: [],
                cachedImages: null
            };

            if (isRegenerate) {
                var cached = getLastGeneratedImages();
                if (!cached) {
                    alert("No previous generation data found (missing payload file). Please generate normally first.");
                    return;
                }
                generationOptions.cachedImages = cached;
                // Note: We trust the user that the mode is compatible or we just use the images as they are.
                // If we want to be strict, we could check cached.mode vs generationOptions.mode
            }

            if (generationOptions.mode === "layer" && !isRegenerate) {
                if (selectedSourceLayers.length === 0) {
                    alert("Please select at least one Source Layer.");
                    return;
                }
                generationOptions.sourceLayers = selectedSourceLayers;
                generationOptions.refLayers = selectedRefLayers;
            }

            processGeneration(settings, txtPrompt.text, generationOptions, lblStatus);

            // Auto-close if enabled
            if (settings.autoClose) {
                win.close();
            }
        } catch (e) {
            alert("Error: " + e.message);
        }
    }

    tabs.selection = 0;
    win.show();
}

// ============================================================================
// Core Logic
// ============================================================================

function processGeneration(settings, promptText, options, statusLabel) {
    var updateStatus = function (msg) {
        if (statusLabel) {
            statusLabel.text = msg;
            // Force UI update
            try {
                var win = statusLabel.window;
                if (win) win.update();
            } catch (e) { }
            app.refresh();
        }
    };

    updateStatus("Initializing...");
    var doc;
    try {
        doc = app.activeDocument;
    } catch (e) {
        alert("No active document found.");
        return;
    }

    // 1. Determine Output File Paths
    // Use getTempFolder() for temporary files
    var tempFolder = getTempFolder();

    // Clean up old result files from previous generations
    // Clean up old result files from previous generations
    // BUT if useLastResult is true, we need to find the LATEST one first
    var lastResultFile = null;
    var oldResults = tempFolder.getFiles("ps_ai_result_*.png");

    if (options && options.useLastResult && options.mode === "direct") {
        // Find the latest file
        if (oldResults && oldResults.length > 0) {
            // Sort by name (timestamp is in name) or modified date
            // Since name is ps_ai_result_TIMESTAMP.png, alphabetical sort works for finding latest if timestamp is fixed length, 
            // but timestamp length might vary slightly? Actually Date.getTime() is monotonic.
            // Let's sort by modified date to be safe.
            oldResults.sort(function (a, b) { return b.modified - a.modified; });
            lastResultFile = oldResults[0];
        }
    }

    if (oldResults) {
        for (var i = 0; i < oldResults.length; i++) {
            try {
                // If this is the file we want to keep, skip deletion
                if (lastResultFile && oldResults[i].fsName === lastResultFile.fsName) {
                    continue;
                }
                oldResults[i].remove();
            } catch (e) {
                // Ignore errors if file is locked or doesn't exist
            }
        }
    }

    var responseFile = new File(tempFolder.fsName + "/ps_ai_response.json");
    var payloadFile = new File(tempFolder.fsName + "/ps_ai_payload.json");
    var timestamp = new Date().getTime();
    var resultImageFile = new File(tempFolder.fsName + "/ps_ai_result_" + timestamp + ".png");

    // Determine extension and mime type based on settings
    var ext = settings.useJpeg ? ".jpg" : ".png";
    var mimeType = settings.useJpeg ? "image/jpeg" : "image/png";

    // 2. Construct Payload based on Provider
    var payload = {};
    var apiUrl = settings.baseUrl;
    var headers = [
        "Content-Type: application/json; charset=utf-8"
    ];


    if (settings.provider === "GPTGod NanoBanana Pro" || settings.baseUrl.indexOf("gptgod") !== -1) {
        // GPT God (OpenAI Compatible but returns URL)
        apiUrl = settings.baseUrl;
        headers.push("Authorization: Bearer " + settings.apiKey);

        // Prepare Images for Vision Model
        var messages = [];
        var userContent = [];

        // Add Text Prompt
        userContent.push({ type: "text", text: promptText });

        // Handle Images (Mask, Source, Ref)
        // Note: GPT God might expect standard OpenAI Vision format

        var maskImageFile = new File(tempFolder.fsName + "/ps_ai_mask" + ext);
        var sourceImageFile = new File(tempFolder.fsName + "/ps_ai_source" + ext);
        var refImageFile = new File(tempFolder.fsName + "/ps_ai_ref" + ext);

        var base64Mask = null;
        var base64Source = null;
        var base64Ref = null;

        // Check for Cached Images (Regenerate Mode)
        if (options && options.cachedImages) {
            updateStatus("Using cached images (Regenerate)...");
            base64Mask = options.cachedImages.mask;
            base64Source = options.cachedImages.source;
            base64Ref = options.cachedImages.ref;
        } else {
            // 1. Handle Mask
            var savedState = doc.activeHistoryState;
            if (hasSelection(doc)) {
                createMaskLayer(doc);
                updateStatus("Exporting mask...");
                exportImage(doc, maskImageFile, settings);
                base64Mask = encodeFileToBase64(maskImageFile);
                doc.activeHistoryState = savedState;
                if (maskImageFile.exists && !settings.debugMode) maskImageFile.remove();
            }

            // 2. Handle Images based on Mode
            if (options && options.mode === "layer") {
                // --- Layer Mode (Optimized Batch Export) ---
                var groupsToExport = [];
                if (options.sourceLayers.length > 0) groupsToExport.push({ name: "source", layers: options.sourceLayers, file: sourceImageFile });
                if (options.refLayers.length > 0) groupsToExport.push({ name: "ref", layers: options.refLayers, file: refImageFile });

                if (groupsToExport.length > 0) {
                    var originalRedraw = app.preferences.enableRedraw;
                    app.preferences.enableRedraw = false;
                    try {
                        updateStatus("Exporting layer groups...");
                        exportAllLayerGroups(doc, groupsToExport, settings);
                    } catch (e) {
                        alert("Export Error: " + e.message);
                    } finally {
                        app.preferences.enableRedraw = originalRedraw;
                    }

                    var exportedItems = [];
                    for (var i = 0; i < groupsToExport.length; i++) {
                        if (groupsToExport[i].file.exists) exportedItems.push({ name: groupsToExport[i].name, file: groupsToExport[i].file });
                    }

                    var batchResults = batchConvertFiles(exportedItems, settings);
                    for (var i = 0; i < batchResults.length; i++) {
                        var res = batchResults[i];
                        if (res.name === "source") base64Source = res.base64;
                        if (res.name === "ref") base64Ref = res.base64;
                    }
                    if (!settings.debugMode) {
                        if (sourceImageFile.exists) sourceImageFile.remove();
                        if (refImageFile.exists) refImageFile.remove();
                    }
                }
            } else if (options && options.mode === "direct") {
                // Direct Mode - No input image (unless mask?)
                // Add canvas size info to prompt
                var canvasWidth = Math.round(doc.width.as("px"));
                var canvasHeight = Math.round(doc.height.as("px"));
                userContent[0].text = "Generate an image with dimensions " + canvasWidth + "x" + canvasHeight + " pixels. " + promptText;

                if (options.useLastResult && lastResultFile && lastResultFile.exists) {
                    var base64Last = encodeFileToBase64(lastResultFile);
                    if (base64Last) {
                        userContent.push({
                            type: "image_url",
                            image_url: {
                                url: "data:image/png;base64," + base64Last
                            }
                        });
                        userContent[0].text += "\n[Attached Image: Input Image (Previous Result)]";
                    }
                }

            } else {
                // File Mode
                updateStatus("Exporting image...");
                exportImage(doc, sourceImageFile, settings);
                base64Source = encodeFileToBase64(sourceImageFile);
                if (!settings.debugMode) sourceImageFile.remove();
            }
        }

        // Add Images to Content
        if (base64Mask) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: "data:image/jpeg;base64," + base64Mask
                }
            });
            userContent[0].text += "\n[Attached Image 1: Mask]";
        }
        if (base64Source) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: "data:image/jpeg;base64," + base64Source
                }
            });
            userContent[0].text += "\n[Attached Image " + (base64Mask ? "2" : "1") + ": Source]";
        }
        if (base64Ref) {
            userContent.push({
                type: "image_url",
                image_url: {
                    url: "data:image/jpeg;base64," + base64Ref
                }
            });
            userContent[0].text += "\n[Attached Image " + (base64Mask ? (base64Source ? "3" : "2") : (base64Source ? "2" : "1")) + ": Reference]";
        }

        payload = {
            model: settings.model,
            messages: [
                {
                    role: "user",
                    content: userContent
                }
            ],
            stream: false
        };

    } else {
        // Gemini API (Default for Google Gemini, Yunwu Gemini, and Custom)
        // Supports Images and Masks
        apiUrl = settings.baseUrl + "/models/" + settings.model + ":generateContent?key=" + settings.apiKey;

        var maskImageFile = new File(tempFolder.fsName + "/ps_ai_mask" + ext);
        var sourceImageFile = new File(tempFolder.fsName + "/ps_ai_source" + ext);
        var refImageFile = new File(tempFolder.fsName + "/ps_ai_ref" + ext);

        var base64Mask = null;
        var base64Source = null;
        var base64Ref = null;

        // Check for Cached Images (Regenerate Mode)
        if (options && options.cachedImages) {
            updateStatus("Using cached images (Regenerate)...");
            base64Mask = options.cachedImages.mask;
            base64Source = options.cachedImages.source;
            base64Ref = options.cachedImages.ref;
        } else {
            // 1. Handle Mask (Common for both modes if selection exists)
            // Save history state to revert mask layer creation
            var savedState = doc.activeHistoryState;

            if (hasSelection(doc)) {
                createMaskLayer(doc);
                updateStatus("Exporting mask...");
                exportImage(doc, maskImageFile, settings);
                base64Mask = encodeFileToBase64(maskImageFile);

                // Revert to original state (removes mask layer, restores selection)
                doc.activeHistoryState = savedState;

                // Cleanup mask if not debug
                if (maskImageFile.exists && !settings.debugMode) maskImageFile.remove();
            }

            // 2. Handle Images based on Mode
            if (options && options.mode === "layer") {
                // --- Layer Mode (Optimized Batch Export) ---

                var groupsToExport = [];

                // Prepare Source Group
                if (options.sourceLayers.length > 0) {
                    groupsToExport.push({ name: "source", layers: options.sourceLayers, file: sourceImageFile });
                }

                // Prepare Reference Group
                if (options.refLayers.length > 0) {
                    groupsToExport.push({ name: "ref", layers: options.refLayers, file: refImageFile });
                }

                if (groupsToExport.length > 0) {
                    // 1. Batch Export (Single Temp Doc)
                    // Disable Redraw for Speed
                    var originalRedraw = app.preferences.enableRedraw;
                    app.preferences.enableRedraw = false;

                    try {
                        updateStatus("Exporting layer groups...");
                        exportAllLayerGroups(doc, groupsToExport, settings);
                    } catch (e) {
                        alert("Export Error: " + e.message);
                    } finally {
                        app.preferences.enableRedraw = originalRedraw;
                    }

                    // 2. Batch Convert (Single PowerShell Call)
                    var exportedItems = [];
                    for (var i = 0; i < groupsToExport.length; i++) {
                        if (groupsToExport[i].file.exists) {
                            exportedItems.push({ name: groupsToExport[i].name, file: groupsToExport[i].file });
                        }
                    }

                    var batchResults = batchConvertFiles(exportedItems, settings);

                    // 3. Map Results
                    for (var i = 0; i < batchResults.length; i++) {
                        var res = batchResults[i];
                        if (res.name === "source") base64Source = res.base64;
                        if (res.name === "ref") base64Ref = res.base64;
                    }

                    // Cleanup
                    if (!settings.debugMode) {
                        if (sourceImageFile.exists) sourceImageFile.remove();
                        if (refImageFile.exists) refImageFile.remove();
                    }
                }

                // Debug Alert for Layer Mode
                if (settings.debugMode) {
                    var msg = "Debug Mode - Layer Export:\n";
                    msg += "Source (" + options.sourceLayers.length + "):\nPath: " + sourceImageFile.fsName + "\n";
                    for (var i = 0; i < options.sourceLayers.length; i++) msg += "- " + options.sourceLayers[i].name + "\n";

                    if (options.refLayers.length > 0) {
                        msg += "References (" + options.refLayers.length + "):\nPath: " + refImageFile.fsName + "\n";
                        for (var i = 0; i < options.refLayers.length; i++) msg += "- " + options.refLayers[i].name + "\n";
                    }
                    if (base64Mask) msg += "Mask: Yes\nPath: " + maskImageFile.fsName;
                    alert(msg);
                }

            } else if (options && options.mode === "direct") {
                // --- Direct Mode ---
                // No layer export, only prompt with canvas dimensions
                // Mask is still supported if selection exists

                if (settings.debugMode) {
                    var msg = "Debug Mode - Direct Mode:\n";
                    msg += "Canvas Size: " + doc.width.as("px") + "x" + doc.height.as("px") + " px\n";
                    if (base64Mask) msg += "Mask: Yes\nPath: " + maskImageFile.fsName + "\n";
                    else msg += "Mask: No\n";

                    if (options.useLastResult && lastResultFile && lastResultFile.exists) {
                        msg += "Using Last Result: Yes\nPath: " + lastResultFile.fsName;
                        base64Source = encodeFileToBase64(lastResultFile); // Reuse base64Source variable for simplicity in payload construction
                    } else {
                        msg += "Using Last Result: No";
                    }

                    alert(msg);
                } else {
                    // Non-debug mode logic for Last Result
                    if (options.useLastResult && lastResultFile && lastResultFile.exists) {
                        base64Source = encodeFileToBase64(lastResultFile);
                    }
                }

            } else {
                // --- File Mode (Default) ---
                updateStatus("Exporting image...");
                exportImage(doc, sourceImageFile, settings);
                base64Source = encodeFileToBase64(sourceImageFile);
                if (!settings.debugMode) sourceImageFile.remove();
            }
        }



        // 4. Construct Payload
        var parts = [{ text: promptText }];

        // Add canvas dimensions for Direct Mode
        if (options && options.mode === "direct") {
            var canvasWidth = Math.round(doc.width.as("px"));
            var canvasHeight = Math.round(doc.height.as("px"));
            parts[0].text = "Generate an image with dimensions " + canvasWidth + "x" + canvasHeight + " pixels. " + promptText;

            if (options.useLastResult && base64Source) {
                parts[0].text += "\n[Attached Image is the Input Image (Previous Result)]";
            }
        }

        // Add System Prompt to identify images
        var systemInstructions = [];
        var imgCount = 0;

        if (base64Mask) {
            imgCount++;
            systemInstructions.push("Image " + imgCount + " is a black and white selection mask (White=Edit, Black=Keep).");
        }

        if (base64Source) {
            imgCount++;
            systemInstructions.push("Image " + imgCount + " is the Source Layer (the content to be modified).");
        }

        if (base64Ref) {
            imgCount++;
            systemInstructions.push("Image " + imgCount + " is the Reference Layer (use this for style/content reference).");
        }

        if (systemInstructions.length > 0) {
            var sysPrompt = "System Instruction: " + systemInstructions.join(" ") + "\n";
            parts[0].text = sysPrompt + "\nUser Prompt: " + parts[0].text;
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

        // Add Search Tool if enabled
        if (options && options.searchMode) {
            payload.tools = [
                { "google_search": {} }
            ];
        }

        // Calculate Aspect Ratio
        var width = doc.width.as("px");
        var height = doc.height.as("px");
        var currentRatio = width / height;
        var ratios = [
            { name: "1:1", value: 1.0 },
            { name: "16:9", value: 16 / 9 },
            { name: "9:16", value: 9 / 16 },
            { name: "4:3", value: 4 / 3 },
            { name: "3:4", value: 3 / 4 },
            { name: "3:2", value: 3 / 2 },
            { name: "2:3", value: 2 / 3 },
            { name: "5:4", value: 5 / 4 },
            { name: "4:5", value: 4 / 5 },
            { name: "21:9", value: 21 / 9 }
        ];
        var bestRatio = ratios[0];
        var minDiff = Math.abs(currentRatio - bestRatio.value);
        for (var r = 1; r < ratios.length; r++) {
            var diff = Math.abs(currentRatio - ratios[r].value);
            if (diff < minDiff) {
                minDiff = diff;
                bestRatio = ratios[r];
            }
        }
        var aspectRatioStr = bestRatio.name;

        // Add Resolution and Aspect Ratio to Payload

        // Google Gemini Native
        if (!payload.generationConfig) payload.generationConfig = {};
        payload.generationConfig.responseModalities = ["image"];
        payload.generationConfig.image_config = {
            aspect_ratio: aspectRatioStr,
            image_size: settings.resolution
        };

        // Final Payload Structure Check
        if (!payload.contents) {

            // I can just modify `payload` here.
        }

    }

    // 3. Write Payload to File
    payloadFile.encoding = "UTF-8";
    payloadFile.open("w");
    payloadFile.write(JSON.stringify(payload));
    payloadFile.close();

    // 4. Construct cURL Command with Performance Optimizations
    var curlCmd = 'curl -X POST "' + apiUrl + '"';

    // Add headers
    for (var i = 0; i < headers.length; i++) {
        curlCmd += ' -H "' + headers[i] + '"';
    }

    // Performance optimizations:
    curlCmd += ' --compressed';      // Enable gzip/deflate compression
    curlCmd += ' --tcp-nodelay';     // Disable Nagle's algorithm for lower latency
    curlCmd += ' --no-buffer';       // Disable output buffering
    curlCmd += ' --keepalive-time 60'; // Keep connection alive
    curlCmd += ' --max-time 300';    // Set 5 min timeout (prevent hanging)
    curlCmd += ' --connect-timeout 30'; // Connection timeout 30s

    // Data and output
    curlCmd += ' -d "@' + payloadFile.fsName + '"';
    curlCmd += ' -o "' + responseFile.fsName + '"';

    // 5. Execute
    updateStatus("Sending request to AI provider... (Please wait)");
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
        updateStatus("Error: API call failed.");
        alert("API call failed. No response file created.");
        return;
    }

    responseFile.encoding = "UTF-8";
    responseFile.open("r");
    var responseText = responseFile.read();
    responseFile.close();

    if (responseText === "") {
        updateStatus("Error: Empty response.");
        alert("API returned an empty response.");
        return;
    }

    // alert("Response size: " + responseText.length);

    var response;
    updateStatus("Processing response...");
    try {
        response = JSON.parse(responseText);
        // alert("JSON Parsed successfully.");
    } catch (e) {
        var shownText = responseText.length > 500 ? responseText.substring(0, 500) + "..." : responseText;
        alert("Failed to parse API response. The server returned:\n\n" + shownText);
        return;
    }

    // 7. Extract Image Data (Base64 or URL)
    var b64Data = null;
    var imageUrl = null;

    // Check for URL (GPT God / OpenAI URL mode)
    if (response.image) imageUrl = response.image;
    else if (response.images && response.images.length > 0) imageUrl = response.images[0];
    else if (response.data && response.data.length > 0 && response.data[0].url) imageUrl = response.data[0].url;

    // Check for URL in content (Markdown)
    if (!imageUrl && response.choices && response.choices.length > 0) {
        var content = response.choices[0].message.content;
        if (typeof content === 'string') {
            var match = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
            if (match) imageUrl = match[1];
            else {
                match = content.match(/(https?:\/\/[^\s]+\.(png|jpg|jpeg|webp|gif))/i);
                if (match) imageUrl = match[1];
            }
        }
    }

    // If URL found, download it
    if (imageUrl) {
        if (settings.debugMode) alert("Image URL found: " + imageUrl);
        try {
            updateStatus("Downloading image...");
            downloadImage(imageUrl, resultImageFile);
            // If download successful, we don't need b64Data, we just proceed to import
            if (resultImageFile.exists && resultImageFile.length > 0) {
                // Skip b64 decoding step
            } else {
                alert("Failed to download image from URL.");
                return;
            }
        } catch (e) {
            alert("Download Error: " + e.message);
            return;
        }
    } else {
        // Try Gemini structure first (candidates)
        if (response.candidates && response.candidates.length > 0) {
            var parts = response.candidates[0].content.parts;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i].inlineData && parts[i].inlineData.data) {
                    b64Data = parts[i].inlineData.data;
                    break;
                } else if (parts[i].text) {
                    // Check if text contains base64 image (Markdown or raw)
                    var txt = parts[i].text;

                    // Look for data URI pattern
                    var dataIdx = txt.indexOf("data:image");
                    if (dataIdx !== -1) {
                        var commaIdx = txt.indexOf(",", dataIdx);
                        if (commaIdx !== -1) {
                            var rawB64 = txt.substring(commaIdx + 1);
                            // If inside markdown ![...](...), it ends with )
                            var endIdx = rawB64.indexOf(")");
                            if (endIdx !== -1) {
                                b64Data = rawB64.substring(0, endIdx);
                            } else {
                                b64Data = rawB64;
                            }
                            // Clean whitespace
                            b64Data = b64Data.replace(/\s/g, "");
                            break;
                        }
                    } else if (txt.length > 1000 && txt.indexOf("{") === -1) {
                        // Assume raw base64 if long and doesn't look like JSON
                        b64Data = txt.replace(/\s/g, "");
                        break;
                    }
                }
            }
        }

        // If not found, try OpenAI structure (data[0].b64_json)
        if (!b64Data && response.data && response.data.length > 0 && response.data[0].b64_json) {
            b64Data = response.data[0].b64_json;
        }

        if (!b64Data) {
            if (response.error) {
                updateStatus("Error: " + (response.error.message || "API Error"));
                alert("API Error:\nCode: " + (response.error.code || "Unknown") + "\nMessage: " + response.error.message);
            } else {
                alert("Unexpected Response (No image found):\n" + JSON.stringify(response, null, 2));
            }
            return;
        }

        // DEBUG: Check Base64 Data
        if (settings.debugMode) {
            alert("Base64 Data Extracted. Length: " + b64Data.length);
        }

        // 8. Save Base64 to PNG
        try {
            if (settings.debugMode) {
                alert("Saving result image to: " + resultImageFile.fsName);
            }
            updateStatus("Decoding image...");
            saveBase64ToPng(b64Data, resultImageFile);
        } catch (e) {
            alert("Failed to decode/save image: " + e.message);
            return;
        }
    }

    // 9. Import to Photoshop
    if (resultImageFile.exists) {
        if (resultImageFile.length > 0) {
            try {
                if (settings.debugMode) {
                    alert("Placing image... Size: " + resultImageFile.length);
                }
                updateStatus("Importing to Photoshop...");
                placeImage(doc, resultImageFile);
                updateStatus("Done!");
                app.refresh(); // Force UI update

                // Keep the file for debugging - will be cleaned up on next generation
                if (settings.debugMode) {
                    alert("Image placed successfully. Result file kept at: " + resultImageFile.fsName);
                }
            } catch (e) {
                alert("Failed to place image into Photoshop: " + e.message);
            }
        } else {
            alert("Result image file is empty (0 bytes). Decode failed?");
        }
    } else {
        alert("Failed to save result image (File not found after decode).");
    }
}

// Helper: Save Base64 string to PNG file using PowerShell (More robust for large files)
function saveBase64ToPng(b64String, outputFile) {
    if (outputFile.exists) outputFile.remove();
    var tempB64File = new File(Folder.temp.fsName + "/ps_ai_temp.b64");
    var errorFile = new File(Folder.temp.fsName + "/ps_ai_error.txt");
    if (errorFile.exists) errorFile.remove();

    // Write raw base64 to file
    tempB64File.open("w");
    tempB64File.write(b64String);
    tempB64File.close();

    // PowerShell command to decode
    // We use a temporary script file to avoid command line length limits
    var psScriptFile = new File(Folder.temp.fsName + "/ps_ai_decode.ps1");
    psScriptFile.open("w");

    // Escape paths for PowerShell (replace backslashes with double backslashes or use single quotes)
    // Using single quotes is safer for paths in PS
    var b64Path = tempB64File.fsName;
    var outPath = outputFile.fsName;
    var errPath = errorFile.fsName;

    var scriptContent = "try {\n";
    scriptContent += "    $b64 = [System.IO.File]::ReadAllText('" + b64Path + "');\n";
    scriptContent += "    $bytes = [System.Convert]::FromBase64String($b64);\n";
    scriptContent += "    [System.IO.File]::WriteAllBytes('" + outPath + "', $bytes);\n";
    scriptContent += "} catch {\n";
    scriptContent += "    Set-Content -Path '" + errPath + "' -Value $_.Exception.Message;\n";
    scriptContent += "    exit 1;\n";
    scriptContent += "}";

    psScriptFile.write(scriptContent);
    psScriptFile.close();

    var cmd = 'powershell -NoProfile -ExecutionPolicy Bypass -File "' + psScriptFile.fsName + '"';
    app.system(cmd);

    // Cleanup
    if (tempB64File.exists) tempB64File.remove();
    if (psScriptFile.exists) psScriptFile.remove();

    // Check for errors
    if (errorFile.exists) {
        errorFile.open("r");
        var err = errorFile.read();
        errorFile.close();
        errorFile.remove();
        throw new Error("PowerShell Decode Error: " + err);
    }

    if (!outputFile.exists) {
        throw new Error("PowerShell Decode Failed: Output file not created (Unknown Error).");
    }
}

// Helper: Encode file to Base64 string using certutil (Windows)
function encodeFileToBase64(inputFile) {
    var tempFolder = getTempFolder();
    var tempB64File = new File(tempFolder.fsName + "/temp_encode_" + new Date().getTime() + ".b64");
    var psScriptFile = new File(tempFolder.fsName + "/temp_encode_script.ps1");

    var scriptContent = "$b64 = [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes('" + inputFile.fsName + "'));\n";
    scriptContent += "[System.IO.File]::WriteAllText('" + tempB64File.fsName + "', $b64);";

    psScriptFile.open("w");
    psScriptFile.write(scriptContent);
    psScriptFile.close();

    var cmd = 'powershell -NoProfile -ExecutionPolicy Bypass -File "' + psScriptFile.fsName + '"';
    app.system(cmd);

    if (!tempB64File.exists) {
        return null;
    }

    // Read the entire file at once
    tempB64File.open("r");
    var b64Data = tempB64File.read();
    tempB64File.close();

    // Cleanup
    tempB64File.remove();
    psScriptFile.remove();

    return b64Data;
}

// Helper: Download image from URL
function downloadImage(url, outputFile) {
    if (outputFile.exists) outputFile.remove();

    // Use curl to download
    // -L to follow redirects
    var cmd = 'curl -L "' + url + '" -o "' + outputFile.fsName + '"';

    app.system(cmd);

    if (!outputFile.exists) {
        throw new Error("Download failed: Output file not created.");
    }
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
        var newLayer = doc.activeLayer;

        // Move to top of document (outside groups)
        try {
            newLayer.move(doc, ElementPlacement.PLACEATBEGINNING);
        } catch (e) {
            // Ignore if already at top or move fails (e.g. background layer issues)
        }

        // Rename
        newLayer.name = getNextBananaLayerName(doc);

    } catch (e) {
        alert("Failed to paste image: " + e.message);
    }
}

function getNextBananaLayerName(doc) {
    var prefix = "BananaImage ";
    var maxNum = 0;

    function checkLayer(layer) {
        if (layer.name.indexOf(prefix) === 0) {
            var numStr = layer.name.substring(prefix.length);
            var num = parseInt(numStr, 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    }

    // Scan top level layers
    for (var i = 0; i < doc.layers.length; i++) {
        checkLayer(doc.layers[i]);
    }

    // Also scan inside groups if needed? 
    // The user said "BananaImage + 序号", usually unique across the doc or at least top level.
    // Let's do a deep scan to be safe, or just top level?
    // User screenshot shows "BananaImage 01" at top level. 
    // Let's stick to a simple scan of all layers to ensure uniqueness.

    traverseLayers(doc, checkLayer);

    var nextNum = maxNum + 1;
    var nextNumStr = nextNum < 10 ? "0" + nextNum : "" + nextNum;
    return prefix + nextNumStr;
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
    } else if (settings.provider === "GPTGod NanoBanana Pro" || settings.baseUrl.indexOf("gptgod") !== -1) {
        // GPT God
        // Base URL might be .../chat/completions, we want .../models
        apiUrl = settings.baseUrl;
        if (apiUrl.indexOf("/chat/completions") !== -1) {
            apiUrl = apiUrl.replace("/chat/completions", "/models");
        } else {
            // Fallback if they just put root v1
            if (apiUrl.slice(-1) !== "/") apiUrl += "/";
            apiUrl += "models";
        }
        headers.push("Authorization: Bearer " + settings.apiKey);
    } else {
        // Custom: We don't know the auth check endpoint.
        // Try a generic GET /models if they follow OpenAI standard, otherwise just return warning.
        if (settings.baseUrl.indexOf("v1") !== -1) {
            apiUrl = settings.baseUrl;
            // Attempt to strip chat/completions if present to find root
            apiUrl = apiUrl.replace("/chat/completions", "");
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

// Helper: Resize document if it exceeds max size
function resizeDocIfNeeded(doc, maxSize) {
    maxSize = maxSize || 1024;
    if (doc.width.as("px") > maxSize || doc.height.as("px") > maxSize) {
        if (doc.width.as("px") > doc.height.as("px")) {
            doc.resizeImage(UnitValue(maxSize, "px"), undefined, undefined, ResampleMethod.BICUBIC);
        } else {
            doc.resizeImage(undefined, UnitValue(maxSize, "px"), undefined, ResampleMethod.BICUBIC);
        }
    }
}

function exportAllLayerGroups(originalDoc, groupsToExport, settings) {
    // Single Temp Doc Strategy
    var tempDoc = app.documents.add(
        originalDoc.width,
        originalDoc.height,
        originalDoc.resolution,
        "PS_AI_Export_Temp",
        NewDocumentMode.RGB,
        DocumentFill.TRANSPARENT
    );

    var emptyState = tempDoc.activeHistoryState;

    for (var g = 0; g < groupsToExport.length; g++) {
        var layers = groupsToExport[g].layers;
        var outFile = groupsToExport[g].file;

        if (!layers || layers.length === 0) continue;

        // Switch to original doc to duplicate layers
        app.activeDocument = originalDoc;

        // Duplicate layers to temp doc (only visible layers)
        for (var i = 0; i < layers.length; i++) {
            try {
                // Skip invisible layers
                if (layers[i].visible) {
                    layers[i].duplicate(tempDoc, ElementPlacement.PLACEATEND);
                }
            } catch (e) { }
        }

        // Switch to temp doc
        app.activeDocument = tempDoc;

        if (tempDoc.layers.length === 0) {
            tempDoc.artLayers.add();
        }

        tempDoc.flatten();
        resizeDocIfNeeded(tempDoc, settings.maxSize);
        saveImage(tempDoc, outFile, settings);

        // Revert
        tempDoc.activeHistoryState = emptyState;
    }

    tempDoc.close(SaveOptions.DONOTSAVECHANGES);
    app.activeDocument = originalDoc;
}

function batchConvertFiles(fileList, settings) {
    if (fileList.length === 0) return [];

    var startTime = new Date().getTime();
    var tempFolder = getTempFolder();
    var psScriptFile = new File(tempFolder.fsName + "/batch_convert.ps1");

    // Construct PowerShell Script
    var scriptContent = "$files = @(\n";
    for (var i = 0; i < fileList.length; i++) {
        var safePath = fileList[i].file.fsName.replace(/\\/g, "\\\\");
        scriptContent += "    '" + safePath + "'";
        if (i < fileList.length - 1) scriptContent += ",";
        scriptContent += "\n";
    }
    scriptContent += ");\n\n";

    scriptContent += "foreach ($f in $files) {\n";
    scriptContent += "    if (Test-Path $f) {\n";
    scriptContent += "        $b64 = [System.Convert]::ToBase64String([System.IO.File]::ReadAllBytes($f));\n";
    scriptContent += "        [System.IO.File]::WriteAllText($f + '.b64', $b64);\n";
    scriptContent += "    }\n";
    scriptContent += "}\n";

    psScriptFile.open("w");
    psScriptFile.write(scriptContent);
    psScriptFile.close();

    // Execute Single PowerShell Command
    var cmd = 'powershell -NoProfile -ExecutionPolicy Bypass -File "' + psScriptFile.fsName + '"';
    app.system(cmd);

    // Read Results
    var results = [];
    for (var i = 0; i < fileList.length; i++) {
        var item = fileList[i];
        var b64File = new File(item.file.fsName + ".b64");
        if (b64File.exists) {
            b64File.open("r");
            var b64 = b64File.read();
            b64File.close();
            b64File.remove();
            results.push({ name: item.name, file: item.file, base64: b64 });
        }
    }

    psScriptFile.remove();

    if (settings.debugMode) {
        var duration = new Date().getTime() - startTime;
        alert("Batch Base64 conversion took " + duration + "ms");
    }

    return results;
}

function expandLayerSet(layerSet) {
    var layers = [];
    try {
        for (var i = 0; i < layerSet.layers.length; i++) {
            var layer = layerSet.layers[i];
            if (layer.typename == "LayerSet") {
                var children = expandLayerSet(layer);
                for (var j = 0; j < children.length; j++) {
                    layers.push(children[j]);
                }
            } else {
                layers.push(layer);
            }
        }
    } catch (e) { }
    return layers;
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

    // Resize if too large
    resizeDocIfNeeded(dup, settings.maxSize);

    dup.flatten(); // JPEGs must be flattened usually, but saveAs handles it. Explicit flatten is safer for consistency.
    saveImage(dup, file, settings);
    dup.close(SaveOptions.DONOTSAVECHANGES);
}


// Helper: Smart Resize Canvas
function smartResizeCanvas(doc) {
    var width = doc.width.as("px");
    var height = doc.height.as("px");
    var currentRatio = width / height;

    // Supported Ratios
    var ratios = [
        { name: "1:1", value: 1.0 },
        { name: "16:9", value: 16 / 9 },
        { name: "9:16", value: 9 / 16 },
        { name: "4:3", value: 4 / 3 },
        { name: "3:4", value: 3 / 4 },
        { name: "3:2", value: 3 / 2 },
        { name: "2:3", value: 2 / 3 },
        { name: "5:4", value: 5 / 4 },
        { name: "4:5", value: 4 / 5 },
        { name: "21:9", value: 21 / 9 }
    ];

    // Find closest ratio
    var bestRatio = ratios[0];
    var minDiff = Math.abs(currentRatio - bestRatio.value);

    for (var i = 1; i < ratios.length; i++) {
        var diff = Math.abs(currentRatio - ratios[i].value);
        if (diff < minDiff) {
            minDiff = diff;
            bestRatio = ratios[i];
        }
    }

    // Calculate new dimensions
    // Rule: Keep long edge, adjust short edge
    var newWidth, newHeight;

    if (bestRatio.value >= 1) {
        // Target is Landscape or Square
        if (width >= height) {
            // Current is Landscape/Square -> Keep Width (Long), Adjust Height
            // But wait, if current is 1000x500 (2:1), target 16:9 (1.77).
            // If we keep width 1000, height = 1000 / 1.77 = 565.
            // If we keep height 500, width = 500 * 1.77 = 885.
            // "Keep long edge" usually means maximize the canvas within the constraints or fit to it?
            // User said: "Keep long side, adjust short side".
            // So if Width is Long, NewWidth = Width. NewHeight = Width / TargetRatio.
            newWidth = width;
            newHeight = width / bestRatio.value;
        } else {
            // Current is Portrait (Width < Height), but Target is Landscape (Ratio >= 1)?
            // This case implies a drastic change, but let's follow the rule "Keep long side".
            // Long side is Height.
            // But Target Ratio is W/H.
            // If we keep Height (Long), NewWidth = Height * TargetRatio.
            newWidth = height * bestRatio.value;
            newHeight = height;
        }
    } else {
        // Target is Portrait (Ratio < 1)
        if (height >= width) {
            // Current is Portrait/Square -> Keep Height (Long), Adjust Width
            newHeight = height;
            newWidth = height * bestRatio.value;
        } else {
            // Current is Landscape (Width > Height), but Target is Portrait?
            // Long side is Width.
            // Keep Width. NewHeight = Width / TargetRatio.
            newWidth = width;
            newHeight = width / bestRatio.value;
        }
    }

    // Round to integers
    newWidth = Math.round(newWidth);
    newHeight = Math.round(newHeight);

    // Resize Canvas
    doc.resizeCanvas(UnitValue(newWidth, "px"), UnitValue(newHeight, "px"), AnchorPosition.MIDDLECENTER);
    alert("Resized to " + bestRatio.name + " (" + newWidth + "x" + newHeight + " px)");
}


// Run
showDialog();
// Helper: Create Source and Reference Groups with Colors
function createSourceRefGroups(doc) {
    var sourceGroup = null;
    var refGroup = null;

    // Check existing top-level layers
    for (var i = 0; i < doc.layers.length; i++) {
        var layer = doc.layers[i];
        if (layer.typename == "LayerSet") {
            if (layer.name.toLowerCase() === "source") sourceGroup = layer;
            if (layer.name.toLowerCase() === "reference") refGroup = layer;
        }
    }

    // Create Source if missing
    if (!sourceGroup) {
        sourceGroup = doc.layerSets.add();
        sourceGroup.name = "source";
        // Move to top? Or just leave where created (usually top)
    }
    // Set Color to Green
    setLayerColor(sourceGroup, "Green");

    // Create Reference if missing
    if (!refGroup) {
        refGroup = doc.layerSets.add();
        refGroup.name = "reference";
    }
    // Set Color to Violet
    setLayerColor(refGroup, "Violet");
}

function setLayerColor(layer, colorName) {
    try {
        // Select the layer first
        var doc = app.activeDocument;
        doc.activeLayer = layer;

        var colorCode = "None";
        switch (colorName.toLowerCase()) {
            case "red": colorCode = "Rd  "; break;
            case "orange": colorCode = "Orng"; break;
            case "yellow": colorCode = "Ylw "; break;
            case "green": colorCode = "Grn "; break;
            case "blue": colorCode = "Bl  "; break;
            case "violet": colorCode = "Vlt "; break;
            case "gray": colorCode = "Gry "; break;
            case "none": colorCode = "None"; break;
            default: return; // Unknown color
        }

        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("null"), ref);
        var desc2 = new ActionDescriptor();
        desc2.putEnumerated(charIDToTypeID("Clr "), charIDToTypeID("Clr "), charIDToTypeID(colorCode));
        desc.putObject(charIDToTypeID("T   "), charIDToTypeID("Lyr "), desc2);
        executeAction(charIDToTypeID("setd"), desc, DialogModes.NO);
    } catch (e) {
        alert("Error setting layer color (" + colorName + "): " + e.message);
    }
}
