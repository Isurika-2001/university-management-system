const ExcelJS = require('exceljs');

// Helper function to format date
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

// Helper function to escape CSV values
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Generate CSV content
const generateCSV = (data, headers) => {
  const csvHeader = headers.map(header => escapeCSV(header.label)).join(',');
  const csvData = data.map(row => 
    headers.map(header => escapeCSV(row[header.key])).join(',')
  );
  return `${csvHeader  }\n${  csvData.join('\n')}`;
};

// Generate Excel file
const generateExcel = async (data, headers, sheetName = 'Export Data') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Add headers
  const headerRow = worksheet.addRow(headers.map(header => header.label));
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add data rows
  data.forEach(row => {
    const dataRow = worksheet.addRow(headers.map(header => row[header.key]));
    
    // Apply conditional formatting for status
    if (row.status) {
      const statusCell = dataRow.getCell(headers.findIndex(h => h.key === 'status') + 1);
      if (row.status === 'completed') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF90EE90' } // Light green
        };
      } else if (row.status === 'incomplete') {
        statusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFB6C1' } // Light red
        };
      }
    }
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = Math.max(
      column.header ? column.header.length : 10,
      ...column.values.slice(1).map(v => String(v).length)
    );
  });

  return await workbook.xlsx.writeBuffer();
};

// Student export headers
const studentExportHeaders = [
  { key: 'registrationNo', label: 'Registration No' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'nic', label: 'NIC' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'address', label: 'Address' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'homeContact', label: 'Home Contact' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
  { key: 'registrationDate', label: 'Registration Date' },
  { key: 'highestAcademicQualification', label: 'Highest Academic Qualification' },
  { key: 'qualificationDescription', label: 'Qualification Description' },
  { key: 'emergencyContactName', label: 'Emergency Contact Name' },
  { key: 'emergencyContactRelationship', label: 'Emergency Contact Relationship' },
  { key: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
  { key: 'emergencyContactEmail', label: 'Emergency Contact Email' },
  { key: 'emergencyContactAddress', label: 'Emergency Contact Address' },
  { key: 'requiredDocumentsCount', label: 'Required Documents Count' },
  { key: 'providedDocumentsCount', label: 'Provided Documents Count' }
];

// Enrollment export headers
const enrollmentExportHeaders = [
  { key: 'enrollmentNo', label: 'Enrollment No' },
  { key: 'registrationNo', label: 'Registration No' },
  { key: 'studentName', label: 'Student Name' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'nic', label: 'NIC' },
  { key: 'studentEmail', label: 'Student Email' },
  { key: 'studentMobile', label: 'Student Mobile' },
  { key: 'studentAddress', label: 'Student Address' },
  { key: 'courseName', label: 'Course Name' },
  { key: 'courseCode', label: 'Course Code' },
  { key: 'batchName', label: 'Batch Name' },
  { key: 'batchCode', label: 'Batch Code' },
  { key: 'enrollmentDate', label: 'Enrollment Date' },
  { key: 'createdAt', label: 'Created Date' },
  { key: 'updatedAt', label: 'Updated Date' },
  { key: 'batchTransfersCount', label: 'Batch Transfers Count' },
  { key: 'lastBatchTransfer', label: 'Last Batch Transfer' },
  { key: 'studentStatus', label: 'Student Status' }
];

module.exports = {
  formatDate,
  escapeCSV,
  generateCSV,
  generateExcel,
  studentExportHeaders,
  enrollmentExportHeaders
};
