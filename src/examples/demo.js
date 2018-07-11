const assert = require('chai').assert;

describe('[Sauce Labs Sample] - demo', () => {
    it('should fail due to timeouts', () => {
        // Load
        browser.url('https://www.bestbuy.com.mx/');
        
        // Resize
        browser.setViewportSize(1000, 1000);
        
        // Search
        browser.setValue('#gh-search-input', 'apple');
        browser.element('.hf-icon-search').click();

        // TIMEOUTS
        // 1) Set mochaOpts.timeout value    
        // 2) Set commandTimeout
        // browser.execute(function () {
        //     while (true) {
        //         console.log('Uh oh...');
        //     }
        // });
    });
});