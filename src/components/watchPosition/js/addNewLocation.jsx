import React from "react";
import {Map} from "react-amap";
import {List, Button, Modal, Toast} from 'antd-mobile';
import PositionPicker from './positionPicker'
import '../css/addNewLocation.less'

const Item = List.Item;
const Brief = Item.Brief;
const prompt = Modal.prompt;

export default class addNewLocation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            posName: '未设置',
            pos: '未设置',
            searchValue: '',
            posList: [],
        };
    }

    componentWillMount() {
        // var locationHref = decodeURI(window.location.href);
        // var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        // var userId = locationSearch.split("&")[0].split('=')[1];
        // var mac = locationSearch.split("&")[1].split('=')[1];
        // this.setState({userId, mac});
    }

    componentDidMount() {

    }

    posNameClick = () => {
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

    saveLocation = () => {
        console.log('saveLocation');
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
            Toast.info('请输入位置信息', 2);
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
        data.map((v) => {
            posList.push(
                <Item
                    arrow="horizontal"
                    multipleLine
                    onClick={() => {
                        _this.intoMap(v)
                    }}
                    platform="android"
                >
                    {v.name}<Brief>{v.district} <br/> {v.address}</Brief>
                </Item>
            )
        });
        this.setState({posList})
    };

    intoMap = (obj) => {
        console.log(obj);
        $('.setPosModel').hide();
        $('.posMap').show();
    };

    render() {

        return (
            <div id="addNewLocation">
                <List className="my-list">
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

                <Button onClick={this.saveLocation} type="primary" size="small">保存</Button>

                <div className='setPosModel' style={{display: 'none'}}>
                    <div>
                        <input onChange={this.searchChange} value={this.state.searchValue} type="text"
                               placeholder="请输入位置信息"/>
                        <div onClick={this.searchPos}>搜索</div>
                    </div>

                    <div>
                        {this.state.posList}
                    </div>
                </div>

                <div className='posMap' style={{display: 'none'}}>
                    <Map
                        zoom={6}
                        center={[120, 30]}
                        useAMapUI={true}
                        amapkey={WebServiceUtil.amapkey}
                        version={WebServiceUtil.version}
                        showBuildingBlock={true}
                        buildingAnimation={true}
                        viewMode='3D'
                        rotateEnable={false}
                    >
                        <PositionPicker/>
                    </Map>
                </div>
            </div>
        )
    }
}



