const antdTheme = require('./src/theme.js')
module.exports = {
  publicPath: './',
  pwa: {
    iconPaths: {
      favicon32: './favicon.png',
      favicon16: './favicon.png',
      appleTouchIcon: './favicon.png',
      maskIcon: './favicon.png',
      msTileImage: './favicon.png',
    },
  },
  css: {
    loaderOptions: {
      less: {
        modifyVars: antdTheme,
        javascriptEnabled: true,
      },
    },
  },
  devServer: {
    proxy: {
      '^/v1': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/v1': '/v1',
        },
        headers: {
          Connection: 'keep-alive',
        },
      },
      '^/': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/': '/',
        },
        headers: {
          Connection: 'keep-alive',
        },
      },
      '^/mappin-test': {
        target: 'https://ltm03gutjl.execute-api.us-east-1.amazonaws.com/',
        secure: false,
      },
      '^/dev_test': {
        target: 'https://qcz9i1r3jj.execute-api.us-east-1.amazonaws.com/',
        secure: false,
      },
    },
  },
}
