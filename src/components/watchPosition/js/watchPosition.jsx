import React from "react";
import {Map, Marker} from "react-amap";
import {Toast, NavBar, Icon, Popover} from 'antd-mobile';
import {WatchWebsocketConnection} from '../../../helpers/watch_websocket_connection'

import '../css/watchPosition.less'

const Loading = <div className="emptyLoading"><div className="loading-cont"><div className="loading-icon"></div><div>正在生成地图...</div></div></div>;

const Item = Popover.Item;

//消息通信js
window.ms = null;

var watchPositionThis;
export default class watchPosition extends React.Component {
    constructor(props) {
        super(props);
        watchPositionThis = this;
        this.state = {
            position: {longitude: '116.397477', latitude: '39.908692'},
            homePoint: {longitude: '116.397477', latitude: '39.908692'},
            sclPoint: {longitude: '116.397477', latitude: '39.908692'},
            homePointFlag: false,
            sclPointFlag: false,
            map: null,
            visible: false,
            toBind: false,
            selected: '',
            watchName: '',
            popoverLay: [],
        };
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        this.setState({userId});

        var phone;
        if (navigator.userAgent.indexOf('iPhone') > -1 || navigator.userAgent.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }

        var pro = {
            "command": "guardianLogin",
            "data": {
                "userId": userId,
                "machineType": phone,
                "version": '1.0',
            }
        };
        ms = new WatchWebsocketConnection();
        ms.connect(pro);
        this.msListener();
    }

    componentDidMount() {
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
                        _this.buildStuList(result.response)
                    }
                } else {
                    Toast.fail(result.msg,1,null,false);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    buildStuList = (data) => {
        if (data.length == 0) {
            this.setState({toBind: true});
            return
        }
        var popoverLay = [];
        data.forEach((v) => {
            popoverLay.push(
                (<Item macId={v.id} mac={v.macAddress} key={v.id}>{v.watchName}</Item>)
            );
        });
        this.setState({popoverLay, mac: data[0].macAddress, macId: data[0].id, watchName: data[0].watchName});
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
                            _this.buildPublicPoint(result.response.filter((v) => {
                                return v.type == 1
                            }), result.response.filter((v) => {
                                return v.type == 2
                            }))
                        }
                    }
                } else {
                    Toast.fail(result.msg,1,null,false);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    buildPublicPoint = (home, school) => {
        if (home.length != 0) {
            //常用点，家
            var homePoint = {
                "longitude": home[0].longitude,
                "latitude": home[0].latitude,
            };
            this.setState({homePointFlag: true, homePoint});
        }
        if (school.length != 0) {
            //常用点，学校
            var sclPoint = {
                "longitude": school[0].longitude,
                "latitude": school[0].latitude,
            };
            this.setState({sclPointFlag: true, sclPoint});
        }
    };

    /**
     * 获取手表位置
     */
    watch2GLocaltionRequest = () => {
        this.getWatch2gHomePoint();
        var obj = {
            "command": "watch2GLocaltionRequest",
            "data": {"macAddress": this.state.mac, "guardianId": this.state.userId}
        };
        ms.send(obj);
    };

    msListener() {
        var _this = this;
        ms.msgWsListener = {
            onError: function (errorMsg) {
                // Toast.fail(errorMsg)
            }, onWarn: function (warnMsg) {
                // Toast.fail(warnMsg)
            }, onMessage: function (info) {
                if (info.command === 'sendWatch2GLocaltionData') {
                    if (info.data.macAddress == _this.state.mac && info.data.guardianId == _this.state.userId) {
                        if ((info.data.longitude == '0.0' && info.data.latitude == '0.0') || (isNaN(info.data.longitude) && isNaN(info.data.latitude))) {
                            Toast.fail('获取定位失败',1,null,false);
                            return
                        }

                        console.log(_this.state.map);

                        var position = {
                            "longitude": info.data.longitude,
                            "latitude": info.data.latitude,
                        };
                        _this.setState({position})
                    }
                }
            }
        }
    }

    /**
     * 设置坐标点样式
     * @returns {*}
     */
    renderMarker() {
        return <div className="user-positioning"><img style={{borderRadius: '50%'}}
                                                      src='http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png?size=100x100'
                                                      alt=""/></div>
    }

    renderhomePoint() {
        return <div style={{display: watchPositionThis.state.homePointFlag ? '' : 'none'}}
                    className="school-positioning">
            <img
                style={{borderRadius: '50%'}}
                src={require('../img/icon-home.png')} alt=""/></div>
    }

    rendersclPoint() {
        return <div style={{display: watchPositionThis.state.sclPointFlag ? '' : 'none'}}
                    className="school-positioning">
            <img
                style={{borderRadius: '50%'}}
                src={require('../img/icon-schoolA.png')} alt=""/></div>
    }

    /**
     * 手动获取位置
     */
    getPosition = () => {
        this.state.map.setZoom(17);
        this.watch2GLocaltionRequest();
    };

    /**
     * 获取运动轨迹（跳转）
     */
    getTrail = () => {
        var url = WebServiceUtil.mobileServiceURL + "watchTrail?mac=" + this.state.mac + '&userId=' + this.state.userId + '&macId=' + this.state.macId;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    /**
     * 设置点（跳转）
     */
    addSafeAddress = () => {

        var url = WebServiceUtil.mobileServiceURL + "commonLocation?mac=" + this.state.mac + '&userId=' + this.state.userId + '&macId=' + this.state.macId;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    onSelect = (opt) => {
        this.setState({
            watchName: opt.props.children,
            visible: false,
            // selected: opt.props.value,
            mac: opt.props.mac,
            macId: opt.props.macId,
            homePointFlag: false,
            sclPointFlag: false,
        }, () => {
            this.watch2GLocaltionRequest();
            this.state.map.setZoom(17);
        });
    };

    toJupmBind = () => {
        var url = WebServiceUtil.mobileServiceURL + "addWatchInfo?userId=" + this.state.userId;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    };

    render() {

        const plugins = [
            {
                name: 'ToolBar', //地图工具条插件，可以用来控制地图的缩放和平移
                options: {
                    locate: false
                },
            }
        ];

        const events = {
            created: (ins) => {
                this.setState({map: ins});
                ins.setZoom(17);
                this.watch2GLocaltionRequest();
            },
        };

        return (
            <div id="watchPosition" style={{height: '100%'}}>
                <div className="am-navbar-blue">
                    <NavBar
                        mode="light"
                        leftContent={
                            <Popover mask
                                     overlayClassName="fortest"
                                     overlayStyle={{color: 'currentColor'}}
                                     visible={this.state.visible}
                                     placement="bottomLeft"
                                     overlay={this.state.popoverLay}
                                     align={{
                                         overflow: {adjustY: 0, adjustX: 0},
                                         offset: [10, 0],
                                     }}
                                     onVisibleChange={(visible) => {
                                         this.setState({
                                             visible,
                                         });
                                     }}
                                     onSelect={this.onSelect}
                            >
                                <div style={{
                                    height: '100%',
                                    padding: '0',
                                    marginRight: '-15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <i className="icon-back"
                                       style={{display: this.state.toBind ? 'none' : ''}}></i>{this.state.watchName}
                                </div>
                            </Popover>
                        }
                    >
                        定位
                    </NavBar>
                </div>
                <div style={{display: this.state.toBind ? "none" : ""}} className="map-cont">
                    <Map
                        amapkey={WebServiceUtil.amapkey}
                        version={WebServiceUtil.version}
                        loading={Loading}
                        plugins={plugins}
                        center={this.state.position}
                        showBuildingBlock={true}
                        buildingAnimation={true}
                        viewMode='3D'
                        events={events}
                        rotateEnable={false}
                    >
                        <Marker
                            position={this.state.position}
                            render={this.renderMarker}
                        />
                        <Marker
                            position={this.state.homePoint}
                            render={this.renderhomePoint}
                        />
                        <Marker
                            position={this.state.sclPoint}
                            render={this.rendersclPoint}
                        />
                        <div onClick={this.getPosition} id="getPosition" className="customLayer">
                            <i className="icon-positioning"></i>
                        </div>
                        <div className="orbital-position">
                            <div onClick={this.getTrail} id="getTrail" className="customLayer line_public">
                            </div>
                            <div onClick={this.addSafeAddress} id="safeAddress" className="customLayer">
                            </div>
                        </div>

                    </Map>
                </div>

                <div className="emptyCont" style={{display: this.state.toBind ? "block" : "none"}}>
                    <div className="p38 my_flex">
                        <div>
                            <i></i>
                            <span>
                                还没有任何信息<br/>
                                请先绑定手表二维码
                                    </span>
                        </div>
                    </div>
                    <div className='submitBtn' onClick={this.toJupmBind}>马上绑定</div>
                </div>

            </div>
        )
    }
}



