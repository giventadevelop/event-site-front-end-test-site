         jQuery(document).ready(function($) {
          $("#amazingslider-1").data("object").isPaused = true;
            $('.toolbar-icons a').on('click', function( event ) {
                event.preventDefault();
            });
            $('#normal-button-bottom').toolbar({content: '#user-options', position: 'bottom'});
        });

         //Search tooltip
                $(document).ready(function(){
                  var submitIcon = $('.searchbox-icon');
                  var inputBox = $('.searchbox-input');
                  var searchBox = $('.searchbox');
                  var isOpen = false;
                  submitIcon.click(function(){
                      if(isOpen == false){
                          searchBox.addClass('searchbox-open');
                          inputBox.focus();
                          isOpen = true;
                      } else {
                          searchBox.removeClass('searchbox-open');
                          inputBox.focusout();
                          isOpen = false;
                      }
                  });  
                   submitIcon.mouseup(function(){
                          return false;
                      });
                  searchBox.mouseup(function(){
                          return false;
                      });
                  $(document).mouseup(function(){
                          if(isOpen == true){
                              $('.searchbox-icon').css('display','block');
                              submitIcon.click();
                          }
                      });
              });
         
                  function buttonUp(){
                      var inputVal = $('.searchbox-input').val();
                      inputVal = $.trim(inputVal).length;
                      if( inputVal !== 0){
                          $('.searchbox-icon').css('display','none');
                      } else {
                          $('.searchbox-input').val('');
                          $('.searchbox-icon').css('display','block');
                      }
                  }
                  $(document).ready(function() {   
                var sideslider = $('[data-toggle=collapse-side]');
                var sel = sideslider.attr('data-target');
                var sel2 = sideslider.attr('data-target-2');
                sideslider.click(function(event){
                    $(sel).toggleClass('in');
                    $(sel2).toggleClass('out');
                });
            });