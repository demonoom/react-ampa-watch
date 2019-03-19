import React from 'react';
import { WhiteSpace, WingBlank, Button, Toast, Modal } from 'antd-mobile';
import '../css/classDemeanor.less'

var sPlan;
const alert = Modal.alert;

export default class schoolPlan extends React.Component {

    constructor(props) {
        super(props);
        sPlan = this;
        this.state = {
            data: [],
            imgArrAtUp: [],
            imgArrAtShow: [],
        };
    }

    componentDidMount() {
        document.title = "学校平面图页面";
        Bridge.setShareAble("false");
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var ident = locationSearch.split("&")[0].split('=')[1];
        this.setState({ ident: ident });
        this.getSchoolMap(ident);
    }
    /**
     * 获取学校地图信息
     * @param {*} id
     */
    getSchoolMap(id) {
        var param = {
            "method": 'viewSchoolMapPage',
            "adminId": id,
            "pn": -1
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    sPlan.setState({ imgArrAtShow: result.response });
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 原生上传照片返回地址
     */
    uploadImgBtn() {
        if (sPlan.state.imgArrAtUp.length == 1) {
            Toast.info("只能上传一张照片")
            return
        }
        var data = {
            method: 'uploadClassDemeanor',
        };

        Bridge.callHandler(data, function (res) {
            //拿到图片地址,显示在页面等待上传
            var arr = res.split(',');
            sPlan.setState({ imgArrAtUp: sPlan.state.imgArrAtUp.concat(arr) });
        }, function (error) {
            console.log(error);
        });
    }

    /**
     * 本地上传照片
     */
    uploadImg = () => {
        if (sPlan.state.imgArrAtUp.length == 0) {
            Toast.fail('请先选择照片',2)
            return
        }
        if (sPlan.state.imgArrAtShow.length == 1) {
            Toast.info("只能上传一张照片")
        }
        sPlan.state.imgArrAtUp.forEach(function (v, i) {
            var param = {
                "method": 'bindSchoolMap',
                "adminId": sPlan.state.ident,
                "mapURL": v,
            };
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: function (result) {
                    if (result.msg == '调用成功' || result.success == true) {
                        if (i == sPlan.state.imgArrAtUp.length - 1) {
                            Toast.success('上传成功');
                            //刷新上半部
                            sPlan.getSchoolMap(sPlan.state.ident)
                            sPlan.state.imgArrAtUp.splice(0)
                        }
                    }
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        })
    }
    /**
     * 删除展示模块的照片
     * @param {*} id
     */
    delSchoolMap(id) {
        this.showAlert(function () {
            var param = {
                "method": 'unbindSchoolMap',
                "mId": id,
            };
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: function (result) {
                    if (result.msg == '调用成功' || result.success == true) {
                        var arr = sPlan.state.imgArrAtShow
                        sPlan.state.imgArrAtShow.forEach((v, i) => {
                            if (v.id == id) {
                                arr.splice(i, 1);
                            }
                        })
                        sPlan.setState({ imgArrAtShow: arr })
                    }
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }, function () {
            // console.log('已取消');
        });
    }
    /**
     * 删除弹出框
     */
    showAlert = (success, cancel) => {
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }

        const alertInstance = alert('确定删除此照片吗?', '', [
            {
                text: '取消', onPress: () => {
                    if (cancel) {
                        cancel();
                    }
                }, style: 'default'
            },
            {
                text: '确定', onPress: () => {
                    if (success) {
                        success()
                    }
                }
            },
        ], phone);
    }

    /**
     * 上传模块的删除
     * @param {*} index
     */
    delImgAtUp(index) {
        var arr = sPlan.state.imgArrAtUp;
        sPlan.state.imgArrAtUp.forEach((v, i) => {
            if (i == index) {
                arr.splice(i, 1);
            }
        })
        sPlan.setState({ imgArrAtUp: arr })
    }

    render() {
        return (
            <div id="schoolPlan" style={{ height: document.body.clientHeight }}>
                <div className="Img_cont">
                    <div className="classDemeanor_title">平面图展示</div>
                    <div className='calmShowImg'>
                        {this.state.imgArrAtShow.map((v) => {
                            return <div className="calmImg">
                                <img className='uploadImgBtn' src={v.path} alt="" />
                                <img onClick={this.delSchoolMap.bind(this, v.id)} className='delImgBtn'
                                    src={require('../imgs/delPic.png')} alt="" />
                            </div>
                        })}
                    </div>
                    <WhiteSpace size="lg" />
                    <div className="classDemeanor_title">上传照片</div>
                    <div className='uploadImg my_flex my_flex_wrap'>
                        {this.state.imgArrAtUp.map((v, i) => {
                            return <div className="listImg flex_center">
                                <img className='uploadImgBtn' src={v} alt="" />
                                <img onClick={this.delImgAtUp.bind(this, i)} className='delImgBtn'
                                    src={require('../imgs/delPic.png')} alt="" />
                            </div>
                        })}
                        <img
                            className='uploadImgBtn'
                            src={require('../imgs/addPic.png')}
                            alt=""
                            onClick={this.uploadImgBtn}
                        />
                    </div>
                </div>
                <div className='addCourseButton'>
                    <WhiteSpace size="lg" />
                    <WingBlank>
                        <Button type="warning" onClick={this.uploadImg}>上传</Button>
                    </WingBlank>
                </div>
            </div>
        );
    }
}
