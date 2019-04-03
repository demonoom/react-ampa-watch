import React from "react";
import {Map, Circle} from "react-amap";
import {List, Button, Modal, Toast, Slider} from 'antd-mobile';
import PositionPicker from './positionPicker'
import '../css/addNewLocation.less'

const Item = List.Item;
const Brief = Item.Brief;
const prompt = Modal.prompt;

export default class updateLocation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posName: '未设置',
            pos: '未设置',
            searchValue: '',
            posList: [],
            defaultPos: [],
            position: {longitude: '116.397477', latitude: '39.908692'},
            zoom: 10,
            map: null,
            circle: null,
            addressName: '',
            addressLT: '',
            style: {
                strokeWeight: '16',
                strokeColor: "rgba(23,172,247,1)",
                strokeOpacity: 0.13,
                strokeStyle: "solid",
                fillColor: 'rgba(23,172,247,1)',
                fillOpacity: '0.26'
            },
            radius: 50,
            sliderValue: 15,
        };
    }

    componentWillMount() {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var id = locationSearch.split("&")[0].split('=')[1];
        var posName = locationSearch.split("&")[1].split('=')[1];
        var pos = locationSearch.split("&")[2].split('=')[1];
        var type = locationSearch.split("&")[3].split('=')[1];
        var posTude = locationSearch.split("&")[4].split('=')[1];
        this.setState({id, posName, pos, type});
        if (posTude != 'null') {
            this.inverseGeocoding(posTude)
        }
    }

    inverseGeocoding = (posTude) => {
        var _this = this;
        $.ajax({
            type: "GET",      //data 传送数据类型。post 传递
            dataType: 'json',  // 返回数据的数据类型json
            url: "https://restapi.amap.com/v3/geocode/regeo?parameters",  // yii 控制器/方法
            data: {
                key: WebServiceUtil.amapjskey,
                location: posTude.split(',')[1] + ',' + posTude.split(',')[0]
            },  //传送的数据
            error: function () {

            }, success: function (data) {
                if (data.status === '1') {
                    _this.setState({
                        defaultPos:
                            <Item arrow="horizontal"
                            className="line_public"
                            multipleLine
                            onClick={() => {
                                _this.intoMap({
                                    location: posTude.split(',')[1] + ',' + posTude.split(',')[0]
                                })
                            }}
                            platform="android"
                        >
                            <i className="icon-search-map"></i>
                            <div className="name">当前位置</div>
                            <Brief>{data.regeocode.formatted_address}</Brief>
                        </Item>
                    })
                } else {
                    Toast.fail('未知的错误', 2, null, false)
                }
            }
        })
    };

    posNameClick = () => {
        if (this.state.type == 1 || this.state.type == 2) {
            return
        }
        var _this = this;
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }

        prompt('请输入名称', '', [
            {text: '取消'},
            {
                text: '确定', onPress: value => {
                    if (value.trim() !== '') {
                        _this.setState({posName: value})
                    }
                }
            },
        ], 'default', '', [], phone);
        if (phone == 'ios') {
            document.getElementsByClassName('am-modal-input')[0].getElementsByTagName('input')[0].focus();
        }
    };

    posClick = () => {
        $('.setPosModel').slideDown();
    };

    searchChange = (e) => {
        this.setState({searchValue: e.target.value});
    };

    /**
     * 高德地图/输入提示
     */
    searchPos = () => {
        var _this = this;
        if (this.state.searchValue.trim() === '') {
            Toast.info('请输入位置信息', 2, null, false);
            return
        }

        $.ajax({
            type: "GET",      //data 传送数据类型。post 传递
            dataType: 'json',  // 返回数据的数据类型json
            url: "https://restapi.amap.com/v3/assistant/inputtips?parameters",  // yii 控制器/方法
            data: {
                key: WebServiceUtil.amapjskey,
                keywords: _this.state.searchValue
            },  //传送的数据
            error: function () {

            }, success: function (data) {
                if (data.status === '1') {
                    _this.buildPosList(data.tips)
                } else {
                    Toast.fail('未知的错误', 2)
                }
            }
        })
    };

    buildPosList = (data) => {
        var _this = this;
        var posList = [];
        data.filter((v) => {
            return typeof (v.location) === 'string'
        }).map((v) => {
            posList.push(
                <Item
                    arrow="horizontal"
                    className="line_public"
                    multipleLine
                    onClick={() => {
                        _this.intoMap(v)
                    }}
                    platform="android"
                >
                    <div className="name">{v.name}</div>
                    <Brief>{v.district}{v.address}</Brief>
                </Item>
            )
        });
        this.setState({posList})
    };

    intoMap = (obj) => {
        var _this = this;
        $('.setPosModel').hide();
        $('.posMap').show();
        this.setState({sliderValue: 15});
        setTimeout(() => {
            _this.state.map.setZoom(17);
            _this.state.map.setCenter(obj.location.split(','));
            _this.state.circle.setCenter(obj.location.split(','));
        }, 300);
    };

    posPicker = (obj) => {
        this.setState({addressName: obj.nearestPOI, addressLT: obj.position.lng + ',' + obj.position.lat});
        this.state.circle.setCenter([obj.position.lng, obj.position.lat])
    };

    setPosDone = () => {
        $('.setPosModel').slideUp();
        $('.posMap').hide();
        this.setState({pos: this.state.addressName})
    };

    setPosQuit = () => {
        $('.setPosModel').show();
        $('.posMap').hide();
    };

    sliderOnChange = () => {
        return (value) => {
            this.setState({sliderValue: value})
        };
    };

    saveLocation = () => {
        if (this.state.posName === '未设置') {
            Toast.fail('请设置位置名称', 2, null, false);
            return
        }
        if (this.state.pos === '未设置') {
            Toast.fail('请设置位置信息', 2, null, false);
            return
        }
        this.updateWatch2gHomePoint()
    };

    /**
     * 手表绑定家
     * public boolean addWatch2gHomePoint(String homeName,String homeAddress,String watchId,String longitude,String latitude,String creatorId,String safetyRange)
     */
    updateWatch2gHomePoint = () => {
        var param = {
            "method": 'updateWatch2gHomePoint',
            "actionName": "watchAction",
            "homeName": this.state.posName,
            "homeAddress": this.state.pos,
            "id": this.state.id,
            "longitude": this.state.addressLT.split(',')[0],
            "latitude": this.state.addressLT.split(',')[1],
            "safetyRange": this.state.sliderValue,
            "type": this.state.type,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (result.success) {
                        Toast.success('修改成功', 1, null, false);

                        setTimeout(function () {
                            var data = {
                                method: 'finishForRefresh',
                            };
                            Bridge.callHandler(data, null, function (error) {
                                console.log(error);
                            });
                        }, 1000)
                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.warn('修改失败');
            }
        });
    };

    /**
     * 手表删除家
     * public boolean deleteWatch2gHomePoint(String id)
     */
    deleteWatch2gHomePoint = () => {
        var param = {
            "method": 'deleteWatch2gHomePoint',
            "actionName": "watchAction",
            "id": this.state.id,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (result.success) {
                        Toast.success('删除成功', 1, null, false);

                        setTimeout(function () {
                            var data = {
                                method: 'finishForRefresh',
                            };
                            Bridge.callHandler(data, null, function (error) {
                                console.log(error);
                            });
                        }, 1000)
                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.warn('删除失败');
            }
        });
    };

    popView = () => {
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, null);
    };

    setPosModelDown = () => {
        var _this = this;
        $('.setPosModel').slideUp(function () {
            _this.setState({posList: [], searchValue: ''})
        });
    };

    render() {

        const plugins = [
            {
                name: 'ToolBar', //地图工具条插件，可以用来控制地图的缩放和平移
                options: {
                    locate: false,
                },
            }
        ];

        const events = {
            created: (ins) => {
                this.setState({map: ins})
            }
        };

        const circleEvents = {
            created: (ins) => {
                this.setState({circle: ins})
            },
        };

        return (
            <div id="addNewLocation">
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.popView}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">修改新地址</span>
                    <span className="am-navbar-right am-navbar-del">
                        <span style={{display: (this.state.type == 1 || this.state.type == 2) ? 'none' : ''}}
                              onClick={this.deleteWatch2gHomePoint}>删除</span>
                    </span>
                </div>
                <div className="commonLocation-cont">
                    <div className="WhiteSpace"></div>
                    <List
                        className={(this.state.type == 1 || this.state.type == 2) ? 'my-list home-hidden' : 'my-list'}>
                        <Item
                            arrow="horizontal"
                            platform="android"
                            extra={this.state.posName}
                            onClick={() => {
                                this.posNameClick()
                            }}>地点名称</Item>
                    </List>
                    <List className="my-list">
                        <Item
                            arrow="horizontal"
                            platform="android"
                            extra={this.state.pos}
                            onClick={() => {
                                this.posClick()
                            }}>地点位置</Item>
                    </List>
                    <div className='submitBtn' onClick={this.saveLocation}>保存</div>
                </div>
                <div className='setPosModel' style={{display: 'none'}}>
                    <div className="am-navbar">
                            <span className="am-navbar-left" onClick={this.setPosModelDown}><i
                                className="icon-back"></i></span>
                        <span className="am-navbar-title">地点</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className="setPosCont">
                        <div className="search-item">
                            <input onChange={this.searchChange} value={this.state.searchValue} type="text"
                                   placeholder="请输入位置信息"/>
                            <div className="icon-search" onClick={this.searchPos}></div>
                        </div>
                        <div className="search-mapItem">{this.state.defaultPos}</div>
                    </div>

                    <div className="searchResults">
                        {this.state.posList}
                    </div>
                </div>
                <div className='posMap' style={{display: 'none'}}>
                    <div className="am-navbar">
                        <span className="am-navbar-left" onClick={this.setPosQuit}><i className="icon-back"></i></span>
                        <span className="am-navbar-title">添加新地址</span>
                        <span className="am-navbar-right"></span>
                    </div>
                    <div className="navbar-bottom"></div>
                    <div className='posMap-content'>
                        <Map
                            plugins={plugins}
                            events={events}
                            zoom={this.state.zoom}
                            center={this.state.position}
                            useAMapUI={true}
                            amapkey={WebServiceUtil.amapkey}
                            version={WebServiceUtil.version}
                            showBuildingBlock={true}
                            // buildingAnimation={true}
                            // viewMode='3D'
                            rotateEnable={false}
                            pitchEnable={false}
                        >
                            <PositionPicker
                                posPicker={this.posPicker}
                            />
                            <Circle
                                center={this.state.position}
                                radius={this.state.sliderValue}
                                events={circleEvents}
                                style={this.state.style}
                            />
                            <div className="posMessage">
                                <span className="icon-posMap"></span>
                                <div className="posMap-cont text_hidden">{this.state.addressName}</div>
                            </div>

                            <div className='setArea'>
                                <div className="submitBtn" onClick={this.setPosDone}>确定</div>
                                <div className="SafeRange">安全范围<span>{Number(this.state.sliderValue) * 10}m</span></div>
                                <Slider
                                    style={{marginLeft: 0, marginRight: 10}}
                                    value={this.state.sliderValue}
                                    min={10}
                                    max={50}
                                    onChange={this.sliderOnChange()}
                                />
                                <div className="distance">
                                    <span>100m</span>
                                    <span className="right">500m</span>
                                </div>
                            </div>
                        </Map>
                    </div>
                </div>

            </div>
        )
    }
}




