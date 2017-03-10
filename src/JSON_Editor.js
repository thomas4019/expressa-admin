var config = require('./config')
var Link = require('react-router').Link
var browserHistory = require('react-router').browserHistory
var JSON_SchemaEditor = require('./JSON_SchemaEditor');
var toastr = require('toastr')

var JSON_Editor = React.createClass({
	getInitialState: function() {
		return {};
	},
	componentDidMount: function() {
		var collectionName = this.props.params.collection;
		var id = this.props.params.id;
		//this.req1 = config.doGet('collection/' + collectionName)
		this.req1 = config.doGet(collectionName + '/schema')
		if (id != 'create') {
			this.req2 = config.doGet(collectionName + '/'+id)
		}
		Promise.all([this.req1, this.req2]).then(function(results) {
			//var collection = results[0].data;
			//var schema = collection.schema;
			var schema = results[0].data;
			schema.editor = schema.editor || {}
			var doc = (id == 'create') ? undefined : results[1].data;
			this.doc = doc;
			this.editor = new JSONEditor(this.refs.editor, Object.assign({
				schema: schema,
				theme: 'bootstrap3',
				iconlib: 'bootstrap3', 
				startval: doc
			}, schema.editor));
			window.editor = this.editor

		}.bind(this));
	},
	save: function() {
		var self = this;
		var errors = this.editor.validate();
		var collection = this.props.params.collection;
		var id = this.props.params.id;

		if (errors.length) {
			console.log(errors);
		} else {
			var data = this.editor.getValue();

			if (typeof id == 'undefined' || id == 'create') {
				console.log('creating');
				console.log(data);
				config.doPost(collection, data)
					.then(function(result) {
						toastr.success('Saved successfully')
						console.log(result);
						config.changePage('/collection/'+collection);
					}, function(err) {
						toastr.error(err.data, 'Failed to save')
						console.error(err);
					});

			} else {
				config.doPut(collection + '/' + id, data)
					.then(function(result) {
						toastr.success('Saved successfully')
						console.log(result);
						config.changePage('/collection/'+collection);
					}, function(err) {
						toastr.error(err.data, 'Failed to save')
						console.log(err);
					});
			}
		}
	},
	delete: function() {
		var self = this;
		var collection = this.props.params.collection;
		var id = this.props.params.id;
		config.doDelete(collection + '/' + id)
			.then(function(result) {
				config.changePage('/collection/'+collection);
			}, function(err) {
				console.log(err);
			});
	},
	render: function() {
		var collection = this.props.params.collection;
		var id = this.props.params.id;
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
					<li><Link to={'/collection/'+collection}>{collection}</Link></li>
					<li><Link to={'/edit/'+collection+'/'+id}>{id}</Link></li>
				</ul>
				<div ref="editor">
				</div>
				<button className="btn btn-primary" onClick={this.save}>Save</button>
				<button className="btn btn-warning" onClick={this.delete}>Delete</button>
			</div>
		);
	}
});

module.exports = JSON_Editor;
