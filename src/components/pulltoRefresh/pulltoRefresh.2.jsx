import React from "react";
import MiniRefreshTools from 'minirefresh';
import 'minirefresh/dist/debug/minirefresh.css'
import "./pull.css"
var calm;
window.mescroll = null;
export default class pulltoRefresh extends React.Component {
    constructor(props) {
        super(props);
        calm = this;
        this.state = {
            pdType: 0,
            tabs: [
                {
                    title: "答题排行榜", label: 0, isActive: true
                },
                {
                    title: "爱心", label: 1, isActive: false
                },
                {
                    title: "运动", label: 2, isActive: false
                }
            ]
        };
    }
    componentWillMount () {
        var locationHref = decodeURI(window.location.href);
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        this.setState({
            userId
        })
    }
    componentDidMount () {
        //创建MeScroll对象,内部已默认开启下拉刷新,自动执行up.callback,刷新列表数据;
        // 引入任何一个主题后，都会有一个 MiniRefresh 全局变量
        var miniRefresh = new MiniRefresh({
            container: '#minirefresh',
            down: {
                callback: function () {
                    console.log("yuio")
                    // 下拉事件
                    miniRefresh.endDownLoading();
                }
            },
            up: {
                callback: function () {
                    // 上拉事件
                    // 注意，由于默认情况是开启满屏自动加载的，所以请求失败时，请务必endUpLoading(true)，防止无限请求
                    miniRefresh.endUpLoading(true);
                }
            }
        });

    }

    componentWillUnmount () {
        //解除监听
        window.removeEventListener('resize', this.onWindowResize)
    }
    /**
       * 视窗改变时改变高度
       */
    onWindowResize () {
        setTimeout(() => {
            calm.setState({ clientHeight: document.body.clientHeight });
        }, 100)
    }




    render () {
        return (
            <div>
                <div id="minirefresh" className="minirefresh-wrap">
                    <div className="minirefresh-scroll" style={{overflow:"hidden"}}>
                        <div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                            <div>啊时光会撒娇看大家好</div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
}
