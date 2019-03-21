import React from "react";
import {Toast, ListView, Tabs, Modal} from "antd-mobile";

const alert = Modal.alert;
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
           this.requestData(1);
    }


    requestData = (page) => {

        var param = {
            "method": 'getTopicsByNotifyType',
            "notifyType":'9',
            "ident": "41",
            "pageNo": '1'
        };
        console.log(param, "param")
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if(result.success){
                    var  resArray = result.response;
                }else {
                    Toast.info(result);
                }


            },
            onError: function (error) {
                Toast.info('请求失败');
            }
        });
    }


    // loadMore = () =>{
    //     this.state.pageNo++;
    //     this.requestData(this.state.pageNo);
    // }


    render() {
        // const cell = (item) => {
        //     console.log(item)
        //     return (
        //         <div>
        //             {/*<div>userName:{item.userName}</div>*/}
        //             {/*<div>time:{item.createTime}</div>*/}
        //             {/*<div>{item.content}</div>*/}
        //
        //             userName ,createTime,content
        //         </div>
        //     );
        // };
        return (
            <div>
                ooo
            </div>
        )
    }
}










