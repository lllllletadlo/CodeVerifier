var scanCodes = [];
var detailData;
//scanData_currentindex = -1;
var ticketData;

function onDeviceReady() {



    scripDefaultInit();

    storage_read();

    if(!local)
    {
        window.plugins.imeiplugin.getImei(getImei_handler);
    }

    if(local)
    {
        //$("#memmory").append('<h1 data-index="0" class="_buttonClick buttonOpacity buttonMemmory">IqiW87hcEZg=</h1>');
        //$("#memmory").append('<h1 data-index="0" class="_buttonClick buttonOpacity buttonMemmory">aa=</h1>');
    }


    $("#specInfo").css("display","none");

    showWindow("screenScan");


    //$("div.footer").css("top",$("div.footer").position().top + "px");
    $("div.footer").css("top",$(document).height()-$("div.footer").height() + "px");
    $("#verzeApp").css("top",$(document).height()-$("#verzeApp").height()-2 + "px");
}




function clickInit()
{

    $("div.footer").on(support.supportedTouchStartEven, "li", function (e) {
        e.preventDefault();
        e.stopPropagation();
        showWindow($(this).attr("class").substring(4));

    });


    $("#memmory").on("click", "h1", function (e) {

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


        $('#scanResult').val($(this).html())
        ajax_send();
        //screenDetail_draw($(this).attr("data-index"));
        //showWindow("screenDetail");
    });
}

function showWindow(windowName)
{

    $("#screenNastaveni").css("display","none");
    $(".footscreenNastaveni span").css("color","#798898");
    $("#screenScan").css("display","none");
    $(".footscreenScan span").css("color","#798898");
    $("#screenDetail").css("display","none");
    $(".footscreenDetail span").css("color","#798898");

    $("#"+windowName).css("display","block");
    $(".foot"+windowName + " span").css("color","white");

}

function waiter_display(show)
{
    if(show)
    {
        $("#specInfo").css("display","block");
    } else
    {
        $("#specInfo").css("display","none");
    }
}

function getImei_handler(imei) {
    $('#imei').val(imei);
    console.log("My Android IMEI :" + imei);
}

/**
 * Makes barcode scan.
 */
function scanBarcode() {

    var result = {};

    if(local)
    {
        result.text = "text";
        result.format = "format";
        //$('#scanResult').val("IqiW87hcEZg");
        $('#scanResult').val("ErcFTJuOspE=");
        ajax_send();
    } else
    {
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.scan(function (result) {
            //searchArticles("", "", "", result.text, 1, 10);
            //$('#scanResult').val(result.text + "/" + result.format);
            $('#scanResult').val(result.text);
            ajax_send();
            console.log("SCANNER result: \n" +
            "text: " + result.text + "\n" +
            "format: " + result.format + "\n" +
            "cancelled: " + result.cancelled + "\n");
            console.log("SCANNER:", result);

        }, function (error) {
            alertG("Chyba scanneru")
            console.log("SCANNER failed: ", error);
        });
    }


}


function ajax_blok(code)
{
    waiter_display(true);

    $.ajax({
        //url: url + "/tokens/show/QwSwVL5Py5g=.json",
        url: $("#setServer").val() + "tokens/lock-due/"+$('#scanResult').val()+"=.json",
        type: 'POST',
        data: JSON.stringify({
            Username: $("#setUserName").val(),
            Password: "heslo",
            IMEI: "123456789012345"
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: ajax_blokdataProceed,
        error: ajaxErrorHandler
    });
}

function ajax_blokdataProceed(data)
{
    waiter_display(false);
    var desc = data.ErrorDescription==null?"":"\n"+data.ErrorDescription;
    if(data!=null)
    {
        alert(data.message + desc);
        ajax_send();
    }


}


function ajax_pay()
{
    waiter_display(true);

    $.ajax({
        //url: url + "/tokens/show/QwSwVL5Py5g=.json",
        url: $("#setServer").val() + "tokens/pay/"+$('#scanResult').val()+".json",
        type: 'POST',
        data: JSON.stringify({
            Username: $("#setUserName").val(),
            Password: "heslo",
            IMEI: "123456789012345",
            Amount : detailData.Due
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: ajax_blokdataProceed,
        error: ajaxErrorHandler
    });
}


function ajax_send()
{
    waiter_display(true);

    $.ajax({
        //url: url + "/tokens/show/QwSwVL5Py5g=.json",
        url: $("#setServer").val() + "tokens/show/" + $('#scanResult').val() +".json",
        type: 'POST',
        data: JSON.stringify({
            Username: $("#setUserName").val(),
            Password: "heslo",
            IMEI: "123456789012345"
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: ajax_dataProceed,
        error: ajaxErrorHandler
    });
}

function ajax_dataProceed(data)
{

    detailData = data;

    if(scanCodes.length==0)
    {
        scanCodes[scanCodes.length] = data.Code;
    } else
    {
        for(var i=0;i<scanCodes.length;i++)
        {
            if(scanCodes[i]!=detailData.Code)
            {
                scanCodes[scanCodes.length] = data.Code;
                console.log("vlozeno");
            }
        }
    }




    if(scanCodes.length>3)
    {
        scanCodes = scanCodes.slice(scanCodes.length-3,scanCodes.length);
    }

    screenDetail_draw(data);
    showWindow('screenDetail');
    waiter_display(false);
    memmoryRedraw();
}


function memmoryRedraw()
{

    $("#memmory").empty();

    for(var i in scanCodes){
        console.log(scanCodes[i]);
        $("#memmory").append('<h1 class="_buttonClick buttonOpacity buttonMemmory">'+ scanCodes[i]+'</h1>');
    }

}



function screenDetail_draw(data)
{

    var numRows = 0;
    var strData = "";
    if(data!=null)
    {
        for(var i in data){
            strData += i + "=" + data[i] + "\n";
            numRows++;
        }
    }


    $("#screenDetail textarea").val(strData);
    $("#screenDetail textarea").css("height",numRows + 4 + "em");
}

function ajaxErrorHandler(data) {

    waiter_display(false);
    console.log(data);
    if(data!=null)
    {
        alertG(data.statusText);
    }

}

function storage_write()
{
    localStorage.setItem("CodeVerifier_urlServer",$("#setServer").val());
    localStorage.setItem("CodeVerifier_userName",$("#setUserName").val());
    localStorage.setItem("CodeVerifier_password",$("#setPassword").val());
    alertG("Uloženo");
}

function storage_read()
{
    if(typeof(Storage) !== "undefined") {
        var urlServer = localStorage.getItem("CodeVerifier_urlServer");
        var userName = localStorage.getItem("CodeVerifier_userName");
        var password = localStorage.getItem("CodeVerifier_password");

        if(urlServer!=null)
            $("#setServer").val(urlServer);
        if(userName!=null)
            $("#setUserName").val(userName);
        if(password!=null)
            $("#setPassword").val(password);

    } else {
        // Sorry! No Web Storage support..
    }
}