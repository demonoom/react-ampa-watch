var isDebug = true;
var localDomain = "192.168.50.139";   //请求地址
var isDebugLocal = true;
var localUrl = "192.168.50.72";    //跳转地址本地地址
var isSafeDebug = true;     //false则为隐藏主页列表，本地调试改为true


//云校本地测试webService地址
var elearningWebserviceURLOfLocal = "http://" + localDomain + ":9007/elearning/elearningControl/";
//云校的远程服务器地址
var elearningWebserviceURLOfRemote = "http://www.maaee.com/elearning/elearningControl/";
var elearningWebserviceURL = isDebug ? elearningWebserviceURLOfLocal : elearningWebserviceURLOfRemote;

// //小蚂蚁webService地址
const apiWebServiceURLOfLocals = "http://" + localDomain + ":9006/Excoord_ApiServer/webservice";
const apiWebServiceURLOfRemote = "https://www.maaee.com/Excoord_For_Education/webservice";
var apiWebServiceURL = isDebug ? apiWebServiceURLOfLocals : apiWebServiceURLOfRemote;
//小蚂蚁mobile地址
const mobileURLOfLocal = (isSafeDebug ? "http://" : "https://") + localUrl + ":8089/#/";
const mobileURLOfRemote = "http://jiaoxue.maaee.com:8089/#/";


//老人健康手环地址
const OldManBraceletURLOfLocals = "http://" + localDomain + ":6010/Excoord_OldManBracelet/webservice";
// const OldManBraceletURLOfLocals = "http://192.168.50.15:9010/Excoord_OldManBracelet/webservice";
const OldManBraceletURLOfRemote = "http://www.maaee.com:6010/Excoord_OldManBracelet/webservice";
var OldManBraceletURL = isDebug ? OldManBraceletURLOfLocals : OldManBraceletURLOfRemote;

//AR支付
const ArPaymentURLOfLocals = "http://" + localDomain + ":6012/Excoord_LittleVideoApiServer/webservice";
const ArPaymentURLOfRemote = "http://www.maaee.com:6010/Excoord_LittleVideoApiServer/webservice";
var ArPaymentURL = isDebug ? ArPaymentURLOfLocals : ArPaymentURLOfRemote;

const wxBindURLOfLocals = "http://" + localDomain + ":6012/Excoord_LittleVideoApiServer/webservice";
const wxBindURLOfRemote = "http://www.maaee.com:6012/Excoord_LittleVideoApiServer/webservice";
//24491:邹长亮  129530:10下的管理员(家宽用)  119665:王鹏飞  6075:牛旭东  54208:赵家宽 9732:成旭 23836:王丹
WebServiceUtil.refreshClassCardUserArray = [24491, 129530, 119665, 6075, 54208, 9732, 23836];

var wxBindURL = isDebug ? wxBindURLOfLocals : wxBindURLOfRemote;


function WebServiceUtil() {

};

WebServiceUtil.mobileServiceURL = isDebugLocal ? mobileURLOfLocal : mobileURLOfRemote;

/**
 * 不带请求头的ajax
 * @param data
 * @param listener
 */
WebServiceUtil.requestLittleElearningWeb = function (data, listener) {
    $.ajax({
        type: "post",
        url: elearningWebserviceURL,
        data: {params: data},
        dataType: "json",
        success: function (result) {
            listener.onResponse(result);
        }, error: function (error) {
            listener.onError(error);
        }
    });
}
/**
 * 不带请求头的ajax---云校
 * @param data
 * @param listener
 */
WebServiceUtil.requestLittleAntApi = function (data, listener) {
    $.ajax({
        type: "post",
        url: apiWebServiceURL,
        data: {params: data},
        dataType: "json",
        success: function (result) {
            listener.onResponse(result);
        }, error: function (error) {
            listener.onError(error);
        }
    });
}


/**
 * 判断是否是pc端
 */
WebServiceUtil.isPC = function () {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
        "SymbianOS", "Windows Phone",
        "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
/**
 * 不带请求头的ajax
 * arpayment
 * @param data
 * @param listener
 */
WebServiceUtil.requestArPaymentApi = function (data, listener) {
    $.ajax({
        type: "post",
        url: ArPaymentURL,
        data: {params: data},
        dataType: "json",
        success: function (result) {
            listener.onResponse(result);
        }, error: function (error) {
            listener.onError(error);
        }
    });
}

/**
 * 不带请求头的ajax
 * arpayment
 * @param data
 * @param listener
 */
WebServiceUtil.requestBindWx = function (data, listener) {
    $.ajax({
        type: "post",
        url: wxBindURL,
        data: {params: data},
        dataType: "json",
        success: function (result) {
            listener.onResponse(result);
        }, error: function (error) {
            listener.onError(error);
        }
    });
}


/**
 * 请求头的ajax
 * @param data
 * @param listener
 */
WebServiceUtil.requestLittleAntApiOldManBracelet = function (data, listener) {
    $.ajax({
        type: "post",
        url: OldManBraceletURL,
        data: {params: data},
        dataType: "json",
        success: function (result) {
            listener.onResponse(result);
        }, error: function (error) {
            listener.onError(error);
        }
    });
}

/**
 * 带有请求头的ajax
 * @param data
 * @param headObj
 * @param listener
 */
WebServiceUtil.requestLittleAntApiWithHead = function (data, headObj, listener) {
    $.ajax({
        type: "post",
        url: apiWebServiceURL,
        data: {params: data},
        dataType: "json",
        headers: JSON.parse(headObj),
        success: function (result) {
            listener.onResponse(result);
        }, error: function (error) {
            listener.onError(error);
        }
    });
}

/**
 * 系统非空判断
 * @param content
 * @returns {boolean}
 */
WebServiceUtil.isEmpty = function (content) {
    if (content == null || content == "null" || content == "" || typeof (content) == "undefined") {
        return true;
    } else {
        return false;
    }
};

/**
 * 时间戳转年月日
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatYMD = function (nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth() + 1;
    var date = da.getDate();
    var ymdStr = [year, month, date].join('-');
    return ymdStr;
};

/**
 * 时间戳转月日
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatMD = function (nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth() + 1;
    var date = da.getDate();
    var ymdStr = [month, date].join('-');
    return ymdStr;
};
WebServiceUtil.formatMD3 = function (nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth() + 1;
    var date = da.getDate();
    var ymdStr = [month, date].join('月')+"日";
    return ymdStr;
};
WebServiceUtil.formatMD2 = function (nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth() + 1;
    var date = da.getDate();
    var ymdStr = [month, date].join('.');
    return ymdStr;
};

//几天前的日期
WebServiceUtil.fun_date=function (aa){
    var date1 = new Date(),
    time1=date1.getFullYear()+"-"+(date1.getMonth()+1)+"-"+date1.getDate();//time1表示当前时间
    var date2 = new Date(date1);
    date2.setDate(date1.getDate()+aa);
    var time2 = (date2.getMonth()+1)+"月"+date2.getDate()+"日";
    return time2;
}

/**
 * 时间戳转年月日时分秒，完整时间显示
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatAllTime = function (nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth() + 1;
    var date = da.getDate();
    var hour = da.getHours() + ":";
    var minutes = da.getMinutes() + ":";
    var sencond = da.getSeconds();
    var dayStr = [year, month, date].join('-');
    var dateStr = dayStr + " " + hour + minutes + sencond;
    return dateStr;
};


/**
 * 时间戳转年月日时分，完整时间显示
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatYMDHM = function (nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = (da.getMonth() + 1) < 10 ? "0" + (da.getMonth() + 1) : da.getMonth() + 1;
    var date = da.getDate() < 10 ? "0" + (da.getDate()) : da.getDate();
    var hour = (da.getHours() < 10 ? "0" + (da.getHours()) : da.getHours()) + ":";
    var minutes = da.getMinutes() < 10 ? "0" + (da.getMinutes()) : da.getMinutes();
    var dayStr = [year, month, date].join('-');
    var dateStr = dayStr + " " + hour + minutes;
    return dateStr;
};
/**
 * 时间戳转月日时分，完整时间显示
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatMDHM = function (nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth() + 1;
    var date = da.getDate();
    var hour = (da.getHours() < 10 ? "0" + (da.getHours()) : da.getHours()) + ":";
    var minutes = da.getMinutes() < 10 ? "0" + (da.getMinutes()) : da.getMinutes();
    var dayStr = [month, date].join('月');
    var dateStr = dayStr + "日" +" "+ hour + minutes;
    return dateStr;
};
/**
 * 时间戳转时分秒，完整时间显示
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatSFM = function (nS) {
    var da = new Date(parseInt(nS));
    var hour = da.getHours() + ":";
    var minutes = da.getMinutes();
    var sencond = da.getSeconds();
    var dateStr = hour + minutes < 10 ? "0" + minutes : minutes + sencond < 10 ? "0" + sencond : sencond;
    return dateStr;
};

/**
 * 时间戳转年月
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatYM = function (nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth() + 1;
    var ymdStr = [year, month].join('-');
    return ymdStr;
};

/**
 * 时间戳转时分
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatHM = function (nS) {
    var da = new Date(parseInt(nS));
    var hour = da.getHours() + ":";
    var minutes = da.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    var hmStr = hour + minutes;
    return hmStr;
};
/**
 * 时间戳转时分
 * @param nS
 * @returns {string}
 */
WebServiceUtil.formatHMS = function (nS) {
    var da = new Date(parseInt(nS));
    var hour = da.getHours() + ":";
    var minutes = da.getMinutes() + ":";
    var sencond = da.getSeconds();

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (sencond < 10) {
        sencond = "0" + sencond;
    }
    var hmStr = hour + minutes + sencond;
    return hmStr;
};

WebServiceUtil.createUUID = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
};

WebServiceUtil.getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var index = window.location.href.indexOf('?') + 1;
    var str = window.location.href.substr(index, window.location.href.length - 1);
    var r = str.match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
};

WebServiceUtil.SMALL_IMG = 'size=100x100';
WebServiceUtil.MIDDLE_IMG = 'size=300x300';
WebServiceUtil.LARGE_IMG = 'size=500x500';
WebServiceUtil.amapkey = '2228dcee9965b2922c14f5cd72c3d0cc';
WebServiceUtil.version = '1.4.13';
//ar上传权限 AR教材的schoolId
WebServiceUtil.AR_SCHOOL_ARRAY = [7];



