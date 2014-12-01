/* Copyright (c) 2013 The Tagspaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
	console.log("Loading viewerPDF");
	exports.init = function(filePath, elementID) {
		console.log("Initalization Browser PDF Viewer...");
		$('#' + elementID).append($('<iframe>', {
			id: "iframeViewer",
			src: "web/viewer.html?file=" + filePath,
			width: "1000",
			height: "1000",
			scrolling: "auto",
			"nwdisable": "",
			"nwfaketop": ""
		}));
	};
});

require