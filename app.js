#!/usr/bin/env node

/*
## todo:

* allow the user to customise the starting directory
* add a switch for a package id filter
* include PackageReference format:
    https://github.com/NuGet/Home/wiki/PackageReference-Specification
    https://docs.microsoft.com/en-us/nuget/consume-packages/package-references-in-project-files

*/

var packagesConfig = require('./packages.config.js');
var projectLockJson = require('./project.lock.json.js');
var nuspec = require('./package.nupkg.js');
var packages = require('./packages.js');
var archy = require('archy');
var colours = require('colors');

var dir = process.cwd();

function hasFlag(name){
    return !!process.argv.filter(x => x === '--' + name).length;
}

var settings = {
    hideVersion : hasFlag('hideVersion'),
    showSystem : hasFlag('showSystem'),
    onlyTopLevel : hasFlag('onlyTopLevel')
}

var packagesFromProjectLockJson = projectLockJson.list(dir, settings);
if (packagesFromProjectLockJson && packagesFromProjectLockJson.length) displayPackages(packagesFromProjectLockJson, 'project.lock.json');

var packagesFromPackageConfig = packagesConfig.list(dir);
if (packagesFromPackageConfig && packagesFromPackageConfig.length) {

    var packageFolder = packages.findPackageFolder(dir);
    if (!packageFolder){
        console.log("Cannot find 'packages' directory. Have you run 'nuget restore'?");
        return;
    }

    var packages = packagesFromPackageConfig;
    if (!settings.showSystem){
        packages = packages.filter(x => x.id.indexOf('System.') !== 0)
    }

    var packageDictionary = {};
    packages.forEach(x => {
        packageDictionary[x.id] = x;
        x.label = x.id + " " + (settings.hideVersion ? "" : x.version.green);
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
    displayPackages(packages, 'packages.config');
}


function displayPackages(packages, source){

    if (settings.onlyTopLevel){
        packages.filter(x => !x.used).forEach(x => {
            console.log(x.label);
        });
    } else {
        var head = {
            label : source,
            nodes : packages.filter(x => !x.used)
        };
        console.log(archy(head));
    }
}
