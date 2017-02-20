/*
## todo:

* read the binding redirects
* report on package versions
* allow the user to customise the starting directory
* add a switch for only seeing the orphans

*/

var packagesConfig = require('./packages.config.js');
var nuspec = require('./package.nupkg.js');
var packages = require('./packages.js');
var archy = require('archy');

var dir = process.cwd();

var packageFolder = packages.findPackageFolder(dir);
if (!packageFolder){
    console.log("Cannot find 'packages' directory. Have you run 'nuget restore'?");
    process.exit(-1);
    return;
}

var packages = packagesConfig.list(dir);
var packageDictionary = {};
packages.forEach(x => {
    packageDictionary[x.id] = x;
    x.label = x.id;
});

packages.forEach(x => {
    x.nodes = x.nodes || [];
    (nuspec.readNuspec(packageFolder, x) || []).forEach(dep => {
        var resolvedDep = packageDictionary[dep.id];
        if (resolvedDep) {
            x.nodes.push(resolvedDep);
            resolvedDep.used = true;
        }
    });
});

var head = {
    label : "packages.config",
    nodes : packages.filter(x => !x.used)
};

console.log(archy(head));
