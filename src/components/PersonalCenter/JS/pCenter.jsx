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
        // Toast.info('修改名字');
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
        ], 'default', "",defaultSting)
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
            <div onClick={this.changeHeader}>
                <img src={data.user.avatar} alt=""/> 修改头像
            </div>

            <div onClick={this.changeName}>
                <span>名字</span> <span>{data.user.userName}</span>
            </div>

            <div onClick={this.changeIntroduce}>
                <span>个性签名</span>
                {
                    data.introduction ? <span>{data.introduction}.</span>:
                        <span>这个人很懒什么也没有留下...</span>
                }

            </div>
        </div>
        this.setState({contentDom})
    }

    render() {

        return (
            <div>
                {this.state.contentDom}

            </div>
        )
    }

}


