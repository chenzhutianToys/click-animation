require('shelljs/global');

function clean(){
    rm('-rf', 'dist');
}

function build() {
    var webpack = require('webpack');
    var config = require('./webpack.config');
    process.env.NODE_ENV = "production"
    rm('-rf', 'dist/*');
    mkdir('-p', "dist/data");
    cp("src/data/*","dist/data/")
    webpack(config, function (err, stats) {
        if (err) throw err;
        process.stdout.write(`${stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false,
        })}\n`);
    });
}

var command = process.argv[2];
switch (command) {
    case "clean": clean(); break;
    case "build": build(); break;
    default: console.info("No command");
}

