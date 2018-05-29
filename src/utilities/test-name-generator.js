function generateTestName(testName) {
    var prefixName = browser.desiredCapabilities.prefixName || 'Chrome on OSX';
    browser.desiredCapabilities.name = prefixName + testName;
    return browser.desiredCapabilities.name;
}

module.exports = {
    generateTestName
};
