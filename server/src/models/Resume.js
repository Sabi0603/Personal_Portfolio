import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: 'Sabari M - Resume',
      maxLength: 150,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Resume document URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
      default: '',
    },
    format: {
      type: String,
      default: 'pdf',
      trim: true,
    },
    bytes: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ isActive: 1, createdAt: -1 });

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

export default Resume;

