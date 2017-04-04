var config = require('./config')

module.exports = React.createClass({
	getInitialState() {
		return {};
	},
	doLogin() {
		var email = document.querySelector('input[name="email"]').value;
		var password = document.querySelector('input[name="password"]').value;
		config.doPost('user/login', {email, password})
			.then(function(response) {
				config.setToken(response.data.token)
				window.sessionStorage.token = response.data.token;
				config.changePage(window.destAfterLogin || '/');
			}.bind(this), function(response) {
				this.state.errorText = response.data.error || response.data;
				this.setState(this.state);
			}.bind(this))
		return false;
	},
	keypress(event) {
		if (event.keyCode == 13) {
			this.doLogin();
		}
	},
	render() {
		return (
			<div className="container">
				<div className="row">
					<div className="col-md-4 col-md-offset-4">
						<div className="panel panel-default">
						  	<div className="panel-heading">
								<h3 className="panel-title">Login</h3>
						 	</div>
						  	<div className="panel-body">
								<fieldset>
								  	<div className="form-group">
										<input className="form-control" placeholder="yourmail@example.com" name="email" type="text" />
									</div>
									<div className="form-group">
										<input className="form-control" onKeyDown={this.keypress} placeholder="Password" name="password" type="password" />
									</div>
									<div className="error-message">
										{this.state.errorText}
									</div>
									<input onClick={this.doLogin} className="btn btn-lg btn-success btn-block" type="submit" value="Login" />
								</fieldset>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
});