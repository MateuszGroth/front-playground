const CracoSwcPlugin = require('craco-swc')
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin')

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      return {
        ...webpackConfig,
        devtool: 'source-map',
        resolve: {
          ...webpackConfig.resolve,
          plugins: [
            ...webpackConfig.resolve.plugins,
            sentryWebpackPlugin({
              debug: true,
              telemetry: false,
            }),
          ],
        },
      }
    },
  },
  plugins: [{ plugin: CracoSwcPlugin }],
}
