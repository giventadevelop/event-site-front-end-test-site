$(function() {

    $("#normal-button-bottom").on('click', function(event) {
        event.preventDefault();
        $("#user-options").toggle('slow');
    });
    
     $("#collapseid").on('click', function(event) {
        event.preventDefault();

     if($("#collapseOne").is(':visible'))
        {
            $("#collapseid").addClass('action-closed').removeClass('action-open');
            $(this).html('Show');
        }else{
            $("#collapseid").addClass('action-open').removeClass('action-closed');
            $(this).html('Hide');
        }
                
    });

});



