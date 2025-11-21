#target photoshop

// ============================================================================
// JSON Polyfill
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
}())

// ============================================================================
// Main UI
// ============================================================================

function showDialog() {
    var win = new Window("dialog", "Layer Test");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 16;

    // Mode Selection
    var pnlMode = win.add("panel", undefined, "Mode");
    pnlMode.orientation = "column";
    pnlMode.alignChildren = ["left", "top"];
    var radFile = pnlMode.add("radiobutton", undefined, "File Mode (Merge All)");
    var radLayer = pnlMode.add("radiobutton", undefined, "Layer Mode (Selected Layers)");
    radFile.value = true;

    // Layer Selection Panel
    var pnlLayers = win.add("panel", undefined, "Layer Selection");
    pnlLayers.orientation = "column";
    pnlLayers.alignChildren = ["fill", "top"];
    pnlLayers.preferredSize.width = 400;

    // Source Layer
    var grpSource = pnlLayers.add("group");
    grpSource.orientation = "row";
    grpSource.add("statictext", undefined, "Source Layer:");
    var dropSource = grpSource.add("dropdownlist", undefined, []);
    dropSource.preferredSize.width = 250;

    // Reference Layers
    pnlLayers.add("statictext", undefined, "Reference Layers (Ctrl/Cmd+Click to select multiple):");
    var listRef = pnlLayers.add("listbox", undefined, [], { multiselect: true });
    listRef.preferredSize.height = 150;
    listRef.preferredSize.width = 380;

    var btnRefresh = pnlLayers.add("button", undefined, "Refresh Layers");

    // Test Button
    var btnTest = win.add("button", undefined, "Test Export");
    btnTest.preferredSize.height = 40;

    // Close Button
    var btnClose = win.add("button", undefined, "Close");

    // ========================================================================
    // Logic
    // ========================================================================

    var allLayers = []; // Store layer objects

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
        // If still not found (e.g. active layer is background or hidden?), default to 0
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
    };

    // Events
    btnRefresh.onClick = loadLayers;
    radLayer.onClick = updateUI;
    radFile.onClick = updateUI;

    btnTest.onClick = function () {
        try {
            if (radFile.value) {
                runTestFileMode();
            } else {
                // Get selections
                if (!dropSource.selection) {
                    alert("Please select a Source Layer.");
                    return;
                }
                var sourceLayer = allLayers[dropSource.selection.index];

                var refLayers = [];
                var selRef = listRef.selection;
                if (selRef) {
                    // listbox.selection returns item or array of items
                    if (selRef instanceof Array) {
                        for (var i = 0; i < selRef.length; i++) {
                            refLayers.push(allLayers[selRef[i].index]);
                        }
                    } else {
                        refLayers.push(allLayers[selRef.index]);
                    }
                }

                runTestLayerMode(sourceLayer, refLayers);
            }
        } catch (e) {
            alert("Error: " + e.message + "\nLine: " + e.line);
        }
    };

    btnClose.onClick = function () {
        win.close();
    };

    // Initial Load
    loadLayers();
    updateUI();

    win.show();
}

// ============================================================================
// Core Logic
// ============================================================================

function runTestFileMode() {
    if (!app.documents.length) return;
    var doc = app.activeDocument;
    var tempFolder = Folder.temp;
    var timestamp = new Date().getTime();
    var sourceFile = new File(tempFolder.fsName + "/test_source_" + timestamp + ".png");

    exportDocument(doc, sourceFile);
    alert("File Mode Export Complete!\n\nSource: " + sourceFile.fsName);
}

function runTestLayerMode(sourceLayer, refLayers) {
    var doc = app.activeDocument;
    var tempFolder = Folder.temp;
    var timestamp = new Date().getTime();

    var sourceFile = new File(tempFolder.fsName + "/test_source_" + timestamp + ".png");
    var refFile = new File(tempFolder.fsName + "/test_ref_" + timestamp + ".png");

    var msg = "";

    // Export Source Layer
    exportLayers(doc, [sourceLayer], sourceFile);
    msg = "Layer Mode Export Complete!\n\nSource Layer: " + sourceLayer.name + "\nPath: " + sourceFile.fsName;

    // Export Reference Layers
    if (refLayers.length > 0) {
        exportLayers(doc, refLayers, refFile);
        msg += "\n\nReference Layers (" + refLayers.length + "): " + refFile.fsName;
        for (var j = 0; j < refLayers.length; j++) {
            msg += "\n - " + refLayers[j].name;
        }
    } else {
        msg += "\n\nNo Reference Layers selected.";
    }

    alert(msg);
}

// ============================================================================
// Helper Functions
// ============================================================================

function exportDocument(originalDoc, file) {
    var dup = originalDoc.duplicate();
    dup.flatten();
    savePng(dup, file);
    dup.close(SaveOptions.DONOTSAVECHANGES);
}

function exportLayers(originalDoc, layersToKeep, file) {
    var dup = originalDoc.duplicate();

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

        savePng(dup, file);
    } else {
        alert("Warning: No matching layers found to export for " + file.name);
    }

    dup.close(SaveOptions.DONOTSAVECHANGES);
}

function recurseSetVisibility(parent, keepNames) {
    var visibleCount = 0;
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

function savePng(doc, file) {
    var opts = new PNGSaveOptions();
    opts.compression = 9;
    doc.saveAs(file, opts, true, Extension.LOWERCASE);
}

function traverseLayers(parent, callback) {
    for (var i = 0; i < parent.layers.length; i++) {
        var layer = parent.layers[i];
        callback(layer);
        if (layer.typename == "LayerSet") {
            traverseLayers(layer, callback);
        }
    }
}

showDialog();
