/**
 * array of screens
 *
 * @type {{}}
 */
var transitionObject = {};

var support = {
    supportedTran : 1,
    supportedTouchStartEven : "touchstart",
    sccanerBarcode : false
};

var scriptDef = {

    transition : {
        transitionInAction : false,
        transitionTranslateEndFunction : function(){
            this.transitionInAction = false;
            console.log(this.transitionInAction);
        }
    },
    /*
     for these function to support ios7 must be in config:
     - org.apache.cordova.statusbar
     - disabled with this:

     <gap:config-file platform="ios" parent="UIStatusBarHidden">
     <true/>
     </gap:config-file>
     <gap:config-file platform="ios" parent="UIViewControllerBasedStatusBarAppearance">
     <false/>
     </gap:config-file>

     */
    iosStatusBarShow : function(){
        var ios = navigator.userAgent.match(/iphone|ipad|ipod/i) &&
            parseInt(navigator.appVersion.match(/OS (\d)/)[1], 10) >= 7;
        if (ios) {
            document.body.style.webkitTransform = 'translate3d(0, 20px, 0)';
            $("body").css("height",$(window).height()-20+"px");
            if(typeof  StatusBar != "undefined")
            {
                StatusBar.show();
            }
        }
    }
};

/**
 * Initialize application.
 */
function scripDefaultInit() {

    // search first page display usually in dataManagerLoad after ajax result

    // detect if browser support things we need and set support... variable
    supportDetectDef();

    // by supported aceleration, prepare classes and view
    transitionInitDef();

    // set clicks function on buttons, touch or click
    clickInitDef();

    // load variable from localStore and set data it in pages
    dataManagerLoadDef();

    // unhide ready app :)
    $(".special.cover").css("display", "none");

}

/**
 * Initialize buttons to be clickable, adds onClick listener to all buttons which have _buttonClick class
 */
function clickInitDef() {
    // ------------- buttons needs click (scrollable or...)
    //$(document).off('click').on('click', function(e){
    $(document).on("click", "._buttonClick", function (e) {
        e.stopPropagation();
        if ($(this).hasClass("buttonDisable"))
            return;
        if ($(this).hasClass("buttonOpacity"))
            $(this).addClass('highlightOpacity');
        else
            $(this).addClass('highlight');
        var el = this;

        setTimeout(function () {
            var dataClick = $(el).attr("data-click");
            if ($(el).hasClass("buttonOpacity"))
                $(el).removeClass('highlightOpacity');
            else
                $(el).removeClass('highlight');
            if (dataClick != null) {
                eval(dataClick);
            }
        }, 150);
    });

    if (typeof clickInit != "undefined") {
        clickInit();
    }

    if (typeof focusOutInit != "undefined") {
        focusOutInit();
    }
}


/**
 * Function for loading dataManager
 */
function dataManagerLoadDef() {
    if (typeof dataManagerLoad != "undefined") {
        dataManagerLoad();
    }
}


function showInfow(show, msg) {

    if (show) {
        $("div.special.info h1").html(msg);
        //$("div.special.info").css("display","block");
        containerVisibilitySet("specInfo", true);
    } else {
        //$("div.special.info").css("display","none");
        containerVisibilitySet("specInfo", false);
    }
}


/**
 * Gets all elements (divs, which are pages) with attribute data-cont-id and puts them into transitionObject var.
 */
function transitionObjectInit() {
    // get all containers
    $("[data-cont-id]").each(function () {
        var key = $(this).attr("data-cont-id");
        transitionObject[key] = {
            el: $(this),
            visibility: true
        };

        if(support.supportedTran == 3) {
            //transitionObject[key].el.one('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function()
            transitionObject[key].el.get(0).addEventListener("webkitTransitionEnd", function()
            {
                scriptDef.transition.transitionTranslateEndFunction();
            }, false);
        }
    });
    logging("transitionObject found: " + Object.keys(transitionObject).length);
}

function containerHideAll(expectShowInfo) {

    for (var o in transitionObject) {
        if (o == "specInfo" && expectShowInfo) {
        } else
            containerVisibilitySet(o, false, true);
    }
}

function containerVisibilitySet(contID, visibility, forced, ccsStyle) {

    // if already visibility is do nothing
    if (transitionObject[contID].visibility == visibility && forced != true) {
        return;
    }


    if(support.supportedTran == 3) {
        if (visibility) {
            transitionObject[contID].el.css("-webkit-transform", "translate3d(0, 0, 0)");
            transitionObject[contID].el.css("transform", "translate3d(0, 0, 0)");
        } else {
            transitionObject[contID].el.css("-webkit-transform", "translate3d(-" + pageMaxLenght + "px, 0, 0)");
            transitionObject[contID].el.css("transform", "translate3d(-" + pageMaxLenght + "px, 0, 0)");
        }
    } else {
        if (visibility) {
            if (ccsStyle != null)
                transitionObject[contID].el.css("display", ccsStyle);
            else
                transitionObject[contID].el.css("display", "block");
        } else {
            transitionObject[contID].el.css("display", "none");
        }
    }

    transitionObject[contID].visibility = visibility;
}


// contID - new page, old one is not hidden
//http://coenraets.org/blog/2013/03/hardware-accelerated-page-transitions-for-mobile-web-apps-phonegap-apps/
function containerSlide(contIDold, contIDnew, direction)
{
    if(support.supportedTran!=3)
    {
        hideAll();
        containerVisibilitySet(newPage);
        return;
    }

    if(contIDold=="")
    {
        hideAll();
        containerVisibilitySet(contIDnew, true);
        return;
    }


    // prepare, set pages to positions
    if(direction=="r")
    {
        transitionObject[contIDnew].el.css("-webkit-transform", "translate3d(100%, 0, 0)")
            .css("transform", "translate3d(100%, 0, 0)")
            .css("transition-duration", "0");
    } else
    {
        transitionObject[contIDnew].el.css("-webkit-transform", "translate3d(-100%, 0, 0)")
            .css("transform", "translate3d(-100%, 0, 0)");
    }


    scriptDef.transition.transitionInAction = true;


    // reflow
    //console.log(transitionObject[contIDnew].el.get(0).offsetHeight);
    transitionObject[contIDnew].el.get(0).offsetHeight;

    transitionObject[contIDold].el.css("transition-duration", ".3s");
    transitionObject[contIDnew].el.css("transition-duration", ".3s");


    // start trans
    if(direction=="r")
    {
        transitionObject[contIDold].el.css("-webkit-transform", "translate3d(-100%, 0, 0)")
            .css("transform", "translate3d(-100%, 0, 0)");
    } else
    {
        transitionObject[contIDold].el.one('webkitTransitionEnd', function(e) {
            var el = $(e.target);
            el.css("-webkit-transform", "translate3d(-100%, 0, 0)")
                .css("transform", "translate3d(-100%, 0, 0)")
                .css("transition-duration", "0");
            //$(e.target).remove();
            /*
             transitionObject[contIDold].el.css("-webkit-transform", "translate3d(-100%, 0, 0)")
             .css("transform", "translate3d(-100%, 0, 0)")
             .css("transition-duration", "0");
             */
        });
        transitionObject[contIDold].el.css("-webkit-transform", "translate3d(100%, 0, 0)")
            .css("transform", "translate3d(100%, 0, 0)");

    }
    transitionObject[contIDnew].el.css("-webkit-transform", "translate3d(" + 0 + "px, 0, 0)")
        .css("transform", "translate3d(" + 0 + "px, 0, 0)");


}


function transitionInitDef() {

    pageMaxLenght = $(document).width() > $(document).height() ? $(document).width() : $(document).height();

    //$("body").css("min-height",pageMaxLenght + "px");

    // --- menu bar
    if (support.supportedTran == 3) {
        $("div.menu").css("-webkit-transform", "translate3d(-100%, 0, 0)");
        $("div.menu").css("transform", "translate3d(-100%, 0, 0)");
    } else if (support.supportedTran == 2) {
        $("div.menu").css("left", "-100%");
    } else {
        $("div.menu").css("display", "none");
    }
    menuVisible = false;

    $navtoggle2 = $("#nav-toggle2");
    $menu = $("div.menu");

    transitionObjectInit();
    containerHideAll(true);

    if (typeof transitionInit != "undefined") {
        transitionInit();
    }

}

// improve to hide by 3d transforms current window
function hideAll() {
    /*
     $(".main div.mainContent").css("display","none");
     $(".main div.mainBottom").css("display","none");
     $(".mainTop h1").css("display","none");
     $("#rowLeft").css("display","none");
     $(".mainTop input").css("display","none");

     $(".mainTop div.zakazniciDetail").css("display","none");
     */
    //$(".mainTop h1").css("display","none");
    //$(".mainTop input").css("display","none");
    containerHideAll();
}

function supportDetectDef() {

    // slider hardware support --------------------
    support.supportedTran = 1;

    if (supportsTransitions()) {
        support.supportedTran = 2;
        logging("support transition", 1);
    }
    if (supportsTransitions3d()) {
        support.supportedTran = 3;
        logging("support transition3d", 1);
    }

    if (typeof supportDetect != "undefined") {
        supportDetect();
    }


    // click event support --------------------
    if ('ontouchstart' in document.documentElement) {
        support.supportedTouchStartEven = "touchstart";
        logging("ontouchstart enabled",1);

    } else
    {
        support.supportedTouchStartEven = "click";
        logging("ontouchstart not supported",1);
    }

    // TODO its not good
    // scaner support
    support.sccanerBarcode = true;
    if (typeof cordova == "undefined") {
        support.sccanerBarcode = false;
    }
    if(support.sccanerBarcode)
    {

        if (typeof cordova.plugins.barcodeScanner == "undefined") {
            support.sccanerBarcode = false;
        }
    }


}

function supportsTransitions() {
    var b = document.body || document.documentElement,
        s = b.style,
        p = 'transition';

    if (typeof s[p] == 'string') {
        return true;
    }

    // Tests for vendor specific prop
    var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
    p = p.charAt(0).toUpperCase() + p.substr(1);

    for (var i = 0; i < v.length; i++) {
        if (typeof s[v[i] + p] == 'string') {
            return true;
        }
    }

    return false;
}

function supportsTransitions3d() {
    var el = document.createElement('p'),
        has3d,
        transforms = {
            'webkitTransform': '-webkit-transform',
            'OTransform': '-o-transform',
            'msTransform': '-ms-transform',
            'MozTransform': '-moz-transform',
            'transform': 'transform'
        };

    // Add it to the body to get the computed style.
    document.body.insertBefore(el, null);

    for (var t in transforms) {
        if (el.style[t] !== undefined) {
            el.style[t] = "translate3d(1px,1px,1px)";
            has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
        }
    }

    document.body.removeChild(el);

    return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
}