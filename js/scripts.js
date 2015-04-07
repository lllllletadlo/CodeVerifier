validator = null;

function onDeviceReady() {


    scripDefaultInit();

    hideAll();
    showWindow("contentIndex");


}

function showWindow(windowName)
{

    hideAll();


    if(windowName=="contentIndex")
    {
        containerVisibilitySet("contentIndex",true);

    }


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
        $('#scanResult').val(result.text + "/" + result.format);
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
