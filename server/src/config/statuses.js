// Student enrollment status constants
const STATUSES = {
  ACTIVE: 'active',
  HOLD: 'hold',
  PASS: 'pass',
  FAIL: 'fail',
  TRANSFERRED: 'transferred' // Added
};

const STATUS_LIST = [
  { value: STATUSES.ACTIVE, label: 'Active', color: 'success' },
  { value: STATUSES.HOLD, label: 'Hold', color: 'warning' },
  { value: STATUSES.PASS, label: 'Pass', color: 'info' },
  { value: STATUSES.FAIL, label: 'Fail', color: 'error' },
  { value: STATUSES.TRANSFERRED, label: 'Transferred', color: 'grey' } // Added
];

module.exports = { STATUSES, STATUS_LIST };