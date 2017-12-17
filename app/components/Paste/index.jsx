import React from 'react';
import {List, Icon} from 'antd';

const Config = require("../../../config.js");
const {ipcRenderer} = window.require('electron');

import styles from "./style.js";

class Paste extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentItem: 0,
            data: []
        };
    }

    componentDidMount() {
        //监听主进程传过来的数据
        ipcRenderer.on(Config.messageFlag.clipboardMessage, (event, arg) => {
            this.setState({data: arg});
        });

        window.addEventListener('keydown', this.handleOnKeyDown.bind(this), true);
    }

    handleOnMouseEnter(index) {
        this.setState({currentItem: index});
    }

    handleOnMouseLeave() {
        this.setState({currentItem: 0});
    }

    handleOnKeyDown(event) {
        switch (event.keyCode) {
            case 13:
                //回车
                this.sendCurrentSelectToMain();
                return;
            case 40:
                //arrowDown
                let next = this.state.currentItem + 1;
                this.setState({currentItem: next > this.state.data.length ? 1 : next});
                return;
            case 38:
                //arrowUp
                let pre = this.state.currentItem - 1;
                this.setState({currentItem: pre < 1 ? this.state.data.length : pre});
                return;
            case 27:
                //esc
                this.setState({currentItem: 0});
                this.sendCurrentSelectToMain();
                return;
        }
    }

    handleOnClick() {
        this.sendCurrentSelectToMain();
    }

    /**
     * 往主进程发送消息，告诉目前选择的哪一个
     */
    sendCurrentSelectToMain() {
        ipcRenderer.send(Config.messageFlag.clipboardMessage, this.state.currentItem);
    }

    render() {
        return (
            <div style={styles.body}>
                <List
                    style={styles.content}
                    size="small"
                    bordered
                    dataSource={this.state.data}
                    renderItem={(item, i) => (
                        <List.Item style={this.state.currentItem === (i + 1) ? styles.itemHover : styles.item}
                                   onClick={this.handleOnClick.bind(this)}
                                   onMouseLeave={this.handleOnMouseLeave.bind(this)}
                                   onMouseEnter={this.handleOnMouseEnter.bind(this, i + 1)}>
                            <span style={styles.text}>{item}</span>
                            <span
                                style={this.state.currentItem === (i + 1) ? styles.badgeHover : styles.badge}>{this.state.currentItem === (i + 1) ?
                                <Icon type="enter"/> : ("⌘ " + (i + 1))}</span>
                        </List.Item>
                    )}
                />
            </div>
        )
    }
}

export default Paste;

