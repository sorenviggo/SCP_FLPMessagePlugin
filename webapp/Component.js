(function () {
    "use strict";
    jQuery.sap.declare("dk.sorenviggo.scp.flp.plugin.SCP_FLPMessagePlugin.Component");
    jQuery.sap.require("sap.ui.core.UIComponent");

    sap.ui.core.UIComponent.extend("dk.sorenviggo.scp.flp.plugin.SCP_FLPMessagePlugin.Component", {

		testmode: false, //MUST BE SET TO FALSE BEFORE DEPLOYMENT !
		
		metadata: {
			manifest: "json"
		},

		createContent : function () {
			this.setupFlpMessageContent();
        },
        
        setupFlpMessageContent: function(){
			//Documentation for oRenderer: https://sapui5.hana.ondemand.com/#/api/sap.ushell.renderers.fiori2.Renderer

			//Get Promise for Fiori Shell renderer.
			var rendererPromise = this._getRenderer();

			//Get configuration for message.
			var msgConfig = this.getMessageConfig();
			if (msgConfig.isActive){
				//Store reference to this for async access.
				var that = this;
				//Setup message in top of Fiori LaunchPad via a custom subHeader.
				rendererPromise.then(function (oRenderer) {
					if(msgConfig.showAsButton){
						//Display message as a Reject button.
						var oButtonFull = new sap.m.Button({
							text: msgConfig.flpMessage, 
							type: sap.m.ButtonType.Reject,
							press: function () {
								that.displayDialog();
							}
						});
						//Add title and button objects in a Bar to the SubHeader area.
						oRenderer.addSubHeader("sap.m.Bar", {
							id: "testBar", 
							contentMiddle: oButtonFull
						}, true, true );
						
					}else{
						//Display message in a Title object with popup via button.
						//Define Title object
						var oTitle = new sap.m.Title({text: msgConfig.flpMessage});
						//Define Button object
						var oButton = new sap.m.Button({
							icon: "sap-icon://hint",
							type: sap.m.ButtonType.Emphasized,
							press: function () {
								that.displayDialog();
							}
						});
						oButton.addStyleClass("sapUiTinyMarginEnd");
						//Add title and button objects in a Bar to the SubHeader area.
						oRenderer.addSubHeader("sap.m.Bar", {
							id: "testBar", 
							contentMiddle: oTitle,
							contentRight: [oButton]
						}, true, true );
					}
				});

				//Perform autopopup of message dialog if requested.
				if (msgConfig.autoPopup){
					this.displayDialog();
				}
			}
        	
        },
        
		displayDialog : function(){
			var msgConfig = this.getMessageConfig();
			var that = this;
			//Create dialog, if it has not already been created.
			if(!this._dialogMessage){
				var vbox = new sap.m.VBox({
					items:[
						new sap.m.FormattedText({htmlText: "<H1>" + msgConfig.flpMessage + "</H1>"}),
						new sap.m.FormattedText({htmlText: msgConfig.longMessage})
					]
				});
				vbox.addStyleClass("sapUiTinyMarginBeginEnd").addStyleClass("sapUiTinyMarginTopBottom");

				this._dialogMessage = new sap.m.Dialog({
					title: msgConfig.popupTitle,
					content: vbox,
					beginButton: new sap.m.Button({
						text: msgConfig.closeBtnText,
						press: function () {
							that._dialogMessage.close();
						}
					})
				});
			}
			//Display dialog.
			this._dialogMessage.open();
		},
		
		getMessageConfig : function(){
			//Set default values.
			var msgConfig = {};
			msgConfig.isActive = false;
			msgConfig.autoPopup = false;
			msgConfig.showAsButton = false;
			msgConfig.flpMessage = "<No text>";
			msgConfig.longMessage = "<No text>";
			msgConfig.popupTitle = "Message";
			msgConfig.closeBtnText = "Close";
			//Get App Configuration - values are set up as parameters for the app in Fiori Configuration Cockpit.
			var appConfig = this.getAppConfig();
			if(this.testmode){
				appConfig = this.getAppConfigTest(); //Load values for local testing
			}
			if(appConfig){
				//Copy each value - this way we can easily change the config key if needed.
				msgConfig.isActive = this.getBoolFromString(appConfig.isActive);
				msgConfig.autoPopup = this.getBoolFromString(appConfig.autoPopup);
				msgConfig.showAsButton = this.getBoolFromString(appConfig.showAsButton);
				if (appConfig.flpMessage){
					msgConfig.flpMessage = appConfig.flpMessage;
				}
				if (appConfig.longMessage){
					msgConfig.longMessage = appConfig.longMessage;
				}
				if (appConfig.popupTitle){
					msgConfig.popupTitle = appConfig.popupTitle;
				}
				if (appConfig.closeBtnText){
					msgConfig.closeBtnText = appConfig.closeBtnText;
				}
			}
			return msgConfig;
		},

		getAppConfig : function(){
			var appConfig;
			try{
				appConfig = this.getComponentData().config;
			}catch(e){
				//Do nothing
			}
			return appConfig;
		},
		
		getAppConfigTest : function(){
			//Test data for local testing.
			//Note: All values must be strings.
			var appConfig = {};
			appConfig.isActive = "true"; 
			appConfig.autoPopup = "false"; 
			appConfig.showAsButton = "false";
			appConfig.popupTitle = "Warning !";
			appConfig.flpMessage = "This is a test message - SAP could be down....";
			appConfig.longMessage = 
				"Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat," +
				" sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem " + 
				"ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore " + 
				"magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut " + 
				"labore et dolore magna aliquyam erat";
			appConfig.closeBtnText = "Close";
			return appConfig;
		},

		getBoolFromString : function(str){
			if (str && str.toUpperCase() === "FALSE"){
				return false;
			}else if(str){
				return true;
			}else{
				return false;
			}
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
    });
}());