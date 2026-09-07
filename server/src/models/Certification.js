import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Certification title is required'],
      trim: true,
      maxLength: 150,
    },
    issuer: {
      type: String,
      required: [true, 'Issuing organization is required'],
      trim: true,
      maxLength: 120,
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    doesNotExpire: {
      type: Boolean,
      default: true,
    },
    credentialId: {
      type: String,
      trim: true,
      default: '',
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
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

certificationSchema.index({ order: 1, issueDate: -1 });

const Certification =
  mongoose.models.Certification || mongoose.model('Certification', certificationSchema);

export default Certification;
