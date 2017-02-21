/*
## todo:

* report on package versions
* allow the user to customise the starting directory
* add a switch for only seeing the orphans
* add a switch to turn on package names starting with System.
* add a switch for a package id filter

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

var packages = packagesConfig.list(dir).filter(x => x.id.indexOf('System.') !== 0);
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
            if (x.nodes.filter(x => x.id === dep.id).length) return; // already added

            x.nodes.push(resolvedDep);
            resolvedDep.used = true;
        } else {
            //dep.id is missing from package.config, at the moment we're not observing targets
        }
    });
});

var head = {
    label : "packages.config",
    nodes : packages.filter(x => !x.used)
};

console.log(archy(head));
