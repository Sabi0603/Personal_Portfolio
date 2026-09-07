import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    institution: {
      type: String,
      required: [true, 'Institution/University is required'],
      trim: true,
      maxLength: 150,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxLength: 120,
    },
    fieldOfStudy: {
      type: String,
      required: [true, 'Field of study / major is required'],
      trim: true,
      maxLength: 120,
    },
    location: {
      type: String,
      trim: true,
      default: '',
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
    grade: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
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

educationSchema.index({ order: 1, startDate: -1 });

const Education = mongoose.models.Education || mongoose.model('Education', educationSchema);

export default Education;
