var scanData = [];

function onDeviceReady() {



    scripDefaultInit();

    storage_read();

    if(!local)
    {
        window.plugins.imeiplugin.getImei(getImei_handler);
    }


    $("#specInfo").css("display","none");

    showWindow("screenScan");

}




function clickInit()
{
    $("#memmory").on("click", "h1", function (e) {

        screenDetail_draw(scanData[$(this).attr("data-index")]);
        showWindow("screenDetail");
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
        $('#scanResult').val("IqiW87hcEZg");
        ajax_send();
    } else
    {
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");

        scanner.scan(function (result) {
            //searchArticles("", "", "", result.text, 1, 10);
            $('#scanResult').val(result.text + "/" + result.format);
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



function ajax_send()
{
    $.ajax({
        //url: url + "/tokens/show/QwSwVL5Py5g=.json",
        url: $("#setServer").val() + "tokens/show/"+$('#scanResult').val()+"=.json",
        type: 'POST',
        data: JSON.stringify({
            Username: "frantisek",
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
    screenDetail_draw(data);
    showWindow('screenDetail');

    scanData[scanData.length] = data;
    if(scanData.length>3)
    {
        scanData = scanData.slice(scanData.length-3,scanData.length);
    }

    memmoryRedraw();
}


function memmoryRedraw()
{
    $("#memmory").empty();

    for(var i in scanData){
        console.log(scanData[i].Code);
        $("#memmory").append('<h1 data-index="'+i+'" class="_buttonClick buttonOpacity buttonMemmory">'+ scanData[i].Code+'</h1>');
    }

}



function screenDetail_draw(data)
{
    var numRows = 0;
    console.log(data);
    if(data!=null)
    {
        strData = "";
        for(var i in data){
            strData += i + "=" + data[i] + "\n";
            numRows++;
        }
    }


    $("#screenDetail textarea").val(strData);
    $("#screenDetail textarea").css("height",numRows + 4 + "em");
}

function ajaxErrorHandler(data) {
    console.log(data);


    if(!local)
    {
        if(typeof navigator.connection!="undefined")
        {

            var networkState = navigator.connection.type;
            if(networkState == Connection.UNKNOWN || networkState== Connection.NONE)
            {
                alertG("Nelze se připojit k internetu","Chyba!");
                return;false
            }
        }

    }

    var msg = "";
    if(typeof data.msg != "undefined")
    {
        msg = data.msg;
    }

    if(typeof data.responseText != "undefined")
    {
        msg = data.responseText;
    }

    if(msg=="")
    {
        alertG("Chyba s komunikací se serverem","Chyba!");
    } else
    {
        alertG("chyba:" +data.msg,"Chyba!");
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