var config = require('./config')
var Link = require('react-router').Link

var JSON_SchemaEditor = React.createClass({
	save: function() {
		var data = this.editor.getValue();
		console.log(data);
		config.doPut('schemas/' + this.props.params.collection, data)
			.then(function(result) {
				console.log(result);
				//self.props.history.push('/collection/'+collection);
			}, function(err) {
				console.log(err);
			});
	},
	componentDidMount: function() {

		var collectionName = this.props.params.collection;
		this.serverRequest = config.doGet(collectionName + '/schema')
		this.serverRequest.then(function(result) {
			console.log(result)
			/*this.setState({
				data: result
			});*/
			var schema = result.data;
			var doc = {}
			this.editor = new JSONSchemaEditor(this.refs.editor, {});
			this.editor.setValue(schema)
		}.bind(this));
	},
	render: function() {
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
				</ul>
				<div ref="editor">
				</div>
				<button className="btn btn-primary" onClick={this.save}>Save</button>
			</div>
		);
	}
});

module.exports = JSON_SchemaEditor;