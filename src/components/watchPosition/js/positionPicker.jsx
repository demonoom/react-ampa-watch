import React from 'react'

/**
 *PositionPicker（拖拽选址） 组件
 */
class positionPicker extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
        this.loadUI();
    }

    loadUI() {
        var _this = this;
        window.AMapUI.loadUI(['misc/PositionPicker'], (PositionPicker) => {
            const map = this.props.__map__;

            const positionPicker = new PositionPicker({
                mode: 'dragMap',
                map: map
            });

            positionPicker.on('success', function (positionResult) {
                _this.props.posPicker(positionResult)
            });
            positionPicker.on('fail', function (positionResult) {
                console.log(positionResult);
            });

            positionPicker.start();
            // map.panBy(0, 1);
        })
    }


    render() {
        return null;
    }
}

export default positionPicker

