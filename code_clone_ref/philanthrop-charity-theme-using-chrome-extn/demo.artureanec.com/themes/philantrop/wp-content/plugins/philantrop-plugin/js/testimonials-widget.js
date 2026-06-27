"use strict";

jQuery(window).on('elementor/frontend/init', function () {
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_testimonials.default', function ($scope) {
        let testimonials = $scope.find('.philantrop_slider_slick'),
            slider_options = testimonials.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows'),
            prev = $scope.find('.philantrop_slider_navigation_container .philantrop_prev'),
            next = $scope.find('.philantrop_slider_navigation_container .philantrop_next'),
            status = $scope.find('.philantrop_slider_counter'),
            current_cont = status.find('.philantrop_current_slide'),
            all_cont = status.find('.philantrop_all_slides'),
            indicator = status.find('.philantrop_separator');

        testimonials.on('init', function (event, slick) {
            let i, n, width;
            
            for (i = 0; i < slick.slideCount; i++) {
                n = i + 1;
                width = 100 / slick.slideCount;

                indicator.append('<span id="indicator_' + n + '" style="width: ' + width + '%;"></span>');
            }
        });

        testimonials.on('init afterChange', function (event, slick, currentSlide) {
            let i = (currentSlide ? currentSlide : 0) + 1,
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

        testimonials.slick({
            fade: slider_options['fade'],
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            rtl: slider_options['rtl'],
            slidesToShow: slider_options['slidesToShow'],
            prevArrow: prev,
            nextArrow: next,
            // arrows: true,
            // dots: false,
            // appendArrows: dots_container,
            adaptiveHeight: true,
            responsive: [{
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }],
        });

        jQuery(window).on('scroll', function () {
            $scope.find('.philantrop_motion_effect_on').each(function () {
                let container_top = jQuery(this).offset().top,
                    visible_area_top = jQuery(window).scrollTop(),
                    visible_area_bottom = visible_area_top + (jQuery(window).height());

                if (container_top < visible_area_bottom) {
                    jQuery(this).find('.philantrop_testimonials_wrapper').addClass('visible');
                }
            });
        });
    });
});
