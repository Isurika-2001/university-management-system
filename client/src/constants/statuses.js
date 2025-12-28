export const STATUSES = {
  ACTIVE: 'active',
  HOLD: 'hold',
  PASS: 'pass',
  FAIL: 'fail',
  TRANSFERRED: 'transferred'
};

export const STATUS_LIST = [
  { value: STATUSES.ACTIVE, label: 'Active', color: 'success' },
  { value: STATUSES.HOLD, label: 'Hold', color: 'warning' },
  { value: STATUSES.PASS, label: 'Pass', color: 'info' },
  { value: STATUSES.FAIL, label: 'Fail', color: 'error' },
  { value: STATUSES.TRANSFERRED, label: 'Transferred', color: 'default' }
];

export default { STATUSES, STATUS_LIST };
