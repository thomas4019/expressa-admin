var axios = require('axios')
var Link = require('react-router').Link

var checkboxFormatter = function(cell, row, role) {
	console.log(cell);
	var header = (row.name.substring(0, 6) == 'Header');
	if (header)
		return (<div></div>);
	else
		return <input data-role={role} name={row.name} type="checkbox" defaultChecked={cell} disabled={role=='Admin'} />;
}

var permissionFormatter = function(cell, row) {
	var header = (row.name.substring(0, 6) == 'Header');
	if (header)
		return <b>{row.name.substring(7)}</b>
	else
		return row.name
}

var Permissions = React.createClass({
	getInitialState: function() {
		return {roles: {Admin: {permissions: {}}}};
	},
	componentDidMount: function() {
		this.request = axios.get('http://localhost:3000/api/role/index')
		this.request.then(function(result) {
			console.log(result)
			this.setState({
				roles: result.data
			});
		}.bind(this));
	},
	save: function() {
		var roles = this.state.roles;
		Array.prototype.slice.call(document.getElementsByTagName('input')).forEach(function(input) {
			roles[input.dataset.role].permissions[input.name] = input.checked;
		});
		Object.keys(roles).forEach(function(roleName) {
			axios.put('http://localhost:3000/api/role/' + roleName, roles[roleName])
				.then(function(result) {
					console.log(result);
				})
		}.bind(this));
		console.log(roles);
	},
	render: function() {
		var self = this;
		var permissions = Object.keys(this.state.roles.Admin.permissions); //['Header-System', 'Create account', 'Manage Permissions', 'View Site Reports']
		var roles = ['Permission'].concat(Object.keys(this.state.roles)); //['Permission', 'Anonymous', 'Authenticated', 'Admin']
		var data = [];
		data = permissions.map(function(permission) {
			var o = {
				name: permission
			};
			Object.keys(self.state.roles).forEach(function(roleName) {
				if (self.state.roles[roleName])
					//o[roleName] = self.state.roles[roleName].permissions.hasOwnProperty(permission);
				o[roleName] = self.state.roles[roleName].permissions[permission];
			})
			console.log(o);
			return o;
		});
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
					<li><Link to="/permissions">User Permissions</Link></li>
				</ul>
				<h2>User Permissions</h2>
					<BootstrapTable className="permissions" data={data} striped={true} hover={true} condensed={true} bordered={false} exportCSV={false}>
				
					{roles.map(function(name, i) {
						
						if (i == 0) {
							return <TableHeaderColumn dataFormat={permissionFormatter} formatExtraData={name} width='200px' key={"name"} dataField="name" isKey={true}>Name</TableHeaderColumn>
						}
						else {
							return <TableHeaderColumn dataFormat={checkboxFormatter} formatExtraData={name} width='75px' key={name} dataAlign="center" dataField={name} isKey={i==0}>{name}</TableHeaderColumn>
						}
					})}

				</BootstrapTable>
				<button className="btn btn-primary" onClick={this.save}>Save</button>
			</div>
		);
	}
});

module.exports = Permissions;