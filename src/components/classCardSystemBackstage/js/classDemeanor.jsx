import React from 'react';
import { Picker, List, WhiteSpace, WingBlank, Button, Toast, Modal } from 'antd-mobile';
import '../css/classDemeanor.less'

var demeanor;
const alert = Modal.alert;

export default class classDemeanor extends React.Component {

    constructor(props) {
        super(props);
        demeanor = this;
        this.state = {
            data: [],
            imgFromAndArr: [],
            imgArr: [],
        };
    }

    componentDidMount() {
        Bridge.setShareAble("false");
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var ident = locationSearch.split("&")[0].split('=')[1];
        var className = locationSearch.split("&")[1].split('=')[1];
        document.title = className;
        this.setState({ classId: ident });
        this.getClassDemeanorInfo(ident);
    }

    getClassDemeanorInfo(id) {
        var param = {
            "method": 'getClassDemeanorInfo',
            "clazzId": id,
            "type": 1
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: function (result) {
                if (result.msg == '调用成功' || result.success == true) {
                    demeanor.setState({ imgArr: result.response });
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
        var data = {
            method: 'selectImgAndVideo',
        };
        Bridge.callHandler(data, function (res) {
            var newArr = res.split('.');
            if(newArr[newArr.length-1] == "JPG"){
                res = res.replace(/JPG/g,"jpg");;
            }
            if(newArr[newArr.length-1] == "JPEG"){
                res = res.replace(/JPEG/g,"jpeg");;
            }
            if(newArr[newArr.length-1] == "MP4"){
                res = res.replace(/MP4/g,"mp4");;
            }
            //拿到图片地址,显示在页面等待上传
            var classDemeanors = res.split(',');
            var promiseArray = [];
            console.log(classDemeanors, '图片地址');
            Toast.loading('正在加载...', 60, () => {
                console.log('Load complete !!!');
            });
            for (var k = 0; k < classDemeanors.length; k++) {
                console.log(k);
                if (classDemeanors[k].substr(classDemeanors[k].length - 3, 3) == 'mp4') {
                    console.log(k, '视频');
                    var cut = new Promise(function (resolve, reject) {
                        let t = k;
                        let video = document.createElement("video");
                        let canvas = document.createElement("canvas");
                        video.src = classDemeanors[t];
                        video.crossOrigin = 'Anonymous';
                        video.addEventListener('loadeddata', function () {
                            console.log('执行');
                            canvas.width = video.videoWidth * 0.8;
                            canvas.height = video.videoHeight * 0.8;
                            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                            // var $Blob = canvas.toDataURL("image/png");
                            var $Blob = demeanor.getBlobBydataURI(canvas.toDataURL("image/png"), 'image/jpeg');
                            var formData = new FormData();
                            formData.append("filePath", $Blob, "file_" + Date.parse(new Date()) + ".png");
                            $.ajax({
                                type: "POST",
                                url: "https://jiaoxue.maaee.com:8890/Excoord_Upload_Server/file/upload",
                                enctype: 'multipart/form-data',
                                data: formData,
                                // 告诉jQuery不要去处理发送的数据
                                processData: false,
                                // 告诉jQuery不要去设置Content-Type请求头
                                contentType: false,
                                success: function (res) {
                                    console.log(res,"ooo");
                                    if (res == '') {
                                        Toast.hide();
                                        Toast.fail('请转成标准视频格式')
                                        return
                                    }
                                    classDemeanors[t] = classDemeanors[t] + '&' + res;
                                    resolve('成功');
                                },
                                error: function (res) {
                                    $('body').html(res);
                                }
                            });
                        });
                    });
                    promiseArray.push(cut);
                }
            }
            // console.log(promiseArray,'promiseArray')
            Promise.all(promiseArray).then(function (e) {
                //     console.log(e,'promise');
                // console.log(classDemeanors, 'classDemeanors!!!!!!');
                demeanor.setState({ imgFromAndArr: demeanor.state.imgFromAndArr.concat(classDemeanors) });

                // return;
                Toast.hide();
            })
            // }

        }, function (error) {
            console.log(error);
        });
    }

    /**
     * 首先需要 吧 base64 流转换成 blob 对象，文件对象都继承它
     * @param dataURI
     * @param type
     * @returns {*}
     */
    getBlobBydataURI(dataURI, type) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], { type: type });
    }

    /**
     * 本地上传照片
     */
    uploadImg = () => {
        if (demeanor.state.imgFromAndArr.length == 0) {
            Toast.fail('请先选择照片', 2)
            return
        }
        console.log(demeanor.state.imgFromAndArr,"mgArri")
        demeanor.state.imgFromAndArr.forEach(function (v, i) {
            var param = {
                "method": 'saveClassDemeanorInfo',
                "clazzId": demeanor.state.classId,
                "imagePath": v,
                "type": 1
            };
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: function (result) {
                    if (result.msg == '调用成功' || result.success == true) {
                        if (i == demeanor.state.imgFromAndArr.length - 1) {
                            Toast.success('上传成功');
                            //刷新上半部
                            demeanor.getClassDemeanorInfo(demeanor.state.classId)
                            demeanor.state.imgFromAndArr.splice(0)
                        }
                    }
                },
                onError: function (error) {
                    // message.error(error);
                }
            });
        })
    }

    deleteClassDemeanorInfo(id) {
        this.showAlert(function () {
            var param = {
                "method": 'deleteClassDemeanorInfo',
                "id": id,
            };
            WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
                onResponse: function (result) {
                    if (result.msg == '调用成功' || result.success == true) {
                        var arr = demeanor.state.imgArr
                        demeanor.state.imgArr.forEach((v, i) => {
                            if (v.id == id) {
                                arr.splice(i, 1);
                            }
                        })
                        demeanor.setState({ imgArr: arr })
                    }
                },
                onError: function (error) {
                    // message.error(error);
                }
            });
        }, function () {
            // console.log('已取消');
        });
    }

    showAlert = (success, cancel) => {
        var phoneType = navigator.userAgent;
        var phone;
        if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
            phone = 'ios'
        } else {
            phone = 'android'
        }

        const alertInstance = alert('确定删除吗?', '', [
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

    deleteimgFromAndArr(index) {

        var arr = demeanor.state.imgFromAndArr;
        demeanor.state.imgFromAndArr.forEach((v, i) => {
            if (i == index) {
                arr.splice(i, 1);
            }
        })
        demeanor.setState({ imgFromAndArr: arr })
    }

    render() {
        return (
            <div id="classDemeanor" style={{ height: document.body.clientHeight }}>
                <div className="Img_cont">
                    <div className="classDemeanor_title">风采展示</div>
                    <div className='showImg my_flex my_flex_wrap'>
                        {this.state.imgArr.map((v) => {
                            var arr = v.imagePath.split('?');
                            var extra = arr[0].split('.');
                            return <div className="listImg flex_center">
                                {
                                    extra[extra.length - 1] == "mp4" ?
                                        <video style={{ width: "100%", height: "100%" }} src={v.imagePath}></video> :
                                        <img className='uploadImgBtn' src={v.imagePath} alt="" />
                                }

                                <img onClick={this.deleteClassDemeanorInfo.bind(this, v.id)} className='delImgBtn'
                                    src={require('../imgs/delPic.png')} alt="" />
                            </div>
                        })}
                    </div>
                    <WhiteSpace size="lg" />
                    <div className="classDemeanor_title">上传资源</div>
                    <div className='uploadImg my_flex my_flex_wrap'>
                        {this.state.imgFromAndArr.map((v, i) => {
                            var arr = v.split('?');
                            var extra = arr[0].split('.');
                            return <div className="listImg flex_center">
                                {/* {
                                    extra[extra.length - 1] == "jpg" ? <img className='uploadImgBtn' src={v} alt=""/> :
                                        extra[extra.length - 1] == "mp4" ?
                                            <video style={{width: "100%", height: "100%"}} src={v}></video> :
                                            extra[extra.length - 1] == "JPG" ?
                                                <img className='uploadImgBtn' src={v} alt=""/> : ""
                                } */}
                                {
                                    extra[extra.length - 1] == "mp4" ?
                                        <video style={{ width: "100%", height: "100%" }} src={v}></video> :
                                        <img className='uploadImgBtn' src={v} alt="" />
                                }
                                <img onClick={this.deleteimgFromAndArr.bind(this, i)} className='delImgBtn'
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
