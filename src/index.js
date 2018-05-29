const assert = require('chai').assert;
const testNameGenerator = require('./utilities/test-name-generator');

describe('[Sauce Labs Sample] ' + testNameGenerator.generateTestName(' - Go search for a product and add it to the cart'), () => {

    it('should search, and from the list page add the product to cart successfully, skipping any warranties that may exist.', () => {
        loadHomePage();

        const isSmallView = isThisPageInSmallView();

        searchForCasa(isSmallView);

        const elementMetaData = findFirstPlpProductWithValidButtonState();

        hideChatOverlay();

        // Click on the 'Add To Cart' button for this line item.
        browser.execute(function() {
            try {
                $(elementMetaData.buttonSelector)[0].scrollIntoView();
            }
            catch (e) {
                console.log('[WARNING] Unable to find add to cart button with valid button state from list page.');
            }
        });

        elementMetaData.button.click();        

        processProtectionPlanDialog(elementMetaData.hasWarranties);

        validateCartHasMyProduct(elementMetaData.skuId);
    });

    it('should search, go to list page, then the PDP, view and add to cart successfully, skipping any warranties that may exist.', () => {        
        loadHomePage();

        const isSmallView = isThisPageInSmallView();

        searchForCasa(isSmallView);

        const elementMetaData = findFirstPlpProductWithValidButtonState();

        hideChatOverlay();

        loadGdpPage(elementMetaData.pdpUrl);
        assert.equal(browser.getUrl(), elementMetaData.pdpUrl, 'Did not make it to the correct PDP');

        ensurePdpPageHasLoadedWithYourSkuId(elementMetaData.skuId);

        browser.execute(function() {
            try {
                $('.shop-add-to-cart button')[0].scrollIntoView();
            }
            catch (e) {
                console.log('Unable to add the product to cart');
            }
        });

        // Click on the 'Add To Cart' button for this product page.        
        browser.click('.shop-add-to-cart button');

        processProtectionPlanDialog(elementMetaData.hasWarranties);

        validateCartHasMyProduct(elementMetaData.skuId);
    });

    //------------------------------------------------------------------------------------------

    function hideChatOverlay() {
        if (browser.isExisting('#chat-telvista-global')) {
            browser.execute(function () {
                try {
                    document.getElementById('chat-telvista-global').style.display = 'none';
                }
                catch (e) {
                    console.log(e);
                }
            });
        }
    }

    function setViewPortSize() {
        /*
        This ensures the window is big enough to show the line items we want to click on.
        */
        browser.setViewportSize({
            width: 1200,
            height: 20000
        });
    }

    function loadHomePage() {
        loadGdpPage('https://www.bestbuy.com.mx');
    }

    function loadGdpPage(url) {
        /*
        Load the page and wait till ready
        The selector is specific to GDP pages.
        */
        browser.url(url);
        browser.waitForExist('footer, #footer');
    }

    function isThisPageInSmallView() {
        /*
        Determine if large or small view, aso we can do different actions based on size
        */
        console.log('Determining view size.');
        return browser.isExisting('body.size-s');
    }

    function searchForCasa(isSmallView) {
        /*
        Search for a product in 'casa'
        */
        let submitSearchSelector = '.hf-icon-search';
        const searchFieldTextBox = '#gh-search-input';

        if (isSmallView) {
            browser.element('.header-search-icon .hf-icon-search').click();
            browser.waitForVisible(searchFieldTextBox);

            browser.setValue(searchFieldTextBox, 'casa');

            submitSearchSelector = '.header-search-button .hf-icon-search';
            browser.element(submitSearchSelector).click();
        }
        else if (browser.desiredCapabilities.browserName.toLowerCase() === 'internet explorer') {
            // IE fails to handle the click event on a span.
            // So we're sending in a newline to act as the enter key
            browser.setValue(searchFieldTextBox, 'casa\n');
        }
        else {
            browser.setValue(searchFieldTextBox, 'casa');
            browser.element(submitSearchSelector).click();
        }

        browser.waitForExist('.plp-container');
    }

    function findFirstPlpProductWithValidButtonState() {
        /*
        Add this item to the cart
        */

        // Get the sku we should use, and check if it has warranties
        const results = browser.execute(function () {
            try {
                var skuToUse = undefined;
                $('.product-line-item-line').each(function (i, el) {
                    if (!skuToUse) {
                        var canAddToCart = $(el).find('.cart-button-wrapper .btn.btn-secondary').length > 0;
                        if (canAddToCart) {
                            skuToUse = {
                                index: i,
                                skuId: window.INITIAL_PAGE_STATE.products[i].skuId,
                                hasWarranties: _.keys(window.INITIAL_PAGE_STATE.products[i].financingOffer).length > 0
                            };
                        }
                        else {
                            console.log('Unable to locate a valid add to cart button in: ' + browser.getUrl());
                        }
                    }
                });
                console.log('Found a sku to use');
                return skuToUse;
            }
            catch (e) {
                return e;
            };
        });

        const skuToUse = results.value || {};

        // Find the add to cart button
        return {
            button: browser.elements('.product-line-item-line .cart-button-wrapper .btn').value[skuToUse.index],
            pdpUrl: browser.elements('.product-line-item-line .product-title a').value[skuToUse.index].getAttribute('href'),
            hasWarranties: skuToUse.hasWarranties,
            skuId: skuToUse.skuId,
            skuIndex: skuToUse.index,
            buttonSelector: '.product-line-item-line .cart-button-wrapper .btn[' + skuToUse.index + ']'
        };
    }

    function ensurePdpPageHasLoadedWithYourSkuId(skuId) {
        // Make sure we're on the correct PDP page
        assert.equal(browser.element('span#sku-value').getText().trim(), skuId, 'The expected SKU ID of "' + skuId + '" was not found on the PDP page. Please ensure we\'re geting to the correct page.');
    }

    function processProtectionPlanDialog(hasWarranties) {
        // Handle warranty dialog if it exists.
        if (hasWarranties) {
            const noThanksLinkOnWarranties = '.atc-warranties-no-thanks';
            try{
                browser.waitForExist(noThanksLinkOnWarranties);
            }
            catch(e) {
                console.log('No thanks to warranties did not load');
            }
            browser.execute(function() {
                try {
                    $('.atc-warranties-no-thanks')[0].scrollIntoView();
                }
                catch (e) {
                    console.log('Unable to move on without rejecting a warranty option');
                }
            });            
            browser.click(noThanksLinkOnWarranties);            
        }
    }

    function validateCartHasMyProduct(skuId) {
        browser.waitForExist('.product-cart-image a');

        let foundSkuOnPage = false;
        const skuDivTags = browser.elements('.product-cart-image a').value;
        skuDivTags.forEach(divTag => {
            // Check the url, as the skuId should be on the url at the end.
            if (divTag.getAttribute('href').indexOf(skuId) > -1) {
                foundSkuOnPage = true;                
            }
        });

        if (!foundSkuOnPage) {
            // The item is not added to cart. Lets fail the test.
            assert.fail(skuId, '', 'We did not find the product has been added to the cart. SkuId: ' + skuId);
        }
    }
});
