var request = require('request');
var fs = require('fs');
var path = require('path');

var config = require('./config/config');

function get_leader_url(callback) {
    // attempts to get the marathon leader url, note if
    // the url is configured to be localhost, that url
    // is returned
    if(config.marathon_url.indexOf('localhost') != -1) {
        callback(config.marathon_url);
    } else {
        request(config.marathon_url + '/leader', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                callback('http://' + info.leader + '/v2');
            } else {
                if(error) {
                    throw(error);
                } else {
                    throw new Error('Request for leader failed.  Status: ' + response.statusCode);
                }
            }
        });
    }
};

function update_app(app, callback) {
    var file = 'marker_' + app + '_marathon.json';
    var json = fs.readFileSync(path.join(__dirname, 'config', file), 'utf8');
    var now = Math.floor(Date.now() / 1000);
    
    // add deployment time to json
    json = json.replace("##TIME##", now.toString());
    
    // retrieve the URL for the Marathon leader
    get_leader_url(function(url) {
        // does the app exist?
        request(url + '/apps/' + app, function(error, response, body) {
            if(!error) {
                var method = response.statusCode == 200 ? "PUT" : "POST";
                
                // need to preserve number of instances
                var info = JSON.parse(body);
                var instances = info['app']['instances'];
                json = json.replace("##INSTANCES##", instances);
                
                request({ 
                        url: url + '/apps' + (method == 'PUT' ? '/' + app : ''),
                        method: method, 
                        json: JSON.parse(json),
                    }, 
                    function(error, response, body) {
                        if(error) {
                            throw(error);
                        } else if(Math.floor(response.statusCode / 100) != 2) {
                            throw new Error('Request to marathon for process failed.  Process: ' + app + ', Status: ' + response.statusCode)
                        } else {
                            callback(body);
                        }
                    }
                );
            } else {
                console.log('Error retrieving app information: ' + error);
                throw(error);
            }
        });
    });
}

var hook_processor = {
    handle: function(app, callback) {
        var res = null;
        if((app == 'fetch') || (app == 'mapper')) {
            update_app(app, function(res) {
                callback(res);
            });
        } else {
            callback(null);
        }
    }
};

module.exports = hook_processor;