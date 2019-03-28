import React from "react";
import {Map, Polyline, Marker} from "react-amap";
import {Toast, Steps, WingBlank, WhiteSpace} from 'antd-mobile';

import '../css/watchTrail.less'

const Loading = <div className="emptyLoading">
    <div className="loading-cont">
        <div className="loading-icon"></div>
        <div>正在生成地图...</div>
    </div>
</div>;

const Step = Steps.Step;

var watchTrailThis;
export default class watchTrail extends React.Component {
    constructor(props) {
        super(props);
        watchTrailThis = this;
        this.state = {
            map: null,
            pointFlag: false,
            path: [],
            type: 0,
            locationName: [],
            style: {
                strokeWeight: '10',
                lineJoin: 'round',
                lineCap: 'round',
                strokeColor: '#3e2bff',
                strokeOpacity: '0.7',
            },
            startPoint: {longitude: '116.397477', latitude: '39.908692'},
            endPoint: {longitude: '116.397477', latitude: '39.908692'},
        };
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        var mac = locationSearch.split("&")[1].split('=')[1];
        var macId = locationSearch.split("&")[2].split('=')[1];
        this.setState({userId, mac, macId});
    }

    componentDidMount() {
        this.getWatch2gLocationRecordByWatch2gId(0)
    }

    /**
     * 根据手表名称获取历史路径
     * public List<Watch2gLocationRecord> getWatch2gLocationRecordByWatch2gId(String Watch2gId,String type) throws Exception{
     */
    getWatch2gLocationRecordByWatch2gId = (type) => {
        var _this = this;
        var param = {
            "method": 'getWatch2gLocationRecordByWatch2gId',
            "Watch2gId": this.state.macId,
            "actionName": "watchAction",
            "type": type,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (result.success) {
                        if (!!result.response) {
                            var path = result.response.map((v) => {
                                return {
                                    longitude: v.longitude,
                                    latitude: v.latitude
                                }
                            });

                            var locationNameMes = result.response.map((v) => {
                                return {
                                    time: v.createTime,
                                    locationName: v.locationName,
                                }
                            });

                            _this.buildLocationName(locationNameMes);

                            _this.setState({
                                path, startPoint: {
                                    longitude: path[0].longitude,
                                    latitude: path[0].latitude
                                },
                                endPoint: {
                                    longitude: path[path.length - 1].longitude,
                                    latitude: path[path.length - 1].latitude
                                }, pointFlag: true
                            }, () => {
                                if (!!_this.state.map) {
                                    _this.state.map.setFitView()
                                }
                            })
                        } else {
                            Toast.info('未查询到记录', 1, null, false);
                            _this.setState({path: [], pointFlag: false})
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
     * locationName
     * <Step title="Step 8" description="This is description"/>
     * @param arr
     */
    buildLocationName = (data) => {
        var locationName = [];
        data.forEach((v, i) => {
            console.log(i);
            if (i == 0) {
                locationName.push(
                    <Step icon={<img src={require('../img/icon-startingPoint.png')} alt=""/>} title={v.locationName} description={WebServiceUtil.formatHM(v.time)}/>
                )
            } else if (i == data.length - 1) {
                locationName.push(
                    <Step icon={<img src={require('../img/icon-end.png')} alt=""/>} title={v.locationName} description={WebServiceUtil.formatHM(v.time)}/>
                )
            } else {
                locationName.push(
                    <Step icon={<img src={require('../img/icon-dot.png')} alt=""/>} title={v.locationName} description={WebServiceUtil.formatHM(v.time)}/>
                )
            }
        });
        this.setState({locationName})
    };

    /**
     * 三天的选择
     */
    timeChoose = (type) => {
        return () => {
            this.getWatch2gLocationRecordByWatch2gId(type);
            this.setState({type, locationName: []});
        };
    };

    popView = () => {
        this.state.map.destroy();
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, null);
    };

    /**
     *
     * @returns {*}
     */
    renderStartPoint() {
        return <div style={{display: watchTrailThis.state.pointFlag ? '' : 'none'}}
                    className="icon-startPoint"></div>
    };

    renderEndPoint() {
        return <div style={{display: watchTrailThis.state.pointFlag ? '' : 'none'}}
                    className="icon-endPoint"></div>
    };

    getLocationDetil = () => {
        $('.setPosModel').slideDown();
    };

    setPosModelDown = () => {
        $('.setPosModel').slideUp();
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
            },
        };

        const lineEvents = {
            created: (ins) => {
                this.state.map.setFitView()
            }
        };

        return (
            <div id="watchTrail" style={{height: '100%'}}>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.popView}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">运动轨迹</span>
                    <span className="am-navbar-right"></span>
                </div>
                <div className="watchTrail-cont">
                    <Map
                        amapkey={WebServiceUtil.amapkey}
                        version={WebServiceUtil.version}
                        loading={Loading}
                        plugins={plugins}
                        showBuildingBlock={true}
                        // buildingAnimation={true}
                        // viewMode='3D'
                        events={events}
                        rotateEnable={false}
                    >
                        <Polyline
                            path={this.state.path}
                            events={lineEvents}
                            style={this.state.style}
                        />
                        <Marker
                            position={this.state.startPoint}
                            render={this.renderStartPoint}
                        />
                        <Marker
                            position={this.state.endPoint}
                            render={this.renderEndPoint}
                        />
                        <div id='timeChoose' className='customLayer'>
                        <span className={this.state.type == 0 ? 'select' : ''}
                              onClick={this.timeChoose('0')}>今天</span>
                            <span className="right-line"></span>
                            <span className={this.state.type == 1 ? 'select' : ''}
                                  onClick={this.timeChoose('1')}>昨天</span>
                            <span className="right-line"></span>
                            <span className={this.state.type == 2 ? 'select' : ''}
                                  onClick={this.timeChoose('2')}>前天</span>
                        </div>
                        <div onClick={this.getLocationDetil} id="getPosition" className="customLayer">
                            <i className="icon-TrackDetails"></i>
                        </div>
                    </Map>
                </div>

                <div className='setPosModel' style={{display: 'none'}}>
                    <div className="am-navbar">
                            <span className="am-navbar-left" onClick={this.setPosModelDown}><i
                                className="icon-back"></i></span>
                        <span className="am-navbar-title">轨迹详情</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className='modelContent'>
                        <div className="WhiteSpace"></div>
                        <div className="TrackDetails-cont">
                            <WingBlank size="lg">
                                <WhiteSpace size="lg"/>
                                <Steps current={this.state.locationName.length - 1}>
                                    {this.state.locationName}
                                </Steps>
                            </WingBlank>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}



