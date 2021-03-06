import React from "react";
import {Map, Marker} from "react-amap";
import {Toast, NavBar, Popover} from 'antd-mobile';
import {WatchWebsocketConnection} from '../../../helpers/watch_websocket_connection'

import '../css/watchPosition.less'

const Loading = <div className="emptyLoading">
    <div className="loading-cont">
    </div>
</div>;

const Item = Popover.Item;

let clickTime = null;

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
            marker: null,
            visible: false,
            toBind: false,
            toConfirm: false,
            selected: '',
            watchName: '',
            popoverLay: [],
            jumpClass: 'user-positioning',
            watch2gs: [],
            familyRelate: '',
            watchAvatar:'http://60.205.86.217/upload9/2019-03-27/11/e4119535-3a05-4656-9b9f-47baa348392e.png',
            childSex:'男'
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
        this.getWatch2gsByGuardianUserId();
        $('body').addClass('jindian');
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

                }
            },
            onError: function (error) {

            }
        });
    };

    /**
     * watchAvatar
     * @param data
     */
    buildStuList = (data) => {
        if (data.length == 0) {
            this.setState({toBind: true});
            return
        }
        this.setState({
            childSex:data[0].childSex,watchAvatar:data[0].student.avatar,watch2gs: data, familyRelate: data[0].guardians.filter((v) => {
                return v.bindType == 1
            })[0].familyRelate
        });
        if (data[0].guardians.filter((v) => {
            return v.guardianId == this.state.userId
        })[0].bindType == 2 && data[0].guardians.filter((v) => {
            return v.guardianId == this.state.userId
        })[0].valid == 2) {
            this.setState({toConfirm: true});
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

                }
            },
            onError: function (error) {

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
        /*if (clickTime === null) {

        }
        clickTime = (new Date()).getTime();*/
        ms.send(obj);
        if (!this.state.toBind && !this.state.toConfirm) {
            Toast.info('正在获取位置信息...', 5, () => {
                this.setState({jumpClass: 'user-positioning'});
            }, false);
            this.setState({jumpClass: 'user-positioning-jump'});
        }
    };

    msListener() {
        var _this = this;
        ms.msgWsListener = {
            onError: function (errorMsg) {
            }, onWarn: function (warnMsg) {
                if (warnMsg === '手表不在线！' && !_this.state.toBind && !_this.state.toConfirm) {
                    Toast.fail(warnMsg, 1, null, false);
                    _this.setState({jumpClass: 'user-positioning'});
                }

            }, onMessage: function (info) {
                if (info.command === 'sendWatch2GLocaltionData') {
                    if (info.data.macAddress == _this.state.mac && info.data.guardianId == _this.state.userId) {
                        if ((info.data.longitude == '0.0' && info.data.latitude == '0.0') || (isNaN(info.data.longitude) && isNaN(info.data.latitude))) {
                            Toast.fail('手表不在线', 1, null, false);
                            _this.setState({jumpClass: 'user-positioning'});
                            return
                        }
                        // var position = {
                        //     "longitude": info.data.longitude,
                        //     "latitude": info.data.latitude,
                        // };
                        // _this.setState({position})

                        if (!!_this.state.map) {
                            _this.state.map.panTo([info.data.longitude, info.data.latitude]);
                            _this.state.map.setZoom(17);
                        }
                        if (!!_this.state.marker) {
                            _this.state.marker.setPosition([info.data.longitude, info.data.latitude]);
                            setTimeout(function () {
                                Toast.hide();
                                _this.setState({jumpClass: 'user-positioning'});
                            },500)
                        }
                    }
                } else if (info.command === 'userOperateResponse') {
                    if (info.data.guardianId == _this.state.userId) {
                        if (info.data.operateStatus == 0) {
                            //拒绝
                            _this.setState({toConfirm: false, toBind: false, watchName: ''}, () => {
                                _this.getWatch2gsByGuardianUserId()
                            })
                        } else {
                            _this.userOperateResponse(info.data)
                        }
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
        return <div className={watchPositionThis.state.jumpClass}><img style={{borderRadius: '50%'}}
                                                                       src={watchPositionThis.state.watchAvatar+'?size=100x100'}
                                                                       onError={(e) => {
                                                                           e.target.onerror = null;
                                                                           e.target.src = watchPositionThis.state.childSex == "女" ? "http://60.205.86.217/upload9/2019-03-27/11/33ac8e20-5699-4a94-a80c-80adb4f050e3.png" : "http://60.205.86.217/upload9/2019-03-27/11/e4119535-3a05-4656-9b9f-47baa348392e.png"
                                                                       }}
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
        var optObj = this.state.watch2gs.filter((v) => {
            return v.id == opt.props.macId
        })[0];

        this.setState({
            familyRelate: optObj.guardians.filter((v) => {
                return v.bindType == 1
            })[0].familyRelate
        });

        if (optObj.guardians.filter((v) => {
            return v.guardianId == this.state.userId
        })[0].bindType == 2 && optObj.guardians.filter((item) => {
            return item.guardianId == this.state.userId
        })[0].valid == 2) {
            this.setState({toConfirm: true});
        } else {
            this.setState({toConfirm: false});
        }

        this.setState({
            watchName: opt.props.children,
            visible: false,
            // selected: opt.props.value,
            mac: opt.props.mac,
            macId: opt.props.macId,
            homePointFlag: false,
            sclPointFlag: false,
            watchAvatar:optObj.student.avatar,
            childSex:optObj.childSex
        }, () => {
            this.watch2GLocaltionRequest();
        });
    };

    userOperateResponse = (data) => {

        var optObj = this.state.watch2gs.filter((v) => {
            return v.id == data.watchId
        })[0];

        this.setState({
            familyRelate: optObj.guardians.filter((v) => {
                return v.bindType == 1
            })[0].familyRelate
        });

        this.setState({toConfirm: false});

        this.setState({
            watchName: optObj.watchName,
            visible: false,
            // selected: opt.props.value,
            mac: optObj.macAddress,
            macId: optObj.id,
            homePointFlag: false,
            sclPointFlag: false,
        }, () => {
            // this.watch2GLocaltionRequest();
        });
    };

    toJupmBind = () => {
        var url = WebServiceUtil.mobileServiceURL + "addWatchInfo?userId=" + this.state.userId;
        var data = {
            method: 'openNewPage',
            navType: 2,
            url: url,
            backAlertInfo: "是否放弃本次编辑？"
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
                var _this = this;
                this.setState({map: ins});
                ins.setZoom(17);
                setTimeout(function () {
                    _this.watch2GLocaltionRequest();
                },300)
            },
            moveend: () => {
                Toast.hide();
                this.setState({jumpClass: 'user-positioning'});
            },
            zoomend: () => {
                Toast.hide();
                this.setState({jumpClass: 'user-positioning'});
            }
        };

        const markerEvents = {
            created: (instance) => {
                this.setState({marker: instance});
            },
            moveend: () => {
                Toast.hide();
                this.setState({jumpClass: 'user-positioning'});
            }
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
                        // showBuildingBlock={true}
                        // viewMode='3D'
                        // buildingAnimation={true}
                        preloadMode={false}
                        events={events}
                        rotateEnable={false}
                        touchZoomCenter='1'
                    >
                        <Marker
                            position={this.state.homePoint}
                            render={this.renderhomePoint}
                        />
                        <Marker
                            position={this.state.sclPoint}
                            render={this.rendersclPoint}
                        />
                        <Marker
                            position={this.state.position}
                            render={this.renderMarker}
                            events={markerEvents}
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

                <div className="emptyCont emptyCont-bg" style={{display: this.state.toBind ? "block" : "none"}}>
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
                <div className="emptyCont emptyCont-bg emptyContBind"
                     style={{display: this.state.toConfirm ? 'block' : 'none'}}>
                    <div className="p38 my_flex">
                        <div>
                            <i></i>
                            <span>
                                    申请已提交<br/>
                                请等待管理员（{this.state.familyRelate}）验证通过
                                    </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



