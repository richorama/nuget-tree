var fs = require('fs');
var path = require('path');
var parseXml = require('xml2js').parseString;
var safeBufferRead = require('./safeBufferRead');

module.exports.list = function (dir) {
    const files = fs.readdirSync(dir).filter(file => file.toLowerCase().endsWith(".csproj") && fs.existsSync(file));
    if (!files) return null;

    const file = files[0];

    var xml = safeBufferRead(fs.readFileSync(file));

    var parsedOutput;
    parseXml(xml, function (err, result) {
        parsedOutput = result;
    });

    try {
        return parsedOutput.Project.ItemGroup.filter(a=>a&&a.PackageReference).map(a=>a.PackageReference.map(x => {
            return {
                id: x.$.Include,
                version: x.$.Version,
                targetFramework: null
            }
        })).reduce((ret, cur)=>ret.concat(cur),[]);
    }
    catch(err){
        console.log(`Cannot parse ${file}. Is it in a valid format?`);
        return false;
    }
}
