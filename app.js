/*
## todo:

* allow the user to customise the starting directory
* add a switch for a package id filter
* include PackageReference format https://github.com/NuGet/Home/wiki/PackageReference-Specification

*/

var packagesConfig = require('./packages.config.js');
var nuspec = require('./package.nupkg.js');
var packages = require('./packages.js');
var archy = require('archy');
var colours = require('colors');

var dir = process.cwd();

function hasFlag(name){
    return !!process.argv.filter(x => x === '--' + name).length;
}

var hideVersion = hasFlag('hideVersion');
var showSystem = hasFlag('showSystem');
var onlyTopLevel = hasFlag('onlyTopLevel');

var packageFolder = packages.findPackageFolder(dir);
if (!packageFolder){
    console.log("Cannot find 'packages' directory. Have you run 'nuget restore'?");
    process.exit(-1);
    return;
}

var packages = packagesConfig.list(dir);

if (!showSystem){
    packages = packages.filter(x => x.id.indexOf('System.') !== 0)
}

var packageDictionary = {};
packages.forEach(x => {
    packageDictionary[x.id] = x;
    x.label = x.id + " " + (hideVersion ? "" : x.version.green);
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


if (onlyTopLevel){
    packages.filter(x => !x.used).forEach(x => {
        console.log(x.label);
    });
} else {
    var head = {
        label : "packages.config",
        nodes : packages.filter(x => !x.used)
    };
    console.log(archy(head));
}
