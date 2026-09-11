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
      previewUrl: {
        type: String,
        default: '',
        trim: true,
      },
      publicId: {
        type: String,
        default: '',
        trim: true,
      },
      fileType: {
        type: String,
        enum: ['image', 'pdf'],
        default: 'image',
      },
      fileName: {
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

const inferFileType = function (next) {
  if (this.image?.url) {
    const urlLower = this.image.url.toLowerCase();
    if (!this.image.fileType || this.image.fileType === 'image') {
      if (urlLower.endsWith('.pdf') || urlLower.includes('.pdf?') || urlLower.includes('/raw/upload/')) {
        this.image.fileType = 'pdf';
      }
    }
  }
  if (typeof next === 'function') next();
};

certificationSchema.pre('validate', inferFileType);
certificationSchema.pre('save', inferFileType);

certificationSchema.index({ order: 1, issueDate: -1 });

const Certification =
  mongoose.models.Certification || mongoose.model('Certification', certificationSchema);

export default Certification;
