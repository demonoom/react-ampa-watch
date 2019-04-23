import React from "react";
import {Toast , Modal} from "antd-mobile";

const prompt = Modal.prompt;
var myUserid = '';

export default class pCenter extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
              resDic:{},
               userId:'',
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var userId = locationSearch.split("&")[0].split('=')[1];
        this.setState({
            userId,
        })
        console.log(userId,'yyyyyy');
        myUserid=userId;
        this.requesetPData();
    }

    requesetPData = () =>{
        var _this = this;
        var param = {
            "method": 'getPersonalCenterData',
            "userId":  myUserid
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    if (result.response) {
                        this.setState({
                           resDic:result.response,
                        })
                        _this.build(result.response)
                    } else {

                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    changeHeader = () =>{
        var data = {
            method: 'selectedImage'
        };
        Bridge.callHandler(data, (photoAddr) => {
           this.serverChangeAvatar(photoAddr);
        }, function (error) {
        });
    }

    changeName = ()=>{
        console.log("ioio")
        //Toast.info('修改名字');
        this.showText(1,this.state.resDic.user.userName);
    }

    changeIntroduce = ()=>{
        this.showText(2,'请输入简介');
    }


    showText = (type , defaultSting) =>{
        var  toststing ;
        if (type == 1){
            toststing='修改名字'
        }
        if (type == 2) {
            toststing='修改简介';
        }


        prompt(toststing, '', [
            {
                text: '取消', onPress: value => {
                    this.setState({

                    }, () => {
                    });
                },
            },
            {
                text: '确定', onPress: value => {
                    console.log(value, "value")
                    this.setState({
                    }, () => {
                        if (type == 1 && value.length>0){
                            this.serverChangeName(value);
                        }
                        if (type == 2 && value.length>0){
                            this.serverChangeIntroduce(value);
                        }
                    });
                }
            },
        ], 'default', "","")
        if (navigator.userAgent.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            document.getElementsByClassName('am-modal-input')[0].getElementsByTagName('input')[0].focus();
        }
    }

    serverChangeName=(name)=>{
        var _this = this;
        var param = {
            "method": 'updateParentName',
            "uid": myUserid,
            "name":name
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    if (result.response) {
                        var data = {
                            method: 'upDataUserInfo'
                        };
                        console.log(data);
                        Bridge.callHandler(data, null, function (error) {

                        });
                        _this.requesetPData();
                    } else {

                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    serverChangeIntroduce=(introduce)=>{
        var _this = this;
        var param = {
            "method": 'updateUserIntroducation',
            "userId": myUserid,
            "introduction":introduce
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    if (result.response) {
                        _this.requesetPData();
                    } else {

                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    //upadteAvatar
    serverChangeAvatar=(url)=>{
        var _this = this;
        var param = {
            "method": 'upadteAvatar',
            "ident": myUserid,
            "avatar":url
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success) {
                    if (result.response) {
                        var data = {
                            method: 'upDataUserInfo'
                        };
                        console.log(data);
                        Bridge.callHandler(data, null, function (error) {

                        });
                        _this.requesetPData();
                    } else {

                    }
                } else {
                    Toast.fail(result.msg, 1, null, false);
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }

    build=(data)=>{
        var contentDom = <div>
            <div className='grayBorder'></div>
            <div onClick={this.changeHeader} className='am-list-item am-list-item-middle line_public15 activeDiv'>
                <div className="am-list-line photo">
                    <div className="am-list-content">修改头像</div>
                    <img src={data.user.avatar}
                         // onError={this.src='http://60.205.86.217/upload8/2018-11-08/10/f43b56b7-5a6f-4aa8-8468-fdd24f438a58.jpg?size=100x100'} alt=""
                    />
                    <div className="am-list-arrow am-list-arrow-horizontal"></div>
                </div>
            </div>
            <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.changeName}>
                <div className="am-list-line">
                    <div className="am-list-content">名字</div>
                    <div className="am-list-extra">
                        {data.user.userName}
                    </div>
                    <div className="am-list-arrow am-list-arrow-horizontal"></div>
                </div>
            </div>
            <div className='am-list-item am-list-item-middle line_public15 activeDiv' onClick={this.changeIntroduce}>
                <div className="am-list-line">
                    <div className="am-list-content">个性签名</div>
                    <div className="am-list-extra">
                        {
                            data.introduction ? <span>{data.introduction}.</span>:
                                <span>这个人很懒什么也没有留下...</span>
                        }
                    </div>
                    <div className="am-list-arrow am-list-arrow-horizontal"></div>
                </div>
            </div>
        </div>
        this.setState({contentDom})
    }


    toBack = () =>{
        var data = {
            method: 'popView',
        };
        Bridge.callHandler(data, null, function (error) {
        });
    }

    render() {

        return (
            <div id='studentInfo' className='bg_gray publicList_50'>
                <div className="am-navbar">
                    <span className="am-navbar-left" onClick={this.toBack}><i className="icon-back"></i></span>
                    <span className="am-navbar-title">编辑个人信息</span>
                    <span className="am-navbar-right"></span>
                </div>
                {this.state.contentDom}

            </div>
        )
    }

}


