var assert = require('assert'),
    fs = require('fs'),
    lib = require('./lib'),
    watcher = require('../lib/watcher'),
    wrench = require('wrench');

exports['teardown'] = function(done) {
  watcher.unwatchAll();
  done();
};

exports['read'] = function(done) {
  var outdir = lib.testDir('watcher', 'touch');

  wrench.copyDirSyncRecursive('test/artifacts', outdir);

  watcher.watchFile(outdir + '/index.html', [], function(type, fileName, sourceChange) {
    assert.fail('Watch event occurred.');
  });

  fs.open(outdir + '/index.html', 'r+', function(err, fd) {
    var buffer = new Buffer(4);
    fs.read(fd, buffer, 0, buffer.length, 0, function(err, bytesRead, buffer) {
      fs.close(fd, function() {
        setTimeout(done, 500);
      });
    });
  });
};

exports['write'] = function(done) {
  var outdir = lib.testDir('watcher', 'touch'),
      count = 0;

  wrench.copyDirSyncRecursive('test/artifacts', outdir);

  var testFile = outdir + '/index.html';
  watcher.watchFile(testFile, [], function(type, fileName, sourceChange) {
    assert.equal(1, ++count);
    assert.equal('change', type);
    assert.equal(testFile, fileName);
    assert.equal(testFile, sourceChange);
    done();
  });

  fs.open(testFile, 'w', function(err, fd) {
    var buffer = new Buffer([1, 2, 3, 4]);
    fs.write(fd, buffer, 0, buffer.length, 0, function(err, written, buffer) {
      fs.close(fd);
    });
  });
};

exports['unlink'] = function(done) {
  var outdir = lib.testDir('watcher', 'touch'),
      count = 0;

  wrench.copyDirSyncRecursive('test/artifacts', outdir);

  var testFile = outdir + '/index.html';
  watcher.watchFile(testFile, [], function(type, fileName, sourceChange) {
    assert.equal(1, ++count);
    assert.equal('remove', type);
    assert.equal(testFile, fileName);
    assert.equal(testFile, sourceChange);
    done();
  });

  setTimeout(function() {
    fs.unlink(testFile);
  }, 100);
};

exports['rename'] = function(done) {
  var outdir = lib.testDir('watcher', 'touch'),
      count = 0;

  wrench.copyDirSyncRecursive('test/artifacts', outdir);

  var testFile = outdir + '/index.html';
  watcher.watchFile(testFile, [], function(type, fileName, sourceChange) {
    assert.equal(1, ++count);
    assert.equal('remove', type);
    assert.equal(testFile, fileName);
    assert.equal(testFile, sourceChange);
    done();
  });

  setTimeout(function() {
    fs.rename(testFile, outdir + '/foo');
  }, 100);
};

exports['overwrite'] = function(done) {
  var outdir = lib.testDir('watcher', 'touch'),
      count = 0;

  wrench.copyDirSyncRecursive('test/artifacts', outdir);

  var testFile = outdir + '/index.html';
  watcher.watchFile(testFile, [], function(type, fileName, sourceChange) {
    assert.ok(2 >= ++count, 'Unexpected count:' + count);
    assert.equal(count === 1 ? 'rename' : 'change', type);
    assert.equal(testFile, fileName);
    assert.equal(testFile, sourceChange);
    if (count >= 2) {
      done();
    }
  });

  setTimeout(function() {
    fs.rename(outdir + '/static.json', testFile, function() {
      setTimeout(function() {
        fs.open(testFile, 'w', function(err, fd) {
          var buffer = new Buffer([1, 2, 3, 4]);
          fs.write(fd, buffer, 0, buffer.length, 0, function(err, written, buffer) {
            fs.close(fd);
          });
        });
      }, 100);
    });
  }, 100);
};

exports['create-child'] = function(done) {
  var outdir = lib.testDir('watcher', 'touch'),
      count = 0;

  wrench.copyDirSyncRecursive('test/artifacts', outdir);

  var testFile = outdir + '/foo';
  watcher.watchFile(outdir, [], function(type, fileName, sourceChange) {
    assert.equal(1, ++count);
    assert.equal('create', type);
    assert.equal(outdir, fileName);
    assert.equal(outdir, sourceChange);
    done();
  });

  setTimeout(function() {
    fs.writeFile(testFile, 'foo');
  }, 100);
};
