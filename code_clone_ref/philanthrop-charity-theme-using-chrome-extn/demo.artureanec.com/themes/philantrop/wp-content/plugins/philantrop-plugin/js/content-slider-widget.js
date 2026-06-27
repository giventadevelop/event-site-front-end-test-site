"use strict";

jQuery(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_content_slider.default', function ($scope) {
        let trigger = $scope.find('.philantrop_video_trigger'),
            slider = $scope.find('.philantrop_slider_slick'),
            slider_options = slider.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows'),
            prev = $scope.find('.philantrop_prev'),
            next = $scope.find('.philantrop_next'),
            status = $scope.find('.philantrop_slider_counter'),
            current_cont = status.find('.philantrop_current_slide'),
            all_cont = status.find('.philantrop_all_slides'),
            indicator = status.find('.philantrop_separator');

        trigger.fancybox();

        slider.on('init afterChange', function (event, slick, currentSlide, nextSlide) {
            var i = (currentSlide ? currentSlide : 0) + 1,
                n, b;

            if (i < 10) {
                n = '0';
            } else {
                n = '';
            }

            if (slick.slideCount < 10) {
                b = '0';
            } else {
                b = '';
            }

            current_cont.text(n + i);
            all_cont.text(b + slick.slideCount);
            indicator.find('.current').removeClass('current');
            indicator.find('#indicator_' + i + '').addClass('current');
        });

        setTimeout(
            slider.slick({
                fade: true,
                pauseOnHover: slider_options['pauseOnHover'],
                autoplay: slider_options['autoplay'],
                autoplaySpeed: slider_options['autoplaySpeed'],
                speed: slider_options['speed'],
                infinite: slider_options['infinite'],
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
                touchThreshold: 100,
                rtl: slider_options['rtl'],
                slidesToShow: 1,
                prevArrow: prev,
                nextArrow: next,
                arrows: slider_options['arrows'],
                dots: slider_options['dots'],
                appendDots: dots_container,
                adaptiveHeight: true
            }), 3000
        );
    });
});
