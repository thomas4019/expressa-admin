var config = require('./config')

module.exports = React.createClass({
	componentDidMount() {
		delete window.sessionStorage.token;
		config.changePage('/login');
	},
	render() {
		return <div></div>
	}
});