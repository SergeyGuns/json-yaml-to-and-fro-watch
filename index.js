const fs = require("fs");
const { exec } = require("child_process");
const filePath = "test";

/**
 * @param {string} filePath with out extension
 * @param {function} log loging callback function
 */

module.exports = function JSONAndYAML(filePath = "test", log = console.log) {
  const transform = (filename, cb) => {
    if (filename.indexOf(".json") !== -1) {
      exec(
        `"./node_modules/.bin/json2yaml" ./${filePath}.json > ./${filePath}.yaml`,
        err => {
          if (err) console.log(err);
          console.log(`${filePath}.json > yaml`);
          cb();
        }
      );
    } else {
      exec(
        `"./node_modules/.bin/yaml2json" ./${filePath}.yaml > ./${filePath}.json`,
        err => {
          if (err) console.log(err);
          console.log(`${filePath}.yaml > json`);
          cb();
        }
      );
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
