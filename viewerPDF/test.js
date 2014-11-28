



function openfile(param, elementID) {
	require(['./extension'], function(viewer) {
		viewer.init(param, elementID);
	})
}