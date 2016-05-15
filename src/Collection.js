var config = require('./config')
var Link = require('react-router').Link
var saveAs = require('filesaverjs').saveAs;

var Collection = React.createClass({
	componentDidMount: function() {
		var collectionName = this.props.params.name;
		this.req1 = config.doGet(collectionName + '/')
		this.req2 = config.doGet(collectionName + '/schema')
		Promise.all([this.req1, this.req2]).then(function(values) {
			this.setState({
				data: values[0].data,
				schema: values[1].data
			});
		}.bind(this));
	},
	componentWillUnmount: function() {
		//this.req1.abort();
		//this.req2.abort();
	},
	downloadCSV: function() {
		var collection = this.props.params.name;
		var text = Object.keys(this.state.schema.properties).map(function(name, i) {
			return '"' + name + '"'
		}.bind(this)).join(',') + '\n'
		if (this.state && this.state.data) {
			text += this.state.data.map(function(v) {
				return Object.keys(this.state.schema.properties).map(function(key) {
					var value = v[key] || ''
					return '"' + value.replace(/"/g, '""') + '"'
				}.bind(this))
			}.bind(this)).join('\n')
			var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
			saveAs(blob, collection + '.csv');
		}
	},
	render: function() {
		var self = this;
		
		var collection = this.props.params.name;
		var contents = (<div></div>)
		if (this.state && this.state.data) {
			var data = this.state.data.map(function(v) {
				for (var prop in v) {
					if (typeof v[prop] != 'string')
						v[prop] = JSON.stringify(v[prop]);
				}
				v['_type'] = self.props.params.name;
				return v;
			});
			var contents = <table className="table table-striped table-hover table-condensed">
				<thead><tr>
				{Object.keys(this.state.schema.properties).map(function(name, i) {
					return <td key={name}>{name}</td>
				})}
				</tr></thead>
				<tbody>
					{data.map(function(row, i) {
						return <tr key={i}>
							{Object.keys(this.state.schema.properties).map(function(name, i) {
								var text = typeof row[name] == "undefined" || row[name].length < 50 ? row[name] : row[name].substring(0, 45)+'...';
								if (i == 0) {
									return <td key={i}><Link to={'/edit/'+row['_type']+'/'+row._id}>{text||'<empty>'}</Link></td>
								} else {
									return <td key={i}>{text}</td>
								}
							})}
						</tr>
					}.bind(this))}
					</tbody>
			</table>
		}
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
					<li><Link to={'/collection/'+collection}>{collection}</Link></li>
				</ul>
				{contents}
				<Link to={'/edit/'+collection+'/create'}><button className="btn btn-primary">Add</button></Link>
				<button onClick={this.downloadCSV} className="btn btn-secondary download-button">Download All</button>
			</div>
		)
	}
});

module.exports = Collection;