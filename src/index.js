var React = require('react')
var ReactDOM = require('react-dom')
var ReactBSTable = require('react-bootstrap-table');


var Router = require('react-router').Router
var IndexRoute = require('react-router').IndexRoute
var Route = require('react-router').Route
var Link = require('react-router').Link
var browserHistory = require('react-router').browserHistory
var hashHistory = require('react-router').hashHistory
var config = require('./config')

config.setAPIURL('http://localhost:3000/api/')

//var jsonschemaeditor = require('json-schema-editor')
//var JSONEditor = require('json-editor');

require("expose?React!react");
require("expose?ReactDOM!react-dom");

window.config = config;

var JSON_Editor = require('./JSON_Editor');
var JSON_SchemaEditor = require('./JSON_SchemaEditor');
var Collection = require('./Collection');
var Permissions = require('./Permissions');
var Login = require('./Login')
var Logout = require('./Logout')
var Install = require('./Install')

config.setToken(window.sessionStorage.token);

const App = React.createClass({
	getInitialState() {
		return {token: '', user: {}};
	},
	componentDidMount() {
		this.state.token = window.sessionStorage.token;
		config.setToken(this.state.token);
		this.setState(this.state);
		config.doGet('user/me')
			.then(function(response) {
				this.state.user = response.data;
				this.setState(this.state);
			}.bind(this))
	},
	render() {
		return (
			<div>
				{window.sessionStorage.token ? <h2>Welcome {this.state.user.fullName}! (<Link to="/logout">logout</Link>)</h2> : <h2></h2>}
				{this.props.children}
			</div>
		)
	}
})

var CollectionEntry = React.createClass({
	render: function() {
		return (
			<li className="collection-entry list-group-item" >
				<Link to={'/collection/'+this.props.name}>{this.props.name}</Link>
			</li>
		)
	}
});

var Home = React.createClass({
	getInitialState: function() {
		return {
			collections: []
		};
	},
	componentDidMount: function() {
		if (typeof window.sessionStorage.token == 'undefined') {
			config.changePage('/login');
		}
		config.doGet('collection')
		  .then(function (response) {
		   	this.setState({
		   		collections: response.data
		   	});
		  }.bind(this))
		  .catch(function (response) {
			console.log(response);
		  });
	},
	render: function() {
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
				</ul>
				<div className="row">
					<div className="col-sm-6">
						<h2>Collections</h2>
						<ul className="list-group">
							{this.state.collections.map(function(collection) {
								return <CollectionEntry key={collection._id} name={collection._id} />
							})}
						</ul>
						{/*<div className="col-sm-6">
							<h2>Collections</h2>
							<Collection params={{name: 'collection'}} />
						</div>*/}
					</div>
					<div className="col-sm-6">
						<h2>Management</h2>
						<ul className="list-group">
							<Link to="/permissions">
								<li className="list-group-item menu-item">User Permissions</li>
							</Link>
						</ul>
					</div>
				</div>
			</div>
		);
	}
});

ReactDOM.render(
	<Router history={hashHistory}>
		<Route path="/install" component={Install}/>
		<Route path="/" component={App}>
			<IndexRoute component={Home}/>
			<Route path="login" component={Login}/>
			<Route path="logout" component={Logout}/>
			<Route path="collection/:name" component={Collection}/>
			<Route path="edit/:collection/:id" component={JSON_Editor}/>
			<Route path="permissions" component={Permissions}/>
		</Route>
	</Router>
, document.getElementById('app'))

module.exports = Home;