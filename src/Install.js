var config = require('./config')
var axios = require('axios')

module.exports = React.createClass({
	getInitialState() {
		var collections = [
			{name: 'settings', required: true, storage: 'file'},
			{name: 'collection', required: true, storage: 'file'},
			{name: 'role', required: true, storage: 'file'},
			{name: 'users', required: true, storage: 'postgres'},
			{name: 'post', required: false, storage: 'postgres'}
		]
		collections.forEach(function(collection) {
			collection.enabled = collection.enabled || collection.required;
		})
		return {
			collections: collections,
			db_type_used: ['file', 'postgres'],
			settings: {
				_id: 'production',
				postgresql_uri: "postgres://<username>:<password>@localhost/<database name>",
				mongodb_uri: "mongodb://localhost:27017/test",
				jwt_secret: "123123"
			},
			email: '',
			password: '',
		};
	},
	updateDbTypesUsed() {
		this.state.db_type_used = this.state.collections.map(function(collection) {
			return collection.enabled ? collection.storage : undefined;
		});
	},
	changeEnabled(event) {
		this.state.collections[event.target.name].enabled = event.target.checked;
		this.updateDbTypesUsed()
		this.setState(this.state)
	},
	changeDbType(event) {
		this.state.collections[event.target.name].storage = event.target.value;
		this.updateDbTypesUsed()
		this.setState(this.state)
	},
	change(event) {
		this.state[event.target.name] = event.target.value;
		this.setState(this.state)
	},
	changeSetting(event) {
		this.state.settings[event.target.name] = event.target.value;
		this.setState(this.state)
	},
	doInstall() {
		var self = this

		config.setToken(undefined)

		var permissions = {
			"collection: view relevant": true,
			"schemas: view": true,
			"view errors": false
		}

		var roles = ['Admin', 'Anonymous', 'Authenticated']

		function postCollections() {
			return self.state.collections.map(function(collection, i) {
				if (collection.enabled) {
					return axios.get('/admin/data/collection/' + collection.name + '.json')
						.then(function(response) {
							// Adds a delay between each post
							// TODO: Fix addCollectionPermissions so this is unncessary
							return new Promise(function(resolve, reject) {
								setTimeout(function() {
									resolve(response)
								}, 200 * i)
							})
						})
						.then(function(response) {
							response.data.storage = collection.storage
							return config.doPost('collection', response.data)
						});
				}
			})
		}

		var collectionPromises = postCollections()

		Promise.all(collectionPromises)
			.then(function() {
				return config.doPost('settings', self.state.settings)
			})
			.then(function() {
				var userPromise = config.doPost('users', {
					email: self.state.email,
					password: self.state.password,
					roles: ['Admin']
				})
				return userPromise
			})
			.then(function() {
				return Promise.all(roles.map(function(roleName) {
					var role = {
						_id: roleName,
						permissions: JSON.parse(JSON.stringify(permissions))
					}
					if (roleName == 'Admin') {
						role.permissions['view errors'] = true
						role.permissions['users: view hashed passwords'] = true
						role.permissions['users: modify roles'] = true
					}
					if (roleName == 'Anonymous') {
						role.permissions['users: create'] = true
					}
					if (roleName == 'Anonymous') {
						role.permissions['users: view own'] = true
						role.permissions['users: edit own'] = true
						role.permissions['users: delete own'] = true
					}
					return config.doPost('role', role)
				}))
			})
			.then(function() {
				return Promise.all(postCollections())
			})
			.then(function() {
				self.state.settings.enforce_permissions = true
				self.state.settings.installed = true
				return config.doPost('settings', self.state.settings)
			})
			.then(function() {
				return config.doPost('user/login', {
					email: self.state.email,
					password: self.state.password
				})
			})
			.then(function(result) {
				window.sessionStorage.token = result.data.token;
				config.setToken(result.data.token)
				console.log('install succeeded')
				config.changePage('/');
			}, function(err) {
				console.error('error during install')
				console.error(err.stack)
			})
	},
	render() {
		return (
			<div>
				<h1>Installing Expressa</h1>
				<h2>Which collections do you want?</h2>
				<ul>
				{this.state.collections.map(function(collection, index) {
					return <li key={collection.name}>
						<input name={index} onChange={this.changeEnabled} type="checkbox" checked={collection.enabled} disabled={collection.required} /> {collection.name}
						{collection.enabled ? <select name={index} onChange={this.changeDbType} value={collection.storage} disabled={collection.name=='collection'||collection.name=='settings'}>
							<option value="file">file</option>
							<option value="mongodb">mongodb</option>
							<option value="postgres">postgres</option>
						</select> : undefined}
					</li>;
				}.bind(this))}
				</ul>
				<p>Storing collections and roles in files enables easy version control.</p>

				<h2>Administrator Account</h2>
				Email: <input name='email' onChange={this.change} value={this.state.email} type="text" className="form-control" />
				Password: <input name='password' onChange={this.change} value={this.state.password} type="password" className="form-control" />

				<h2>Settings</h2>
				{this.state.db_type_used.indexOf('mongodb') != -1 ? 
					<div>MongoDB URI: <input name='mongodb_uri' onChange={this.changeSetting} value={this.state.settings.mongodb_uri} type="text" className="form-control" /></div>
					: undefined}
				{this.state.db_type_used.indexOf('postgres') != -1 ? 
					<div>PostgreSQL URI: <input name='postgresql_uri' onChange={this.changeSetting} value={this.state.settings.postgresql_uri} type="text" className="form-control" /></div>
					: undefined}
				

				<br/>

				<button onClick={this.doInstall}>Install</button>
			</div>
		)
	}
});