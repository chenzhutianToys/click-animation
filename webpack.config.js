var webpack = require("webpack");
var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(ROOT_PATH,"src");
var BUILD_PATH = path.resolve(ROOT_PATH,"dist");
console.log(BUILD_PATH);
module.exports = {
    entry : {
        app:APP_PATH,
        vendors:["material-design-lite/src/material-design-lite.scss","d3","vue","material-design-lite"]
    },
    output: {
        path: BUILD_PATH,
        // publicPath: "/build/",
        filename: "./js/[name].js"
    },
    module: {
        preloaders:[
            { test:/\.js$/,loader:"jshint-loader" }
        ],
        loaders: [
            { test: /\.vue$/, loader: "vue" },
            { test: /\.js$/, loader: "babel", exclude: /node_modules/ },
            { test: /\.json$/, loader: "json"},
            { test:/\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader",{ publicPath: "../"})},
            { test: /\.scss$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader",{ publicPath: "../"}) },
            { test: /\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader",{ publicPath: "../"})},
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/font-woff&name=fonts/[name].[ext]"},
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=application/octet-stream&name=fonts/[name].[ext]"},
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file?name=fonts/[name].[ext]"},
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&mimetype=image/svg+xml&name=fonts/[name].[ext]"},
            { test: /\.(jpe?g|png|gif)$/i,
                loaders: [
                    "file?hash=sha512&digest=hex&name=img/[hash].[ext]",
                    "image-webpack?bypassOnDebug&optimizationLevel=0&interlaced=false"
                ]
            },
             { test: require.resolve("material-design-lite/material.js"), loader: "exports?componentHandler" }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new webpack.optimize.CommonsChunkPlugin('vendors', './js/vendors.js'),
        new ExtractTextPlugin("./css/[name].css"),
        new HtmlWebpackPlugin({
            template:"src/index.html"
        })
    ],
    vue:{
      loaders:{
          css:ExtractTextPlugin.extract("css")
      }  
    },
    jshint: {
        "esnext": true
    },
    babel: {
        presets: ["es2015"],
        plugins: ["transform-runtime"]
    }
}

if (process.env.NODE_ENV === "production") {
  module.exports.plugins = [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: "production"
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin()
  ]
} else {
  module.exports.devtool = "#source-map"
}