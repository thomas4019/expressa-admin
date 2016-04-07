var React = require('react')
var ReactDOM = require('react-dom')
var axios = require('axios')
var ReactBSTable = require('react-bootstrap-table');

var Router = require('react-router').Router
var IndexRoute = require('react-router').IndexRoute
var Route = require('react-router').Route
var Link = require('react-router').Link
var browserHistory = require('react-router').browserHistory

//var jsonschemaeditor = require('json-schema-editor')
//var JSONEditor = require('json-editor');

require("expose?React!react");
require("expose?ReactDOM!react-dom");

var JSON_Editor = require('./JSON_Editor');
var JSON_SchemaEditor = require('./JSON_SchemaEditor');
var Collection = require('./Collection');
var Permissions = require('./Permissions');

const App = React.createClass({
	render() {
		return (
			<div>
				{this.props.children}
			</div>
		)
	}
})

var CollectionEntry = React.createClass({
	render: function() {
		return (
			<li className="list-group-item" >
				<Link to={'/collection/'+this.props.name}>{this.props.name}</Link>
				<Link to={'/schema/'+this.props.name}><i className="fa fa-cog"></i></Link>
				<i className="fa fa-trash"></i>
			</li>
		)
	}
});

var Home = React.createClass({
	getInitialState: function() {
		return {
			collections: {}
		};
	},
	componentDidMount: function() {
		var self = this;
		axios.get('http://localhost:3000/api/collection/index')
		  .then(function (response) {
		   	self.setState({
		   		collections: response.data
		   	});
		  })
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
							{Object.keys(this.state.collections).map(function(collectionName) {
								return <CollectionEntry key={collectionName} name={collectionName} />
							})}
						</ul>
					</div>
					<div className="col-sm-6">
						<h2>Management</h2>
						<ul className="list-group">
							<Link to="/permissions">
								<li className="list-group-item">User Permissions</li>
							</Link>
						</ul>
					</div>
				</div>
			</div>
		);
	}
});

ReactDOM.render(
	<Router history={browserHistory}>
		<Route path="/" component={App}>
			<IndexRoute component={Home}/>
			<Route path="collection/:name" component={Collection}/>
			<Route path="edit/:collection/:id" component={JSON_Editor}/>
			<Route path="schema/:collection" component={JSON_SchemaEditor}/>
			<Route path="permissions" component={Permissions}/>
		</Route>
	</Router>
, document.getElementById('app'))

module.exports = Home;