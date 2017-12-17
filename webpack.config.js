// 一个常见的`webpack`配置文件
module.exports = {
    entry: __dirname + "/app/main.jsx", //已多次提及的唯一入口文件
    output: {
        path: __dirname + "/build",
        filename: "bundle.js"
    },
    module: {
        rules: [{
            test: /\.jsx?$/, // 用正则来匹配文件路径，这段意思是匹配 js 或者 jsx
            use: [{
                loader: "babel-loader",
                options: {
                    presets: ["react", "es2015"],
                    plugins: [
                        ["import", {"libraryName": "antd", "libraryDirectory": "es", "style": "css"}]
                    ]
                }
            }],
            exclude: /node_modules/
        }, {
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    plugins: [],
    node: {
        fs: 'empty'
    }
};
