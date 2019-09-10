(function () {
    "use strict";
    jQuery.sap.declare("dk.sorenviggo.scp.flp.plugin.SCP_FLPMessagePlugin.Component");
    jQuery.sap.require("sap.ui.core.UIComponent");

    sap.ui.core.UIComponent.extend("dk.sorenviggo.scp.flp.plugin.SCP_FLPMessagePlugin.Component", {

        // use inline declaration instead of component.json to save 1 round trip
        metadata : {
            "manifest": "json"
        },

        createContent : function () {
        	//Hello world implementation
        	sap.m.MessageBox.information("Hello - this is a plugin info !");
        }

    });
}());