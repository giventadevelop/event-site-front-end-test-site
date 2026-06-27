$(document).ready(function(){

	//$(".desktop-namebx-mob").html("<p>Hello Dileep</p>");
	

	// Set options
	var speed = 500;			// Fade speed
	var autoSwitch = false;		// Auto slider options
	var autoSwitchSpeed = 4000;	// Auto slider speed
	var hoverPause = true;	// Pause auto slider on hover
	var keyPressSwitch = true;	// Key press next/prev
	
	// Add initial active class
	$('.slide').first().addClass('active');
	
	// Hide all slides
	$('.slide').hide();
	
	$('.tooltip_content').html($('.active').find('.desktop-namebx-mob').html());
	// Show first slide
	$('.active').show();
		
	// Switch to next slide
	function nextSlide(){
		$('.active').removeClass('active').addClass('oldActive');
		if($('.oldActive').is(':last-child')){
			$('.slide').first().addClass('active');
		} else {
			$('.oldActive').next().addClass('active');
		}
		$('.oldActive').removeClass('oldActive');
		$('.slide').fadeOut(speed);
		$('.active').fadeIn(speed);
		$('.tooltip_content').html($('.active').find('.desktop-namebx-mob').html());
		//alert($(".mob_slider_text").attr('title'));
		//$("#cath_name").html("<b>Dileep</b>");
		var var_div = $('.active').closest('div[class^="desktop-namebx-mob"]');
		
		
		if($('.active').is(':last-child')){
			$('#next').hide();
		}
		else{
			$('#next').show();
		}
		if($('.active').is(':first-child')){
			$('#prev').hide();
		}
		else{
			$('#prev').show();
		}
		
		
	}
	
	// Switch to prev slide
	function prevSlide(){
		$('.active').removeClass('active').addClass('oldActive');
		if($('.oldActive').is(':first-child')){
			$('.slide').last().addClass('active');
		} else {
			$('.oldActive').prev().addClass('active');
		}
		$('.oldActive').removeClass('oldActive');
		$('.slide').fadeOut(speed);
		$('.active').fadeIn(speed);
		$('.tooltip_content').html($('.active').find('.desktop-namebx-mob').html());
		if($('.active').is(':first-child')){
			$('#prev').hide();
		}
		else{
			$('#prev').show();
		}
		if($('.active').is(':last-child')){
			$('#next').hide();
		}
		else{
			$('#next').show();
		}
		
	}

	// Key press event handler
	if(keyPressSwitch === true){
		$("body").keydown(function(e){
			if(e.keyCode === 37){
		    	nextSlide();
		  	} else if(e.keyCode === 39){
		    	prevSlide();
		  	}
		});
	}

	// Next handler
	$('#next').on('click', nextSlide);
	
	// Prev handler
	$('#prev').on('click', prevSlide);
	
	// Auto slider handler
	if(autoSwitch === true){
		var interval = null;
		interval = window.setInterval(function(){nextSlide();},autoSwitchSpeed);
	}

	// Stop and start on hover
	if(autoSwitch === true && hoverPause === true){
		$('#slider,#prev,#next').hover(function() {
		    window.clearInterval(interval);    
		}, function() {
		    interval = window.setInterval(function(){nextSlide();},autoSwitchSpeed);
		});
	}

	// Slider hover class handler
	$('#sliderContainer').addClass('sliderHovered');
	/*$('#sliderContainer').hover(function() {
	    $('#sliderContainer').addClass('sliderHovered');
	}, function() {
	    $('#sliderContainer').removeClass('sliderHovered');
	});*/
	
	prevSlide();
	$('#slider').show();
	
//*********************************************************************************

// Set options
	var speed1 = 500;			// Fade speed
	var autoSwitch1 = false;		// Auto slider options
	var autoSwitchSpeed1 = 4000;	// Auto slider speed
	var hoverPause1 = true;	// Pause auto slider on hover
	var keyPressSwitch1 = true;	// Key press next/prev
	
	// Add initial active1 class
	$('.slide1').last().addClass('active1');
	
	// Hide all slides
	$('.slide1').hide();
	
	// Show first slide
	$('.active1').show();
		
	// Switch to next slide
	function nextSlide1(){
		//alert("next1");
		$('.active1').removeClass('active1').addClass('oldActive1');
		if($('.oldActive1').is(':last-child')){
			$('.slide1').first().addClass('active1');
		} else {
			$('.oldActive1').next().addClass('active1');
		}
		$('.oldActive1').removeClass('oldActive1');
		$('.slide1').fadeOut(speed1);
		$('.active1').fadeIn(speed1);
		
		if($('.active1').is(':last-child')){
			$('#next1').hide();
		}
		else{
			$('#next1').show();
		}
		if($('.active1').is(':first-child')){
			$('#prev1').hide();
		}
		else{
			$('#prev1').show();
		}
		
		//alert("next2");
		//var var_div = $('.active1').closest('div[class^="desktop-namebx-mob"]');
	}
	
	// Switch to prev slide
	function prevSlide1(){
		//alert("prev1");
		$('.active1').removeClass('active1').addClass('oldActive1');
		if($('.oldActive1').is(':first-child')){
			$('.slide1').last().addClass('active1');
		} else {
			$('.oldActive1').prev().addClass('active1');
		}
		$('.oldActive1').removeClass('oldActive1');
		$('.slide1').fadeOut(speed1);
		$('.active1').fadeIn(speed1);
		
		if($('.active1').is(':first-child')){
			$('#prev1').hide();
		}
		else{
			$('#prev1').show();
		}
		if($('.active1').is(':last-child')){
			$('#next1').hide();
		}
		else{
			$('#next1').show();
		}
		
		//alert("prev2");
	}

	// Key press event handler
	if(keyPressSwitch1 === true){
		$("body").keydown(function(e){
			if(e.keyCode === 37){
		    	nextSlide1();
		  	} else if(e.keyCode === 39){
		    	prevSlide1();
		  	}
		});
	}

	// Next handler
	$('#next1').on('click', nextSlide1);
	
	// Prev handler
	$('#prev1').on('click', prevSlide1);
	
	// Auto slider handler
	if(autoSwitch1 === true){
		var interval = null;
		interval = window.setInterval(function(){nextSlide1();},autoSwitchSpeed1);
	}

	// Stop and start on hover
	if(autoSwitch1 === true && hoverPause1 === true){
		$('#slider,#prev,#next').hover(function() {
		    window.clearInterval(interval);    
		}, function() {
		    interval = window.setInterval(function(){nextSlide1();},autoSwitchSpeed1);
		});
	}
   $('#sliderContainer1').addClass('sliderHovered');
	// Slider hover class handler
	/*$('#sliderContainer1').hover(function() {
	    $('#sliderContainer1').addClass('sliderHovered');
	}, function() {
	    $('#sliderContainer1').removeClass('sliderHovered');
	});*/	
	
	
	
	
	
	
	
	
	
	
	
	
	

});





