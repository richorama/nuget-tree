
var fs = require('fs');
var safeBufferRead = require('./safeBufferRead');
var path = require('path');

module.exports.list = function(dir, settings){

    if (!fs.existsSync(path.join(dir,'project.lock.json'))){
        return null;
    }

    var jsonString = safeBufferRead(fs.readFileSync(path.join(dir,'project.lock.json')));
    var json = JSON.parse(jsonString);

    var packageDictionary = {};

    // put all packages in the dictionary
    Object.keys(json.targets).forEach(target => {
        Object.keys(json.targets[target]).forEach(dep => {

            if (!settings.showSystem && dep.indexOf('System.') === 0) return;

            var depParts = dep.split('/');
            var id = depParts[0];
            var version = depParts[1];
            var dependency = json.targets[target][dep];

            if (!packageDictionary[id]) {
                packageDictionary[id] = {
                    id : id,
                    version: version,
                    targetFramework : target,
                    label : id + " " + (settings.hideVersion ? "" : version.green),
                    nodes:[]
                }
            }
        });
    });

    // build the hierarchy
    Object.keys(json.targets).forEach(target => {
        Object.keys(json.targets[target]).forEach(dep => {

            if (!settings.showSystem && dep.indexOf('System.') === 0) return;

            var depParts = dep.split('/');
            var id = depParts[0];
            var version = depParts[1];
            var dependency = json.targets[target][dep];

            var pkg = packageDictionary[id];
            Object.keys(dependency.dependencies || []).forEach(dependantId => {
                if (packageDictionary[dependantId] && pkg.nodes.filter(x => x.id === dependantId).length === 0){
                    var resolvedDep = packageDictionary[dependantId];
                    pkg.nodes.push(resolvedDep);
                    resolvedDep.used = true;
                }
            });

        });
    });

    return Object.keys(packageDictionary).map(key => packageDictionary[key]);
}
