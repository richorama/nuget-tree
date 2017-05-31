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

function hasFlag(name) {
    return !!process.argv.filter(x => x === '--' + name).length;
}

function hasValue(name){
    var index = process.argv.indexOf('--' + name);
    if (index === -1) return null;
    return process.argv[index + 1];
}

if (hasFlag('?') || hasFlag('h') || hasFlag('help')){
  var fs = require('fs');
  var path = require('path');
  var version = JSON.parse(fs.readFileSync(path.join(__dirname, './package.json')).toString()).version;
  console.log(`nuget-tree version ${version}
Execute this command (nuget-tree) in the directory containing a .NET project.
packages.config or project.lock.json will be parsed to draw a nuget dependency tree.

Optional command line switches:
  --hideVersion         : hides the package versions
  --showSystem          : shows the System.* packages
  --onlyTopLevel        : lists only the packages at the top level of the tree (i.e. those that are not depended upon by any other package)
  --flat                : lists the dependencies without the hierarchy
  --why Newtonsoft.Json : shows only dependency trees that reference the given package (Newtonsoft.Json in this case)
    `);
  return;
}

var settings = {
    hideVersion: hasFlag('hideVersion'),
    showSystem: hasFlag('showSystem'),
    onlyTopLevel: hasFlag('onlyTopLevel'),
    flat: hasFlag('flat'),
    why:hasValue('why')
}

if (settings.why){
  console.log("Showing dependency trees containing " + settings.why);
}

var packagesFromProjectLockJson = projectLockJson.list(dir, settings);
if (packagesFromProjectLockJson && packagesFromProjectLockJson.length) displayPackages(packagesFromProjectLockJson, 'project.lock.json');

var packagesFromPackageConfig = packagesConfig.list(dir);
if (packagesFromPackageConfig && packagesFromPackageConfig.length) {

    var packageFolder = packages.findPackageFolder(dir);
    if (!packageFolder) {
        console.log("Cannot find 'packages' directory. Have you run 'nuget restore'?");
        return;
    }

    var packages = packagesFromPackageConfig;
    if (!settings.showSystem) {
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

function findWhy(node){
  node.match = false;

  if (node.id.toLowerCase() === settings.why.toLowerCase()) {
    node.match = true;
  }

  node.nodes.forEach(child => {
    node.match = findWhy(child) || node.match
  });
  return node.match;
}

function filterOnlyMatches(node){
    node.nodes = node.nodes.filter(x => x.match);
    node.nodes.forEach(filterOnlyMatches)
}

function displayPackages(packages, source) {

    if (settings.why){
      var head = {
          id :"",
          label: source,
          match: true,
          nodes: packages.filter(x => !x.used)
      };
      findWhy(head);
      filterOnlyMatches(head);
      console.log(archy(head));
    } else if (settings.onlyTopLevel) {
        packages.filter(x => !x.used).forEach(x => {
            console.log(x.label);
        });
    } else if (settings.flat) {
        packages.forEach(x => {
            console.log(x.label);
        });
    } else {
        var head = {
            label: source,
            nodes: packages.filter(x => !x.used)
        };
        console.log(archy(head));
    }
}
