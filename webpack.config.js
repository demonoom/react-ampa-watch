const path = require('path');  //引入path模块
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const version = new Date().getTime();
// const version = '1.4.4';

const postcssOpts = {
    ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
    plugins: () => [
        autoprefixer({
            browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4'],
        }),
    ],
};

const uglify = require('uglifyjs-webpack-plugin');   //压缩工具

module.exports = {
    plugins: [
        ["import", {libraryName: "antd-mobile", style: "css"}, new uglify()] // `style: true` 会加载 less 文件
    ],
    devtool: 'false', // or 'inline-source-map'    生产模式,不再打包.map文件
    devServer: {
        disableHostCheck: true,
        // inline: false,  // 关闭热更新
    },

    entry: {
        "index": path.resolve(__dirname, 'src/index'),
        vendor: ['react', 'react-dom', 'react-router', 'redux'],   //提取react、redux第三方的库文件,
    }, /*指向spa应用的入口文件*/

    output: {
        filename: '[name].js?v=' + version,
        chunkFilename: '[name]_chunk.js?v=' + version,   //匹配chunk
        path: path.join(__dirname, '/dist'), /*输出的文件路径*/
        publicPath: '/'
    },

    resolve: {
        modules: [path.resolve(__dirname, 'node_modules'), path.join(__dirname, 'src')],
        extensions: ['.web.js', '.jsx', '.js', '.json'],
    },

    module: {
        rules: [
            {
                test: /\.jsx$/,    //用正则匹配文件路径,匹配js或者jsx
                exclude: /node_modules/,   //排除
                loader: 'babel-loader',    //加载模块
                options: {
                    plugins: [
                        'external-helpers', // why not work?
                        ["transform-runtime", {polyfill: false}],
                        ["import", [{"style": "css", "libraryName": "antd-mobile"}]]
                    ],
                    presets: ['es2015', 'stage-0', 'react']  //使用babel中的某些插件
                    // presets: [['es2015', { modules: false }], 'stage-0', 'react'] // tree-shaking
                }
            },
            {
                test: /\.(jpg|png|gif|svg|ttf|eot|woff)$/,
                loader: "url-loader?limit=8192"
            },
            // 注意：如下不使用 ExtractTextPlugin 的写法，不能单独 build 出 css 文件
            // { test: /\.less$/i, loaders: ['style-loader', 'css-loader', 'less-loader'] },
            // { test: /\.css$/i, loaders: ['style-loader', 'css-loader'] },
            {
                test: /\.less$/i,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader', {loader: 'postcss-loader', options: postcssOpts}, 'less-loader'
                    ]
                })
            },
            {
                test: /\.css$/i,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader', {loader: 'postcss-loader', options: postcssOpts}
                    ]
                })
            }
        ]
    },
    externals: {
        //"react": "React", 修改的地方
        //"react-dom": "ReactDOM" 修改的地方
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        //new webpack.optimize.CommonsChunkPlugin('shared'),
        //分离第三方应用的插件
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'shared.js?v=' + version
        }),

        //将开发模式变为生产模式
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"',
            },
        }),
        //抽取CSS文件插件
        new ExtractTextPlugin({filename: '[name].css?v=' + version, allChunks: true}),

        new HtmlWebpackPlugin({
            title: "HtmlPlugin",
            template: path.join(__dirname, "./index_deploy.html"),
            inject: "body",
            cache: false,
            xhtml: false
        })
    ]
}
