import React from "react";
import {Toast} from "antd-mobile";

export default class schoolPush extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
           list : [],
            userId:'',
            pageNo:0
        };
    }

    componentWillMount() {

    }

    componentDidMount() {

    }


    requestData = (page) => {

        var param = {
            "method": 'bindWatchGuardian',
            "account": this.state.userId,
            "pageNo": page
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.success && result.response) {

                    var  resArray = result.response;


                } else {
                     Toast.info('解绑失败');
                }
            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }


    render() {

        return (
            <div id="schoolPush">
                <span>userName:李四</span> <span>time:2019-12-2 12:00</span>
                <div>content</div>
            </div>
        )
    }
}



