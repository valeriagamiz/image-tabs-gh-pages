var
  pkg = require('../package.json'),
  MultiLineError = require('./multi-line-error').MultiLineError,
  fs = require('fs'),
  path = require('path'),
  util = require('util'),
  gitCountCommits = require('git-count-commits')
;

/*
  +++++++++++++++++++++++++++++++++++++++++++++++
  TESTS
  +++++++++++++++++++++++++++++++++++++++++++++++
*/

describe('# git commits', function () {

  it('has enough commits', function (done) {
    var repoPath = path.resolve(process.env.REPO || ('./.git'));

    gitCountCommits(repoPath, 'gh-pages', function(err, originalCommits) {
      gitCountCommits(repoPath, function(e, allCommits) {
        // -1 from allCommits to accommodate the Travis CI merge commit
        var commitsDiff = (allCommits - 1) - originalCommits;

        if (commitsDiff < pkg.autoMarks.commits) {
          throw new MultiLineError('Git Commits', [util.format("Not enough commits to the repository (has %d, expecting %d)", commitsDiff, pkg.autoMarks.commits)]);
        }

        done();
      });
    });
  });

});
