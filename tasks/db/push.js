/* jshint unused:false */
var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var path = require('path');
var Promise = require('bluebird');
var mkdirp = require('mkdirp');
var db = require('../../lib/db');

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'db:push', task);

  function task() {
    var shipit = getShipit(gruntOrShipit);
    var helper = db(shipit);
    shipit = helper.init();
    var remoteDumpFilePath = path.join(shipit.sharedPath || shipit.currentPath, helper.dumpFile('local'));
    var localDumpFilePath = path.join(shipit.config.workspace, helper.dumpFile('local'));

    var upload = function upload() {
      return shipit.remoteCopy(localDumpFilePath, remoteDumpFilePath);
    };

    return helper.createDirs()
    .then(function() {
      return helper.dump('local', localDumpFilePath);
    })
    .then(upload)
    .then(function() {
      return helper.clean(localDumpFilePath, 'local', shipit.config.db.cleanLocal);
    })
    .then(function() {
      return helper.load(remoteDumpFilePath, 'remote');
    })
    .then(function() {
      return helper.clean(remoteDumpFilePath, 'remote', shipit.config.db.cleanRemote);
    });
  }
};
