"use strict"

const baseURL = document.getElementsByTagName("constants")[0].dataset.base;
const apiURL = document.getElementsByTagName("constants")[0].dataset.api;
const commonApiURL = document.getElementsByTagName("constants")[0].dataset.commonApi;

const loaderHtml = `<div id="loader" style="display:flex;justify-content:center;"><i class="fa fa-spinner fa-spin" style="font-size:45px;color:#dc3545;"></i></div>`;

let languageChangeMethods = new Set();


const addLanguageChangeMethod = (method) => {
    languageChangeMethods.add(method);
}


//Define the API endpoint paths
const apiEndpoints = {
    contact_us: "cms/contact_us",
    visits: "cms/visits",
    sidemenus: "cms/sidemenus",
    topmenus: "cms/topmenus",
    socialmedias: "cms/socialmedias",
    quicklinks: "cms/quicklinks",
    banners: "cms/banners",
    about_us: "cms/about_us",
    daily_updates: "cms/daily_updates",
    pope: "holy_see/pope",
    oriental_churches: "holy_see/oriental_churches",
    apostolic_nunciature: "holy_see/apostolic_nunciature",
    bishops: "bishops",
    depart: "bishops/depart",
    majorarchbishop: "bishops/majorarchbishop",
    eparchies: "eparchies",
    eparchies_countries: "eparchies/countries",
    eparchial_curia: "eparchies/curia/",
    eparchial_bishops: "eparchies/bishops/",
    eparchial_former_bishops: "eparchies/former_bishops/",
    institutions: "institutions",
    institutions_main_categories: "institutions/main_categories",
    institutions_categories: "institutions/categories",
    institutions_status_categories: "institutions/institutions_status_categories",
    institutions_members: "institutions/members",
    institutions_members_sub: "institutions/institutions_members_sub",
    institution_status: "institutions/institution_status",
    synods: "synods",
    chronologies: "chronologies",
    tribunals: "tribunals",
    ordinary_tribunals: "ordinary_tribunals",
    commissions: "commissions",
    sub_commissions: "commissions/sub_commissions",
    commissions_members: "commissions/members",
    image_gallery: "image_gallery",
    gallery_categories: "image_gallery/categories",
    documents: "documents",
    
    pr_document: "documents/pr_document",
    pl_document: "documents/pl_document",
    chancery_document: "documents/chancery_document",
    other_document: "documents/other_document",
    circular_document: "documents/circular_document",
    latest_updates: "documents/latest_updates",
    latest_photos: "documents/latest_photos", 

    documents_categories: "documents/categories",
    events: "events",
    events_tags: "events/tags",
    news: "news",
    news_categories: "news/categories",
    news_tags: "news/tags",
    saints: "saints",
    mount_curia: "mount_curia",
    search: "search",
    liturgy: "liturgy",
    venerables_and_servants: "saints/venerables_and_servants",
    latin_bishops: "bishops/latin",
    emeriti_bishops: "bishops/emeriti",
    depart: "bishops/depart",
    church_at_a_glance: "mount_curia/church_at_a_glance",
    church_around_the_globe: "mount_curia/church_around_the_globe",
    conference_kcbc: "conference/kcbc",
    conference_ccbi: "conference/ccbi",
    conference_cbci: "conference/cbci",
    conference_smcc: "conference/smcc",
    procurator: "procurator",
    pilgrim_churches: "pilgrim_churches",
    seminary: "seminary",
    apostolic_visitation: "apostolic_visitation",
    prelates: "prelates",
};


const cacheTimes = {
    testTime: 10000, // 1 min
    minTime: 300000, // 5 min
    avgTime: 3600000, // 1 hr
    maxTime: 43200000, // 12 hrs
};


let apiResponses = localStorage.getItem("apiResponses");
apiResponses = apiResponses ? JSON.parse(apiResponses) : {};


$(document).ready(function () {
    loadLazyImages();
    loadLanguage();
    loadBreadCrumb();

    hidePreLoader();


    fetchSideMenu();
    fetchTopMenu();


    fetchSocialMedias();
    fetchQuickLinks();

    fetchLatestNews();
    fetchLatestEvents();
    fetchLatestGallery();


    checkVisitor();
});



function hidePreLoader() {
    $("#loading").hide();
}


function loadBreadCrumb() {
    const breadcrumbTitle = $('.breadcrumb-title');
    const breadcrumbs = $('#breadcrumbs');

    const currentUrl = window.location.pathname.substring(1);
    const sections = currentUrl.split("/");

    const sectionSize = sections.length - 1;
    let formattedSection = '', breadcrumbTitleWord = '';
    let breadCrumbHtml = `<li class="breadcrumb-item"><a href="index.html">Home</a></li>`;

    breadCrumbHtml += sections.map((section, idx) => {
        section = section.replace(/\.html$/i, "");
        formattedSection = section.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
        formattedSection = formattedSection.replace(/-/g, " ");
        if (idx == sectionSize)
            breadcrumbTitleWord = formattedSection;

        return `<li class="breadcrumb-item ${(sectionSize == idx) ? 'active' : ''}" ${(sectionSize == idx) ? 'aria-current="page"' : ''} >${formattedSection}</li>`;
    }).join("");


    breadcrumbTitle.html(breadcrumbTitleWord);
    breadcrumbs.html(breadCrumbHtml);
}


function checkVisitor() {
    const currentTime = new Date().getTime();
    const expiryTimeMin = 1000 * 60 * 60 * 24; // in milliseconds : 1000 = 1 seconds
    const expiryTime = expiryTimeMin;
    if (localStorage.getItem("lastVisitTime") !== null) {

        var lastVisitTime = localStorage.getItem("lastVisitTime");

        if (currentTime - lastVisitTime < expiryTime) {
        } else {
            $.get(apiURL + apiEndpoints.visits, function (data, status) { });

        }
    }

    localStorage.setItem("lastVisitTime", currentTime);
}


function setCaching() {
    const currentTime = new Date().getTime();
    const expiryTimeMin = 5000; // in milliseconds : i * 1000 = i seconds
    const expiryTime = expiryTimeMin;
    if (localStorage.getItem("lastVisitTime") !== null) {

        var lastVisitTime = localStorage.getItem("lastVisitTime");

        if (currentTime - lastVisitTime < expiryTime) {
            BottomToast("You have visited this site today");
        } else {
            BottomToast("You have not visited this site today");
        }
    }

    localStorage.setItem("lastVisitTime", currentTime);
}


function checkForCaching() {
    const currentTime = new Date().getTime();
    const expiryTimeMin = 5000; // in milliseconds : i * 1000 = i seconds
    const expiryTime = expiryTimeMin;
    if (localStorage.getItem("lastVisitTime") !== null) {

        var lastVisitTime = localStorage.getItem("lastVisitTime");

        if (currentTime - lastVisitTime < expiryTime) {
            BottomToast("You have visited this site today");
        } else {
            BottomToast("You have not visited this site today");
        }
    }

    localStorage.setItem("lastVisitTime", currentTime);
}





function fetchSideMenu() {
    const sidemenus = $("#sidemenus");
    sidemenus.html('');


    fetchData(apiEndpoints.sidemenus, function (response) {
        addLanguageChangeMethod(fetchSideMenu);

        if (!response.status)
            return;

        var menuHtml = "";
        var metaDetails, contentDetails;
        $.each(response.data, function (idx, menu) {
            metaDetails = menu.meta;
            contentDetails = menu.contents;
            var sideMenuName = (metaDetails.side_menu_name || "").trim();
            var isSynod = sideMenuName.toLowerCase() === "synod";

            menuHtml = "";
            if (isSynod) {
                /* Holy Synod: single link, hide all submenu items */
                menuHtml += `<div class="col-sm-4 mb-lg-5 mb-4">`;
                menuHtml += `<img data-src="${metaDetails.side_menu_icon}" class="img-fluid float-start me-2 lozad menu-icon">`;
                menuHtml += `<p class="m-0 mb-lg-3 mb-0 float-lg-start pe-2 offcanvas-menu-title"><strong>Holy Synod</strong></p>`;
                menuHtml += `<div class="menu-clearfix clearfix border-bottom mb-3">&nbsp;</div>`;
                menuHtml += `<div class="row m-0">`;
                menuHtml += `<a class="col-6" href="/syro/holy-synod" target="_top">Holy Synod</a>`;
                menuHtml += `</div></div>`;
            } else {
                var menuSize = contentDetails.length >= 10 ? 8 : 4;
                menuHtml += `<div class="col-sm-${menuSize} mb-lg-5 mb-4">`;
                menuHtml += `<img data-src="${metaDetails.side_menu_icon}" class="img-fluid float-start me-2 lozad menu-icon">`;
                menuHtml += `<p class="m-0 mb-lg-3 mb-0 float-lg-start pe-2 offcanvas-menu-title"><strong>${metaDetails.side_menu_name}</strong></p>`;
                menuHtml += `<div class="menu-clearfix clearfix border-bottom mb-3">&nbsp;</div>`;
                menuHtml += `<div class="row m-0">`;
                $.each(contentDetails, function (index, link) {
                    menuHtml += `<a class="col-6" href="${link.content_link}">${link.content_title}</a>`;
                });
                menuHtml += `</div></div>`;
            }
            sidemenus.append(menuHtml);
        });
        loadLazyImages();

    }, {}, cacheTimes.minTime);
}



function fetchSocialMedias() {
    const socialmedias = $("#socialmedias");
    socialmedias.html('');

    fetchData(apiEndpoints.socialmedias, function (response) {

        if (!response.status)
            return;

        var linksHtml = "";
        $.each(response.data.contents, function (idx, links) {
            linksHtml = "";
            linksHtml += `<li><a href="${links.link_url}" target="_blank"><i class="${links.link_icon}"></i></a></li>`;
            socialmedias.append(linksHtml);
        });

    }, {}, cacheTimes.minTime);
}



// function fetchQuickLinks() {
//     const quicklinks = $("#quicklinks");
//     quicklinks.html('');

//     fetchData(apiEndpoints.quicklinks, function (response) {
//         addLanguageChangeMethod(fetchQuickLinks);

//         if (!response.status)
//             return;

//         var linksHtml = "";
//         $.each(response.data.contents, function (idx, links) {
//             linksHtml = "";
//             linksHtml += `<a href="${links.link_url}"><p class="mb-3">${links.link_title}</p></a>`;
//             quicklinks.append(linksHtml);
//         });

//     }, {}, cacheTimes.minTime);
// }

function fetchQuickLinks() {
    const quicklinks = $("#quicklinks");
    if (quicklinks.hasClass("quick-links-two-col")) return;
    quicklinks.html('');

    fetchData(apiEndpoints.quicklinks, function (response) {
        addLanguageChangeMethod(fetchQuickLinks);

        if (!response.status)
            return;

        var linksHtml = "";
        $.each(response.data.contents, function (idx, links) {
            linksHtml = "";
            // Add target="_blank" to open links in a new tab
            linksHtml += `<a href="${links.link_url}" target="_blank"><p class="mb-3">${links.link_title}</p></a>`;
            quicklinks.append(linksHtml);
        });

    }, {}, cacheTimes.minTime);
}



function fetchLatestNews() {
    const latest_news = $("#latest_news");
    latest_news.html('');

    let parameters = {
        page: 1,
        per_page: 3
    };
    fetchData(apiEndpoints.news, function (response) {
        addLanguageChangeMethod(fetchLatestNews);

        if (!response.status)
            return;

        var newsHtml = "";
        $.each(response.data, function (index, details) {
            const metaDetails = details.meta;
            const mainDetails = details.contents;

            $.each(mainDetails, function (idx, news) {
                newsHtml = "";
                newsHtml += `<span class="mb-3 d-block"><a href="${baseURL + 'news/' + news.news_alias}"><p class="mb-0 footer-event-title line-1">${news.news_title.substring(0, 30)}...</p>`;
                newsHtml += `<p class="mb-0 footer-event-date line-1">${news.news_date}</p>`;
                newsHtml += `</a></span>`;
                latest_news.append(newsHtml);
            });
        });

    }, parameters, cacheTimes.minTime);
}



function fetchLatestEvents() {
    const latest_events = $("#latest_events");
    latest_events.html('');

    let parameters = {
        page: 1,
        per_page: 4
    };
    fetchData(apiEndpoints.events, function (response) {
        addLanguageChangeMethod(fetchLatestEvents);

        if (!response.status)
            return;

        var eventsHtml = "";
        $.each(response.data, function (index, details) {

            $.each(details, function (idx, events) {
                eventsHtml = "";
                eventsHtml += `<span class="mb-3 d-block"><a href="${baseURL + 'events/' + events.event_alias}"><p class="mb-0 footer-event-title line-1">${events.event_title.substring(0, 30)}...</p>`;
                eventsHtml += `<p class="mb-0 footer-event-date line-1">${events.event_date_time}</p>`;
                eventsHtml += `</a></span>`;
                latest_events.append(eventsHtml);
            });
        });

    }, parameters, cacheTimes.minTime);
}


function fetchLatestGallery() {
    const latest_gallery = $("#latest_gallery");
    latest_gallery.html('');

    let parameters = {
        page: 1,
        per_page: 4
    };
    fetchData(apiEndpoints.image_gallery, function (response) {
        addLanguageChangeMethod(fetchLatestEvents);

        if (!response.status)
            return;

        var galleryHtml = "";
        let galleryIndex = 0;
        $.each(response.data, function (index, details) {
            $.each(details.contents, function (idx, gallery) {
                galleryHtml = "";
                galleryHtml += `<div class="box-${++galleryIndex}"><a href="${gallery.image_path}" class="glightbox">`;
                galleryHtml += `<img data-src="${gallery.image_path}" class="w-100 lozad" alt="${gallery.image_title}"></a></div>`;
                latest_gallery.append(galleryHtml);
            });
        });
        loadLazyImages();

        initializeLightBox();

    }, parameters, cacheTimes.minTime);
}


const initializeLightBox = () => {

    GLightbox({
        touchNavigation: false,
        loop: false,
        autoplayVideos: true,
        openEffect: "zoom",
        closeEffect: "zoom",
        preload: false,
        zoomable: false,
        navigation: false,
        draggable: false,
    });

}

function fetchTopMenu() {
    const topmenus = $("#topmenus");
    topmenus.html('');

    fetchData(apiEndpoints.topmenus, function (response) {
        addLanguageChangeMethod(fetchTopMenu);
        if (!response.status)
            return;

        var menuHtml = "";



        /**
        *  Menu which has submenus
        * 
        */
        let metaDetails, contentDetails;
        $.each(response.data.has_submenu, function (idx, menu) {
            metaDetails = menu.meta;
            contentDetails = menu.contents;
            var menuName = (metaDetails.top_menu_name || "").trim();
            var isSynod = menuName.toLowerCase() === "synod";

            menuHtml = "";
            if (isSynod) {
                /* Holy Synod: single link, no dropdown/submenu items */
                menuHtml += `<li class="nav-item ms-2 me-2"><a class="nav-link" href="/syro/holy-synod" target="_top">Holy Synod</a></li>`;
            } else {
                menuHtml += `<li class="nav-item dropdown ms-2 me-2"><a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">${metaDetails.top_menu_name}</a>`;
                if (contentDetails)
                    menuHtml += `<ul class="dropdown-menu">`;
                $.each(contentDetails, function (index, link) {
                    menuHtml += `<li><a class="dropdown-item" href="${link.content_link}">${link.main_menu_name}</a></li>`;
                });
                if (contentDetails)
                    menuHtml += `</ul>`;
                menuHtml += `</li>`;
            }
            topmenus.append(menuHtml);
        });


        /**
         *  Menu which has no submenu
         * 
         */

        if (response.data.hasOwnProperty('no_submenu'))
            $.each(response.data.no_submenu.contents, function (idx, menu) {
                menuHtml = "";
                menuHtml += `<li class="nav-item ms-2 me-2"><a class="nav-link" href="${menu.content_link}">${menu.top_menu_name}</a></li>`;

                topmenus.append(menuHtml);
            });

        var firstLi = $("#topmenus > li:first");
        if (firstLi.length) {
            firstLi.find(".dropdown-toggle, .nav-link").first().text("Catholicate").attr("href", "/syro/catholicate").attr("target", "_top").removeClass("dropdown-toggle").attr("data-bs-toggle", "");
            firstLi.removeClass("dropdown");
            firstLi.find(".dropdown-menu").remove();
            firstLi.after('<li class="nav-item ms-2 me-2"><a class="nav-link" href="/syro/administration" target="_top">Administration</a></li>');
        }

        /* Insert "The Church" before "Holy Synod" (if not already present) */
        $("#topmenus > li").each(function () {
            var menuText = $(this).find(".dropdown-toggle, .nav-link").first().text().trim();
            if (menuText === "Holy Synod") {
                var prevText = $(this).prev("li").find(".dropdown-toggle, .nav-link").first().text().trim();
                if (prevText !== "The Church") {
                    $(this).before('<li class="nav-item ms-2 me-2"><a class="nav-link" href="/syro/the-church" target="_top">The Church</a></li>');
                }
                return false;
            }
        });

        /* Hide Eparchies, Major Archbishop, and Curia menus by marking their li */
        $("#topmenus > li").each(function () {
            var menuText = $(this).find(".dropdown-toggle, .nav-link").first().text().trim().toLowerCase();
            if (menuText.indexOf("eparch") >= 0) {
                $(this).addClass("menu-eparchies");
            }
            if (menuText.indexOf("major archbishop") >= 0) {
                $(this).addClass("menu-major-archbishop");
            }
            if (menuText.indexOf("curia") >= 0) {
                $(this).addClass("menu-curia");
            }
        });

    }, {}, cacheTimes.minTime);
}



/**
 * 
 *  Sharing Buttons
 */

function setMetaTags(data) {
    const metaTags = document.head.querySelectorAll('meta[property^="og:"]');

    metaTags.forEach((tags) => {
        const property = tags.getAttribute("property");
        switch (property) {
            case 'og:url':
                tags.setAttribute('content', window.location.href);
                break;
            case 'og:title':
                tags.setAttribute('content', data.title);
                break;
            case 'og:description':
                tags.setAttribute('content', data.description);
                break;
            case 'og:image':
                tags.setAttribute('content', data.image);
                break;
            case 'og:image:width':
                tags.setAttribute('content', data.imageWidth);
                break;
            case 'og:image:height':
                tags.setAttribute('content', data.imageHeight);
                break;
        }
    });
}

$(document).on('click', '.web-share', function (e) {
    e.preventDefault();
    const metaTitle = $('meta[property="og:title"]').attr('content');
    const metaDescription = $('meta[property="og:description"]').attr('content');



    if (navigator.share) {
        navigator.share({
            title: metaTitle,
            text: metaDescription,
            url: window.location.href
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(err => {
            BottomToast('Something went wrong, try again !');
            console.log(err);
        });
    } else {
        BottomToast('This feature is not supported !');
    }
});



$(document).on('click', '.copy-to-clipboard', function (e) {
    e.preventDefault();
    let copy_link = window.location.href;
    navigator.clipboard.writeText(copy_link);
    BottomToast('Copied to Clipboard ' + copy_link);
});


function shareOnEmail() {
    const url = window.location.href;
    const title = $('meta[property="og:title"]').attr('content');
    const description = $('meta[property="og:description"]').attr('content');

    const encodedBody = `${title}\n\n${description}\n\n${url}`;


    const mailtoUrl = `mailto:subject=${encodeURIComponent(title)}&body=${encodeURIComponent(encodedBody)}`;

    window.location.href = mailtoUrl;
}


function shareOnWhatsApp() {
    const url = window.location.href;
    const title = $('meta[property="og:title"]').attr('content');
    const description = $('meta[property="og:description"]').attr('content');

    const message = `${title}\n\n${description}\n\n${url}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}


function shareOnFacebook() {
    const url = window.location.href;

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
}

function shareOnTwitter() {
    const url = window.location.href;
    const title = $('meta[property="og:title"]').attr('content');

    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank');
}

function shareOnLinkedIn() {
    const url = window.location.href;
    const title = $('meta[property="og:title"]').attr('content');
    const description = $('meta[property="og:description"]').attr('content');

    const linkedInUrl = `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
    window.open(linkedInUrl, '_blank');
}

function shareOnPinterest() {
    const url = window.location.href;
    const title = $('meta[property="og:title"]').attr('content');
    const description = $('meta[property="og:description"]').attr('content');
    const image = $('meta[property="og:image"]').attr('content');

    const pinterestUrl = `https://pinterest.com/pin/create/button?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`;
    window.open(pinterestUrl, '_blank');
}


















$(document).on('submit', '#contact-form', function (e) {
    e.preventDefault();


    if (validate_form(true, false, true))
        return false;


    const submitBtn = $('.submit-btn');

    submitBtn.hide();
    var formData = new FormData($("#contact-form")[0]);
    var form_url = apiURL + apiEndpoints.contact_us;
    var result_xhr = $.ajax({
        url: form_url,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = parseInt((evt.loaded / evt.total) * 100);
                    $(".progress-bar").width(percentComplete + '%');
                    $(".progress-bar").html(percentComplete + '%');
                }
            }, false);
            return xhr;
        },
        beforeSend: function () {
            $(".progress-bar").width('0%');
            $(".progress").show();
        }
    })

    result_xhr.done(function (data) {
        $(".progress-bar").width('0%');
        $(".progress").hide();
        submitBtn.show();


        var out = data;
        if (out.status == 'success') {
            BottomToast(out.msg);
            $('#contact-form')[0].reset();
        } else
            BottomToast('Recheck these errors and resubmit');


        BottomToast(out.msg);

    });

    result_xhr.fail(function () {
        $(".progress-bar").width('0%');
        $(".progress").hide();
        submitBtn.show();

        BottomToast('Page has expired, try later !');
    });



});



$(document).on('keyup', 'form .form-control', function (e) {
    try {
        validate_form(false, false, true, true);
    } catch (err) {
        console.warn('Validation is not present');
    }
});


const showNotFound = () => {
    const mainContent = $("#mainContent");
    let contentHtml = "";

    contentHtml += `<section class="inner-page-content"><div class="container">`;
    contentHtml += `<h2 class="error-info">The Data You are looking for is not found</h2>`;
    contentHtml += `</div></section>`;

    mainContent.html(contentHtml);
}





function setFilters(filters) {
    const filtersDiv = $("#filters");

    var filtersHtml = "";
    $.each(filters, function (index, filter) {
        filtersHtml = "";
        filtersHtml += `<li class="category-list" onclick="scrollToElement('${filter}')">${filter}</li>`;

        filtersDiv.append(filtersHtml);

    });
}


function scrollToElement(elementId) {
    $('.btn-close').trigger('click');
    setTimeout(function () {
        const element = document.getElementById(elementId);
        element.scrollIntoView({ align: true, behavior: 'smooth' });
    }, 1200);



}





/**
 * Fetches data from the API at the specified endpoint and passes the data to the provided callback function.
 * 
 * @param {string} endPoint - The API endpoint to fetch data from.
 * @param {function} callback - The function to call with the retrieved data.
 * @returns {void}
 */
const fetchData = (endPoint, callback, parameters = {}, cacheTime = 0) => {
    const url = apiURL + endPoint;
    const language = $("body").attr("language");

    parameters.language = language;

    let urlFormatted = new URL(url);
    let searchParameters = new URLSearchParams(parameters);
    urlFormatted.search = searchParameters.toString();

    urlFormatted = urlFormatted.toString();


    const currentTime = new Date().getTime();

    if (cacheTime > 0) {
        let expiryTime = cacheTime;
        if (apiResponses[urlFormatted] && currentTime - apiResponses[urlFormatted].timestamp < expiryTime) {
            callback(apiResponses[urlFormatted].data);
            return;
        }
    }

    $.ajax({
        url: url,
        method: "GET",
        data: parameters,
        dataType: 'json',
        success: function (data) {
            // if (data.show_message)
            //     BottomToast(data.show_message);
            // if (!data.status)
            //     BottomToast(data.message ? data.message : 'No Data found');


            apiResponses[urlFormatted] = {
                data: data,
                timestamp: currentTime
            };


            localStorage.setItem("apiResponses", JSON.stringify(apiResponses));



            callback(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // BottomToast('Error fetching data from API');
        }
    });
}



const loadLazyImages = () => {
    const observer = lozad();
    observer.observe();
}




/**
 * Displays a message to the user window
 * 
 * @param {string} message - The Message to display.
 * @param {boolean} hide - A Boolean to check if the message should hide after few seconds.
 * @returns {void}
 */
const BottomToast = (message = '', hide = true) => {
    if (message.length == 0)
        return
    $("#snackbar").remove();
    let snackbar_html = `<div id="snackbar" class="show">${message}</div>`;
    $('body').append(snackbar_html);

    if (hide)
        setTimeout(function () {
            $("#snackbar").removeClass("show"); $("#snackbar").remove();
        }, 3000);
}






$(document).on("change", "#change-language", function (e) {
    switchLanguage();
});







/**
 * Loads the language from local storage
 * 
 * @param {null} 
 * @returns {void}
 */
const loadLanguage = () => {
    let default_lang = localStorage.getItem("default-lang");
    if (localStorage.getItem("default-lang") === null) default_lang = "en";

    $("#change-language").val(default_lang);
    $("body").attr("language", default_lang);

    $("#change-language").val(default_lang).trigger("change");
}




/**
 * Switches language content from data attributes
 * 
 * @param {null} 
 * @returns {void}
 */
const switchLanguage = () => {


    let lang = $("#change-language").val();
    localStorage.setItem("default-lang", lang);

    var language_selector = "data-" + lang;

    $("body").attr("language", lang);

    $("[" + language_selector + "]").each(function (lang_index, lang_elements) {
        $(this).text($(this).attr(language_selector));
    });


    languageChangeMethods.forEach(changeMethods => {
        changeMethods();
        languageChangeMethods.delete(changeMethods);
    });
}



