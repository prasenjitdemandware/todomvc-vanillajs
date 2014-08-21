'use strict';

var assert = require('assert');

var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var chromeDriver = require('selenium-chromedriver');

var makeSelector = webdriver.By.css;
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

it('add new items to the list', function(){
	var driver = this.driver;
	var typeKeys = 'a task added';
	
	return driver.findElement(makeSelector('#new-todo'))
		.then(function(textInput){
			return textInput.sendKeys(typeKeys, webdriver.Key.ENTER);
		})
		.then(function(){
			return driver.findElements(makeSelector('#todo-list li'));
		})
		.then(function(todoItems){
			assert.equal(todoItems.length, 1);
			return todoItems[0].getText();
		})
		.then(function(inText){
			assert.equal(inText, typeKeys);
		});
});

it('verify the count of items is showing correctly', function(){
	var driver = this.driver;
	var typeKeys = 'a new task added';

	return driver.findElement(makeSelector('#new-todo'))
		.then(function(textInput){
			return [textInput.sendKeys(typeKeys, webdriver.Key.ENTER), textInput.sendKeys(typeKeys + ' xyz', webdriver.Key.ENTER)];	// adding 2 items
		})
		.then(function(){
			return driver.findElement(makeSelector('#todo-count strong')).getText();		// text.match(/\b(\d+)\b/), do not use 'strong'
		})
		.then(function(count){
			assert.equal(count, 2);		
		});
});

function createItem(){
	var driver = this.driver;
	var typeKeys = "some task";

	return driver.findElement(makeSelector('#new-todo'))
		.then(function(textInput){
			return textInput.sendKeys(typeKeys, webdriver.Key.ENTER);
		})
}

describe('item modification', function(){

	beforeEach(function(){
		var driver = this.driver;

		return createItem.call(this).then(function(){
			return driver.findElement(makeSelector('#todo-list li'));
		})
		.then(function(newItem){
			this.newItem = newItem;
		}.bind(this));
	});

	it('allows users to complete items', function(){
		var driver = this.driver;

		return driver.findElement(makeSelector('.toggle'))
			.then(function(element){
				return element.click();
			})
			.then(function(){
				return driver.findElements(makeSelector('#todo-list .completed'))
			})
			.then(function(completedItems){
				assert.equal(completedItems.length, 1);
			})
	});

	it('allows users to update item text', function(){
		var newItem = this.newItem; 

		this.driver.actions()
			.doubleClick(newItem)
			.sendKeys(' and other things', webdriver.Key.ENTER)
			.perform()
			.then(function(){
				return newItem.getText();
			})
			.then(function(text){
				assert.equal(text, 'some task and other things');
			});
	});
})
