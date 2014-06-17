var assert = require('assert');
var CommanderCompletion = require('../').Command;

var commanderCompletionUtils = {
  init: function (fn) {
    before(function createCompletion () {
      // Create and bind options to completion
      this.program = new CommanderCompletion();
      fn.call(this, this.program);
    });
    after(function cleanupCompletion () {
      delete this.program;
    });
  },
  complete: function (command) {
    before(function saveResults (done) {
      // TODO: Use same lib as from completion
      // Complete our input and save results
      var that = this;
      this.program.complete({
        line: command,
        cursor: command.length
      }, function saveResult (err, results) {
        that.results = results;
        done(err);
      });
    });
    after(function cleanupResults () {
      delete this.results;
    });
  }
};

describe('A commander with completable commands', function () {
  commanderCompletionUtils.init(function (program) {
    program.name = 'wat';
    program
      .command('hello')
      .completion(function (params, cb) {
        cb(null, ['world']);
      })
      .action(function () {});
  });

  describe('when completing an incomplete command', function () {
    // `wat hel|`
    commanderCompletionUtils.complete('wat hel');

    it('completes the command', function () {
      assert.deepEqual(this.results, ['hello']);
    });
  });

  describe('when completing a command\'s results', function () {
    // `wat hello w|`
    commanderCompletionUtils.complete('wat hello w');

    it('completes the command\'s results', function () {
      assert.deepEqual(this.results, ['world']);
    });
  });
});

describe('A commander with options', function () {
  commanderCompletionUtils.init(function (program) {
    this.program.name = 'wat';
    this.program.option('-n, --dry-run', 'Output commands but do nothing');
    this.program
      .command('hello')
      .completion(function (params, cb) {
        cb(null, ['world']);
      })
      .action(function () {});
  });

  describe('completing a command with a short option', function () {
    // `wat -n hel|`
    commanderCompletionUtils.complete('wat -n hel');

    it('completes the command', function () {
      assert.deepEqual(this.results, ['hello']);
    });
  });

  describe('completing a command with a long option', function () {
    // `wat --dry-run hel|`
    commanderCompletionUtils.complete('wat --dry-run hel');

    it('completes the command', function () {
      assert.deepEqual(this.results, ['hello']);
    });
  });

  describe('completing a command without options', function () {
    it('completes the command', function () {
    });
  });
});

describe.skip('A commander with an option that has a required value', function () {
  // hello --dir <cwd>
});

describe.skip('A commander with an option that has a optional value', function () {
  // hello --dir [cwd]
});
