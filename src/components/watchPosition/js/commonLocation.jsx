import React from "react";
import {Toast, List} from "antd-mobile";
import '../css/addNewLocation.less'

const Item = List.Item;
const Brief = Item.Brief;

export default class commonLocation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posList: [],
            homePosition: '未设置',
            homeObj: null,
            schoolPosition: '未设置',
            schoolObj: null,
            mainId: '',
            posTude: null
        };
    }

    componentWillMount() {
        var _this = this;
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var mac = locationSearch.split("&")[0].split('=')[1];
        var userId = locationSearch.split("&")[1].split('=')[1];
        var macId = locationSearch.split("&")[2].split('=')[1];
        this.setState({userId, mac, macId});
        var data = {
            method: 'getLocation',
        };
        setTimeout(() => {
            Bridge.callHandler(data, function (data) {
                _this.setState({posTude: data});
            }, function (error) {

            });
        }, 1000)
    }

    componentDidMount() {
        this.getWatch2gHomePoint();
        this.getWatch2gsByGuardianUserId()
    }

    /**
     * 查询此人监护的手表列表
     * public List<Watch2g> getWatch2gsByGuardianUserId(String userId, String pageNo)
     */
    getWatch2gsByGuardianUserId = () => {
        var _this = this;
        var param = {
            "method": 'getWatch2gsByGuardianUserId',
            "actionName": "watchAction",
            "userId": this.state.userId,
            "pageNo": -1,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (!!result.response) {
                        this.setState({
                            mainId: result.response.filter((v) => {
                                return v.id == this.state.macId
                            })[0].guardians.filter((item) => {
                                return item.bindType == 1
                            })[0].guardianId
                        })
                    }
                } else {
                    // Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    addNewPos = () => {
        var _this = this;
        var url = WebServiceUtil.mobileServiceURL + "addNewLocation?mac=" + this.state.mac + '&userId=' + this.state.userId + '&macId=' + this.state.macId + '&type=0';
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url + '&posTude=' + this.state.posTude
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url + '&posTude=' + _this.state.posTude;
        });
    };

    /**
     * 查看手表家
     *  public List<Watch2gHomePoint> getWatch2gHomePoint(String watchId)
     */
    getWatch2gHomePoint = () => {
        var _this = this;
        var param = {
            "method": 'getWatch2gHomePoint',
            "actionName": "watchAction",
            "watchId": this.state.macId,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (result.success) {
                        if (!!result.response) {
                            _this.buildPosList(result.response.filter((v) => {
                                return (v.type != 1 && v.type != 2)
                            }));
                            _this.buildPublicMsg(result.response.filter((v) => {
                                return v.type == 1
                            }), result.response.filter((v) => {
                                return v.type == 2
                            }))
                        }
                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    /**
     * @param home
     * @param school
     */
    buildPublicMsg = (home, school) => {
        if (home.length != 0) {
            this.setState({homePosition: home[0].homeAddress, homeObj: home[0]});
        }
        if (school.length != 0) {
            this.setState({schoolPosition: school[0].homeAddress, schoolObj: school[0]});
        }

    };

    buildPosList = (data) => {
        var _this = this;
        var posList = [];
        data.map((v) => {
            posList.push(
                <Item
                    arrow="horizontal"
                    className="common-space line_public"
                    multipleLine
                    onClick={() => {
                        _this.intoDetil(0, v)
                    }}
                    platform="android"
                >
                    <span className="spaceAvatar">
                        <img style={{borderRadius: '50%'}}
                             src={require("../img/icon-Public.png")} alt=""/>
                    </span>
                    <div className="space-wrap">
                        <div className="space-name text_hidden">{v.homeName}</div>
                        <Brief>{v.homeAddress}</Brief>
                    </div>
                </Item>
            )
        });
        this.setState({posList});
    };

    /**
     * homeAddress: "陕西省西安市雁塔区大雁塔街道大雁塔大雁塔文化休闲景区"
     homeName: "sdsd "
     id: 5
     * @param obj
     */
    intoDetil = (type, obj) => {
        var _this = this;
        var url;
        if (type == 0) {
            //自定义
            if (obj.creatorId != this.state.userId) {
                Toast.fail('常用地点只能由创建者修改');
                return
            }
            url = encodeURI(WebServiceUtil.mobileServiceURL + "updateLocation?id=" + obj.id + '&homeName=' + obj.homeName + '&homeAddress=' + obj.homeAddress + '&type=0');
        } else if (type == 1) {
            //家
            if (this.state.mainId != this.state.userId) {
                Toast.fail('只允许主监护人修改');
                return
            }
            if (!!this.state.homeObj) {
                //修改
                url = encodeURI(WebServiceUtil.mobileServiceURL + "updateLocation?id=" + this.state.homeObj.id + '&homeName=' + this.state.homeObj.homeName + '&homeAddress=' + this.state.homeObj.homeAddress + '&type=1');
            } else {
                //添加
                url = WebServiceUtil.mobileServiceURL + "addNewLocation?mac=" + this.state.mac + '&userId=' + this.state.userId + '&macId=' + this.state.macId + '&type=1';
            }
        } else if (type == 2) {
            //学校
            if (this.state.mainId != this.state.userId) {
                Toast.fail('只允许主监护人修改');
                return
            }
            if (!!this.state.schoolObj) {
                //修改
                url = encodeURI(WebServiceUtil.mobileServiceURL + "updateLocation?id=" + this.state.schoolObj.id + '&homeName=' + this.state.schoolObj.homeName + '&homeAddress=' + this.state.schoolObj.homeAddress + '&type=2');
            } else {
                //添加
                url = WebServiceUtil.mobileServiceURL + "addNewLocation?mac=" + this.state.mac + '&userId=' + this.state.userId + '&macId=' + this.state.macId + '&type=2';
            }
        }
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url + '&posTude=' + this.state.posTude
        };
        console.log(data);
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url + '&posTude=' + _this.state.posTude;
        });
    };

    popView = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, null);
    };

    render() {

        return (
            <div id="addNewLocation">
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.popView}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">常用地点</span>
                    <span className="am-navbar-right" onClick={this.addNewPos}>添加</span>
                </div>
                <div className="commonLocation-cont">
                    <div className="commonLocation-content">
                        <div className="WhiteSpace"></div>
                        <div className="publicPos">
                            <Item
                                arrow="horizontal"
                                className="common-space line_public"
                                multipleLine
                                onClick={() => {
                                    this.intoDetil(1)
                                }}
                                platform="android"
                            >
                                <span className="spaceAvatar">
                                    <img style={{borderRadius: '50%'}}
                                         src={require("../img/icon-home.png")} alt=""/>
                                </span>
                                <div className="space-wrap">
                                    <div className="space-name text_hidden">家</div>
                                    <Brief>{this.state.homePosition}</Brief>
                                </div>
                            </Item>
                            <Item
                                arrow="horizontal"
                                className="common-space"
                                multipleLine
                                onClick={() => {
                                    this.intoDetil(2)
                                }}
                                platform="android"
                            >
                                <span className="spaceAvatar">
                                    <img style={{borderRadius: '50%'}}
                                         src={require("../img/icon-schoolA.png")} alt=""/>
                                </span>
                                <div className="space-wrap">
                                    <div className="space-name text_hidden">学校</div>
                                    <Brief>{this.state.schoolPosition}</Brief>
                                </div>
                            </Item>
                            <div className="WhiteSpace"></div>
                        </div>

                        <div className="publicPos">{this.state.posList}</div>

                        <div className="tips">
                            <div className="tips-title">温馨提示</div>
                            <div className="tips-cont">设置常用地点后，手表定位到该地点时，地图界面会自动显示相应设置信息。手表进出相应地点范围，家长端将收到对应的消息通知。</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



