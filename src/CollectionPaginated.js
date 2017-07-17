var config = require('./config')
var Link = require('react-router').Link
var saveAs = require('file-saver').saveAs;
var dotty = require('dotty')

function jsonToHuman(obj) {
	return JSON.stringify( obj, null, 2 )
		.replace(/["\[\]{}]/g, '')
		.replace(/^\s*[\r\n]/gm, '')
		.replace(/[^A-Za-z0-9]: /g, '')
}

var Collection = React.createClass({
	componentDidMount: function() {
		var collectionName = this.props.params.name;
		this.req1 = config.doGet(collectionName + '/?limit=50&page=0&query={}&orderby={"meta.created":-1}')
		this.req2 = config.doGet(collectionName + '/schema')
		Promise.all([this.req1, this.req2]).then(function(values) {
			this.setState({
				searchtext: '',
				itemsPerPage: 50,
				page: 0,
				pageCount: values[0].data.pages,
				data: values[0].data.data,
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
					return '"' + String(value).replace(/"/g, '""') + '"'
				}.bind(this))
			}.bind(this)).join('\n')
			var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
			saveAs(blob, collection + '.csv');
		}
	},
	prev: function() {
		if (this.state.page > 0) {
			this.state.page--;
			this.setState(this.state);
			this.update();
		}
	},
	next: function() {
		if (this.state.page < this.state.pageCount - 1) {
			this.state.page++;
			this.setState(this.state);
			this.update();
		}
	},
	changeItemsPerPage: function(event) {
		this.state.itemsPerPage = event.target.value;
		this.setState(this.state);
		this.update();
	},
	search: function(event) {
		this.state.searchtext = event.target.value;
		this.setState(this.state);
		this.update();
	},
	update: function() {
		var query = {
			'$and': []
		};
		var fields = (this.state.schema.listing ? this.state.schema.listing.search_columns : null) || ['_id']
		this.state.searchtext.split(' ').forEach(function (word) {
			var conditions = fields.map(function(field) {
				var temp = {};
				temp[field] = {'$regex': word, '$options': 'i'}
				return temp;
			});
			if (conditions.length == 1) {
				query['$and'].push(conditions[0])
			} else {
				query['$and'].push({'$or': conditions})
			}
		})
		var collectionName = this.props.params.name;
		this.req1 = config.doGet(collectionName + '/?limit='+this.state.itemsPerPage+'&page='+this.state.page+'&query='+JSON.stringify(query)+'&orderby={"meta.created":-1}')
		this.req1.then((result) => {
			this.state.data = result.data.data;
			this.state.pageCount = result.data.pages;
			this.setState(this.state);
		});
	},
	render: function() {
		var self = this;
		var collection = this.props.params.name;
		var contents = (<div></div>)

		if (this.state && this.state.data) {
			this.state.schema.listing = this.state.schema.listing || {};
			this.state.listedProperties = this.state.schema.listing.columns || Object.keys(this.state.schema.properties);

			var data = this.state.data.map(function(v) {
				v['_type'] = self.props.params.name;
				return v;
			});
			var emptyMessage = null;
			if (data.length == 0) {
				emptyMessage = <tr><td colSpan={this.state.listedProperties.length}>
					No records to show.
				</td></tr>;
			}
			var contents = <table className="table table-striped table-hover table-condensed">
				<thead><tr>
				{self.state.listedProperties.map(function(name, i) {
					return <td key={name}>{name}</td>
				})}
				</tr></thead>
				<tbody>
					{data.map(function(row, i) {
						return <tr key={i}>
							{this.state.listedProperties.map(function(name, i) {
								var value = dotty.get(row, name)
								if (typeof value == 'undefined') {
									value = ''
								}
								if (typeof value != 'string') {
									value = jsonToHuman(value)
								}
								var text = typeof value == "undefined" || value.length < 50 ? value : value.substring(0, 45)+'...';
								if (i == 0) {
									return <td key={i}><Link to={'/edit/'+row['_type']+'/'+row._id}>{text||'<empty>'}</Link></td>
								} else {
									return <td key={i}>{text}</td>
								}
							})}
						</tr>
					}.bind(this))}
					{emptyMessage}
				</tbody>
			</table>
		}
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
					<li><Link to={'/collection/'+collection}>{collection}</Link></li>
				</ul>
				<input onChange={this.search} placeholder="Search" />
				{contents}
				<div>
					Page {this.state ? this.state.page + 1 : undefined} of {this.state ? this.state.pageCount : undefined}
					<button style={{marginLeft: '8px'}} onClick={this.prev} className="btn btn-secondary">Prev</button>
					<button style={{marginLeft: '8px'}} onClick={this.next} className="btn btn-secondary">Next</button>
					<div style={{float: 'right'}}>
						<label for="itemsPerPage">Items per page:</label>
						<select defaultValue="50" name="itemsPerPage" onChange={this.changeItemsPerPage}>
							<option value="10">10</option>
							<option value="50">50</option>
							<option value="250">250</option>
							<option value="1000">1000</option>
						</select>
					</div>
				</div>
				<br/>

				<Link to={'/edit/'+collection+'/create'}><button className="btn btn-primary">Add</button></Link>
				<button onClick={this.downloadCSV} className="btn btn-secondary download-button">Download All</button>
			</div>
		)
	}
});

module.exports = Collection;