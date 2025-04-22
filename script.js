document.addEventListener('DOMContentLoaded', () => {
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');
    const fileInput = document.getElementById('fileInput');

    // ----------------------------------------------------
    // Element References (Simple Fields)
    // ----------------------------------------------------\
    const elements = {
        name: document.getElementById('name'),
        author: document.getElementById('author'),
        configVersion: document.getElementById('configVersion'),

        cpuGovernorEnable: document.getElementById('cpuGovernorEnable'),
        cpu_maxRateHz: document.getElementById('cpu_maxRateHz'),
        cpu_minRateHz: document.getElementById('cpu_minRateHz'),
        cpu_activeDelay: document.getElementById('cpu_activeDelay'),
        cpu_freqStep: document.getElementById('cpu_freqStep'),

        threadSchedOptEnable: document.getElementById('threadSchedOptEnable'),
        defaultCpus: document.getElementById('defaultCpus'),

        gpuGovernorEnable: document.getElementById('gpuGovernorEnable'),
        gpu_baseRateHz: document.getElementById('gpu_baseRateHz'),
        gpu_burstRateHz: document.getElementById('gpu_burstRateHz'),
        volt_minVolt: document.getElementById('volt_minVolt'),
        volt_maxVolt: document.getElementById('volt_maxVolt'),
        volt_voltOffset: document.getElementById('volt_voltOffset'),

        devfreqTunerEnable: document.getElementById('devfreqTunerEnable'),

        thermalEnable: document.getElementById('thermalEnable'),
        thermal_interval: document.getElementById('thermal_interval'),
        thermal_actionDelay: document.getElementById('thermal_actionDelay'),
        thermal_matchRule: document.getElementById('thermal_matchRule'),

        triggerEnable: document.getElementById('triggerEnable')
    };

    // ----------------------------------------------------
    // JSON Editor Initialization
    // ----------------------------------------------------\
    const editorOptions = {
        mode: 'tree',
        modes: ['code', 'form', 'text', 'tree', 'view', 'preview'], // Allowed modes
        search: true,
        indentation: 4 // Use 4 spaces for indentation
    };

    let editors = {}; // Initialize empty
    try {
        // Ensure the container elements exist before creating editors
        const editorContainers = {
            cpuPolicies: document.getElementById('cpuPoliciesEditor'),
            cpuModes: document.getElementById('cpuModesEditor'),
            appTypes: document.getElementById('appTypesEditor'),
            schedRules: document.getElementById('schedRulesEditor'),
            gpuModes: document.getElementById('gpuModesEditor'),
            thermalModes: document.getElementById('thermalModesEditor'),
            scenes: document.getElementById('scenesEditor'),
            hints: document.getElementById('hintsEditor')
        };

        for (const key in editorContainers) {
            if (editorContainers[key]) {
                editors[key] = new JSONEditor(editorContainers[key], editorOptions);
            } else {
                console.warn(`Editor container #${key}Editor not found.`);
            }
        }

        // --- Initial Load (Optional: Load a default or empty state) ---
        Object.values(editors).forEach(editor => editor.set({})); // Set empty object to start
        console.log("JSON Editors initialized:", Object.keys(editors));

    } catch (error) {
        console.error("Error initializing JSON editors:", error);
        alert("初始化 JSON 编辑器时出错: " + error.message + "\n请确保 HTML 结构正确并且 jsoneditor 库已加载。");
    }

    // ----------------------------------------------------
    // Load Configuration Function
    // ----------------------------------------------------\
    function loadConfig(jsonData) {
        console.log("Loading configuration:", jsonData);
        try {
            // Load basic info
            elements.name.value = jsonData.name || '';
            elements.author.value = jsonData.author || '';
            elements.configVersion.value = jsonData.configVersion ?? 0;

            // --- Helper to safely set editor data ---
            const setEditorData = (editorKey, data, defaultData) => {
                if (editors[editorKey]) {
                    // Introduce a small delay to potentially help with complex data rendering
                    setTimeout(() => {
                        try {
                            editors[editorKey].set(data || defaultData);
                        } catch (e) {
                            console.error(`Error setting data for editor ${editorKey} after delay:`, e);
                            // Attempt to set default data again on error
                            try { 
                                editors[editorKey].set(defaultData);
                            } catch (e2) {
                                console.error(`Error setting default data for editor ${editorKey} after delay error:`, e2);
                            }
                        }
                    }, 10); // 10ms delay
                } else {
                     console.warn(`Editor ${editorKey} not initialized, cannot load data.`);
                }
            };

            // Load CPU Governor
            const cpuGovData = jsonData.CpuGovernor;
            elements.cpuGovernorEnable.checked = cpuGovData?.enable ?? false;
            if (cpuGovData?.params) {
                elements.cpu_maxRateHz.value = cpuGovData.params.maxRateHz ?? 0;
                elements.cpu_minRateHz.value = cpuGovData.params.minRateHz ?? 0;
                elements.cpu_activeDelay.value = cpuGovData.params.activeDelay ?? 0;
                elements.cpu_freqStep.value = cpuGovData.params.freqStep ?? 0;
            }
            setEditorData('cpuPolicies', cpuGovData?.policies, []);
            setEditorData('cpuModes', cpuGovData?.modes, {});

            // Load Thread Scheduling Optimization
            const threadSchedData = jsonData.ThreadSchedOpt;
            elements.threadSchedOptEnable.checked = threadSchedData?.enable ?? false;
            elements.defaultCpus.value = (threadSchedData?.defaultCpus || []).join(',');
            setEditorData('appTypes', threadSchedData?.appTypes, {});
            setEditorData('schedRules', threadSchedData?.schedRules, {});

            // Load GPU Governor
            const gpuGovData = jsonData.MtkGpuGovernor; // Corrected key
            elements.gpuGovernorEnable.checked = gpuGovData?.enable ?? false;
            if (gpuGovData?.params) {
                elements.gpu_baseRateHz.value = gpuGovData.params.baseRateHz ?? 0;
                elements.gpu_burstRateHz.value = gpuGovData.params.burstRateHz ?? 0;
            }
            if (gpuGovData?.voltAdjust) {
                elements.volt_minVolt.value = gpuGovData.voltAdjust.minVolt ?? 0;
                elements.volt_maxVolt.value = gpuGovData.voltAdjust.maxVolt ?? 0;
                elements.volt_voltOffset.value = gpuGovData.voltAdjust.voltOffset ?? 0;
            }
            setEditorData('gpuModes', gpuGovData?.modes, {});

            // Load Devfreq Tuner
            elements.devfreqTunerEnable.checked = jsonData.DevfreqTuner?.enable ?? false;

            // Load Thermal Control
            const thermalData = jsonData.Thermal;
            elements.thermalEnable.checked = thermalData?.enable ?? false;
            if (thermalData?.params) {
                elements.thermal_interval.value = thermalData.params.interval ?? 0;
                elements.thermal_actionDelay.value = thermalData.params.actionDelay ?? 0;
                elements.thermal_matchRule.value = thermalData.params.matchRule || '';
            }
            setEditorData('thermalModes', thermalData?.modes, {});

            // Load Trigger
            const triggerData = jsonData.Trigger;
            elements.triggerEnable.checked = triggerData?.enable ?? false;
            setEditorData('scenes', triggerData?.scenes, {});
            setEditorData('hints', triggerData?.hints, {});

            console.log("Configuration loaded successfully.");
        } catch (error) {
            console.error("Error loading configuration:", error);
            alert("加载配置文件时出错: " + error.message);
        }
    }

    // ----------------------------------------------------
    // Save Configuration Function
    // ----------------------------------------------------\
    function saveConfig() {
        console.log("Saving configuration...");
        try {
            const config = {
                name: elements.name.value || undefined,
                author: elements.author.value || undefined,
                configVersion: parseInt(elements.configVersion.value, 10) || 0,
            };

            // --- Helper to safely get editor data ---
            const getEditorData = (editorKey, defaultData) => {
                if (editors[editorKey]) {
                    try {
                        // Basic validation: check if it's empty object/array from default
                        const data = editors[editorKey].get();
                        if (typeof data === 'object' && data !== null && Object.keys(data).length > 0) {
                            return data;
                        } else if (Array.isArray(data) && data.length > 0) {
                             return data;
                        }
                        return defaultData; // Return default if empty or invalid
                    } catch (e) {
                        console.error(`Error getting data from editor ${editorKey}:`, e);
                        // Decide if we should alert the user or just return default
                        // alert(`无法从编辑器 ${editorKey} 获取数据: ${e.message}`);
                        return defaultData; // Return default on error
                    }
                } else {
                    console.warn(`Editor ${editorKey} not initialized, cannot save data.`);
                    return defaultData;
                }
            };

            // Conditionally add sections based on enable flags and editor content
            if (elements.cpuGovernorEnable.checked) {
                config.CpuGovernor = {
                    enable: true,
                    params: {
                        maxRateHz: parseInt(elements.cpu_maxRateHz.value, 10) || 0,
                        minRateHz: parseInt(elements.cpu_minRateHz.value, 10) || 0,
                        activeDelay: parseInt(elements.cpu_activeDelay.value, 10) || 0,
                        freqStep: parseInt(elements.cpu_freqStep.value, 10) || 0,
                    },
                    policies: getEditorData('cpuPolicies', undefined), // Let it be undefined if empty
                    modes: getEditorData('cpuModes', undefined)    // Let it be undefined if empty
                };
                 // Remove empty keys
                 if (!config.CpuGovernor.policies) delete config.CpuGovernor.policies;
                 if (!config.CpuGovernor.modes) delete config.CpuGovernor.modes;
             } else {
                 config.CpuGovernor = { enable: false };
             }

            if (elements.threadSchedOptEnable.checked) {
                config.ThreadSchedOpt = {
                    enable: true,
                    defaultCpus: elements.defaultCpus.value.split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite),
                    appTypes: getEditorData('appTypes', undefined),
                    schedRules: getEditorData('schedRules', undefined)
                };
                if (!config.ThreadSchedOpt.appTypes) delete config.ThreadSchedOpt.appTypes;
                if (!config.ThreadSchedOpt.schedRules) delete config.ThreadSchedOpt.schedRules;
                if (config.ThreadSchedOpt.defaultCpus.length === 0) delete config.ThreadSchedOpt.defaultCpus;
            } else {
                 config.ThreadSchedOpt = { enable: false };
            }

            if (elements.gpuGovernorEnable.checked) {
                config.MtkGpuGovernor = { // Corrected key
                    enable: true,
                    params: {
                        baseRateHz: parseInt(elements.gpu_baseRateHz.value, 10) || 0,
                        burstRateHz: parseInt(elements.gpu_burstRateHz.value, 10) || 0,
                    },
                     voltAdjust: {
                        minVolt: parseInt(elements.volt_minVolt.value, 10) || 0,
                        maxVolt: parseInt(elements.volt_maxVolt.value, 10) || 0,
                        voltOffset: parseInt(elements.volt_voltOffset.value, 10) || 0,
                    },
                    modes: getEditorData('gpuModes', undefined)
                };
                 if (!config.MtkGpuGovernor.modes) delete config.MtkGpuGovernor.modes;
             } else {
                 config.MtkGpuGovernor = { enable: false };
             }

            // Devfreq Tuner only has enable flag
            config.DevfreqTuner = { enable: elements.devfreqTunerEnable.checked };

            if (elements.thermalEnable.checked) {
                config.Thermal = {
                    enable: true,
                    params: {
                        interval: parseInt(elements.thermal_interval.value, 10) || 0,
                        actionDelay: parseInt(elements.thermal_actionDelay.value, 10) || 0,
                        matchRule: elements.thermal_matchRule.value || undefined
                    },
                    modes: getEditorData('thermalModes', undefined)
                };
                if (!config.Thermal.modes) delete config.Thermal.modes;
                if (!config.Thermal.params.matchRule) delete config.Thermal.params.matchRule; // Remove empty matchRule
            } else {
                 config.Thermal = { enable: false };
            }

            if (elements.triggerEnable.checked) {
                config.Trigger = {
                    enable: true,
                    scenes: getEditorData('scenes', undefined),
                    hints: getEditorData('hints', undefined)
                };
                 if (!config.Trigger.scenes) delete config.Trigger.scenes;
                 if (!config.Trigger.hints) delete config.Trigger.hints;
            } else {
                 config.Trigger = { enable: false };
            }

            // Remove undefined top-level keys (like name, author if empty)
            Object.keys(config).forEach(key => config[key] === undefined && delete config[key]);

            console.log("Saved configuration object:", config);
            return config;
        } catch (error) {
            console.error("Error saving configuration:", error);
            alert("保存配置时出错: " + error.message);
            return null; // Indicate failure
        }
    }

    // ----------------------------------------------------
    // Event Listeners
    // ----------------------------------------------------\
    importBtn.addEventListener('click', () => {
        fileInput.click(); // Trigger the hidden file input
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                loadConfig(jsonData);
                 // Reset file input value to allow importing the same file again
                 fileInput.value = '';
            } catch (error) {
                console.error("Error parsing JSON file:", error);
                alert("无法解析 JSON 文件: " + error.message);
                 fileInput.value = '';
            }
        };
        reader.onerror = (e) => {
             console.error("Error reading file:", e);
             alert("读取文件时出错。");
             fileInput.value = '';
        };
        reader.readAsText(file);
    });

    exportBtn.addEventListener('click', () => {
        const configData = saveConfig();
        if (configData) {
             try {
                const configString = JSON.stringify(configData, null, 4); // Pretty print JSON
                const blob = new Blob([configString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // Use the loaded config name or a default, ensuring valid filename chars
                const safeName = (elements.name.value || 'exported_config').replace(/[^a-z0-9_.-]/gi, '_');
                const fileName = safeName + '_edited.json';
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log("Configuration exported successfully as", fileName);
             } catch (error) {
                 console.error("Error exporting configuration:", error);
                 alert("导出配置时出错: " + error.message);
             }
        }
    });

});