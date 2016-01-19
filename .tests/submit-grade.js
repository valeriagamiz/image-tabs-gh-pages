var
  pkg = require('../package.json'),
  gitExecute = require('git-execute'),
  path = require('path'),
  util = require('util'),
  https = require('https'),
  repoPath = path.resolve(process.env.REPO || ('./.git')),
  proxyUrl = 'https://travis-canvas-proxy.appspot.com/grade?%s'
;

if (!process.env.TRAVIS_PULL_REQUEST) return;

var getVars = [
  util.format('gh_repo=%s', encodeURI(process.env.TRAVIS_REPO_SLUG)),
  util.format('gh_pr=%s', process.env.TRAVIS_PULL_REQUEST),
  util.format('canvas_course=%s', pkg.autoMarks.canvasCourse),
  util.format('canvas_assignment=%s', pkg.autoMarks.canvasAssignment)
];

https.get(util.format(proxyUrl, getVars.join('&')), function (res) {
  res.on('data', function (data) { });
}).on('error', function (e) { });
