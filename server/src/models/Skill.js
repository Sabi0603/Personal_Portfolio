import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxLength: [100, 'Skill name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
      maxLength: [60, 'Category name cannot exceed 60 characters'],
      default: 'Frontend',
      index: true,
    },
    icon: {
      url: {
        type: String,
        default: '',
        trim: true,
      },
      publicId: {
        type: String,
        default: '',
        trim: true,
      },
    },
    proficiency: {
      type: Number,
      required: [true, 'Proficiency percentage is required'],
      min: [0, 'Proficiency cannot be less than 0%'],
      max: [100, 'Proficiency cannot exceed 100%'],
      default: 80,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for public listings
skillSchema.index({ isPublished: 1, order: 1, createdAt: -1 });

const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema);

export default Skill;

