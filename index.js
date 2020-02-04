const fs = require("fs");
const { exec } = require("child_process");
const filePath = "test";
const jsonxml = require("jsontoxml");
const convert = require("xml-js");
console.log({ convert });
/**
 * @param {string} filePath with out extension
 * @param {function} log loging callback function
 */

module.exports = function JSONAndYAML(filePath = "test", log = console.log) {
  const transform = (filename, cb) => {
    if (filename.indexOf(".json") !== -1) {
      json_to_yaml(filePath, cb);
      json_to_xml(filePath, cb);
    } else {
      yaml_to_json(filePath, cb);
    }
  };
  const watchers = {
    json: fs.watch("./" + filePath + ".json", handlerTransform),
    yaml: fs.watch("./" + filePath + ".yaml", handlerTransform)
  };

  let started = false;
  function handlerTransform(eventType, filename) {
    if (started) return;
    started = true;
    const fileDistExt = filename.indexOf(".json") !== -1 ? "yaml" : "json";
    if (filename) {
      watchers[fileDistExt].close();
      transform(filename, err => {
        watchers[fileDistExt] = fs.watch(
          "./" + filePath + "." + fileDistExt,
          handlerTransform
        );
        started = false;
      });
    }
  }
};

// module.exports = function multiFormatConverter({
//   fileName = "test",
//   formats = ["yaml", "json", "xml"],
//   log = console.log
// }) {
//   const transform = (filename, cb) => {
//     const fileExtension = filename.split(".").slice(-1);
//     formats.filter();
//   };
// };

function yaml_to_json(fileName, cb) {
  const [name, extension] = fileName.split(".");
  exec(
    `"./node_modules/.bin/yaml2json" ./${name}.yaml > ./${name}.json`,
    err => {
      if (err) console.log(err);
      console.log(`${name}.yaml > json`);
      cb();
    }
  );
}

function json_to_yaml(fileName, cb) {
  const [name, extension] = fileName.split(".");
  exec(
    `"./node_modules/.bin/json2yaml" ./${name}.json > ./${name}.yaml`,
    err => {
      if (err) console.log(err);
      console.log(`${name}.json > yaml`);
      cb();
    }
  );
}

function json_to_xml(fileName, cb) {
  const [name, extension] = fileName.split(".");
  const obj = JSON.parse(fs.readFileSync(`./${name}.json`));
  const result = convert.js2xml(obj, { compact: true, spaces: 4 });
  console.log({ obj, result });
  fs.writeFile(`./${name}.xml`, result, console.log);
}
