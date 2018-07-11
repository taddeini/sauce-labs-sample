const assert = require('chai').assert;

describe('[Sauce Labs Sample] - demo', () => {
    it('should fail due to timeouts', () => {
        // 1) Set mochaOpts.timeout value to 1000 
        //browser.url('https://www.bestbuy.com.mx/');
                
        // 2) Set commandTimeout value to 5
        browser.url('https://www.bestbuy.com.mx/');
        browser.execute(function () {            
            while (true) {
                return true;
            }
        });
    });
});