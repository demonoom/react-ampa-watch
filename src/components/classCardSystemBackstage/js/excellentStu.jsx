import React from "react";
import {Toast} from "antd-mobile"
import "../css/excellentStu.less";

var topStu;
export default class excellentStu extends React.Component {
    constructor(props) {
        super(props);
        topStu = this;
        this.state = {
            getExcellentStuData: []
        }
    }

    componentDidMount() {
        document.title = "早到之星";
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var classId = locationSearch.split("&")[0].split('=')[1];
        var defaultId = locationSearch.split("&")[1].split("=")[1];
        this.setState({
            classId,
            defaultId
        })
        this.getBraceletAttendTopStudentByClazzId(classId)
    }

    /**
     * 根据班级ID获取谁数据
     */
    getBraceletAttendTopStudentByClazzId(classId) {
        var param = {
            "method": 'getBraceletAttendTopStudentByClazzId',
            "clazzId": classId
        };
        console.log(param)
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    console.log(result.response);
                    //var response = [{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.15:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}},{"attendTime":1530193673000,"user":{"avatar":"http://192.168.50.34:8080/Excoord_For_Education/userPhoto/default_avatar.png","colAccount":"ST23993","colPasswd":"bd3adc44bd53e6473e81885d05252f38","colUid":23993,"colUtype":"STUD","colValid":1,"schoolId":9,"schoolName":"hzbtest","userName":"小兔兔"}}];
                    this.setState({
                        getExcellentStuData: result.response
                    })
                } else {
                    Toast.fail('请求出错');
                }
            },
            onError: function (error) {
                Toast.fail(error, 1);
            }
        });
    }

    /**
     * 返回首页
     */
    historyGoBack() {
        var data = {
            method: 'finish',
        };

        Bridge.callHandler(data, null, function (error) {
            console.log(error);
        });
    }

    render() {
        return (
            <div id={this.state.defaultId}>
                <div id="excellentStu" className="home_content">
                    <div className="inner_bg">
                        <div className="navBar">
                            <span onClick={this.historyGoBack}>首页</span>
                            <span className="icon"></span>
                            <span>早到之星</span>
                        </div>
                        <div className="cont my_flex">
                            <div className="left">
                                {
                                    topStu.state.getExcellentStuData.map((v, i) => {
                                        console.log(v);
                                        return (
                                            <div className="my_flex">
                                                <span className="num">第{i + 1}名</span>
                                                <div className="info textOver">
                                                    <img src={v.user.avatar}/>
                                                    <span className="userName textOver">{v.user.userName}</span>
                                                </div>
                                                <span className="time">
                                                <img src={require("../imgs/clock.png")}/>
                                                    {WebServiceUti.formatHM(v.attendTime)}
                                            </span>

                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className="right">
                                <img className="icon_topLeft" src={require("../imgs/rightPic.png")}/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }
}