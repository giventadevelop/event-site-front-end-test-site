

$(document).ready(function () {

  fetchBanners();
  fetchEventToDisplay();
  fetchSaints();
  fetchAboutUs();
  fetchMajorArchBishop();

  fetchLiturgy();

  fetchChurchesLatestNewsCategory();
  fetchEparchyCountries();
  fetchDailyUpdates();


});



function fetchBanners() {
  const banners = $("#banners");
  banners.html('');

  fetchData(apiEndpoints.banners, function (response) {

    if (!response.status)
      return;

    var bannersHtml = "";
    // Only show the first two images and replace them with local images
    var localImages = [
      "assets/images/mosc_images/bava_thirumeni_pope_visit.jpeg",
      "assets/images/mosc_images/Malankara_Orthodox_Palace_Slider_Image.jpeg"
    ];
    
    // Only process first 2 banners
    var bannersToShow = response.data.contents.slice(0, 2);
    
    $.each(bannersToShow, function (idx, banner) {
      bannersHtml = "";
      // Use local images for both slides
      bannersHtml += ` <div class="swiper-slide min-h-100vh"><img src="${localImages[idx]}" class="w-100" alt="${banner.banner_name}"></div>`;
      banners.append(bannersHtml);
    });

    bannerSlider();

  }, {}, cacheTimes.minTime);
}



function fetchEventToDisplay() {
  const latestEvent = $("#latest-event");
  latestEvent.hide();

  let parameters = { display: true };
  fetchData(apiEndpoints.events, function (response) {
    addLanguageChangeMethod(fetchEventToDisplay);

    if (!response.status)
      return;


    latestEvent.show();

    const event = response.data;
    const eventDateTime = event.event_date_time_in24;
    $("#eventCountDownDate").html(event.event_date);
    $("#eventCountDownTitle").html(event.event_title.substring(0, 100));

    var countDownDate = new Date(eventDateTime).getTime();
    var x = setInterval(function () {
      var now = new Date().getTime();

      var distance = countDownDate - now;
      if (distance < 0) {
        latestEvent.hide();
        return;
      }

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Output the result
      try {
        document.getElementById("day").innerHTML = days;
        document.getElementById("hour").innerHTML = hours;
        document.getElementById("minute").innerHTML = minutes;
        document.getElementById("second").innerHTML = seconds;
      } catch (err) {

      }

    }, 1000);

    countDownEventSlider();

  }, parameters);
}


// function fetchSaints() {
//   const saints = $("#saints");
//   saints.html(loaderHtml);

//   let parameters = {
//     display: true,
//     per_page: 6
//   };
//   fetchData(apiEndpoints.saints, function (response) {
//     addLanguageChangeMethod(fetchSaints);

//     saints.html('');

//     if (!response.status) 
//       return;

//     var saintsHtml = "";
//     $.each(response.data.contents, function (idx, saint) {
//       saintsHtml = "";
//       saintsHtml += `<li><div class="our-saints-card d-flex align-items-center"><div class="our-saints-img me-3">`;
//       saintsHtml += `< a href=""><figure><img loading="lazy" class="lozad" data-src="${saint.saint_image}" alt="${saint.saint_name}"></figure></a></div>`;
//       saintsHtml += `<div class="our-saints-title"> < a href=""><h6>${saint.saint_name}</h6></a></div></div></li>`;
//       saints.append(saintsHtml);
//     });

//     loadLazyImages();


//     saintsSlider();

//   }, parameters, cacheTimes.minTime);
// }

function fetchSaints() {
  const saints = $("#saints");
  saints.html(loaderHtml);

  let parameters = {
    display: true,
    per_page: 6
  };
  fetchData(apiEndpoints.saints, function (response) {
    addLanguageChangeMethod(fetchSaints);

    saints.html('');

    if (!response.status) 
      return;

    var saintsHtml = "";
    var firstFour = (response.data.contents || []).slice(0, 4);
    $.each(firstFour, function (idx, saint) {
      var imgSrc = (idx === 0) ? 'assets/images/mosc_images/St_Mother_Mary.jpg'
        : (idx === 1) ? 'assets/images/mosc_images/St_Baselios_Yeldho.jpg'
        : (idx === 2) ? 'assets/images/mosc_images/St_Geevarghese.jpg'
        : (idx === 3) ? 'assets/images/mosc_images/St_Gregorios_Parumala.jpg' : saint.saint_image;
      var name = (idx === 0) ? 'St.Mary Mother of God'
        : (idx === 1) ? 'St. Baselios Yeldho'
        : (idx === 2) ? 'St. Geevarghese'
        : (idx === 3) ? 'St. Gregorios Of Parumala' : saint.saint_name;
      var saintHref = (idx === 0) ? 'st-mary-mother-of-god.html' : (idx === 1) ? 'st-baselios-yeldho.html' : (idx === 2) ? 'st-geevarghese-mar-dionysius-vattasseril.html' : (idx === 3) ? 'st-gregorios-of-parumala.html' : 'saints.html';
      saintsHtml = "";
      saintsHtml += `<li><a href="${saintHref}" class="unset-link"><div class="our-saints-card d-flex align-items-center"><div class="our-saints-img me-3">`;
      saintsHtml += `<figure><img loading="lazy" class="lozad" data-src="${imgSrc}" alt="${name}"></figure></div>`;
      saintsHtml += `<div class="our-saints-title"><h6>${name}</h6></div></div></a></li>`;
      saints.append(saintsHtml);
    });

    loadLazyImages();

    saintsSlider();

  }, parameters, cacheTimes.minTime);
}




function fetchAboutUs() {
  const front_description = $("#front_description");
  const about_image_1 = $("#about_image_1");
  const about_image_2 = $("#about_image_2");
  const about_image_3 = $("#about_image_3");


  fetchData(apiEndpoints.about_us, function (response) {
    addLanguageChangeMethod(fetchAboutUs);

    if (!response.status)
      return;

    const about_us = response.data;

    front_description.html("The Malankara Orthodox Syrian Church traces its origins to the Apostolic ministry of St. Thomas in India. We are a community rooted in ancient traditions, committed to preserving the faith handed down through generations while serving our members with love, compassion, and spiritual guidance.");

    about_image_1.attr('src', 'assets/images/mosc_images/Cross_Image.png');
    about_image_1.attr('alt', "About Image");

    about_image_2.attr('src', 'assets/images/mosc_images/Malankara_Orthodox_Fathers_Image.jpeg');
    about_image_2.attr('alt', "About Image");

    about_image_3.attr('src', 'assets/images/mosc_images/MOSC_Cross_Inside_Circle.png');
    about_image_3.attr('alt', "About Image");


    loadLazyImages();

  }, {}, cacheTimes.minTime);
}



function fetchMajorArchBishop() {
  const bishop_name = $("#bishop_name");
  const bishop_about = $("#bishop_about");
  const bishop_image_front_1 = $("#bishop_image_front_1");
  const bishop_image_front_2 = $("#bishop_image_front_2");

  var bishopAboutShort = "His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.";
  var bishopNameText = 'His Holiness Baselios Marthoma Mathews III';

  function setBishopContent() {
    bishop_name.html(bishopNameText);
    bishop_about.html(bishopAboutShort);
    bishop_image_front_1.attr('src', 'assets/images/mosc_images/Baselios_Marthoma_Mathews_III.jpeg');
    bishop_image_front_1.attr('alt', bishopNameText);
    bishop_image_front_2.attr('src', 'assets/images/mosc_images/Baselios_Marthoma_Mathews_III_2.jpeg');
    bishop_image_front_2.attr('alt', bishopNameText);
  }

  setBishopContent();

  fetchData(apiEndpoints.majorarchbishop, function (response) {
    addLanguageChangeMethod(fetchMajorArchBishop);

    if (!response.status) {
      setBishopContent();
      return;
    }

    const majorArchBishopDetails = response.data;
    bishop_name.html(bishopNameText);
    bishop_about.html(bishopAboutShort);
    bishop_image_front_1.attr('src', 'assets/images/mosc_images/Baselios_Marthoma_Mathews_III.jpeg');
    bishop_image_front_1.attr('alt', majorArchBishopDetails.bishop_name || bishopNameText);
    bishop_image_front_2.attr('src', 'assets/images/mosc_images/Baselios_Marthoma_Mathews_III_2.jpeg');
    bishop_image_front_2.attr('alt', majorArchBishopDetails.bishop_name || bishopNameText);

    loadLazyImages();

  }, {}, cacheTimes.minTime);

  if (bishop_about.length) {
    setTimeout(setBishopContent, 350);
    setTimeout(setBishopContent, 1000);
  }
}



$(document).on('click', '.liturgy-button', function (e) {
  e.preventDefault();
  const selectedLanguage = $(this).attr('data-id');
  $('.liturgy-button').removeClass('active');
  $(this).addClass('active');
  fetchLiturgy(selectedLanguage);
});


function fetchLiturgy(language = 'en') {
  const liturgy_readings = $("#liturgy_readings");
  liturgy_readings.html(loaderHtml);

  let parameters = {
    __: "dmdlMXBVWkNqcS95MkFDVmlEWExZQT09",
    lng: language
  };

  $.get(commonApiURL + apiEndpoints.liturgy, parameters, function (data, status) {


    const readings = data.message;
    var readingHtml = "";

    if (readings.length == 0)
      return;

    const liturgy_day_heading = readings[0].liturgy_day_heading;
    const season_name = readings[0].season_name;

    readingHtml += `<p>${liturgy_day_heading} </p><h2>${season_name}</h2>`;
    readingHtml += `<ul class='fa-ul'>`;

    $.each(readings, function (idx, reading) {
      readingHtml += `<li><i class="fa-li fa-solid fa-cross"></i>${reading.liturgy_heading}<span> ( ${reading.content_place} )</span></li>`;
    });

    readingHtml += `</ul>`;
    liturgy_readings.html(readingHtml);

  });
}



function fetchChurchesLatestNewsCategory() {
  const church_latest_news_category = $(".church_latest_news_category");
  church_latest_news_category.html(loaderHtml);

  let parameters = {
    display: true
  };

  fetchData(apiEndpoints.news_categories, function (response) {
    addLanguageChangeMethod(fetchChurchesLatestNewsCategory);

    church_latest_news_category.html('');

    if (!response.status)
      return;

    let category_alias = '';
    var categoriesHtml = "";
    // categoriesHtml += `<li class="news-nav-item nav-item" role="presentation"><button class="news-button nav-link category-list active" type="button">All</button></li>`;
    // church_latest_news_category.append(categoriesHtml);

    $.each(response.data, function (idx, category) {
      if (idx == 0)
        category_alias = category.category_alias;

      categoriesHtml = "";
      categoriesHtml += `<li class="news-nav-item nav-item" role="presentation"><button class="news-button nav-link category-list ${idx == 0 ? 'active' : ''}" data-id="${category.category_alias}" type="button">${category.category_name}</button></li>`;

      church_latest_news_category.append(categoriesHtml);
    });


    if (category_alias.length > 0)
      fetchChurchesLatestNews(category_alias);



  }, parameters, cacheTimes.minTime);
}



function fetchEparchyCountries() {
  const eparchy_countries = $("#eparchy_countries");
  eparchy_countries.html('');

  fetchData(apiEndpoints.eparchies_countries, function (response) {
    eparchy_countries.html('');

    if (!response.status)
      return;

    var countriesHtml = "";

    $.each(response.data, function (idx, category) {
      countriesHtml = "";
      countriesHtml += `<div data-id="${category.country_alias}" class="${category.country_alias} position-absolute open-country-offcanvas" type="button">
        <span class="country-tooltips d-none d-lg-block" type="button" data-bs-toggle="tooltip" data-bs-custom-class="location-tooltip" data-bs-placement="top" data-bs-title="${category.country_name}"></span>
        </div>`;

      eparchy_countries.append(countriesHtml);
    });



    // Inititalizing tooltips for working
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('.country-tooltips'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl)
    })


  }, {}, cacheTimes.minTime);
}


function fetchEparchyByCountry(country) {
  const eparchy_list = $("#offcanvas_eparchy_list");
  const country_name = $("#offcanvas_country_name");
  const country_image = $("#country_image");
  country_name.html("Diocese in " + country);
  eparchy_list.html(loaderHtml);

  let country_image_val = country_image.attr('data-src');
  country_image_val = country_image_val.split("/").slice(0, -1).join("/") + "/" + country + ".svg";
  country_image.attr('src', country_image_val);


  let parameters = {
    country: country
  };

  fetchData(apiEndpoints.eparchies, function (response) {
    addLanguageChangeMethod(fetchEparchyByCountry);

    eparchy_list.html('');

    if (!response.status)
      return;

    var eparchiesHtml = "";
    $.each(response.data, function (idx, details) {
      const metaDetails = details.meta;
      const mainDetails = details.contents;

      country_name.html("Diocese in  " + metaDetails.country_name);

      $.each(mainDetails, function (idx, eparchy) {
        eparchiesHtml = "";
        eparchiesHtml += `<li class="col-12 col-md-3"><a href="${baseURL + 'eparchies/' + eparchy.eparchy_alias}">${eparchy.eparchy_name}</a></li>`;
        eparchy_list.append(eparchiesHtml);
      });
    });

    loadLazyImages();

  }, parameters);
}




$(document).on('click', '.open-country-offcanvas', function (e) {
  e.preventDefault();
  $('#dioceseCountry').addClass('show');
  $('#dioceseCountry').css('visibility', 'visible');

  const selectedCountry = $(this).attr('data-id');
  fetchEparchyByCountry(selectedCountry);
});



$(document).on('click', '.close-country-offcanvas', function (e) {
  e.preventDefault();
  $('#dioceseCountry').removeClass('show');
  $("#dioceseCountry").animate({
    visibility: 'hidden'
  });

  $('.offcanvas-content').html('');
});




$(document).on('click', '.category-list', function (e) {
  e.preventDefault();


  $('.category-list').removeClass('active');
  $(this).addClass('active');

  const category_alias = $(this).attr('data-id');

  fetchChurchesLatestNews(category_alias);

});


function fetchChurchesLatestNews(category_alias) {
  category_alias = (category_alias == '') ? $('.category-list.active').attr('data-id') : category_alias;

  const church_latest_news = $("#church_latest_news");
  church_latest_news.html(loaderHtml);

  let parameters = {
    page: 1,
    category: category_alias,
    per_page: 6
  };
  fetchData(apiEndpoints.news, function (response) {
    addLanguageChangeMethod(fetchChurchesLatestNews);

    church_latest_news.html('');

    if (!response.status)
      return;

    var newsHtml = "";
    $.each(response.data, function (index, details) {

      const metaDetails = details.meta;
      const mainDetails = details.contents;

      // $.each(mainDetails, function (idx, news) {
      //   newsHtml = "";
      //   newsHtml += ` <li><div class="news-item-card"><div class="news-header">`;
      //   newsHtml += `<div class="news-img"><img loading="lazy" class="w-100 lozad" data-src="${news.news_image}" alt="${news.news_title.substring(0, 75)}"></div>`;
      //   newsHtml += `<a href="${news.news_link}" class="primary-button news-more"><span>View News</span><i class="fa-solid fa-arrow-right-long ms-3"></i></a>`;
      //   newsHtml += `<div class="news-body"><h3><a href="${news.news_link}">${news.news_title.substring(0, 75)}</a></h3></div>`;
      //   newsHtml += `<div class="news-footer"><a href="${news.news_link}"><span>Read More</span><span><i class="fa-solid fa-arrow-right-long ms-3"></i></span></a></div></div></li>`;


      //   church_latest_news.append(newsHtml);
      // });

      $.each(mainDetails, function (idx, news) {
        newsHtml = "";
        newsHtml += ` <li><div class="news-item-card"><div class="news-header">`;
        newsHtml += `<div class="news-img"><img loading="lazy" class="w-100 lozad" data-src="${news.news_image}" alt="${news.news_title.substring(0, 75)}"></div>`;
        newsHtml += `<a href="${baseURL + 'news/' + news.news_alias}" class="primary-button news-more"><span>View News</span><i class="fa-solid fa-arrow-right-long ms-3"></i></a>`;
        newsHtml += `<div class="news-body"><h3><a href="${baseURL + 'news/' + news.news_alias}">${news.news_title.substring(0, 75)}</a></h3></div>`;
        newsHtml += `<div class="news-footer"><a href="${baseURL + 'news/' + news.news_alias}"><span>Read More</span><span><i class="fa-solid fa-arrow-right-long ms-3"></i></span></a></div></div></li>`;


        church_latest_news.append(newsHtml);
      });
    });

    loadLazyImages();


    latestNewsSlider();

  }, parameters, cacheTimes.minTime);
}



function fetchDailyUpdates() {
  const daily_updates = $("#daily_updates");
  daily_updates.html(loaderHtml);

  let parameters = {
    page: 1,
    per_page: 25
  };
  fetchData(apiEndpoints.daily_updates, function (response) {
    daily_updates.html('');

    if (!response.status)
      return;

    var dailyUpdatesHtml = "";
    $.each(response.data.contents, function (idx, updates) {
      dailyUpdatesHtml = "";
      dailyUpdatesHtml += `<li><div class="saints-card"><div class="saints-img-container position-relative">`;
      dailyUpdatesHtml += `<a href="${updates.update_image}" class="img-zoom glightbox position-absolute"><i class="fa-solid fa-expand"></i></a><div class="position-absolute w-100 h-100 saint-overlay"></div>`;
      dailyUpdatesHtml += `<img loading="lazy" data-src="${updates.update_image}" class="saint-img lozad" alt="${updates.update_title}"></div></div></li>`;
      daily_updates.append(dailyUpdatesHtml);
    });

    loadLazyImages();


    dailyUpdatesSlider();

    initializeLightBox();

  }, parameters, cacheTimes.minTime);
}


// function fetchlatestupdates() {
//   const latestupdates = $("#breaking-news");
//   latestupdates.html(loaderHtml);

//   let parameters = {
//     display: true,
//     per_page: 6
//   };
//   fetchData(apiEndpoints.latest_updates, function (response) {
//     addLanguageChangeMethod(fetchlatestupdates);

//     latestupdates.html('');

//     if (!response.status)
//       return;

//     var latestupdatesHtml = "";
//     $.each(response.data.contents, function (idx, latestupdate) {
//       latestupdatesHtml = "";
//       latestupdatesHtml = '<div class="d-flex justify-content-between align-items-center breaking-news bg-white"><div class="d-flex flex-row flex-grow-1 flex-fill justify-content-center bg-danger py-2 text-white px-1 news">';
//       latestupdatesHtml = '<span class="d-flex align-items-center circular">&nbsp;<b>Latest Updates</b></span></div>';
//       latestupdatesHtml += `<marquee class="news-scroll" behavior="scroll" direction="left" onmouseover="this.stop();" onmouseout="this.start();" id="latestUpdates"> `;
//       latestupdatesHtml += `  <a href="${latestupdate.latestdoc_link}" target="_blank"> <span class="dot"></span> ${latestupdate.latestdoc_name}</a>`;
//       latestupdatesHtml += `</marquee> </div>`;
//       latestupdates.append(latestupdatesHtml);
//     });

//     loadLazyImages();

   
//    // saintsSlider();

//   }, parameters, cacheTimes.minTime);
// }


//#########################################################################################################

// const bannerSlider = () => {
//   new Swiper(".main-slider", {
//     slidesPerView: 1,
//     speed: 2500,
//     loop: true,
//     spaceBetween: 10,
//     loop: true,
//     centeredSlides: true,
//     roundLengths: true,
//     parallax: true,
//     effect: "fade",
//     navigation: true,
//     fadeEffect: { crossFade: true },
//     // autoplay: { delay: 5000 },
//     autoplay: { delay: 15000 },
//     pagination: { el: ".main-slider-pagination", clickable: true },
//     navigation: { nextEl: ".main-slider-next", prevEl: ".main-slider-prev" },
//   });

// }

const bannerSlider = () => {
  new Swiper(".main-slider", {
    slidesPerView: 1,
    speed: 1000, // Transition speed (in milliseconds)
    loop: true,
    spaceBetween: 10,
    centeredSlides: true,
    roundLengths: true,
    parallax: true,
    effect: "fade",
    navigation: true,
    fadeEffect: { crossFade: true },
    autoplay: { delay: 4000 }, // Change the delay to 4000 for 4 seconds
    pagination: { el: ".main-slider-pagination", clickable: true },
    navigation: { nextEl: ".main-slider-next", prevEl: ".main-slider-prev" },
  });
}



const saintsSlider = () => {
  if (!$("#saints").length || !$("#saints li").length) return;
  tns({
    container: ".our-saints-slider",
    // items: 3,
    speed: 1000,
    swipeAngle: false,
    mouseDrag: true,
    gutter: 10,
    slideBy: "1",
    lazyload: false,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    controls: true,
    nav: false,
    loop: true,
    controlsContainer: "#saints-customize-controls",
    responsive: {
      640: {
        //   edgePadding: 20,
        //   gutter: 20,
        items: 1,
        autoplay: true,
        autoplayTimeout: 4000,
      },
      768: {
        items: 3,
        autoplay: true,
      },
      991: {
        items: 3,
        autoplay: true,
      },
    },
  });

}


const latestNewsSlider = () => {

  tns({
    container: ".latest-news-slider",
    // items: 3,
    speed: 1000,
    swipeAngle: false,
    mouseDrag: true,
    gutter: 20,
    slideBy: "1",
    lazyload: false,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    controls: false,
    nav: false,
    responsive: {
      640: {
        //   edgePadding: 20,
        //   gutter: 20,
        items: 1,
      },
      768: {
        items: 3,
      },
    },
  });

}


const dailyUpdatesSlider = () => {

  tns({
    container: ".daily-saints-slider",
    // items: 3,
    speed: 1000,
    swipeAngle: false,
    mouseDrag: true,
    gutter: 20,
    slideBy: "1",
    lazyload: false,
    // autoplayTimeout: 4000,
    autoplayHoverPause: true,
    controls: true,
    nav: false,
    controlsContainer: "#customize-controls",
    responsive: {
      640: {
        //   edgePadding: 20,
        //   gutter: 20,
        items: 1,
        autoplay: true,
        autoplayTimeout: 4000,
      },
      768: {
        items: 3,
        autoplay: true,
      },
      991: {
        items: 4,
        autoplay: false,
      },
    },
  });

}
//#########################################################################################################



const countDownEventSlider = () => {

  new Swiper(".event-slider", {
    // direction: 'vertical',
    slidesPerView: 1,
    speed: 2500,
    loop: true,
    spaceBetween: 10,
    loop: true,
    centeredSlides: true,
    roundLengths: true,
    parallax: true,
    effect: "fade",
    navigation: true,
    // fadeEffect: { crossFade: true, },
    autoplay: { delay: 5000 },
    pagination: { el: ".event-pagination", clickable: true },
  });




}


//#########################################################################################################

// Scroll to a Specific Div
if ($(".scroll-to-target").length) {
  $(".scroll-to-target").on("click", function () {
    var target = $(this).attr("data-target");
    // animate
    $("html, body").animate(
      {
        scrollTop: $(target).offset().top,
      },
      1000
    );
  });
}

//#########################################################################################################


//#########################################################################################################

//Sticky Navbar
window.onscroll = function () {
  myFunction();
};

var navbar = document.getElementById("syro-header-bar");
var sticky = navbar ? navbar.offsetTop : 0;

function myFunction() {
  if (navbar && window.pageYOffset > sticky) {
    navbar.classList.add("sticky");
  } else if (navbar) {
    navbar.classList.remove("sticky");
  }
}

//#########################################################################################################



//#########################################################################################################

//Lazy Load
$(document).ready(function () {
  const observer = lozad();
  observer.observe();
});

//#########################################################################################################

//WOW
// var wow = new WOW({
//   boxClass: "wow", // default
//   animateClass: "animated", // default
//   offset: 0, // default
//   mobile: true, // default
//   live: true, // default
// });
// wow.init();

//#########################################################################################################

// toggle Mass timing start
$("#skin-select #toggle").click(function () {
  if ($(this).hasClass("active")) {
    // $("#fas-toggle").removeClass('fa-times')
    $(this).removeClass("active");
    $("#skin-select").animate({
      right: -$(this).parent("#skin-select").width(),
    });
  } else {
    $(this).addClass("active");
    // $("#fas-toggle").addClass('fa-angle-double-left')
    $("#skin-select").animate({
      right: 0,
    });
  }

  if ($("#fas-toggle").hasClass("fa-times")) {
    $("#fas-toggle").removeClass("fa-times");
    $("#fas-toggle").addClass("fa-angle-double-left");
  } else {
    $("#fas-toggle").removeClass("fa-angle-double-left");
    $("#fas-toggle").addClass("fa-times");
  }
  return false;
});

// toggle Mass timing End

//#########################################################################################################

//preloader

$(window).on("load", function () {
  // $("#loading").hide();
});

//#########################################################################################################

//tooltip

$(document).ready(function () {
  $('[data-bs-toggle="tooltip"]').tooltip();
});

//#########################################################################################################

//Search box-focus

$("#search-btn").click(function () {
  // $("#search-input").focus();
  $("#search-item").on("shown.bs.modal", function () {
    $(this).find("#search-input").focus();
  });
});


