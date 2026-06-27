/*
 * 
 *
 *  => Form element id is taken for validation
 *  => Validation rules are taken from data-validation attribute from the form element
 *  => All elements with form-control class inside a form is taken to consideration here
 * 
 *  => Either just call the validate_form() which takes all the elements by steps writter above or 
 *     pass all values in validation_fields() manually 
 * 
 *  => The function returns true if there are any errors and false if no errors occur
 * 
 *  => form_validation_message string appends all the validation errors and returns it into the alert message
 *  
 *  => Form validation rules : required,numeric,valid_email, alpha_only,alpha,alpha_numeric ,min_length-n,max_length-n,exact_length-n 
 * 
 * 
 * 
 **/


var form_validation_message = '';
let form_fields = [];

function validation_fields(field_name, constraints, alias_name) {
    this.field_name = field_name;
    this.constraints = constraints;
    this.alias_name = alias_name;

    init_form_obj();
}


function init_form_obj() {
    let form_obj = { field_name: field_name, constraints: constraints, alias_name, alias_name };

    form_fields.push(form_obj);

    //console.log(form_fields);
}


function initiate_validat_form() {

    form_fields = [];
    $(".form-control").removeClass('error-input');
    $(".error-detail").remove();



    let form_obj = {};
    $("form .form-control").each(function (index, form_elements) {

        if (typeof form_elements.dataset.validation != 'undefined') {
            form_obj = {
                'field_name': form_elements.id,
                'constraints': form_elements.dataset.validation,
                'alias_name': (form_elements.parentElement.innerText != '') ? form_elements.parentElement.innerText : form_elements.id
            };

            if (form_elements.parentElement.innerText == '' && form_elements.placeholder != '<empty string>')
                form_obj['alias_name'] = form_elements.placeholder;

            // Field name is assigned form element id
            // Constraint is assigned data-validation fields if there are any
            // Alias name is assigned element id if no label field is present
            // Alias name is assigned element placeholder if placeholder field is present

            //console.log(form_obj);
            form_fields.push(form_obj);

        }
    });

}


function validate_form(show_toast = true, show_errors = true, show_below = false, onlyActiveElem = false) {



    initiate_validat_form();

    form_validation_message = '';
    let field_name;
    let constraints;
    let alias_name;

    var form_element;

    let current_form_element = document.activeElement;

    if (!show_toast & current_form_element.tagName != 'INPUT')
        return false;


    if (onlyActiveElem) {
        form_fields = [];
        form_obj = {
            'field_name': current_form_element.id,
            'constraints': current_form_element.dataset.validation,
            'alias_name': (current_form_element.parentElement.innerText != '') ? current_form_element.parentElement.innerText : current_form_element.id
        };
        // console.log(document.activeElement);

        form_fields.push(form_obj);

        current_form_element.classList.remove('valid-input');

    }

    // console.log(form_fields);


    $.each(form_fields, function (index, form_field) {
        // console.log(form_field);
        field_name = form_field.field_name;
        constraints = form_field.constraints;
        alias_name = form_field.alias_name;

        try {
            form_element = document.getElementById(field_name).value;
        } catch (err) {
            console.warn('Element with ID ' + field_name + ' is not present or cannot be accessed');
        }
        var elem_constraints = constraints.split("|");

        $.each(elem_constraints, function (constraint_index, elem_constraint) {
            // console.log(field_name + ' - ' + form_element)
            form_validation_message += (_check_constraints(field_name, form_element, elem_constraint, alias_name, show_below));
            // console.log(form_validation_message);
        });

    });

    form_fields = [];


    if (!form_validation_message.length > 0) {
        current_form_element.classList.add('valid-input');
        return false;
    }

    if (show_toast)
        BottomToast('Recheck these errors and resubmit');
    if (show_errors)
        BottomToast(form_validation_message);

    return true;


}


function _check_constraints(field_name, value, constraints, alias_name, show_below) {


    var err_msg = '';
    if (constraints == 'required')
        if (_check_required(value)) {
            err_msg = '<p> The ' + alias_name + ' field is required. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }

    if (constraints == 'numeric')
        if (_check_numeric(value)) {
            err_msg = '<p> The ' + alias_name + ' field must contain only numbers. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }

    if (constraints == 'valid_email')
        if (_check_valid_email(value)) {
            err_msg = '<p> The ' + alias_name + ' field should be a valid email. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }

    if (constraints == 'alpha_only')
        if (_check_alpha_only(value)) {
            err_msg = '<p> The ' + alias_name + ' field should be only alphabets. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }

    if (constraints == 'alpha')
        if (_check_alpha(value)) {
            err_msg = '<p> The ' + alias_name + ' field should be only alphabets and spaces. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }


    if (constraints == 'alpha_numeric')
        if (_check_alpha_numeric(value)) {
            err_msg = '<p> The ' + alias_name + ' field should be  only alphabets and numbers. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }

    if (constraints.includes("min_length-")) {
        var string_length = (constraints.split("-").length > 1) ? Number(constraints.split("-")[1]) : 0;
        if (_check_min_length(value, string_length)) {
            err_msg = '<p> The ' + alias_name + ' field should be of minimum length ' + string_length + '. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }

    }

    if (constraints.includes("max_length-")) {
        var string_length = (constraints.split("-").length > 1) ? Number(constraints.split("-")[1]) : 0;
        if (_check_max_length(value, string_length)) {
            err_msg = '<p> The ' + alias_name + ' field should be of maximum length ' + string_length + '. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }

    }

    if (constraints.includes("exact_length-")) {
        var string_length = (constraints.split("-").length > 1) ? Number(constraints.split("-")[1]) : 0;
        if (_check_exact_length(value, string_length)) {
            err_msg = '<p> The ' + alias_name + ' field should be of length ' + string_length + '. </p>';
            if (show_below)
                create_error_msg(field_name, err_msg);
            return err_msg;
        }

    }

    return err_msg;
}



function create_error_msg(field_name, err_msg) {
    $("#" + field_name).addClass('error-input');
    let err_div = `<div class="error-detail">${err_msg}</div> `;

    $("#" + field_name).parent().append(err_div);

}


/*

 => All validation functions are written below

*/

function _check_required(value) {
    if (value == '' || value.length == 0) {
        return true;
    }

    return false;
}

function _check_alpha_only(value) {
    if (value.length > 0 && !/^[a-zA-Z]+$/.test(value)) {
        return true;
    }

    return false;
}


function _check_alpha(value) {
    if (value.length > 0 && !/^[a-zA-Z\s]*$/.test(value)) {
        return true;
    }

    return false;
}


function _check_alpha_numeric(value) {
    if (value.length > 0 && !/^[a-zA-Z0-9\s]*$/.test(value)) {
        return true;
    }

    return false;
}


function _check_min_length(value, string_length) {
    if (value.length < string_length) {
        return true;
    }

    return false;
}

function _check_max_length(value, string_length) {
    if (value.length > string_length) {
        return true;
    }

    return false;
}

function _check_exact_length(value, string_length) {
    if (value.length != string_length) {
        return true;
    }

    return false;
}

function _check_numeric(value) {
    if (isNaN(value) || value.length == 0) {
        return true;
    }

    return false;
}

function _check_valid_email(value) {
    if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        return true;
    }

    return false;
}



