// ---- menu button
function enableMenuButton()
{
    document.addEventListener("menubutton", menuButton, true);
}
function enableBackButton()
{
    document.addEventListener("backbutton", backKeyDown, true);
    if(typeof navigator.app== "undefined") return;
    if(typeof navigator.app.overrideBackbutton== "undefined") return;
    navigator.app.overrideBackbutton(true);
}

function backKeyDown() {
    var r = confirm("Chcete opustit aplikaci?");
    if (r == true) {
        navigator.app.exitApp();
    } else {
        return;
    }
}







// level: 1=INFO, 2=WARNING, 3=ERROR
// v2
function logging(str, level) {
    if (level == 1 || level == null) console.log("INFO:" + str);
    if (level == 2) console.log("WARN:" + str);
    if (level == 3) alert("ERROR:" + str);

    var elLog = $("#log");
    if(elLog.length>0)
    {
        var elTextarea = $("#log").find("textarea");
        var text= $(elTextarea).val();
        text += str + "\n";
        $(elTextarea).val(text);
        $(elTextarea).scrollTop($(elTextarea)[0].scrollHeight);
    }
};

function alertG(msg,title)
{
    if(typeof navigator.notification!="undefined")
    {
        if(title == undefined) title = "Upozornění!";

        navigator.notification.alert(
            msg,  // message
            null,         // callback
            title,            // title
            'OK'                  // buttonName
        );
    } else
    {
        alert(msg);
    }


}


function alertS(msg,title)
{
    if(typeof navigator.notification!="undefined")
    {
        if(title == undefined) title = "Zpráva:";

        navigator.notification.alert(
            msg,  // message
            null,         // callback
            title,            // title
            'OK'                  // buttonName
        );
    } else
    {
        alert(msg);
    }


}

function PinchEl(elementToZoom, elementPinch)
{
    /*
     elementToZoom - element that will be zoomed
     elementPinch - element where is pinch proceed. Probably elementToZoom
     startFontSizePercentage - size of font, for example 100. (Must be se because I cant get it by $(el).css("font-size")! Because result is not in percentage but in px
     */
    this.elementToZoom = elementToZoom;
    this.elementPinch = elementPinch;
    this.scaling = false;
    this.windowWidth;
    this.scaleWidthStart;
    this.scaleCurrent = 1;


    this.elementPinch.addEventListener('touchstart', function(e) {

        //http://stackoverflow.com/questions/5968227/get-the-value-of-webkit-transform-of-an-element-with-jquery
        this.matrixStyle = window.getComputedStyle($(this.elementToZoom).get(0));  // Need the DOM object
        this.matrix = new WebKitCSSMatrix(this.matrixStyle.webkitTransform);
        this.scaleCurrent = this.matrix.a;

        if (e.touches.length ==2) {
            this.windowWidth = $(window).width();
            this.scaling = true;
            this.scaleWidthStart = Math.sqrt((e.touches[0].pageX-e.touches[1].pageX) * (e.touches[0].pageX-e.touches[1].pageX) + (e.touches[0].pageY-e.touches[1].pageY) * (e.touches[0].pageY-e.touches[1].pageY));
        }

    }.bind(this), false);


    this.elementPinch.addEventListener('touchmove', function(e) {
        if(this.scaling)
        {

            // pythagoras for distance
            this.distPinch = Math.sqrt((e.touches[0].pageX-e.touches[1].pageX) * (e.touches[0].pageX-e.touches[1].pageX) + (e.touches[0].pageY-e.touches[1].pageY) * (e.touches[0].pageY-e.touches[1].pageY));
            this.distPinchChange = this.distPinch / this.scaleWidthStart;

            //this.scale = Math.max(0.25/this.scale, Math.min(this.distPinchChange, 6/this.scale));

            this.scale = this.scaleCurrent * this.distPinchChange;


            if(this.scale > 0.01 && this.scale<100)
            {
                //$(this.elementToZoom).css('-moz-transform', 'scale(' + distPinchChange + ')' + 'translate(' + 0 + 'px, ' + 0 + 'px' + ')')
                $(this.elementToZoom).css('-webkit-transform', 'scale3d('+this.scale+','+this.scale+',1)');

            }


        }
    }.bind(this), false);

    this.elementPinch.addEventListener('touchend', function(e) {
        if(this.scaling) {
            this.scaling = false;
            $("div.mainContent.photoImage").width($("div.mainContent.photoImage").width(320*this.scale));
        }
    }.bind(this), false);
}
