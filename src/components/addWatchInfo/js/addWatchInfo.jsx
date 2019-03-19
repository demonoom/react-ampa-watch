import React from 'react';
import {
    InputItem, Toast,
    Modal
} from 'antd-mobile';
const alert = Modal.alert;
const prompt = Modal.prompt;
export default class addWatchInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            macId: "9090",
            stuName: "",
            sexValue: "",
            showSexBox: false,
            relationBox: false,
            relationData: [
                {
                    value: "父子"
                },
                {
                    value: "母子"
                },
                {
                    value: "祖父"
                },
                {
                    value: "祖母"
                },
                {
                    value: "姐弟"
                },
                {
                    value: "姐妹"
                },
                {
                    value: "自定义"
                },
            ]
        };
    }

    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var loginType = searchArray[0].split('=')[1];
        // loginType==1  代表主账号
        this.setState({
            loginType
        })
    }

    componentDidMount () {
        Bridge.setShareAble("false");
        document.title = '手环绑定学生班级列表';
    }

    /**
     * 调用客户端
     */
    scanCode = () => {
        var data = {
            method: 'ringBinding'
        };
        Bridge.callHandler(data, function (mes) {
            //获取二维码MAC地址
            // var string = mes.replace(/:/g, '');
            // if (string.length > 16) {
            //     Toast.fail('mac地址超过最大字节数', 2)
            //     return
            // }
            //判断返回的ｍａｃ地址是否是以MAC:开头的,如果是,则将原内容的MAC:截掉
            var compareMes = mes.toUpperCase();
            if (compareMes.indexOf("MAC:") == 0) {
                mes = mes.substr(4, mes.length - 1);
            }
            if (mes.indexOf(":") == -1) {
                var string = splitStrTo2(mes).join(":");
                mes = string.substr(0, string.length - 1)
            }
            this.setState({ macId: mes.toUpperCase() });
        }, function (error) {
            console.log(error);
        });
    }

  
    //显示性别
    showSexBox = () => {
        this.setState({
            showSexBox: true
        })
    }
    //隐藏性别
    hideSexBox = (num) => {
        console.log(num, "num")
        this.setState({
            showSexBox: false,
            sexValue: num
        })
    }

    //显示关系
    showRelationBox = () => {
        this.setState({
            relationBox: true
        })
    }
    //点击关系选项
    clickRelation = (relation) => {
        this.setState({
            relationBox:false
        })
        console.log(relation, "q")
        if (relation == "自定义") {
            this.showModal()
        }
    }
    //自定义关系
    showModal () {
        prompt('请输入关系', '', [
            { text: '取消' },
            {
                text: '确定', onPress: value => {
                    console.log(`输入的内容:${value}`);
                }
            },
        ], 'default', "")
    }
    //跳转下一页
    nextPage=()=>{
        if(this.state.loginType == 1){
            var url = WebServiceUtil.mobileServiceURL + "bindStudentInfo?loginType="+this.state.loginType;
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        }else {
            var url = WebServiceUtil.mobileServiceURL + "loginSuccess?loginType="+this.state.loginType;
            var data = {
                method: 'openNewPage',
                url: url
            };
            Bridge.callHandler(data, null, function (error) {
                window.location.href = url;
            });
        }

      
      
    }
    render () {
        return (
            <div id="addWatchInfo" style={{ height: document.body.clientHeight }}>
                {
                    this.state.loginType == 1 ?
                        <h5>添加学生信息</h5>
                        :
                        ""
                }
                <div><span>{this.state.macId}</span><span onClick={this.scanCode}>扫描</span></div>
                {
                    this.state.loginType == 1 ?
                        <div>
                           
                            <div>
                                <span>请选择孩子的性别</span>
                                <span onClick={this.showSexBox}>箭头</span>
                                <div style={{ display: this.state.showSexBox ? "block" : "none" }}>
                                    <div onClick={this.hideSexBox.bind(this, "0")}>男</div>
                                    <div onClick={this.hideSexBox.bind(this, "1")}>女</div>
                                </div>
                            </div>
                        </div>
                        :
                        ""
                }
                <div>
                    <span>请选择你与孩子的关系</span>
                    <span onClick={this.showRelationBox}>箭头</span>
                    <div style={{ display: this.state.relationBox ? "block" : "none" }}>
                        {
                            this.state.relationData.map((v, i) => {
                                return (
                                    <div onClick={this.clickRelation.bind(this, v.value)}>{v.value}</div>
                                )
                            })
                        }
                    </div>
                </div>
                <div onClick={this.nextPage}>下一步</div>
            </div>
        );
    }
}