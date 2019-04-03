import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Route, hashHistory, IndexRoute, Link} from 'react-router';
import App from './components/App';
import "./helpers/webServiceUtil";

/**
 * 注册学生账号
 * @param location
 * @param cb
 */
const stuAccountRegist = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/stuAccountRegist/js/stuAccountRegist').default)
    }, 'stuAccountRegist')
};

/**添加手表信息 */
const addWatchInfo = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/addWatchInfo').default)
    }, 'addWatchInfo')
};
const babyInfo = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/babyInfo').default)
    }, 'babyInfo')
};
const schoolInfo = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/schoolInfo').default)
    }, 'schoolInfo')
};


const verifyStuInfo = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/verifyStuInfo').default)
    }, 'verifyStuInfo')
};

const loginSuccess = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/addWatchInfo/js/loginSuccess').default)
    }, 'verifyStuInfo')
};

//更多页面
const morePage = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/morePage').default)
    }, 'morePage')
};

const validationMes = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/stuAccountRegist/js/validationMes').default)
    }, 'validationMes')
};

const watchPosition = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/watchPosition/js/watchPosition').default)
    }, 'watchPosition')
};

const watchTrail = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/watchPosition/js/watchTrail').default)
    }, 'watchTrail')
};

const commonLocation = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/watchPosition/js/commonLocation').default)
    }, 'updateClock')
};

const addNewLocation = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/watchPosition/js/addNewLocation').default)
    }, 'updateClock')
};

const updateLocation= (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/watchPosition/js/updateLocation').default)
    }, 'updateLocation')
};

//闹钟
const addClock = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/clock/addClock').default)
    }, 'addClock')
};

const clockList = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/clock/clockList').default)
    }, 'clockList')
};

const updateClock = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/clock/updateClock').default)
    }, 'updateClock')
};

const schoolPush= (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/schoolPush/js/schoolPush').default)
    }, 'schoolPush')
};

const teHomework= (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/schoolPush/js/teHomework').default)
    }, 'teHomework')
};
//排行榜
const rankingList= (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/rankingList/js/rankingList').default)
    }, 'rankingList')
};

const detailPage= (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/rankingList/js/detailPage').default)
    }, 'detailPage')
};

//验证绑定
const verifyBinding= (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/verifyBinding/js/verifyBinding').default)
    }, 'verifyBinding')
};

//学生信息
const studentInfo = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/studentInfo/studentInfo').default)
    }, 'studentInfo')
};
const watchContacts = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/watchContacts/watchContacts').default)
    }, 'watchContacts')
};
const loveRewards = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/loveRewards/loveRewards').default)
    }, 'loveRewards')
};
const bindAndUnbind = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/bindAndUnbind/bindAndUnbind').default)
    }, 'bindAndUnbind')
};
const setting = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/morePage/js/setting/setting').default)
    }, 'setting')
};

const articleList = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/article/js/articleList').default)
    }, 'articleList')
};

const articleDetail = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/article/js/articleDetail').default)
    }, 'articleDetail')
};

const pCenter = (location, cb) => {
    require.ensure([], require => {
        cb(null, require('./components/PersonalCenter/JS/pCenter').default)
    }, 'pCenter')
};


import './index.less';

class Index extends React.Component {
    render() {
        return (
            <div className="body">
                <ul role="nav">
                    <li>
                        <Link
                            to="/addWatchInfo?userId=23836"
                            style={{fontSize: '24px'}}>添加手表信息</Link>
                    </li>
                    <li>
                        <Link
                            to="/stuAccountRegist"
                            style={{fontSize: '24px'}}>注册学生账号</Link>
                    </li>
                    <li>
                        <Link
                            to="/morePage?userId=23836&version=1.0.0"
                            style={{fontSize: '24px'}}>morePage</Link>
                    </li>
                    <li>
                        <Link
                            to="/teHomework?userId=23836"
                            style={{fontSize: '24px'}}>教师作业</Link>
                    </li>
                    <li>
                        <Link
                            to="/schoolPush?userId=23836"
                            style={{fontSize: '24px'}}>校园通知</Link>
                    </li>
                    <li>
                        <Link
                            to="/rankingList?stuId=23991"
                            style={{fontSize: '24px'}}>排行榜</Link>
                    </li>
                </ul>
            </div>
        );
    }
}

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            {
                <IndexRoute component={Index}/>
            }
            <Route path="addWatchInfo" getComponent={addWatchInfo}/>
            <Route path="babyInfo" getComponent={babyInfo}/>
            <Route path="schoolInfo" getComponent={schoolInfo}/>
            <Route path="verifyStuInfo" getComponent={verifyStuInfo}/>
            <Route path="loginSuccess" getComponent={loginSuccess}/>
            <Route path="stuAccountRegist" getComponent={stuAccountRegist}/>
            <Route path="validationMes" getComponent={validationMes}/>
            <Route path="morePage" getComponent={morePage}/>
            <Route path="watchPosition" getComponent={watchPosition}/>
            <Route path="watchTrail" getComponent={watchTrail}/>
            <Route path="commonLocation" getComponent={commonLocation}/>
            <Route path="addNewLocation" getComponent={addNewLocation}/>
            <Route path="updateLocation" getComponent={updateLocation}/>
            <Route path="addClock" getComponent={addClock}/>
            <Route path="clockList" getComponent={clockList}/>
            <Route path="updateClock" getComponent={updateClock}/>
            <Route path="schoolPush" getComponent={schoolPush}/>
            <Route path="teHomework" getComponent={teHomework}/>
            <Route path="rankingList" getComponent={rankingList}/>
            <Route path="detailPage" getComponent={detailPage}/>
            <Route path="verifyBinding" getComponent={verifyBinding}/>
            <Route path="studentInfo" getComponent={studentInfo}/>
            <Route path="watchContacts" getComponent={watchContacts}/>
            <Route path="loveRewards" getComponent={loveRewards}/>
            <Route path="articleList" getComponent={articleList}/>
            <Route path="articleDetail" getComponent={articleDetail}/>
            <Route path="bindAndUnbind" getComponent={bindAndUnbind}/>
            <Route path="setting" getComponent={setting}/>
            <Route path="pCenter" getComponent={pCenter}/>
        </Route>
    </Router>, document.getElementById('example')
);
