"use strict";

function initFloatPlaceholderInput() {
    const inputs = [
        '.widget_search input[placeholder]:not([placeholder=""])',
        '.wp-block-search input[placeholder]:not([placeholder=""])',
        '.wpforms-form input[placeholder]:not([placeholder=""])',
        '.wpforms-form textarea[placeholder]:not([placeholder=""])',
        '.wpcf7-form input[placeholder]:not([placeholder=""])',
        '.wpcf7-form textarea[placeholder]:not([placeholder=""])',
        '.woocommerce input[placeholder]:not([placeholder=""]):not([type=number])',
        '.woocommerce textarea[placeholder]:not([placeholder=""])',
        '.post-comments-wrapper input[placeholder]:not([placeholder=""])',
        '.post-comments-wrapper textarea[placeholder]:not([placeholder=""])',
        '.mc4wp-form input[placeholder]:not([placeholder=""])',
        '.mc4wp-form textarea[placeholder]:not([placeholder=""])',
        '.site-search input[placeholder]:not([placeholder=""])',
        '.consultum-no-result-search-form input[placeholder]:not([placeholder=""])',
        '.post-password-form input[placeholder]:not([placeholder=""])',
        '#give_checkout_user_info input[placeholder]:not([placeholder=""])',
    ];
    const $inputs = jQuery(inputs.join(', '));
    $inputs.each(function() {
        if(jQuery(this)[0].name == 'coupon_code' && jQuery(this).parents('td.actions').length || jQuery(this)[0].name == 'min_price' || jQuery(this)[0].name == 'max_price') {
            return;
        }

        if(!jQuery(this).parent('.input-floating-wrap').length) {
            jQuery(this).wrap('<span class="input-floating-wrap"></span>');
            let placeholder = jQuery(this).attr('placeholder'),
                required = jQuery(this).attr('aria-required'),
                star;

            if (required === 'true') {
                star = '<sup>*</sup>';
            } else {
                star = '';
            }

            jQuery(this).after('<span class="floating-placeholder">' + placeholder + star + '</span>');
        }
    });
}

// ---------------------- //
// --- Document Ready --- //
// ---------------------- //
jQuery(document).ready(function () {
    let window_width = jQuery(window).width();

    // Parallax
    background_image_parallax(jQuery('[data-parallax="scroll"]'), 0.7);

    // aside dropdown
    function asideDropdown() {
        let dropdown = jQuery('.philantrop_aside_dropdown');

        if (!dropdown.length) return;

        let trigger = jQuery('.philantrop_side_panel_button');
        let	close = jQuery('.philantrop_aside_dropdown_close');

        trigger.on('click', function(){
            dropdown.addClass('active');
            trigger.addClass('is-active');
        });

        close.on('click', function(){
            dropdown.removeClass('active');
            trigger.removeClass('is-active');
        });

        jQuery(document).on('click', function(event) {
            if (jQuery(event.target).closest('.philantrop_side_panel_button, .philantrop_aside_dropdown_inner').length) return;
            dropdown.removeClass('active');
            trigger.removeClass('is-active');
            event.stopPropagation();
        });
    }

    asideDropdown();

    initFloatPlaceholderInput();

    function menuMobile() {
        let dropdown = jQuery('.philantrop_menu_mobile_container');

        let trigger = jQuery('.philantrop_menu_trigger');
        let	close = jQuery('.philantrop_menu_mobile_close');

        trigger.on('click', function(){
            dropdown.addClass('philantrop_menu_mobile_active');
            trigger.addClass('is-active');
        });

        close.on('click', function(){
            dropdown.removeClass('philantrop_menu_mobile_active');
            trigger.removeClass('is-active');
        });

        jQuery(document).on('click', function(event) {
            if (jQuery(event.target).closest('.philantrop_menu_trigger, .philantrop_menu_mobile_container').length) return;
            dropdown.removeClass('philantrop_menu_mobile_active');
            trigger.removeClass('is-active');
            event.stopPropagation();
        });
    }

    menuMobile();

    // Main Donation Popup
    jQuery('.philantrop_main_donate_popup_trigger').on('click', function () {
        jQuery('.philantrop_main_donation_popup').addClass('active');
        jQuery('.philantrop_close_main_donation_popup_layer').addClass('active');

        setTimeout(function () {
            jQuery('.philantrop_close_main_donation_popup_layer').addClass('visible');
            jQuery('.philantrop_main_donation_popup').addClass('visible');
        }, 100);
    });

    jQuery('.philantrop_close_main_donation_popup_layer').on('click', function () {
        jQuery(this).removeClass('visible');
        jQuery('.philantrop_main_donation_popup').removeClass('visible');

        setTimeout(function () {
            jQuery('.philantrop_close_main_donation_popup_layer').removeClass('active');
            jQuery('.philantrop_main_donation_popup').removeClass('active');
        }, 500);
    });

    // Background Image CSS From JS
    if (jQuery('.philantrop_js_bg_image').length) {
        jQuery('.philantrop_js_bg_image').each(function(){
            jQuery(this).css('background-image', 'url('+jQuery(this).attr('data-background')+')');
        });
    }

    // Background Color CSS From JS
    if (jQuery('.philantrop_js_bg_color').length) {
        jQuery('.philantrop_js_bg_color').each(function(){
            jQuery(this).css('background-color', jQuery(this).attr('data-bg-color'));
        });
    }

    // Min Height CSS From JS
    if (jQuery('.philantrop_js_min_height').length) {
        jQuery('.philantrop_js_min_height').each(function(){
            jQuery(this).css('min-height', jQuery(this).attr('data-min-height')+'px');
        });
    }

    jQuery('.elementor-widget-wp-widget-search .search-form .search-form-icon').each(function () {
        jQuery(this).html('<svg class="icon"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.19 0a8.19 8.19 0 016.47 13.212l5.04 5.04a1.024 1.024 0 11-1.448 1.448l-5.04-5.04A8.19 8.19 0 118.19 0zm0 2.048a6.143 6.143 0 100 12.285 6.143 6.143 0 000-12.285z"/></svg></svg>');
    });

    // Tilt
    jQuery('.tilt-effect').tilt({
        maxTilt:        23,
        perspective:    2e3,
        easing:         "cubic-bezier(.22,.61,.36,1)"
    });

    // Tilt alter
    document.addEventListener("mousemove", parallax);
    function parallax(e){
        var moving_value = -10;
        jQuery('.tilt-part img').each(function(){
            var x = (e.clientX * moving_value) / 250;
            var y = (e.clientY * moving_value) / 250;
            moving_value = moving_value + 4;
            jQuery(this).css({
                'transform': 'translate(' + x + 'px, ' + y + 'px)'
            }).attr('data-value', moving_value);
        });
    }
});

// ------------------- //
// --- Window Load --- //
// ------------------- //
jQuery(window).on('load', function () {
    let window_width = jQuery(window).width();

    jQuery('body').css('opacity', '1');

    // Preloader
    setTimeout(function () {
        jQuery('.philantrop_preloader_container').addClass('invisible');
    }, 500);

    setTimeout(function () {
        jQuery('.philantrop_preloader_container').css('display', 'none');
    }, 1200);

    jQuery('.philantrop_header_search_button, .philantrop_menu_mobile_search').on('click', function () {
        jQuery('.philantrop_header_search_overlay').addClass('visible');
        jQuery('.philantrop_header_search_container').addClass('active');
    });

    jQuery('.philantrop_header_search_overlay').on('click', function () {
        jQuery(this).removeClass('visible');
        jQuery('.philantrop_header_search_container').removeClass('active');
    });

    jQuery('.philantrop_header_search_close_button').on('click', function () {
        jQuery('.philantrop_header_search_overlay').removeClass('visible');
        jQuery('.philantrop_header_search_container').removeClass('active');
    });

    // Back to Top
    var philantrop_scrollTrigger = 600, // px
        philantrop_backToTop = function () {
            var philantrop_scrollTop = jQuery(window).scrollTop();
            if (philantrop_scrollTop > philantrop_scrollTrigger) {
                jQuery('.philantrop_back_to_top_button').addClass('show');
            } else {
                jQuery('.philantrop_back_to_top_button').removeClass('show');
            }
        };
    philantrop_backToTop();
    jQuery(window).on('scroll', function () {
        philantrop_backToTop();
    });
    jQuery('.philantrop_back_to_top_button').on('click', function (e) {
        e.preventDefault();
        jQuery('html,body').animate({
            scrollTop: 0
        }, 200);
    });

    jQuery('.elementor-widget-shortcode .sbi_photo').each(function () {
        let image_width = jQuery(this).width();

        jQuery(this).height(image_width);
    });


    jQuery('.philantrop_menu_mobile_wrapper .philantrop_mobile_menu li.menu-item-has-children > a').on('click', function () {
        jQuery(this).parent().toggleClass('open');
        jQuery(this).parent().children('.sub-menu').stop().slideToggle(300);
    });


    jQuery('.philantrop_menu_mobile_wrapper > ul .menu-item-has-children > a').each(function () {
        jQuery(this).on('click', function (event) {
            event.preventDefault();
        });
    });

    if (window_width < 769) {
        jQuery('.philantrop_portfolio_slider_widget').each(function () {
            let navigation = jQuery(this).find('.philantrop_slider_navigation_container').detach();

            jQuery(this).find('.philantrop_slider_slick').after(navigation);
        });

        jQuery('.philantrop_time_line_widget').each(function () {
            let navigation = jQuery(this).find('.philantrop_slider_navigation_container').detach();

            jQuery(this).find('.philantrop_slider_slick').after(navigation);
        });
    }

    jQuery('.philantrop_shortcode_widget_wrapper input[type="submit"]').each(function () {
        jQuery(this).wrap('<span class="philantrop_shortcode_widget_submit_button"></span>');
    });

    jQuery('.elementor-shortcode input[type="submit"]').each(function () {
        jQuery(this).wrap('<span class="philantrop_widget_submit_button"></span>');
        jQuery('.philantrop_widget_submit_button').append('<svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.72029 1.27952L2.60273 1.27947L2.60273 -1.13769e-07L8.99994 5.3966e-05L9 6.39733L7.72055 6.39733L7.72029 1.27952Z"/><path d="M0.90471 9L-3.95466e-08 8.09528L8.03093 0.0642592L8.93564 0.968978L0.90471 9Z"/></svg>');
    });

    if (window_width >= 992) {
        jQuery('.cursor').each(function () {
            const cursor = jQuery(this);
            const slider = cursor.parents('.elementor-column').find('.elementor-image');

            function showViewCursor(event) {
                cursor.css('left', event.clientX-5).css('top', event.clientY-5);
            }

            slider.mousemove(showViewCursor);

            slider.mouseleave(function(e) {
                if(!jQuery('body').hasClass('elementor-editor-active')) {
                    slider.find('a').css({cursor: 'auto'});
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
                    slider.find('a').css({cursor: 'none'});
                    cursor.show();
                    setTimeout(function() {
                        cursor.addClass('active');
                    }, 10);
                }
            });
        });
    }

    if (window_width < 821) {
        let sidebar_trigger = jQuery('.philantrop_sidebar_trigger');
        let sidebar = jQuery('.philantrop_sidebar');
        let overlay = jQuery('.philantrop_site_overlay');
        let sidebar_close = jQuery('.philantrop_sidebar .philantrop_aside_dropdown_close');

        sidebar_trigger.on('click', function () {
            sidebar.addClass('active');
            overlay.addClass('active');
            jQuery('header').addClass('inactive');
        });

        sidebar_close.on('click', function () {
            sidebar.removeClass('active');
            overlay.removeClass('active');
            jQuery('header').removeClass('inactive');
        });

        jQuery(document).on('click', function (event) {
            if (jQuery(event.target).closest('.philantrop_sidebar_trigger, .philantrop_sidebar').length) return;
            sidebar.removeClass('active');
            overlay.removeClass('active');
            jQuery('header').removeClass('inactive');
        })
    }

    jQuery('.wpcf7 input[type="date"]').each(function () {
        let date = new Date(),
            day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();

        if (month < 10) {
            month = "0" + month;
        }

        if (day < 10) {
            day = "0" + day;
        }

        let today = year + "-" + month + "-" + day;

        jQuery(this).val(today);
    });

    jQuery('.philantrop_sidebar .widget.widget_tag_cloud .tagcloud a, .footer_widget.widget_tag_cloud .tagcloud a, .philantrop_sidebar .widget.widget_product_tag_cloud .tagcloud a, .wp-block-tag-cloud a').each(function () {
        jQuery(this).prepend('#');
    });

    jQuery('.sticky_column').each(function () {
        let section_width = window_width,
            container_width = jQuery(this).parents('.elementor-container').width(),
            right_position = (section_width - container_width) / 2;

        jQuery(this).css('right', -right_position + 'px');
    });

    jQuery('.philantrop_single_post_donation_form_container, .philantrop_main_donation_popup, .widget_philantrop_donate_form_widget').each(function () {
        if (jQuery(this).find('.give-progress-bar').length) {
            let progress_bar = jQuery(this).find('.give-progress-bar'),
                progress_bar_value = jQuery(progress_bar).attr('aria-valuenow');

            jQuery(progress_bar).find('span').prepend('<span class="philantrop_progress_bar_marker">' + progress_bar_value + '%</span>');
        }
    });
});

// --------------------- //
// --- Window Resize --- //
// --------------------- //
jQuery(window).on('resize', function () {
    let window_width = jQuery(window).width();

    // Parallax
    background_image_parallax(jQuery('[data-parallax="scroll"]'), 0.7);

    if (window_width < 769) {
        jQuery('.philantrop_portfolio_slider_widget').each(function () {
            let navigation = jQuery(this).find('.philantrop_slider_navigation_container').detach();

            jQuery(this).find('.philantrop_slider_slick').after(navigation);
        });

        jQuery('.philantrop_time_line_widget').each(function () {
            let navigation = jQuery(this).find('.philantrop_slider_navigation_container').detach();

            jQuery(this).find('.philantrop_slider_slick').after(navigation);
        });
    } else {
        jQuery('.philantrop_portfolio_slider_widget').each(function () {
            let navigation = jQuery(this).find('.philantrop_slider_navigation_container').detach();

            jQuery(this).find('.philantrop_timeline_heading_and_buttons_part .col-lg-5').append(navigation);
        });

        jQuery('.philantrop_time_line_widget').each(function () {
            let navigation = jQuery(this).find('.philantrop_slider_navigation_container').detach();

            jQuery(this).find('.philantrop_timeline_heading_and_buttons_part .col-lg-5').append(navigation);
        });
    }

    if (window_width < 821) {
        let sidebar_trigger = jQuery('.philantrop_sidebar_trigger');
        let sidebar = jQuery('.philantrop_sidebar');
        let overlay = jQuery('.philantrop_site_overlay');
        let sidebar_close = jQuery('.philantrop_sidebar .philantrop_aside_dropdown_close');

        sidebar_trigger.on('click', function () {
            sidebar.addClass('active');
            overlay.addClass('active');
            jQuery('header').addClass('inactive');
        });

        sidebar_close.on('click', function () {
            sidebar.removeClass('active');
            overlay.removeClass('active');
            jQuery('header').removeClass('inactive');
        });

        jQuery(document).on('click', function (event) {
            if (jQuery(event.target).closest('.philantrop_sidebar_trigger, .philantrop_sidebar').length) return;
            sidebar.removeClass('active');
            overlay.removeClass('active');
            jQuery('header').removeClass('inactive');
        })
    }

    jQuery('.sticky_column').each(function () {
        let section_width = jQuery(this).parents('.elementor-section').width(),
            container_width = jQuery(this).parents('.elementor-container').width(),
            right_position = (section_width - container_width) / 2;

        jQuery(this).css('right', -right_position + 'px');
    });
});

// --------------------- //
// --- Window Scroll --- //
// --------------------- //
let last_scroll_top = 0;

jQuery(window).on('scroll', function () {
    let header = jQuery('header.philantrop_sticky_header_container'),
        scroll_position = jQuery(window).scrollTop();

    if (header.is('.philantrop_sticky_header_off')) {} else {
        if (scroll_position > last_scroll_top) {
            if (scroll_position > 300) {
                header.addClass('active');
            }
        } else {
            header.removeClass('active');
        }

        last_scroll_top = scroll_position;
    }

    if (header.is('.philantrop_transparent_header_off')) {} else {
        if (scroll_position > 1) {
            header.addClass('color_bg_on');
        } else {
            header.removeClass('color_bg_on');
        }
    }
});

jQuery('a[href="#"]').on('click', function(event){
    event.preventDefault();
});

jQuery('.philantrop_sidebar .widget_nav_menu ul li.menu-item-has-children a').on('click', function () {
    jQuery(this).parent().toggleClass('open');
    jQuery(this).next().slideToggle(300);
});

jQuery('.footer_widget.widget_nav_menu ul li.menu-item-has-children a').on('click', function () {
    jQuery(this).parent().toggleClass('open');
    jQuery(this).next().slideToggle(300);
});

function background_image_parallax(object, multiplier){
    if ( object.length > 0 ) {
        multiplier = typeof multiplier !== 'undefined' ? multiplier : 0.5;
        multiplier = 1 - multiplier;
        var doc = jQuery(document);
        object.css({
            'background-attatchment': 'fixed'
        });
        jQuery(window).scroll(function () {
            if (jQuery(window).width() >= 992) {
                var from_top = doc.scrollTop() - object.offset().top,
                    bg_css = 'center ' + (multiplier * from_top) + 'px';
                object.css({
                    'background-position': bg_css
                });
            } else {
                object.css({
                    'background-position': ''
                });
            }
        });
    }
}

let adv_button_wrapper = jQuery('.philantrop_footer_adv_button_wrapper');

jQuery(adv_button_wrapper).mouseleave(function(e){
    TweenMax.to(this, 0.6, {scale: 1});
    TweenMax.to('.philantrop_footer_adv_button, .philantrop_footer_adv_button_text, .philantrop_footer_adv_button_circle', 0.6,{scale:1, x: 0, y: 0});
});

jQuery(adv_button_wrapper).mouseenter(function(e){
    TweenMax.to(this, 0.6, {transformOrigin: '0 0', scale: 1});
    TweenMax.to('.philantrop_footer_adv_button', 0.6,{scale: 1});
    TweenMax.to('.philantrop_footer_adv_button_circle', 0.6,{scale: 1});
    TweenMax.to('.philantrop_footer_adv_button_text', 0.6,{scale: 1});
});

jQuery(adv_button_wrapper).mousemove(function(e){
    callParallax(e);
});

function callParallax(e){
    parallaxIt(e, '.philantrop_footer_adv_button', 40);
    parallaxIt2(e, '.philantrop_footer_adv_button_circle', 40);
    parallaxIt(e, '.philantrop_footer_adv_button_text', 10);
}

function parallaxIt(e, target, movement){
    var $this = jQuery(adv_button_wrapper);
    var boundingRect = $this[0].getBoundingClientRect();
    var relX = e.pageX - boundingRect.left;
    var relY = e.pageY - boundingRect.top;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    TweenMax.to(target, 0.5, {
        x: (relX - boundingRect.width/2) / boundingRect.width * movement,
        y: (relY - boundingRect.height/2 - scrollTop) / boundingRect.width * movement,
        ease: Power3.easeOut
    });
}

function parallaxIt2(e, target, movement){
    var $this = jQuery(adv_button_wrapper);
    var boundingRect = $this[0].getBoundingClientRect();
    var relX = e.pageX - boundingRect.left;
    var relY = e.pageY - boundingRect.top;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    TweenMax.to(target, 0.5, {
        x: (relX - boundingRect.width/2) / boundingRect.width * movement,
        y: (relY - boundingRect.height/2 - scrollTop) / boundingRect.width * movement,
        ease: Power3.easeOut,
        delay: 0.1
    });
}
