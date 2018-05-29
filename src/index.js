const assert = require('chai').assert;

describe('test 1', () => {
    it('should load the home page', () => {
        browser.url('http://www.bestbuy.com.mx');
    });
});