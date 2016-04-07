module.exports = {
    entry: './src/index.js',
    output: {
        path: 'builds',
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: "babel",
            query: {
                presets: ['es2015', 'react']
            }
        }],
    },
    devServer: {
        historyApiFallback: {
            index: '/index.html'
        }
    }
};