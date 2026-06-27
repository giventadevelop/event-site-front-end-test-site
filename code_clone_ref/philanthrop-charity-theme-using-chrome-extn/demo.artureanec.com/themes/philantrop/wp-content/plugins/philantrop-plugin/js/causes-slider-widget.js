"use strict";

jQuery(window).on('elementor/frontend/init', function () {
    function customCursor($scope) {
        if($scope.find('.custom_cursor_active').length > 0 && jQuery(window).width() >= 992) {

            function showCustomCursor(event) {
                const cursor = jQuery('.cursor_drag', $scope);
                cursor.css('left', event.clientX-5).css('top', event.clientY-5);
            }
            var slider = $scope.find('.philantrop_slider_slick'),
                slider_link = slider.find('a');

            slider.mousemove(showCustomCursor);

            slider.mouseleave(function(e) {
                if(!jQuery('body').hasClass('elementor-editor-active')) {
                    const cursor = jQuery('.cursor_drag', $scope);
                    $scope.css({cursor: 'auto'});
                    cursor.removeClass('active');
                    setTimeout(function() {
                        if(!cursor.hasClass('active')) {
                            cursor.hide();
                        }
                    }, 300);
                }
            });

            slider.mouseenter(function(e) {
                if(!jQuery('body').hasClass('elementor-editor-active')) {
                    const cursor = jQuery('.cursor_drag', $scope);
                    $scope.css({cursor: 'none'});
                    cursor.show();
                    setTimeout(function() {
                        cursor.addClass('active');
                    }, 10);
                }
            });

            if ($scope.find('.philantrop_linked_item_slider_widget')) {} else {
                slider_link.mouseenter(function (e) {
                    if(!jQuery('body').hasClass('elementor-editor-active')) {
                        const cursor = jQuery('.cursor_drag', $scope);
                        $scope.css({cursor: 'auto'});
                        cursor.removeClass('active');
                        setTimeout(function() {
                            if(!cursor.hasClass('active')) {
                                cursor.hide();
                            }
                        }, 300);
                    }
                });

                slider_link.mouseleave(function (e) {
                    if(!jQuery('body').hasClass('elementor-editor-active')) {
                        const cursor = jQuery('.cursor_drag', $scope);
                        $scope.css({cursor: 'none'});
                        cursor.show();
                        setTimeout(function() {
                            cursor.addClass('active');
                        }, 10);
                    }
                });
            }
        }
    }

    // ---------------------------------- //
    // ------ Causes Slider Widget ------ //
    // ---------------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_causes_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            prev = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_prev'),
            next = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_next');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_causes_list_item').each(function () {
            if (jQuery(this).find('.give-progress-bar').length) {
                let progress_bar = jQuery(this).find('.give-progress-bar'),
                    progress_bar_value = jQuery(progress_bar).attr('aria-valuenow');

                jQuery(progress_bar).find('span').append('<span class="philantrop_progress_bar_marker">' + progress_bar_value + '%</span>');
            }

            jQuery(this).find('.give-form-title').detach();
            jQuery(this).find('form.give-form').detach();
        });

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        if (jQuery(causesSlider).is('.slider_type_4')) {
            causesSlider.slick({
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
                fade: true
            });
        } else {
            causesSlider.slick({
                pauseOnHover: slider_options['pauseOnHover'],
                autoplay: slider_options['autoplay'],
                autoplaySpeed: slider_options['autoplaySpeed'],
                speed: slider_options['speed'],
                infinite: slider_options['infinite'],
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
                touchThreshold: 100,
                rtl: slider_options['rtl'],
                slidesToShow: 3,
                prevArrow: prev,
                nextArrow: next,
                responsive: [{
                    breakpoint: 1025,
                    settings: {
                        slidesToShow: 2,
                    }
                }, {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                    }
                }]
            });
        }
    });

    // ------------------------------------ //
    // ------ Projects Slider Widget ------ //
    // ------------------------------------ //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_projects_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            prev = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_prev'),
            next = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_next');

        if (!causesSlider.length) return;

        causesSlider.slick({
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            rtl: slider_options['rtl'],
            slidesToShow: 4,
            prevArrow: prev,
            nextArrow: next,
            responsive: [{
                breakpoint: 1025,
                settings: {
                    slidesToShow: 2,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });
    });

    // ----------------------------------- //
    // ------ Stories Slider Widget ------ //
    // ----------------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_stories_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            prev = $scope.find('.philantrop_stories_slider_navigation_container .philantrop_prev'),
            next = $scope.find('.philantrop_stories_slider_navigation_container .philantrop_next');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        causesSlider.slick({
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
            responsive: [{
                breakpoint: 1025,
                settings: {
                    slidesToShow: 1,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });
    });

    // --------------------------- //
    // ------ Awards Widget ------ //
    // --------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_awards.default', customCursor);
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_awards.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        causesSlider.on('init', function (event, slick) {
            $scope.find('.slick-dots li').each(function () {
                jQuery(this).prepend('<svg aria-hidden="true" class="philantrop_progress" width="70" height="70" viewBox="0 0 70 70"><path class="philantrop_progress__path" d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z" pathLength="1"></path></svg>');
            });
        });

        causesSlider.slick({
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            rtl: slider_options['rtl'],
            slidesToShow: slider_options['slides_to_show'],
            arrows: false,
            dots: slider_options['nav'],
            appendDots: dots_container,
            responsive: [{
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });
    });

    // ---------------------------------- //
    // ------ Blog Carousel Widget ------ //
    // ---------------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_blog_slider.default', customCursor);
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_blog_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows'),
            prev = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_prev'),
            next = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_next');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        causesSlider.slick({
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            rtl: slider_options['rtl'],
            slidesToShow: 3,
            arrows: false,
            dots: true,
            appendDots: dots_container,
            responsive: [{
                breakpoint: 1025,
                settings: {
                    slidesToShow: 2,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });
    });

    // ----------------------------------- //
    // ------ Gallery Slider Widget ------ //
    // ----------------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_gallery_slider.default', customCursor);
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_gallery_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows'),
            prev = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_prev'),
            next = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_next');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        causesSlider.slick({
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            rtl: slider_options['rtl'],
            slidesToShow: slider_options['slides_to_show'],
            arrows: false,
            dots: true,
            appendDots: dots_container,
            responsive: [{
                breakpoint: 1025,
                settings: {
                    slidesToShow: 2,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });
    });

    // -------------------------------------- //
    // ------ Services Carousel Widget ------ //
    // -------------------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_services_slider.default', customCursor);
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_services_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows'),
            prev = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_prev'),
            next = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_next');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        causesSlider.on('init', function (event, slick) {
            $scope.find('.slick-dots li').each(function () {
                jQuery(this).prepend('<svg aria-hidden="true" class="philantrop_progress" width="70" height="70" viewBox="0 0 70 70"><path class="philantrop_progress__path" d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z" pathLength="1"></path></svg>');
            });
        });

        causesSlider.slick({
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            rtl: slider_options['rtl'],
            slidesToShow: slider_options['slidesToShow'],
            arrows: false,
            dots: true,
            appendDots: dots_container,
            responsive: [{
                breakpoint: 1367,
                settings: {
                    slidesToShow: 3,
                }
            }, {
                breakpoint: 1025,
                settings: {
                    slidesToShow: 2,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });

        jQuery(window).on('scroll', function () {
            $scope.find('.philantrop_motion_effect_on').each(function () {
                let container_top = jQuery(this).offset().top,
                    visible_area_top = jQuery(window).scrollTop(),
                    visible_area_bottom = visible_area_top + (jQuery(window).height() - 100);

                if (container_top < visible_area_bottom) {
                    jQuery(this).addClass('visible');
                }
            });
        });
    });

    // ----------------------------- //
    // ------ Timeline Widget ------ //
    // ----------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_work_steps.default', customCursor);
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_work_steps.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows'),
            prev = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_prev'),
            next = $scope.find('.philantrop_causes_slider_navigation_container .philantrop_next');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        causesSlider.on('init', function (event, slick) {
            $scope.find('.slick-dots li').each(function () {
                jQuery(this).prepend('<svg aria-hidden="true" class="philantrop_progress" width="70" height="70" viewBox="0 0 70 70"><path class="philantrop_progress__path" d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z" pathLength="1"></path></svg>');
            });
        });

        causesSlider.slick({
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            rtl: slider_options['rtl'],
            slidesToShow: 3,
            arrows: false,
            dots: true,
            appendDots: dots_container,
            responsive: [{
                breakpoint: 1025,
                settings: {
                    slidesToShow: 2,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });

        jQuery(window).on('scroll', function () {
            $scope.find('.philantrop_motion_effect_on').each(function () {
                let container_top = jQuery(this).offset().top,
                    visible_area_top = jQuery(window).scrollTop(),
                    visible_area_bottom = visible_area_top + (jQuery(window).height() - 100);

                if (container_top < visible_area_bottom) {
                    jQuery(this).addClass('visible');
                }
            });
        });
    });

    // ------------------------------------ //
    // ------ Projects Slider Widget ------ //
    // ------------------------------------ //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_projects_slider.default', customCursor);
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_projects_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        causesSlider.on('init', function (event, slick) {
            $scope.find('.slick-dots li').each(function () {
                jQuery(this).prepend('<svg aria-hidden="true" class="philantrop_progress" width="70" height="70" viewBox="0 0 70 70"><path class="philantrop_progress__path" d="m35,2.5c17.955803,0 32.5,14.544199 32.5,32.5c0,17.955803 -14.544197,32.5 -32.5,32.5c-17.955803,0 -32.5,-14.544197 -32.5,-32.5c0,-17.955801 14.544197,-32.5 32.5,-32.5z" pathLength="1"></path></svg>');
            });
        });

        causesSlider.slick({
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            centerMode: true,
            rtl: slider_options['rtl'],
            slidesToShow: 3,
            arrows: false,
            dots: true,
            appendDots: dots_container,
            responsive: [{
                breakpoint: 1200,
                settings: {
                    slidesToShow: 2,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });
    });

    // ----------------------------------------- //
    // ------ Linked Item Carousel Widget ------ //
    // ----------------------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_linked_item_slider.default', customCursor);
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_linked_item_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            view_type = slider_options['view_type'],
            dots_container = $scope.find('.philantrop_slider_arrows'),
            prev = $scope.find('.philantrop_slider_arrows .philantrop_prev'),
            next = $scope.find('.philantrop_slider_arrows .philantrop_next'),
            status = $scope.find('.philantrop_slider_counter'),
            current_cont = status.find('.philantrop_current_slide'),
            all_cont = status.find('.philantrop_all_slides'),
            indicator = status.find('.philantrop_separator'),
            slidesToShow,
            slidesToScroll,
            centerMode,
            initialSlide;

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        if (view_type === 'type_1') {
            slidesToShow = 4;
            slidesToScroll = 1;
            centerMode = false;
            initialSlide = 0;

            causesSlider.slick({
                pauseOnHover: slider_options['pauseOnHover'],
                autoplay: slider_options['autoplay'],
                autoplaySpeed: slider_options['autoplaySpeed'],
                speed: slider_options['speed'],
                infinite: slider_options['infinite'],
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
                touchThreshold: 100,
                rtl: slider_options['rtl'],
                slidesToShow: slidesToShow,
                slidesToScroll: slidesToScroll,
                arrows: true,
                dots: false,
                prevArrow: prev,
                nextArrow: next,
                centerMode: centerMode,
                centerPadding: '0px',
                initialSlide: initialSlide,
                responsive: [{
                    breakpoint: 1025,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 2,
                    }
                }, {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                }]
            });
        }

        if (view_type === 'type_2') {
            slidesToShow = 5;
            slidesToScroll = 5;
            centerMode = false;
            initialSlide = 0;

            causesSlider.slick({
                pauseOnHover: slider_options['pauseOnHover'],
                autoplay: slider_options['autoplay'],
                autoplaySpeed: slider_options['autoplaySpeed'],
                speed: slider_options['speed'],
                infinite: slider_options['infinite'],
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
                touchThreshold: 100,
                rtl: slider_options['rtl'],
                slidesToShow: slidesToShow,
                slidesToScroll: slidesToScroll,
                arrows: false,
                dots: true,
                appendDots: dots_container,
                centerMode: centerMode,
                centerPadding: '0px',
                initialSlide: initialSlide,
                responsive: [{
                    breakpoint: 1025,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3,
                    }
                }, {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                }]
            });
        }

        if (view_type === 'type_3') {
            slidesToShow = 3;
            slidesToScroll = 1;
            centerMode = true;
            initialSlide = 1;

            causesSlider.slick({
                pauseOnHover: slider_options['pauseOnHover'],
                autoplay: slider_options['autoplay'],
                autoplaySpeed: slider_options['autoplaySpeed'],
                speed: slider_options['speed'],
                infinite: slider_options['infinite'],
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
                touchThreshold: 100,
                rtl: slider_options['rtl'],
                slidesToShow: slidesToShow,
                slidesToScroll: slidesToScroll,
                arrows: true,
                dots: false,
                prevArrow: prev,
                nextArrow: next,
                centerMode: centerMode,
                centerPadding: '0px',
                initialSlide: initialSlide,
                responsive: [{
                    breakpoint: 1025,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                    }
                }, {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                }]
            });
        }
    });

    // ------------------------------- //
    // ------ Best Offer Widget ------ //
    // ------------------------------- //
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_best_offer_slider.default', customCursor);
    elementorFrontend.hooks.addAction('frontend/element_ready/philantrop_best_offer_slider.default', function ($scope) {
        let causesSlider = $scope.find('.philantrop_slider_slick'),
            slider_options = causesSlider.data('slider-options'),
            dots_container = $scope.find('.philantrop_slider_arrows');

        if (!causesSlider.length) return;

        $scope.find('.philantrop_offset_container').width(jQuery(window).width());

        causesSlider.slick({
            centerMode: true,
            centerPadding: '0',
            pauseOnHover: slider_options['pauseOnHover'],
            autoplay: slider_options['autoplay'],
            autoplaySpeed: slider_options['autoplaySpeed'],
            speed: slider_options['speed'],
            infinite: slider_options['infinite'],
            initialSlide: 2,
            cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
            touchThreshold: 100,
            rtl: slider_options['rtl'],
            slidesToShow: slider_options['slides_to_show'],
            arrows: false,
            dots: slider_options['nav'],
            appendDots: dots_container,
            responsive: [{
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                }
            }, {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
            }]
        });
    });
});

