const fs = require('fs');
const path = require('path');

const buildOutputDir = path.join(__dirname, '../client-build');
const rootBuildDir = path.join(__dirname, '../build');

function copyBuildOutput() {
    if (!fs.existsSync(buildOutputDir)) {
        console.error('Client build output does not exist.');
        return;
    }

    fs.copyFileSync(buildOutputDir, rootBuildDir);
    console.log('Build output copied to root build directory.');
}

copyBuildOutput();
