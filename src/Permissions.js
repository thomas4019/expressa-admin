var config = require('./config')
var Link = require('react-router').Link
var toastr = require('toastr')

var checkboxFormatter = function(cell, row, role) {
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
		return {roles: [{'_id': 'Admin', permissions: {}}]};
	},
	componentDidMount: function() {
		this.request = config.doGet('role')
		this.request.then(function(result) {
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
		var promises = roles.map(function(role) {
			return config.doPut('role/' + role._id, role)
		}.bind(this));
		Promise.all(promises)
			.then(function(result) {
				toastr.success('Saved successfully')
			}, function(err) {
				toastr.error(err, 'Failed to save')
			})

	},
	render: function() {
		var self = this;
		var Admin = null;
		this.state.roles.forEach(function(role) {
			if (role._id == 'Admin')
				Admin = role
		})
		var permissions = Object.keys(Admin.permissions); //['Header-System', 'Create account', 'Manage Permissions', 'View Site Reports']
		var ordered = ['Admin', 'Authenticated', 'Anonymous'];
		var roles = [{_id:'abc', name:'Permission'}].concat(this.state.roles.sort(function(a, b) {
			var ai = ordered.indexOf(a._id);
			var bi = ordered.indexOf(b._id);
			if (ai != bi) {
				return bi - ai;
			} else {
				return a._id.localeCompare(b._id);
			}
		}));
		var data = [];
		data = permissions.map(function(permission) {
			var o = {
				name: permission
			};
			self.state.roles.forEach(function(role) {
				if (role) {
					//o[roleName] = self.state.roles[roleName].permissions.hasOwnProperty(permission);
					o[role._id] = role.permissions[permission];
				}
			})
			return o;
		}).sort(function(a, b) {
			if (a.name < b.name) {
				return -1
			} else if (a.name > b.name) {
				return 1
			} else {
				return 0
			}
		})
		return (
			<div>
				<ul className="breadcrumbs">
					<li><Link to="/">Home</Link></li>
					<li><Link to="/permissions">User Permissions</Link></li>
				</ul>
				<h2>User Permissions</h2>
					<BootstrapTable className="permissions" data={data} striped={true} hover={true} condensed={true} bordered={false} exportCSV={false}>
				
					{roles.map(function(row, i) {
						var id = row._id;
						if (i == 0) {
							return <TableHeaderColumn dataFormat={permissionFormatter} formatExtraData={i-1} width='200px' key="name" dataField="name" isKey={true}>Permission Name</TableHeaderColumn>
						}
						else {
							return <TableHeaderColumn dataFormat={checkboxFormatter} formatExtraData={i-1} width='75px' key={id} dataAlign="center" dataField={id} isKey={i==0}>{id}</TableHeaderColumn>
						}
					})}

				</BootstrapTable>
				<button className="btn btn-primary" onClick={this.save}>Save</button>
			</div>
		);
	}
});

module.exports = Permissions;