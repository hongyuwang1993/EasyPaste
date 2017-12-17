import React from 'react';

import Paste from "../Paste";

import styles from "./style.js"

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={styles.body}>
                <Paste/>
            </div>
        )
    }
}

export default Main;

