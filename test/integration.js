'use strict';

var assert = require('assert');

var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var chromeDriver = require('selenium-chromedriver');

var port = process.env.NODE_TEST_PORT || 8002;

before(function(done) {
  require('./server')(__dirname + '/..', port, done);
  chrome.setDefaultService(
    new chrome.ServiceBuilder(chromeDriver.path).build()
  );

});

beforeEach(function(){
	this.driver = new webdriver.Builder().
   		withCapabilities(webdriver.Capabilities.chrome()).
   		build();

   	this.timeout(0);
   	return this.driver.get('http://localhost:' + port);
});

afterEach(function(){
	return this.driver.quit();
});

// done not needed, since a promise is seen as async by Mocha
it('ensure todomvc is in the title', function(){
	this.timeout(6000);
	
	return this.driver.getTitle().then(function(titleText){
		assert(/TodoMVC/.test(titleText));
	});
});