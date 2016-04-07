var axios = require('axios')
var Link = require('react-router').Link

var JSON_Editor = React.createClass({
	componentDidMount: function() {
		var collectionName = this.props.params.collection;
		var id = this.props.params.id;
		this.req1 = axios.get('http://localhost:3000/api/' + collectionName + '/schema')
		this.req2 = axios.get('http://localhost:3000/api/' + collectionName + '/'+id)
		Promise.all([this.req1, this.req2]).then(function(results) {
			var schema = results[0].data;
			var doc = results[1].data;
			this.editor = new JSONEditor(this.refs.editor, {
				schema: schema,
				theme: 'bootstrap3',
				startval: doc
			});
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
			var schema = this.editor.getValue();
			if (typeof id == 'undefined' || id == 'create') {
				console.log('creating');
				axios.post('http://localhost:3000/api/' + collection, schema)
					.then(function(result) {
						console.log(result);
						self.props.history.push('/collection/'+collection);
					}, function(err) {
						console.log(err);
					});

			} else {
				axios.put('http://localhost:3000/api/' + collection + '/' + id, schema)
					.then(function(result) {
						console.log(result);
						self.props.history.push('/collection/'+collection);
					}, function(err) {
						console.log(err);
					});
			}
		}
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
			</div>
		);
	}
});

module.exports = JSON_Editor;