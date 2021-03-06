(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'echarts'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('echarts'));
    } else {
        // Browser globals
        factory({}, root.echarts);
    }
}(this, function (exports, echarts) {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    echarts.registerTheme('macarons', {
        "version": 1,
        "themeName": "macarons",
        "theme": {
            "seriesCnt": "3",
            "backgroundColor": "rgba(0,101,255,0.71)",
            "titleColor": "#ffffff",
            "subtitleColor": "#ffffff",
            "textColorShow": false,
            "textColor": "#333",
            "markTextColor": "#ffffff",
            "color": [
                "rgba(73,198,255,0.67)",
                "rgba(107,230,193,0.84)",
                "rgba(98,108,145,0.77)"
            ],
            "borderColor": "#ffffff",
            "borderWidth": "2",
            "visualMapColor": [
                "rgba(0,26,255,0.98)"
            ],
            "legendTextColor": "#ffffff",
            "kColor": "#e6a0d2",
            "kColor0": "transparent",
            "kBorderColor": "#e6a0d2",
            "kBorderColor0": "#3fb1e3",
            "kBorderWidth": "2",
            "lineWidth": "2",
            "symbolSize": "6",
            "symbol": "emptyCircle",
            "symbolBorderWidth": "2",
            "lineSmooth": false,
            "graphLineWidth": "1",
            "graphLineColor": "#cccccc",
            "mapLabelColor": "#ffffff",
            "mapLabelColorE": "rgb(63,177,227)",
            "mapBorderColor": "#aaaaaa",
            "mapBorderColorE": "#3fb1e3",
            "mapBorderWidth": 0.5,
            "mapBorderWidthE": 1,
            "mapAreaColor": "#eeeeee",
            "mapAreaColorE": "rgba(63,177,227,0.25)",
            "axes": [
                {
                    "type": "all",
                    "name": "通用坐标轴",
                    "axisLineShow": true,
                    "axisLineColor": "#ffffff",
                    "axisTickShow": false,
                    "axisTickColor": "#333",
                    "axisLabelShow": true,
                    "axisLabelColor": "#ffffff",
                    "splitLineShow": true,
                    "splitLineColor": [
                        "rgba(255,255,255,0.08)"
                    ],
                    "splitAreaShow": true,
                    "splitAreaColor": [
                        "rgba(255,255,255,0.06)",
                        "rgba(255,255,255,0.03)"
                    ]
                },
                {
                    "type": "category",
                    "name": "类目坐标轴",
                    "axisLineShow": true,
                    "axisLineColor": "#333",
                    "axisTickShow": true,
                    "axisTickColor": "#333",
                    "axisLabelShow": true,
                    "axisLabelColor": "#333",
                    "splitLineShow": false,
                    "splitLineColor": [
                        "#ccc"
                    ],
                    "splitAreaShow": false,
                    "splitAreaColor": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                },
                {
                    "type": "value",
                    "name": "数值坐标轴",
                    "axisLineShow": true,
                    "axisLineColor": "#333",
                    "axisTickShow": true,
                    "axisTickColor": "#333",
                    "axisLabelShow": true,
                    "axisLabelColor": "#333",
                    "splitLineShow": true,
                    "splitLineColor": [
                        "#ccc"
                    ],
                    "splitAreaShow": false,
                    "splitAreaColor": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                },
                {
                    "type": "log",
                    "name": "对数坐标轴",
                    "axisLineShow": true,
                    "axisLineColor": "#333",
                    "axisTickShow": true,
                    "axisTickColor": "#333",
                    "axisLabelShow": true,
                    "axisLabelColor": "#333",
                    "splitLineShow": true,
                    "splitLineColor": [
                        "#ccc"
                    ],
                    "splitAreaShow": false,
                    "splitAreaColor": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                },
                {
                    "type": "time",
                    "name": "时间坐标轴",
                    "axisLineShow": true,
                    "axisLineColor": "#333",
                    "axisTickShow": true,
                    "axisTickColor": "#333",
                    "axisLabelShow": true,
                    "axisLabelColor": "#333",
                    "splitLineShow": true,
                    "splitLineColor": [
                        "#ccc"
                    ],
                    "splitAreaShow": false,
                    "splitAreaColor": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            ],
            "axisSeperateSetting": false,
            "toolboxColor": "#999999",
            "toolboxEmpasisColor": "#666666",
            "tooltipAxisColor": "#ffffff",
            "tooltipAxisWidth": 1,
            "timelineLineColor": "#0038ff",
            "timelineLineWidth": 1,
            "timelineItemColor": "#0037ff",
            "timelineItemColorE": "#0c33c7",
            "timelineCheckColor": "#3fb1e3",
            "timelineCheckBorderColor": "rgba(0,176,255,0.15)",
            "timelineItemBorderWidth": 1,
            "timelineControlColor": "#0036ff",
            "timelineControlBorderColor": "#0038ff",
            "timelineControlBorderWidth": 0.5,
            "timelineLabelColor": "#626c91",
            "datazoomBackgroundColor": "rgba(255,255,255,0)",
            "datazoomDataColor": "rgba(222,222,222,1)",
            "datazoomFillColor": "rgba(114,230,212,0.25)",
            "datazoomHandleColor": "#cccccc",
            "datazoomHandleWidth": "100",
            "datazoomLabelColor": "#999999"
        }
    });
}));
