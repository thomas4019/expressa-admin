var config = require('./config')
var axios = require('axios')

module.exports = React.createClass({
	getInitialState() {
		var collections = [
			{name: 'collection', required: true, default: 'file'},
			{name: 'users', required: true, default: 'postgres'},
			{name: 'role', required: true, default: 'file'},
			{name: 'post', required: false, default: 'postgres'}
		]
		collections.forEach(function(collection) {
			collection.enabled = collection.enabled || collection.required;
		})
		return {collections: collections};
	},
	changeEnabled(event) {
		this.state.collections[event.target.name].enabled = event.target.checked;
		this.setState(this.state)
	},
	changeDbType(event) {
		this.state.collections[event.target.name].default = event.target.value;
		this.setState(this.state)
	},
	change(event) {
		this.state[event.target.name] = event.target.value;
		this.setState(this.state)
		console.log(JSON.stringify(this.state, null, 2))
	},
	doInstall() {
		//console.log(JSON.stringify(this.state, null, 2));

		config.doPost('users', {
			email: this.state.email,
			password: this.state.password
		})

		/*var promises = this.state.collections.forEach(function(collection) {
			if (collection.enabled) {
				return axios.get('/admin/data/collection/' + collection.name + '.json')
					.then(function(response) {
						console.log(response.data)
						config.doPost('collection', response.data)

					});
			}
		});*/

		/*Promise.all(promises)
			.then(function() {
				
			})*/
	},
	render() {
		return (
			<div>Installer
				<h2>Which collections do you want?</h2>
				<ul>
				{this.state.collections.map(function(collection, index) {
					return <li key={collection.name}>
						<input name={index} onChange={this.changeEnabled} type="checkbox" checked={collection.enabled} disabled={collection.required} /> {collection.name}
						<select name={index} onChange={this.changeDbType} value={collection.default} disabled={collection.name=='collection'}>
							<option value="file">file</option>
							<option value="mongodb">mongodb</option>
							<option value="postgres">postgres</option>
						</select>
					</li>;
				}.bind(this))}
				</ul>
				<p>Storing collections and roles in files enables easy version control.</p>

				<h2>Primary Account</h2>
				Email: <input name='email' onChange={this.change} value={this.state.email} type="text" />
				Password: <input name='password' onChange={this.change} value={this.state.password} type="password" />

				<br/>

				<button onClick={this.doInstall}>Install</button>
			</div>
		)
	}
});