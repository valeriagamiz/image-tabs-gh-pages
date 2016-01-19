var
  MultiLineError = require('./multi-line-error').MultiLineError,
  fs = require('fs'),
  util = require('util'),
  validator = require('w3cjs'),
  linter = require('htmlcs'),
  beautifier = require('js-beautify').html,
  differ = require('diff')
;

var shouldIncludeError = function (message, line) {
  // The standard info: using HTML parser
  if (!line && message.match(/content-type.*text\/html/i)) return false;

  // The schema message
  if (!line && message.match(/schema.*html/i)) return false;

  // Google fonts validation error with vertical pipes
  if (message.match(/bad value.*fonts.*google.*\|/i)) return false;

  // Elements that "don't need" specific roles
  if (message.match(/element.*does not need.*role/i)) return false;

  return true;
};

/*
  +++++++++++++++++++++++++++++++++++++++++++++++
  TESTS
  +++++++++++++++++++++++++++++++++++++++++++++++
*/

describe('# index.html', function () {
  var exists;

  try {
    exists = fs.statSync('index.html').isFile();
  } catch (e) {
    exists = false;
  }

  /* FILE EXISTS ++++++++++++++++++++++++++++++++ */

  it('exists', function (done) {
    if (!exists) {
      throw new MultiLineError('File missing', ['The file `index.html` is missing or misspelled.']);
    }

    done();
  });

  if (!exists) return;

  /* VALIDATION ++++++++++++++++++++++++++++++++ */

  it('is valid HTML', function(done) {
    validator.validate({
      file: 'index.html',

      callback: function (res) {
        var prettyErrors = [];

        if (res.messages.length > 2) {

          res.messages.forEach(function (item) {
            if (shouldIncludeError(item.message, item.line)) {
              prettyErrors.push(util.format('Line %d: %s', item.lastLine, item.message));
            }
          });

          if (prettyErrors.length > 0) {
            throw new MultiLineError('Validation', prettyErrors);
          }
        };

        done();
      }
    });
  });

  /* BEST PRACTICES ++++++++++++++++++++++++++++++++ */

  it('follows best practices', function (done) {
    var
      errors = linter.hintFile('index.html'),
      prettyErrors = []
    ;

    if (errors.length > 0) {
      errors.forEach(function (item) {
        prettyErrors.push(util.format('Line %d: %s', item.line, item.message));
      });

      throw new MultiLineError('Best practices', prettyErrors);
    }

    done();
  });

  /* INDENTATION ++++++++++++++++++++++++++++++++ */

  it('is properly indented', function (done) {
    var
      diffLines, lineCount = 0, skipNext = false,
      prettyErrors = [],
      fileContents = fs.readFileSync('index.html', 'utf8');
      beautified = beautifier(fileContents, {
        indent_size: 2,
        preserve_newlines: true,
        max_preserve_newlines: 10,
        wrap_line_length: 0,
        end_with_newline: true,
        extra_liners: []
      })
    ;

    if (fileContents != beautified) {
      diffLines = differ.diffLines(fileContents, beautified);

      diffLines.forEach(function (item) {
        if (!skipNext) {
          lineCount += item.count;

          if (item.added || item.removed) {
            skipNext = true;
            prettyErrors.push('Line ' + lineCount);
          }
        } else {
          skipNext = false;
        }
      });

      throw new MultiLineError('Indentation', prettyErrors);
    }

    done();
  });

});
