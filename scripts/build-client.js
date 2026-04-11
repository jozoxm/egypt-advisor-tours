// Update the client by running npm install and build
const { exec } = require('child_process');

// Define a function to execute shell commands
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(`Error: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}

async function buildClient() {
    try {
        console.log('Installing client dependencies...');
        await runCommand('npm install --prefix client');
        console.log('Building client...');
        await runCommand('npm run build --prefix client');
        console.log('Copying build output to root build directory...');
        await runCommand('cp -r client/build/* build/');
        console.log('Build completed successfully!');
    } catch (error) {
        console.error(error);
    }
}

buildClient();