var config = require('./config')
var Link = require('react-router').Link

var Table = require('fixed-data-table').Table;
var Column = require('fixed-data-table').Column;
var Cell = require('fixed-data-table').Cell;
import GetContainerDimensions from 'react-dimensions'
import ReactPaginate from 'react-paginate';

import 'fixed-data-table/dist/fixed-data-table.css'


function linkFormatter(cell, row){
  return (<Link to={'/edit/'+row._type+'/'+row.id}>{cell}</Link>);
}

const TextCell = ({rowIndex, data, col}) => (
  <Cell>
    {data[rowIndex][col]}
  </Cell>
);

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
				var o = [];
				for (var prop in v) {
					v[prop] = JSON.stringify(v[prop]);
					o.push(prop);
				}
				v['_type'] = self.props.params.name;
				v.id = id;
				return v;
			});
			console.log(data);
			console.log(this.state.schema.properties)
			var contents = <Table rowHeight={50} rowsCount={data.length}
			width={this.props.containerWidth} height={500} headerHeight={50}>
				{Object.keys(this.state.schema.properties).map(function(name, i) {
					return <Column key={name}
						header={<Cell>{name}</Cell>}
						cell={<TextCell data={data} col={name} />}
						width={150}
					/>
				})}
			</Table>

  			/*<BootstrapTable data={data} striped={true} hover={false} condensed={true}>
				{Object.keys(this.state.schema.properties).map(function(name, i) {
					return <TableHeaderColumn key={name} dataField={name} dataFormat={i==0?linkFormatter:undefined} isKey={i==0}>{name}</TableHeaderColumn>
				})}
			</BootstrapTable>*/
		}
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
					<li><Link to={'/collection/'+collection}>{collection}</Link></li>
				</ul>
				{contents}
				<nav aria-label="...">
					<ul className="pagination">
						<li className="disabled"><a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>
						<li className="active"><a href="#">1</a></li>
						...
					</ul>
				</nav>
				<Link to={'/edit/'+collection+'/create'}><button className="btn btn-primary">Add</button></Link>
			</div>
		)
	}
});

module.exports = GetContainerDimensions()(Collection);