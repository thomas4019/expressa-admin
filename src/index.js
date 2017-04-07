var React = require('react')
var ReactDOM = require('react-dom')
var ReactBSTable = require('react-bootstrap-table');

var Router = require('react-router').Router
var IndexRoute = require('react-router').IndexRoute
var Route = require('react-router').Route
var Link = require('react-router').Link
var browserHistory = require('react-router').browserHistory
var hashHistory = require('react-router').hashHistory

window.settings = window.settings || {}
var config = require('./config')

config.setAPIURL(window.settings.apiurl ? window.settings.apiurl : '/api/')

//var jsonschemaeditor = require('json-schema-editor')
//var JSONEditor = require('json-editor');

require("expose?React!react");
require("expose?ReactDOM!react-dom");
require("expose?config!./config");

require('../styles.css')

require('expose?$!expose?jQuery!jquery');

require("bootstrap-webpack");

require("font-awesome-webpack");

require("toastr");
require("!style!css!../node_modules/toastr/toastr.scss");

require('json-editor')
require("expose?!json-editor");
require("exports?JSONEditor!json-editor")
require("expose?JSONScheamEditor!json-schema-editor");


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
		config.doGet('status')
			.then(function(response) {
				if (!response.data.installed) {
					config.changePage('install')
				} else {
					config.doGet('user/me')
						.then(function(response) {
							this.state.user = response.data;
							this.setState(this.state);
						}.bind(this), function(err) {
							dest = location.hash.substring(1).split('?')[0];
							if (dest != '/login' && dest != '/') {
								window.destAfterLogin = dest;
							}
							config.changePage('/login');
						})
				}
			}.bind(this),
			function (response) {
				console.error(response);
			});

		this.state.token = window.sessionStorage.token;
		config.setToken(this.state.token);
		this.setState(this.state);
	},
	render() {
		return (
			<div>
				{window.sessionStorage.token ? <h2>Welcome {this.state.user.email}! (<Link to="/logout">logout</Link>)</h2> : <h2></h2>}
				{this.props.children}
			</div>
		)
	}
})

var CollectionEntry = React.createClass({
	render: function() {
		var edit = config.production ? '' : <Link to={'/edit/collection/'+this.props.name}><i className="fa fa-cog" aria-hidden="true"></i></Link>
		return (
			<li className="collection-entry list-group-item" >
				<Link to={'/collection/'+this.props.name}>{this.props.name}</Link>
			{edit}
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
			return config.changePage('/login');
		}
		config.doGet('collection')
		  .then(function (response) {
		   	this.setState({
		   		collections: response.data
		   	});
		  }.bind(this),
		  function (response) {
			console.error(response);
		  });
	},
	render: function() {
		var addcollection = !config.production ? <Link to={'/edit/collection/create'}><button className="btn btn-primary">Add Collection</button></Link> : ''
		return (
			<div>
				<ul className="breadcrumbs">
					<li></li>
				</ul>
				<div className="row">
					<div className="col-md-6">
						<h2>Collections</h2>
						<ul className="list-group">
							{this.state.collections.map(function(collection) {
								if( config.production && ["role", "collection", "settings"].indexOf(collection._id) != -1  ) return false
								return <CollectionEntry key={collection._id} name={collection._id} />
							})}
						</ul>
						{addcollection}
						{/*<div className="col-sm-6">
							<h2>Collections</h2>
							<Collection params={{name: 'collection'}} />
						</div>*/}
					</div>
					<div className="col-md-6">
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
		<Route path="/login" component={Login}/>
		<Route path="/" component={App}>
			<IndexRoute component={Home}/>
			<Route path="logout" component={Logout}/>
			<Route path="collection/:name" component={Collection}/>
			<Route path="edit/:collection/:id" component={JSON_Editor}/>
			<Route path="permissions" component={Permissions}/>
		</Route>
	</Router>
, document.getElementById('app'))

if (JSONEditor) {
  JSONEditor.defaults.resolvers.unshift(function(schema) {
    if (schema.type === "object" && schema.format === "schema") {
      return "schema";
    }

    // If no valid editor is returned, the next resolver function will be used
  });

  JSONEditor.defaults.editors.schema = JSONEditor.AbstractEditor.extend({
    setValue: function(value,initial) {
      this.value = value;
    	this.schemaeditor.setValue(value)
      this.onChange();
    },
    getValue: function() {
    	if (typeof this.schemaeditor != 'undefined')
    		return this.schemaeditor.getValue();
     	else
     		return {}
    },
    register: function() {
      this._super();
      if(!this.input) return;
      this.input.setAttribute('name', this.formname);
    },
    unregister: function() {
      this._super();
      if(!this.input) return;
      this.input.removeAttribute('name');
    },
    getNumColumns: function() {
      return 12;
    },
    build: function() {
      var self = this;
      if(!this.options.compact) {
        this.label = this.header = this.theme.getFormInputLabel(this.getTitle());
      }
      if(this.schema.description) this.description = this.theme.getFormInputDescription(this.schema.description);
      if(this.options.compact) this.container.className += ' compact';

      this.input = document.createElement('div')
      this.control = this.theme.getFormControl(this.label, this.input, this.description);

      if(this.schema.readOnly || this.schema.readonly) {
        this.always_disabled = true;
        this.input.disabled = true;
      }

      this.container.appendChild(this.control);

      this.schemaeditor = new JSONSchemaEditor(this.input, {
      	startval: {}
      });
      this.schemaeditor.on('change', function() {
      	self.onChange(true);
      });
    },
    enable: function() {
      if(!this.always_disabled) {
        this.input.disabled = false;
      }
      this._super();
    },
    disable: function() {
      this.input.disabled = true;
      this._super();
    },
    destroy: function() {
      if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
      if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
      if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
      this._super();
    }
  });
}

module.exports = Home;
