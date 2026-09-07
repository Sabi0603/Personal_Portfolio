import multer from "multer";
import path from "path";
import { sendError } from "../utils/apiResponse.js";

const storage = multer.memoryStorage();
const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_SKILL_IMAGE_MIMES = [...ALLOWED_IMAGE_MIMES, "image/svg+xml"];
const ALLOWED_DOC_MIMES = ["application/pdf"];
const ALLOWED_MIMES = [
    ...ALLOWED_IMAGE_MIMES,
    ...ALLOWED_DOC_MIMES,
    "image/svg+xml",
];
const ALLOWED_IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_SKILL_IMAGE_EXTS = [...ALLOWED_IMAGE_EXTS, ".svg"];
const ALLOWED_DOC_EXTS = [".pdf"];
const ALLOWED_EXTS = [...ALLOWED_IMAGE_EXTS, ...ALLOWED_DOC_EXTS, ".svg"];

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isMimeValid = ALLOWED_MIMES.includes(file.mimetype);
    const isExtValid = ALLOWED_EXTS.includes(ext);

    if (!isMimeValid || !isExtValid) {
        const error = new Error(
            `Unsupported file type '${ext || file.mimetype}'. Allowed formats: JPEG, PNG, WEBP, SVG, and PDF.`,
        );
        error.statusCode = 400;
        return cb(error, false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
    },
});

export const handleSingleUpload = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return sendError(
                        res,
                        "File size exceeds the 10 MB maximum limit.",
                        400,
                    );
                }

                return sendError(res, `Upload error: ${err.message}`, 400);
            }

            return sendError(
                res,
                err.message || "File validation failed.",
                400,
            );
        }

        if (!req.file) {
            return sendError(
                res,
                'Please provide a file to upload in the "file" field.',
                400,
            );
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        const isSvg = req.file.mimetype === 'image/svg+xml' || ext === '.svg';
        const isImage = ALLOWED_IMAGE_MIMES.includes(req.file.mimetype);
        const isPdf = ALLOWED_DOC_MIMES.includes(req.file.mimetype) || ext === '.pdf';
        const requestedFolder = (req.body?.folder || req.query?.folder || '').toLowerCase().trim();

        /*
         * SVG is allowed only for skill icons.
         * The media controller/route must validate the
         * requested Cloudinary folder as "skills".
         */
        if (isSvg && requestedFolder !== 'skills') {
            return sendError(
                res,
                'SVG files are only allowed for skill icons.',
                400,
            );
        }
        // Images and SVG skill icons: max 5 MB
        if ((isImage || isSvg) && req.file.size > 5 * 1024 * 1024) {
            return sendError(
                res,
                'Image file size exceeds the 5 MB maximum limit.',
                400,
            );
        }
        // PDF resume: max 10 MB
        if (isPdf && req.file.size > 10 * 1024 * 1024) {
            return sendError(
                res,
                "PDF document file size exceeds the 10 MB maximum limit.",
                400,
            );
        }
        next();
    });
};

export {
    ALLOWED_IMAGE_MIMES,
    ALLOWED_SKILL_IMAGE_MIMES,
    ALLOWED_DOC_MIMES,
    ALLOWED_IMAGE_EXTS,
    ALLOWED_SKILL_IMAGE_EXTS,
    ALLOWED_DOC_EXTS,
};
