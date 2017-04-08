var fs = require('fs');
var path = require('path');
var parseXml = require('xml2js').parseString;
var safeBufferRead = require('./safeBufferRead');

module.exports.list = function (dir) {

    if (!fs.existsSync(path.join(dir, 'packages.config'))) {
        return null;
    }

    var xml = safeBufferRead(fs.readFileSync(path.join(dir, 'packages.config')));

    var parsedOutput;
    parseXml(xml, function (err, result) {
        parsedOutput = result;
    });

    try {
        return parsedOutput.packages.package.map(x => {
            return {
                id: x.$.id,
                version: x.$.version,
                targetFramework: x.$.targetFramework
            }
        });
    }
    catch(err){
        console.log("Cannot parse 'packages.config'. Is it in a valid format?");
        return false;
    }
}
