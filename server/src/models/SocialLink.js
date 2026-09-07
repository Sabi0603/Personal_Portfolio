import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
      maxLength: 60,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    isVisible: {
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

socialLinkSchema.index({ isVisible: 1, order: 1 });

const SocialLink = mongoose.models.SocialLink || mongoose.model('SocialLink', socialLinkSchema);

export default SocialLink;
