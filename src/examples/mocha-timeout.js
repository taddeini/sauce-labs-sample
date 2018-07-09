const assert = require('chai').assert;

describe('[Sauce Labs Sample] - demo', () => {
    it('should fail due to mocha timeout', () => {
        browser.url('https://www.bestbuy.com.mx/');
    });
});