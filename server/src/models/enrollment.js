const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    registration_no: {
      type: String,
      required: true,
    },
    enrollment_no: {
      type: String,
      required: true,
      unique: true,
    },
    // New fields
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    // Payment Schema for this enrollment
    paymentSchema: {
      courseFee: {
        type: Number,
      },
      isDiscountApplicable: {
        type: Boolean,
      },
      discountType: {
        type: String,
        enum: ['amount', 'percentage']
      },
      discountValue: {
        type: Number,
      },
      downPayment: {
        type: Number,
      },
      numberOfInstallments: {
        type: Number,
      },
      installmentStartDate: {
        type: Date,
      },
      paymentFrequency: {
        type: String,
        enum: ['monthly', 'each_3_months', 'each_6_months']
      }
    },
    // Batch transfer tracking
    batchTransfers: [{
      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      reason: {
        type: String,
        required: true,
      },
    }],
  },
  {
    timestamps: true, 
  }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
