/**
 * 这里存放一些配置项
 */
module.exports = {
    //窗口的宽度
    width: 400,
    //窗口的高度
    height: 420,
    //窗口的标题
    title: "EasyPaste",
    //快捷键
    shortcut: {
        dev: "F12",
        paste: "CommandOrControl",
        esc: "Esc"
    },
    maxLength: 9,
    messageFlag: {
        clipboardMessage: "CLIPBOARD_MESSAGE"
    },
    listenClipboardInterval: 500
};