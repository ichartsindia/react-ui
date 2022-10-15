var path = require('path');
var webpack = require('webpack');
const InterpolateHtmlPlugin=require('interpolate-html-plugin');

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist",
        publicPath: '/dist',
    },
    devtool: "source-map",
    devServer: {
        // ...
        watchContentBase: true,
        publicPath: '/dist/',
      },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader"
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                      '@babel/preset-env',
                      '@babel/preset-react',
                      {
                        plugins: [
                          '@babel/plugin-proposal-class-properties'
                        ]
                      }
                    ]
                  }
            },
            {
                test: /(\.css$)/,
                loaders: ['style-loader', 'css-loader']
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg|gif|png)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: './[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },
    plugins: [
      new InterpolateHtmlPlugin({PUBLIC_URL: 'par' })
      ],
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // }
    externals: {
      'Config': JSON.stringify(process.env.NODE_ENV == 'development' ? {
        serverUrl: "http://localhost:8080/api/"
      } : {
        serverUrl: "."
      })
    }
};
