(function() {

	function checkDropboxAuthorization(callback) {
		Alfresco.util.Ajax.jsonGet({
			url: 'http://localhost:5000/dropbox/auth/status',
			successCallback: {
				fn: function(response) {
					if (response.json.authorized) {
						callback(true);
					} else {
						// If not authorized, redirect to the authorization URL
						window.location.href = response.json.authorizationUrl;
					}
				},
				scope: this
			},
			failureCallback: {
				fn: function() {
					Alfresco.util.PopupManager.displayMessage({
						text: "Failed to check Dropbox authorization status"
					});
					callback(false);
				},
				scope: this
			}
		});
	}


	// Send to Dropbox action
	function onDropboxActionSendTo(record) {
		checkDropboxAuthorization(function(isAuthorized) {
			if (isAuthorized) {
				// Call Alfresco web script to send document to Dropbox
				Alfresco.util.Ajax.jsonPost({
					url: 'http://localhost:5000/share/service/upload',
					dataObj: {
						nodeRef: record.nodeRef
					},
					successCallback: {
						fn: function() {
							Alfresco.util.PopupManager.displayMessage({
								text: "Document sent to Dropbox successfully"
							});
						},
						scope: this
					},
					failureCallback: {
						fn: function() {
							Alfresco.util.PopupManager.displayMessage({
								text: "Failed to send document to Dropbox"
							});
						},
						scope: this
					}
				});
			}
		});
	}

	// Get from Dropbox action
	function onDropboxActionGetFrom(record) {
		console.log("before sending request");

		// Extract nodeId from nodeRef
		const nodeId = record.nodeRef.split('/').pop();
		console.log("nodeId: " + nodeId);

		Alfresco.util.Ajax.request({
			url: 'http://localhost:5000/share/service/download/local/' + nodeId,
			method: "GET",
			successCallback: {
				fn: function(response) {
					Alfresco.util.PopupManager.displayMessage({
						text: "Document retrieved from Dropbox successfully"
					});
				},
				scope: this
			},
			failureCallback: {
				fn: function(response) {
					Alfresco.util.PopupManager.displayMessage({
						text: "Failed to retrieve document from Dropbox"
					});
				},
				scope: this
			}
		});
	}

	// Remove from Dropbox action
	function onDropboxActionRemove(record) {
		Alfresco.util.Ajax.jsonPost({
			url: Alfresco.constants.PROXY_URI + 'dropbox/remove',
			dataObj: {
				nodeRef: record.nodeRef
			},
			successCallback: {
				fn: function() {
					Alfresco.util.PopupManager.displayMessage({
						text: "Document removed from Dropbox successfully"
					});
				},
				scope: this
			},
			failureCallback: {
				fn: function() {
					Alfresco.util.PopupManager.displayMessage({
						text: "Failed to remove document from Dropbox"
					});
				},
				scope: this
			}
		});
	}

	YAHOO.Bubbling.fire("registerAction", {
		actionName: "onDropboxActionSendTo",
		fn: onDropboxActionSendTo
	});

	YAHOO.Bubbling.fire("registerAction", {
		actionName: "onDropboxActionGetFrom",
		fn: onDropboxActionGetFrom
	});

	YAHOO.Bubbling.fire("registerAction", {
		actionName: "onDropboxActionRemove",
		fn: onDropboxActionRemove
	});

})();
