var config = require('./config')
var Link = require('react-router').Link

var JSON_SchemaEditor = React.createClass({
	getData: function() {
		return this.editor.getValue();
	},
	componentDidMount: function() {
		var schema = this.props.schema;
		this.editor = new JSONSchemaEditor(this.refs.editor, {startval: schema});
	},
	render: function() {
		return (
			<div>
				<h2>Schema</h2>
				<div ref="editor">
				</div>
			</div>
		);
	}
});

module.exports = JSON_SchemaEditor;