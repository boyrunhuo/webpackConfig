// 配置webpack编译入口
// 配置webpack输出路径、名称和静态文件路径
// 配置不同模块的处理规则与命名规则
'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const { VueLoaderPlugin } = require('vue-loader')
const vueLoaderConfig = require('./vue-loader.conf')

// 获取根目录
function resolve(dir) {
  //path.join() 方法使用平台特定的分隔符作为定界符将所有给定的 path 片段连接在一起，然后规范化生成的路径。
  // __dirname是根目录绝对路径，假设__dirname是D:\\a\b，path.join(__dirname,'..',dir)就返回D:\\a\dir
  return path.join(__dirname, '..', dir)
}

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

module.exports = {
  //基础目录，绝对路径，用于从配置中解析入口起点(entry point)和 loader
  context: path.resolve(__dirname, '../'),
  //起点或是应用程序的起点入口。从这个起点开始，应用程序启动执行。如果传递一个数组，那么数组的每一项都会执行。动态加载的模块不是入口起点。
  //简单规则：每个 HTML 页面都有一个入口起点。单页应用(SPA)：一个入口起点，多页应用(MPA)：多个入口起点。
  entry: {
    app: './src/main.js'
  },
  output: {
    //输出路径
    path: config.build.assetsRoot,
    //输出文件名称，name为entry中定义的key值
    filename: '[name].js',
    //静态资源路径，
    //开发环境下，路径为config目录下index的dev中设置的assetsPublicPath
    //生产环境下，路径为config目录下index的build中设置的assetsPublicPath
    publicPath:
      process.env.NODE_ENV === 'production'
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
  },
  //解析，这些选项能设置模块如何被解析。webpack 提供合理的默认值，但是还是可能会修改一些解析的细节。
  resolve: {
    // 自动解析拓展，引用文件时不用写后缀
    extensions: ['.js', '.vue', '.json'],
    //　配置别名，避免在结构嵌套过深的情况下出现../../../../xxx这种写法
    alias: {
      '@': resolve('src')
    }
  },
  // 模块，这些选项决定了如何处理项目中的不同类型的模块。
  module: {
    rules: [
      ...(config.dev.useEslint ? [createLintingRule()] : []),
      // 配置不同模块的处理规则，loader 让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）
      
      //UseEntry
      {
        test: /\.vue$/,// Rule.test 是 Rule.resource.test 的简写。条件会匹配 resource。既可以提供 Rule.resource 选项，也可以使用快捷选项 Rule.test，Rule.exclude 和 Rule.include。
        loader: 'vue-loader',//Rule.loader 是 Rule.use: [ { loader } ] 的简写。
        options: vueLoaderConfig// options 属性为字符串或对象。值可以传递到 loader 中，将其理解为 loader 选项。


      },
      {
        test: /\.js$/,
        loader: 'babel-loader?cacheDirectory',
        //Rule.include 是 Rule.resource.include 的简写。
        //如果你提供了 Rule.include 选项，就不能再提供 Rule.resource。
        include: [
          resolve('src'),
          resolve('test'),
          resolve('node_modules/webpack-dev-server/client')
        ]
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [resolve('src/icons')],
        options: {
          //svg-sprite-loader的参数，使用文件名作为 symbol 的 ID
          symbolId: 'icon-[name]'
        }
      },
      {
        //url-loader同时设置了src(<img src="../xx">)路径的名称与文件的名称
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        // src/icon下的svg文件是用来做svg雪碧图的，就不用url-loader处理，用exclude过滤掉
        exclude: [resolve('src/icons')],
        // 对于图片资源，当文件体积小于10kb时，将其生成为base64，直接插入html中
        // 当大于10kb时，将图片名称进行按照命名规则进行更改
        // dist/static/img的几张图片，就是大于10kb的，打包后生成“图片名.7位hash.后缀”的文件名
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  
  //插件提供了webpack自身不具备的功能，使webpack更加灵活
  plugins: [
    //Vue Loader 的配置和其它的 loader 不太一样。除了通过一条规则将 vue-loader 应用到所有扩展名为 .vue 的文件上之外，
    //请确保在你的 webpack 配置中添加 Vue Loader 的插件
    new VueLoaderPlugin()
  ],

  //这些选项可以配置是否 polyfill 或 mock 某些 Node.js 全局变量和模块。
  //这可以使最初为 Node.js 环境编写的代码，在其他环境（如浏览器）中运行。
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}
