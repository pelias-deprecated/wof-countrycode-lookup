var tape = require('tape');
var Document = require('pelias-model').Document;
var eventStream = require('event-stream');
var countryCodeLookup = require('../index');

function test_stream(input, testedStream, callback) {
    var input_stream = eventStream.readArray(input);
    var destination_stream = eventStream.writeArray(callback);

    input_stream.pipe(testedStream).pipe(destination_stream);
}

tape('iso3 country code lookups', function(test) {
  test.test('unsupported country should not set alpha3', function(t) {
    var inputDoc = new Document( 'whosonfirst', 'placetype', '1')
                    .setAlpha3( '!@#' )
                    .setAdmin( 'admin0', 'Unsupported Country');

    var expectedDoc = new Document( 'whosonfirst', 'placetype', '1')
                    .setAlpha3( '!@#' )
                    .setAdmin( 'admin0', 'Unsupported Country');

    var stream = countryCodeLookup.createStream();

    test_stream([inputDoc], stream, function(err, actual) {
      t.deepEqual(actual, [expectedDoc], 'should not have changed alpha3');
      t.end();
    });

  });

  test.test('supported country should override alpha3', function(t) {
    var inputDoc = new Document( 'whosonfirst', 'placetype', '1')
                    .setAlpha3('XYZ')
                    .setAdmin( 'admin0', 'France' );

    var expectedDoc = new Document( 'whosonfirst', 'placetype', '1')
                    .setAlpha3('FRA')
                    .setAdmin( 'admin0', 'France' );

    var stream = countryCodeLookup.createStream();

    test_stream([inputDoc], stream, function(err, actual) {
      t.deepEqual(actual, [expectedDoc], 'should have overridden alpha3');
      t.end();
    });

  });

});
