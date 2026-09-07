import mongoose from 'mongoose';

const screenshotSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Screenshot URL is required'],
      trim: true,
    },
    publicId: {
      type: String,
      default: '',
      trim: true,
    },
    caption: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxLength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: [true, 'Project summary is required'],
      trim: true,
      maxLength: [350, 'Summary cannot exceed 350 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project detailed description is required'],
      trim: true,
    },
    problem: {
      type: String,
      trim: true,
      default: '',
    },
    solution: {
      type: String,
      trim: true,
      default: '',
    },
    thumbnail: {
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
    screenshots: [screenshotSchema],
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    demoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
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

// Compound index for efficient public project listings
projectSchema.index({ isPublished: 1, order: 1, createdAt: -1 });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;
