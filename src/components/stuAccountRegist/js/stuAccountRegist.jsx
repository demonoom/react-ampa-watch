import React from "react";
import {InputItem, List, Picker, Toast, Button} from 'antd-mobile';
import '../css/stuAccountRegist.less'
import {provinceLite} from 'antd-mobile-demo-data';

export default class stuAccountRegist extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stuName: '',
            classId: '',
            schoolId: '',
            schoolName: '',
            inputValue: '',
            responseList: [],
            data: [],
            cols: 1,
        };
    }

    componentDidMount() {

    }

    /**
     * 改变学生姓名
     * @param e
     */
    stuOnChange = (e) => {
        this.setState({stuName: e})
    };

    schoolOnClick = () => {
        $('.updateModel').slideDown();
        $('.mask').show();
    };

    /**
     * 根据学校名称搜索学校
     * getSchoolsBySchoolName(String schoolName,String pageNo)
     */
    getSchoolsBySchoolName = () => {
        var _this = this;
        if (this.state.inputValue === '') {
            Toast.fail('请输入内容');
            return
        }
        var param = {
            "method": 'getSchoolsBySchoolName',
            "schoolName": this.state.inputValue,
            "pageNo": -1,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    if (result.response.length === 0) {
                        Toast.info('未找到相关学校')
                    } else {
                        _this.buildSchoolList(result.response)
                    }
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    buildSchoolList = (data) => {
        var _this = this;
        var arr = [];
        data.forEach(function (v, i) {
            arr.push(<li
                className='line_public noomPowerList textOver'
                onClick={() => {
                    _this.schoolItemOnClick(v);
                }}>{v.name}</li>)
        });
        this.setState({responseList: arr})
    };

    schoolItemOnClick = (data) => {
        this.exitSchoolInput();
        this.setState({schoolName: data.name, schoolId: data.id})
    };

    schoolNameOnChange = (e) => {
        this.setState({inputValue: e.target.value})
    };

    exitSchoolInput = () => {
        this.setState({responseList: []});
        $('.updateModel').slideUp();
        $('.mask').hide();
        this.setState({inputValue: ''})
    };

    classOnClick = () => {
        if (this.state.schoolId === '') {
            Toast.fail('请先选择学校');
            return
        }
        this.getGradesBySchoolId(this.state.schoolId);
    };

    /**
     * 根据学校id查询所有年级
     * getGradesBySchoolId(String schoolId,String pageNo)
     */
    getGradesBySchoolId = (schoolId) => {
        var _this = this;
        var param = {
            "method": 'getGradesBySchoolId',
            "schoolId": schoolId,
            "pageNo": -1,
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    var arr = result.response.map((v) => {
                        return {
                            "value": v.id,
                            "label": v.name
                        }
                    });
                    _this.setState({
                        data: arr,
                    }, () => {
                        _this.onPickerChange([arr[0].value])
                    });
                    // this.setState({
                    //     data: provinceLite,
                    // });
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    onPickerChange = (val) => {
        var _this = this;
        let colNum = 1;

        let par = new Promise((resolve, reject) => {
            this.getClazzesByGradeId(val, function (obj) {
                resolve(obj);
            });
        });
        Promise.all([par]).then((result) => {
            var arr = _this.state.data;
            arr.map((v) => {
                if (v.value === [...val][0]) {
                    v.children = result[0]
                }
            });
            const d = arr;
            const asyncValue = [...val];

            d.forEach((i) => {
                if (i.children && i.value === val[0]) {
                    colNum = 2;
                    asyncValue.push(i.children[0].value);
                }
            });
            this.setState({
                data: d,
                cols: colNum,
                asyncValue,
            });

        });
    };

    /**
     * 查询此年级的所有的班级
     * @param data
     * getClazzesByGradeId(String gradeId)
     */
    getClazzesByGradeId = (data, resolve) => {
        var param = {
            "method": 'getClazzesByGradeId',
            "gradeId": data[0],
        };
        WebServiceUtil.requestLittleAntApi(JSON.stringify(param), {
            onResponse: (result) => {
                if (result.msg == '调用成功' || result.success == true) {
                    resolve(result.response.map((v) => {
                        return {
                            "label": v.name,
                            "value": v.id
                        }
                    }))
                } else {
                    Toast.fail(result.msg, 1);
                }
            },
            onError: function (error) {
                Toast.warn('保存失败');
            }
        });
    };

    nextStep = () => {
        if (this.state.stuName.trim() === '') {
            Toast.fail('请输入学生姓名');
            return
        }
        if (this.state.classId === '') {
            Toast.fail('请选择学生所在班级');
            return
        }
        console.log(this.state.classId);
        console.log(this.state.schoolId);
        console.log(this.state.stuName);
    };

    render() {
        return (
            <div id="stuAccountRegist">
                <h1>注册学生账号</h1>
                <div className='am-list-item am-list-item-middle' onClick={this.schoolOnClick}>
                    <div className="am-list-line">
                        <div className="am-list-content">学生所在学校</div>
                        <div
                            className="am-list-extra">{this.state.schoolName == '' ? '请选择' : this.state.schoolName}</div>
                        <div className="am-list-arrow am-list-arrow-horizontal"></div>
                    </div>
                </div>

                <Picker
                    data={this.state.data}
                    cols={this.state.cols}
                    value={this.state.asyncValue}
                    onPickerChange={this.onPickerChange}
                    onOk={v => this.setState({classId: this.state.asyncValue[1]})}
                >
                    <List.Item arrow="horizontal" onClick={this.classOnClick}>学生所在班级</List.Item>
                </Picker>

                <InputItem
                    className=""
                    placeholder="请输入学生姓名"
                    value={this.state.stuName}
                    onChange={this.stuOnChange}
                ></InputItem>

                <div className="mask" onClick={this.exitSchoolInput} style={{display: 'none'}}></div>
                <div className='updateModel' style={{display: 'none'}}>
                    <div className='searchDiv'>
                        <input type="text" value={this.state.inputValue} onChange={this.schoolNameOnChange}
                               placeholder='请输入搜索内容'/>
                        <span onClick={this.getSchoolsBySchoolName}>搜索</span>
                    </div>
                    <div className='cont'>
                        {this.state.responseList}
                    </div>
                </div>
                <Button type='primary' onClick={this.nextStep}>下一步</Button>
            </div>
        )
    }
}



