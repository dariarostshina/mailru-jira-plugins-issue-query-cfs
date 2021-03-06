// Created by Andrey Markelov 29-08-2012.
// Copyright Mail.Ru Group 2012. All rights reserved.

//--> initialize dialog
function initJqlDlg(baseUrl, cfId, prId, type) {
    var res = "";
    jQuery.ajax({
        url: baseUrl + "/rest/queryfieldsws/1.0/queryfieldssrv/initjqldlg",
        type: "POST",
        dataType: "json",
        data: {"cfId": cfId, "prId": prId, "type": type},
        async: false,
        error: function(xhr, ajaxOptions, thrownError) {
            try {
                var respObj = eval("(" + xhr.responseText + ")");
                initErrorDlg(respObj.message).show();
            } catch(e) {
                initErrorDlg(xhr.responseText).show();
            }
        },
        success: function(result) {
            res = result.html;
        }
    });

    return res;
}

//--> initialize error dialog
function initErrorDlg(bodyText) {
    var errorDialog = new AJS.Dialog({
        width:420,
        height:250,
        id:"error-dialog",
        closeOnOutsideClick: true
    });

    errorDialog.addHeader(AJS.I18n.getText("queryfields.admin.title.error"));
    errorDialog.addPanel("ErrorMainPanel", '' +
        '<html><body><div class="error-message errdlg">' +
        bodyText +
        '</div></body></html>',
        "error-panel-body");
    errorDialog.addCancel(AJS.I18n.getText("queryfields.closebtn"), function() {
        errorDialog.hide();
    });

    return errorDialog;
}

//--> configure Jql for plugIn custom field
function configureJql(event, baseUrl, cfId, prId, type) {
    event.preventDefault();

    var dialogBody = initJqlDlg(baseUrl, cfId, prId, type);
    if (!dialogBody)
    {
        return;
    }

    jQuery("#configure_jql_dialog").remove();
    var md = new AJS.Dialog({
        width:550,
        height:350,
        id:"configure_jql_dialog",
        closeOnOutsideClick: true
    });
    md.addHeader(AJS.I18n.getText("queryfields.configjqltitle"));
    md.addPanel("load_panel", dialogBody);
    md.addButton(AJS.I18n.getText("queryfields.applyjqlbtn"), function() {
        jQuery.ajax({
            url: baseUrl + "/rest/queryfieldsws/1.0/queryfieldssrv/setjql",
            type: "POST",
            dataType: "json",
            data: AJS.$("#setjqlform").serialize(),
            async: false,
            error: function(xhr, ajaxOptions, thrownError) {
                var errText;
                try {
                    var respObj = eval("(" + xhr.responseText + ")");
                    if (respObj.message) {
                        errText = respObj.message;
                    } else if (respObj.html) {
                        errText = respObj.html;
                    } else {
                        errText = xhr.responseText;
                    }
                } catch(e) {
                    errText = xhr.responseText;
                }
                jQuery("#errorpart").empty();
                jQuery("#errorpart").append("<div class='errdiv'>" + errText + "</div>");
            },
            success: function(result) {
                document.location.reload(true);
            }
        });
    });
    md.addCancel(AJS.I18n.getText("queryfields.closebtn"), function() {
        md.hide();
    });
    md.show();
}

function setQueryFieldValue(idstr, cid) {
    var val = AJS.$("#" + idstr + " :selected").val();
    AJS.$("#" + cid).val(val);
}

function upChooseValFromNewWindow(cfId, baseUrl, returnCfId, prId) {
    var marginTop = 100;
    var marginLeft = 500;

    var pickerWindow = window.open(
        baseUrl + "/secure/popups/MailRuUserPickerValuePickerAction.jspa?cfid=" + cfId + "&inputid=" + cfId + "&returnid=" + returnCfId + "&prId=" + prId,
        "_blank",
        "status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=1,scrollbars=1,height=500,width=500");

    pickerWindow.moveTo(marginLeft, marginTop);
}

function selectAndReturnValue(value, returnId) {
    var returnElem = window.opener.jQuery("#" + returnId);

    if (returnElem) {
        returnElem.val(value);
        returnElem.trigger('input');
    }
    window.close();
};
