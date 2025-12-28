/* Deprecated: defaultDataCreation.js replaced by migration runner.
   Kept as a backward-compatible proxy that invokes migrations/run_all.js
   so existing scripts that call this file will continue to work.
*/

require('./migrations/run_all');

module.exports = {};
