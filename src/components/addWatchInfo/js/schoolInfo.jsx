import React from 'react';
import {
    Toast, Modal
} from 'antd-mobile';
import '../css/schoolInfo.less'
const alert = Modal.alert;
export default class schoolInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            littleAntName: "",
            stuInfoData: null
        };
    }

    componentWillMount () {
        document.title = '学校信息';
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var macAddr = searchArray[0].split('=')[1];
        var sex = searchArray[1].split('=')[1];
        var relation = searchArray[2].split('=')[1];
        var phoneNumber = searchArray[3].split('=')[1];
        var ident = searchArray[4].split('=')[1];
        var birthDay = searchArray[5].split('=')[1];
        this.setState({
            macAddr,
            sex,
            relation,
            phoneNumber,
            ident,
            birthDay
        })
        window.addEventListener('resize', this.onWindwoResize);
    }

    componentDidMount () {
        Bridge.setShareAble("false");
    }

    componentWillUnmount () {
        window.removeEventListener('resize', this.onWindwoResize);
    }

    //监听窗口改变时间
    onWindwoResize =()=> {
        // this
        setTimeout(() => {
            this.setState({
                clientHeight: document.body.clientHeight,
            })
        }, 100)
    }

    //输入小蚂蚁账号
    littAntOnChange = (value) => {
        this.setState({
            littleAntName: value,

        });
    }
    //下一页
    nextPage = () => {
        var url = WebServiceUtil.mobileServiceURL + "verifyStuInfo?macAddr=" + this.state.macAddr+ "&sex=" + this.state.sex+"&relation="+this.state.relation+"&phoneNumber="+this.state.phoneNumber+"&ident="+this.state.ident+"&birthDay="+this.state.birthDay;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });


    }

    //跳注册页面
    toRegPage = () => {
        var url = WebServiceUtil.mobileServiceURL + "stuAccountRegist?sex=" + this.state.sex + "&macAddr=" + this.state.macAddr+"&relation="+this.state.relation+"&phoneNumber="+this.state.phoneNumber+"&ident="+this.state.ident+"&birthDay="+this.state.birthDay;
        var data = {
            method: 'openNewPage',
            selfBack: true,
            url: url
        };
        Bridge.callHandler(data, null, function (error) {
            window.location.href = url;
        });
    }
    render () {
        return (
            <div id="schoolInfo" className='bg_gray'>
                <div className="topPadding"></div>
                <div className="icon_back"></div>
                <div className="my_flex mainCont">
                    <div className='hasAccount'>
                        <img  onClick={this.nextPage} src={require('../../images/hasAccount.png')} alt=""/>
                        <div className="dec">我有小蚂蚁账号</div>
                    </div>
                    <div onClick={this.toRegPage} className='noAccount'>
                        <img src={require('../../images/noAccount.png')} alt=""/>
                        <div className="dec">没有小蚂蚁账号</div>
                    </div>
                </div>
                <div className='bt_bg'>
                </div>


            </div>
        );
    }
}
