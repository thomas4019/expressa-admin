var config = require('./config')
var Link = require('react-router').Link

function linkFormatter(cell, row){
  return (<Link to={'/edit/'+row._type+'/'+row.id}>{cell}</Link>);
}

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
	render: function() {
		var self = this;
		
		var collection = this.props.params.name;
		var contents = (<div></div>)

		if (this.state && this.state.data) {
			var data = Object.keys(this.state.data).map(function(id) {
				var v = self.state.data[id];
				for (var prop in v) {
					v[prop] = JSON.stringify(v[prop]);
				}
				v['_type'] = self.props.params.name;
				v.id = id;
				return v;
			});
			console.log(data);
			var contents = <BootstrapTable data={data} striped={true} hover={false} condensed={true}>
				{Object.keys(this.state.schema.properties).map(function(name, i) {
					return <TableHeaderColumn key={name} dataField={name} dataFormat={i==0?linkFormatter:undefined} isKey={i==0}>{name}</TableHeaderColumn>
				})}
			</BootstrapTable>
		}
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
					<li><Link to={'/collection/'+collection}>{collection}</Link></li>
				</ul>
				{contents}
				<Link to={'/edit/'+collection+'/create'}><button className="btn btn-primary">Add</button></Link>
			</div>
		)
	}
});

module.exports = Collection;