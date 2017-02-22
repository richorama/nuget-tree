/*
{
  "dependencies": {
    "Microsoft.Extensions.DependencyInjection": "1.0.0",
    "Microsoft.Owin.Hosting": "3.0.1",
    "Nowin": "0.25.0"
  }
  ...

*/
var fs = require('fs');
var safeBufferRead = require('./safeBufferRead');
var path = require('path');

module.exports.list = function(dir){

    if (!fs.existsSync(path.join(dir,'project.json'))){
        return [];
    }

    var jsonString = safeBufferRead(fs.readFileSync(path.join(dir,'project.json'))).replace("´╗┐","");
    var json = JSON.parse(jsonString);

    var deps = json.dependencies || {};
    return Object.keys(deps).map(id => {
        return {
            id : id,
            version: deps[id]
        }
    });
}
