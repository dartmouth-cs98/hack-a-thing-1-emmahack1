// modified from https://github.com/facebook/create-react-app/issues/6782
// this allows me to use fs for storing the locations
module.exports = {
    webpack: {
        configure: {
            target: 'electron-renderer'
        }
    }
};