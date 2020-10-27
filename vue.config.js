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
      '/v1': {
        target: 'http://localhost:3000/',
      },
      '/': {
        target: 'http://localhost:3000/',
      },
      '^/mappin-test': {
        target: 'https://ltm03gutjl.execute-api.us-east-1.amazonaws.com/',
      },
      '^/dev_test': {
        target: 'https://qcz9i1r3jj.execute-api.us-east-1.amazonaws.com/',
      },
    },
  },
}
