const Config = require("./config.js");

const {app, BrowserWindow, clipboard, globalShortcut, ipcMain, Tray, Menu} = require('electron');

/**
 * 这个是保存复制的文本
 * @type {Array}
 */
const PASTE_TEXT = [];

/**
 * 全局的主窗口
 * @type {object}
 */
let mainWindow = null;
/**
 * 托盘
 * @type {object}
 */
let tray = null;

/**
 * 注册函数的原子方法
 * @param cmd
 * @param callback
 */
function doRegister(cmd, callback) {
    globalShortcut.register(cmd, callback);
}

/**
 * 注册快捷菜单
 */
function registerShortcut() {
    //注册开发F12快捷键
    // doRegister(Config.shortcut.dev, () => {
    //     let win = BrowserWindow.getFocusedWindow();
    //     if (!win) {
    //         return;
    //     }
    //     win.webContents.toggleDevTools();
    //     console.log("toggleDevTools F12");
    // });

    //注册Command + 1~9
    for (let i = 1; i < 10; i++) {
        doRegister(`${Config.shortcut.paste}+${i}`, () => {
            if (i > PASTE_TEXT.length) {
                return;
            }
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            }
            clipboard.writeText(PASTE_TEXT[i - 1]);
        });
    }

    doRegister(`${Config.shortcut.paste}+P`, () => {
        if (!mainWindow.isVisible()) {
            showMainWindow();
        }
    });
}

/**
 * 监听剪切板中的内容
 */
function listenClipboard() {
    // 先读取当前剪切板中的文字内容
    let currentText = clipboard.readText();
    if (!currentText) {
        return;
    }
    insertPasteText(currentText);
}

/**
 * 把文字内容插入剪切板
 * @param text
 */
function insertPasteText(text) {
    let pos = PASTE_TEXT.indexOf(text);
    if (pos === -1) {
        PASTE_TEXT.unshift(text);
        if (PASTE_TEXT.length > Config.maxLength) {
            PASTE_TEXT.pop();
        }
    } else {
        PASTE_TEXT.splice(pos, 1);
        PASTE_TEXT.unshift(text);
    }
}

function createMainWindow() {
    let win = new BrowserWindow({
        width: Config.width,
        height: Config.height,
        frame: false,
        transparent: true,
        resizable: true,
        title: Config.title,
        show: false
    });

    win.loadURL(`file://${__dirname}/index.html`);
    //给窗口绑定各种事件
    bindWindowEvent(win);
    return win;
}

function createTray() {
    let tray = process.platform === 'darwin' ? (new Tray(`${__dirname}/tray.png`)) : (new Tray(`${__dirname}/tray-win.png`));

    let trayMenuTemplate = [
        {
            label: '查看',
            click: function () {
                if (!mainWindow) {
                    mainWindow = createMainWindow();
                } else {
                    showMainWindow();
                }
            }
        },
        {
            label: '退出',
            click: function () {
                app.quit();
            }
        }
    ];
    let trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
    tray.setContextMenu(trayMenu);

    tray.on("click", () => {
        if (!mainWindow) {
            mainWindow = createMainWindow();
        } else {
            showMainWindow();
        }
    });

    return tray;
}

/**
 * 往渲染ui发送消息
 */
function sendPasteTextToUI() {
    //给渲染进程发送剪切板信息
    mainWindow.webContents.send(Config.messageFlag.clipboardMessage, PASTE_TEXT);
}

/**
 * 给窗口绑定事件
 * @param win
 */
function bindWindowEvent(win) {
    win.on('blur', () => {
        // globalShortcut.unregisterAll();
        win.hide();
    });

    win.on('focus', function () {
        // registerShortcut(win);
    });

    win.once('ready-to-show', () => {
        showMainWindow();
    })
}

function showMainWindow() {
    mainWindow.show();
    sendPasteTextToUI();
}

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    } else {
        showMainWindow();
    }
});

ipcMain.on(Config.messageFlag.clipboardMessage, (event, arg) => {
    mainWindow.hide();
    if (arg === 0) {
        return;
    }
    clipboard.writeText(PASTE_TEXT[arg - 1]);
});

/**
 * 入口函数
 */
app.on('ready', () => {
    mainWindow = createMainWindow();
    tray = createTray();
    listenClipboard();
    setInterval(listenClipboard, Config.listenClipboardInterval);
    //注册键盘快捷键
    registerShortcut();
});

