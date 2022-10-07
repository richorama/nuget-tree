var path = require('path');
var fs = require('fs');
var zip = require('zip');
var parseXml = require('xml2js').parseString;
var safeBufferRead = require('./safeBufferRead');

module.exports.readNuspec = function (packagesFolder, package, settings) {
    if (!packagesFolder) throw new Error("no packagesFolder");

    var nuspecFilePath = path.join(packagesFolder, package.id + "." + package.version, package.id + ".nuspec");
    var nuspecXml;
    if (fs.existsSync(nuspecFilePath)) {
        nuspecXml = safeBufferRead(fs.readFileSync(nuspecFilePath));
    }
    else {
        var packageFilePath = path.join(packagesFolder, package.id + "." + package.version, package.id + "." + package.version + ".nupkg");

        if (!fs.existsSync(packageFilePath)) {
            packageFilePath = path.join(packagesFolder, package.id.toLowerCase() + "." + package.version, package.id.toLowerCase() + "." + package.version + ".nupkg");
    
            if (!fs.existsSync(packageFilePath) && package.version) {
                packageFilePath = path.join(packagesFolder, package.id, package.version, package.id + "." + package.version + ".nupkg");
    
                if (!fs.existsSync(packageFilePath) && package.version) {
                    packageFilePath = path.join(packagesFolder, package.id.toLowerCase(), package.version, package.id.toLowerCase() + "." + package.version + ".nupkg");
    
                    if (!fs.existsSync(packageFilePath)) {
                        if (!settings.observingTargets) {
                            console.log("WARN: Cannot find nupkg file for " + package.id);
                        }
                        return [];
                    }
                }
            }
        }

        nuspecXml = openNuspecFile(packageFilePath);
    }

    if (!nuspecXml) {
        console.log("WARN: Cannot find nuspec file for " + package.id);
        console.log("Attempted to open this file: " + packageFilePath);
        return [];
    }

    return readAllDeps(nuspecXml);
}

function readAllDeps(nuspecXml) {
    var dependencies = [];
    parseXml(nuspecXml, (err, data) => {
        if (err) console.error(err);
        if (!data) return;
        (data.package.metadata || []).forEach(metadata => {
            (metadata.dependencies || []).forEach(dep => {

                // if the nuget package targets multiple version, there are groups
                (dep.group || []).forEach(dep => {
                    (dep.dependency || []).forEach(dep => {
                        dependencies.push(dep.$);
                    })
                });

                // otherwise there are no groups
                (dep.dependency || []).forEach(dep => {
                    dependencies.push(dep.$);
                })

            });
        });
    });
    return dependencies;
}


function openNuspecFile(packageFilePath) {

    var pkgData = fs.readFileSync(packageFilePath);
    var reader = zip.Reader(pkgData);
    var nuspec;
    reader.forEach(function (entry, next) {
        if (path.extname(entry._header.file_name) === ".nuspec") {
            nuspec = safeBufferRead(entry.getData())
        }
    });
    return nuspec;
}
