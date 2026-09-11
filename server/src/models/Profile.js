import mongoose from 'mongoose';

const skillItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Advanced',
    },
    icon: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const skillCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
    },
    items: [skillItemSchema],
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxLength: 100,
    },
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true,
      maxLength: 150,
    },
    shortBio: {
      type: String,
      required: [true, 'Short bio is required'],
      trim: true,
      maxLength: 300,
    },
    about: {
      type: String,
      required: [true, 'Detailed about section is required'],
      trim: true,
    },
    avatar: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    availableForHire: {
      type: Boolean,
      default: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    skills: [skillCategorySchema],
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);

export default Profile;
