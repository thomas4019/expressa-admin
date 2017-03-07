var axios = require('axios')
var hashHistory = require('react-router').hashHistory

module.exports = (function() {
	var apiURL = '/api/';
	var token = '';

	return {
		production: !window.settings.showCriticalFeaturesOnProduction && document.location.port == "80", 
		changePage(path) {
			hashHistory.push(path);
		},
		doGet(url) {
			return axios.get(apiURL + url, {
				headers: {'x-access-token': token}
			})
		},
		doPost(url, data) {
			return axios.post(apiURL + url, data, {
				headers: {'x-access-token': token}
			})
		},
		doPut(url, data) {
			return axios.put(apiURL + url, data, {
				headers: {'x-access-token': token}
			})
		},
		doDelete(url, data) {
			return axios.delete(apiURL + url, {
				headers: {'x-access-token': token}
			})
		},
		getAPIURL: function() {
			return apiURL;
		},
		setAPIURL: function(u) {
			apiURL = u;
		},
		getToken: function() {
			return token;
		},
		setToken: function(t) {
			token = t;
		}
	};
})();
