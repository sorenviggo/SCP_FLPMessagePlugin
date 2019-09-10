/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"dk/sorenviggo/scp/flp/plugin/SCP_FLPMessagePlugin/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});