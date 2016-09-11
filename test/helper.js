var subtle = new (require("../build/node-webcrypto").Subtle);
var assert = require("assert");
function checkPromise(promise, done, error) {
    var _error = true;
    promise.then(function (res) {
        assert.equal(res, null);
        _error = false;
    })
        .catch(function (err) {
            assert.equal(!!err, error, err.message);
        })
        .then(function () {
            assert.equal(_error, error, "Must be error");
        })
        .then(done, done);
}

function sign(alg, key, done, error) {
    checkPromise(subtle.sign(alg, key, new Uint8Array([1, 2, 3])), done, error);
}
module.exports.sign = sign;

function verify(alg, key, done, error) {
    checkPromise(subtle.verify(alg, key, new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3])), done, error);
}
module.exports.verify = verify;

function deriveKey(alg, key, derAlg, usages, done, error) {
    checkPromise(subtle.deriveKey(alg, key, derAlg, true, usages), done, error);
}
module.exports.deriveKey = deriveKey;

function generate(alg, keyUsages, done, error) {
    checkPromise(subtle.generateKey(alg, false, keyUsages), done, error);
}
module.exports.generate = generate;

function encrypt(func, alg, key, done, error) {
    checkPromise(subtle[func](alg, key, new Uint8Array([1, 2, 3])), done, error);
}
module.exports.encrypt = encrypt;

function exportKey(format, key, done, error) {
    checkPromise(subtle.exportKey(format, key), done, error);
}
module.exports.exportKey = exportKey;

function importKey(format, keyData, alg, keyUsages, done, error) {
    checkPromise(subtle.importKey(format, keyData, alg, true, keyUsages), done, error);
}
module.exports.importKey = importKey;