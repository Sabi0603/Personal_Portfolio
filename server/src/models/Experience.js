import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title/role is required'],
      trim: true,
      maxLength: 120,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxLength: 120,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
      default: 'Full-time',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    isCurrent: {
      type: Boolean,
      default: false,
    },
    description: [
      {
        type: String,
        trim: true,
      },
    ],
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    companyUrl: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

experienceSchema.index({ order: 1, startDate: -1 });

const Experience = mongoose.models.Experience || mongoose.model('Experience', experienceSchema);

export default Experience;
