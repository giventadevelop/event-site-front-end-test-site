"use strict";

jQuery(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_ticker_widget.default', function ($scope) {
        Marquee3k.init();
    });
});
