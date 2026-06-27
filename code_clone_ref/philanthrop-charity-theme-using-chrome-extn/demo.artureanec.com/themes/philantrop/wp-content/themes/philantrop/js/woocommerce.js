"use strict";

if(jQuery.fn.select2) {
    jQuery(document.body).on( 'updated_shipping_method', function() {
        jQuery('.woocommerce-checkout-shipping-method .select2').select2();
        jQuery('.woocommerce-shipping-methods .select2').select2();
        initFloatPlaceholderInput();
        jQuery('form.woocommerce-shipping-calculator').find('select').each(function() {
            if(jQuery(this).parent('.input-floating-wrap').length) {
                jQuery(this).siblings('.floating-placeholder').remove();
                jQuery(this).unwrap();
            }
        });
    } );
    jQuery(document.body).on('updated_checkout', function() {
        if (!jQuery('.woocommerce-checkout-shipping-method .select2').hasClass("select2-hidden-accessible")) {
            jQuery('.woocommerce-checkout-shipping-method .select2').select2();
        }
    });
    jQuery(document.body).on('updated_wc_div', function() {
        jQuery('.woocommerce-shipping-methods .select2').select2();
        initFloatPlaceholderInput();
        jQuery('form.woocommerce-shipping-calculator').find('select').each(function() {
            if(jQuery(this).parent('.input-floating-wrap').length) {
                jQuery(this).siblings('.floating-placeholder').remove();
                jQuery(this).unwrap();
            }
        });
    });
}
jQuery(document.body).on( 'country_to_state_changed', function() {
    initFloatPlaceholderInput();
    jQuery('form.woocommerce-shipping-calculator').find('select').each(function() {
        if(jQuery(this).parent('.input-floating-wrap').length) {
            jQuery(this).siblings('.floating-placeholder').remove();
            jQuery(this).unwrap();
        }
    });
} );
jQuery(document.body).on('updated_checkout', function(){
    jQuery( '.woocommerce-checkout-shipping-method' ).unblock({
        message: null,
        overlayCSS: {
            background: '#fff',
            opacity: 0.6
        }
    });
    initFloatPlaceholderInput();
    jQuery('form.checkout').find('select').each(function() {
        if(jQuery(this).parent('.input-floating-wrap').length) {
            jQuery(this).siblings('.floating-placeholder').remove();
            jQuery(this).unwrap();
        }
    });
});

jQuery(document).ready(function () {
    jQuery('.philantrop_single_product_page .quantity').prepend('<div class="philantrop_minus_button">-</div>').append('<div class="philantrop_plus_button">+</div>');
    jQuery('.woocommerce-cart-form .product-quantity .quantity').prepend('<div class="philantrop_minus_button">-</div>').append('<div class="philantrop_plus_button">+</div>');
});

jQuery(window).on('load', function () {
    jQuery(document).on('click', '.philantrop_minus_button', function () {
        let input_value = jQuery(this).parent().find('.qty').val();

        if (input_value > 0) {
            input_value--;

            jQuery(this).parent().find('.qty').change().val(input_value);
        }
    });

    jQuery(document).on('click', '.philantrop_plus_button', function () {
        let input_value = jQuery(this).parent().find('.qty').val();

        input_value++;

        jQuery(this).parent().find('.qty').change().val(input_value);
    });

    jQuery(window).on('scroll', function () {
        if (jQuery('div').is('.philantrop_minus_button')){} else {
            jQuery('.woocommerce-cart-form .product-quantity .quantity').prepend('<div class="philantrop_minus_button">-</div>').append('<div class="philantrop_plus_button">+</div>');

            jQuery('.philantrop_minus_button').on('click', function () {
                var input_value = jQuery(this).parent().find('.qty').val();

                if (input_value > 0) {
                    input_value--;

                    jQuery(this).parent().find('.qty').val(input_value);
                }
            });

            jQuery('.philantrop_plus_button').on('click', function () {
                var input_value = jQuery(this).parent().find('.qty').val();

                input_value++;

                jQuery(this).parent().find('.qty').val(input_value);
            });
        }
    });

    jQuery('.tagged_as a, .posted_in a').each(function () {
        let link = jQuery(this);

        jQuery(link.prop('nextSibling')).remove();
    });

    jQuery('.woocommerce-billing-fields__field-wrapper .form-row').each(function () {
        let label_val = jQuery(this).find('label').text();

        jQuery(this).find('input').attr('placeholder', label_val);

        if (jQuery(this).is('.validate-postcode')) {
            jQuery(this).after('<div class="clear"></div>');
        }
    });

    jQuery('.woocommerce-additional-fields__field-wrapper .form-row').each(function () {
        let label_val = jQuery(this).find('label').text();

        jQuery(this).find('textarea').attr('placeholder', label_val);
    });

    jQuery('.tab-columns-switcher').on('click', function() {
        jQuery('.tab-column', jQuery(this).parents('.tab-columns')).toggleClass('hidden');
    });

    jQuery('.philantrop-single-product-page .comment-form p:not(.comment-form-cookies-consent)').each(function () {
        let placeholder = jQuery(this).find('label').text();

        jQuery(this).find('input').attr('placeholder', placeholder);
    });

    jQuery('.philantrop-single-product-page .comment-form .comment-form-comment').each(function () {
        let placeholder = jQuery(this).find('label').text();

        jQuery(this).find('textarea').attr('placeholder', placeholder);
    });

    jQuery('.woocommerce-page .philantrop_page_wrapper button, .philantrop_page_wrapper .woocommerce-message .button, .philantrop_page_wrapper .woocommerce-Message .button, .woocommerce-page .cart-collaterals .wc-proceed-to-checkout .button, .return-to-shop .wc-backward').each(function () {
        jQuery(this).addClass('philantrop_button');
    });

    jQuery('.philantrop_page_wrapper .woocommerce-message .button, .woocommerce .return-to-shop .button').each(function () {
        let button_text = jQuery(this).text();

        jQuery(this).html('<span>' + button_text + '</span>');
    });

    jQuery('.woocommerce #review_form #respond .form-submit input[type="submit"]').wrap('<div class="philantrop_prod_review_button"></div>');

    jQuery('.woocommerce #review_form #respond .form-submit .philantrop_prod_review_button').append('<svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.72029 1.27952L2.60273 1.27947L2.60273 -1.13769e-07L8.99994 5.3966e-05L9 6.39733L7.72055 6.39733L7.72029 1.27952Z"/><path d="M0.90471 9L-3.95466e-08 8.09528L8.03093 0.0642592L8.93564 0.968978L0.90471 9Z"/></svg>');

    jQuery('.woocommerce-page .philantrop_page_wrapper philantrop_button .cart-collaterals .wc-proceed-to-checkout .button').addClass('philantrop_button').wrapInner('<span></span>').prepend('<svg><rect x="0" y="0" fill="none" width="100%" height="100%"></rect></svg>');

    setTimeout(function () {
        jQuery('.woocommerce-checkout button#place_order').each(function () {
            jQuery(this).addClass('philantrop_button');
            jQuery(this).prepend('<span>');
        });
    }, 1000);

    let window_width = jQuery(window).width();

    jQuery('.single-product .comment-form').each(function () {
        if (jQuery(this).find('.comment-notes').length) {
            let rating_cont = jQuery(this).find('.comment-form-rating').detach();

            jQuery(this).find('.comment-notes').after(rating_cont);
        }
    });

    jQuery('.philantrop_sidebar .widget_product_search button').each(function () {
        jQuery(this).append('<svg class="icon"><svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.19 0a8.19 8.19 0 016.47 13.212l5.04 5.04a1.024 1.024 0 11-1.448 1.448l-5.04-5.04A8.19 8.19 0 118.19 0zm0 2.048a6.143 6.143 0 100 12.285 6.143 6.143 0 000-12.285z"/></svg></svg>');
        jQuery(this).removeClass('philantrop_button');
    });

    jQuery('.philantrop_single_product_page .product_meta span.tagged_as a').each(function () {
        jQuery(this).prepend('#');
    });

    jQuery('.woocommerce .widget_price_filter .price_slider_amount .button').each(function () {
        let button_text = jQuery(this).text();

        jQuery(this).wrap('<div></div>');
        jQuery(this).prepend('<span>' + button_text + '</span>');
        jQuery(this).append('<svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.72029 1.27952L2.60273 1.27947L2.60273 -1.13769e-07L8.99994 5.3966e-05L9 6.39733L7.72055 6.39733L7.72029 1.27952Z"/><path d="M0.90471 9L-3.95466e-08 8.09528L8.03093 0.0642592L8.93564 0.968978L0.90471 9Z"/></svg>');
    });

    jQuery('.woocommerce #review_form #respond textarea, .woocommerce #review_form #respond input[type="text"], .woocommerce #review_form #respond input[type="email"]').each(function () {
        if(!jQuery(this).parent('.input-floating-wrap').length) {

            setTimeout(function (container) {
                jQuery(container).wrap('<span class="input-floating-wrap"></span>');

                let placeholder = jQuery(container).attr('placeholder'),
                    required = jQuery(container).attr('aria-required'),
                    star;

                if (required === 'true') {
                    star = '<sup>*</sup>';
                } else {
                    star = '';
                }

                jQuery(container).after('<span class="floating-placeholder">' + placeholder + star + '</span>');
            }, 1000, this);
        }
    });

    jQuery('.woocommerce .woocommerce-ordering').each(function () {
        jQuery(this).wrap('<span class="philantrop_woocommerce-ordering"></span>');
    });
});

jQuery(document).on('change', '.wc_payment_methods input', function () {
    jQuery(this).parents('.woocommerce-checkout-payment').find('button').each(function () {
        jQuery(this).addClass('philantrop_button');
        jQuery(this).append('<svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.72029 1.27952L2.60273 1.27947L2.60273 -1.13769e-07L8.99994 5.3966e-05L9 6.39733L7.72055 6.39733L7.72029 1.27952Z"/><path d="M0.90471 9L-3.95466e-08 8.09528L8.03093 0.0642592L8.93564 0.968978L0.90471 9Z"/></svg>');
    });
});

jQuery(document.body).on('updated_checkout', function () {
    jQuery('.woocommerce-checkout button#place_order').each(function () {
        jQuery(this).addClass('philantrop_button');
        jQuery(this).append('<svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.72029 1.27952L2.60273 1.27947L2.60273 -1.13769e-07L8.99994 5.3966e-05L9 6.39733L7.72055 6.39733L7.72029 1.27952Z"/><path d="M0.90471 9L-3.95466e-08 8.09528L8.03093 0.0642592L8.93564 0.968978L0.90471 9Z"/></svg>');
    });
});

jQuery(document.body).on('updated_cart_totals', function () {
    jQuery('.woocommerce-page .philantrop_page_wrapper button, .philantrop_page_wrapper .woocommerce-message .button, .philantrop_page_wrapper .woocommerce-Message .button, .woocommerce-page .cart-collaterals .wc-proceed-to-checkout .button, .return-to-shop .wc-backward').each(function () {
        jQuery(this).addClass('philantrop_button');
    });
});
