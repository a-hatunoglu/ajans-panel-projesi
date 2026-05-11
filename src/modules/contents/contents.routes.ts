import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { agencyScope } from '../../middleware/agency-scope';
import {
  createContentSchema,
  updateContentSchema,
  changeStatusSchema,
  assignContentSchema,
  approveRejectSchema,
  rejectSchema,
  addCommentSchema,
  contentIdParamSchema,
  companyIdParamSchema,
  calendarQuerySchema,
  contentsListQuerySchema,
  presignedUrlSchema,
  confirmMediaSchema,
} from './contents.schema';
import { ALLOWED_MIME_MAP, VIDEO_MAX_BYTES } from '../../shared/constants/media';
import * as contentsController from './contents.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: VIDEO_MAX_BYTES }, // Global ceiling = video max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ALLOWED_MIME_MAP[file.mimetype];

    if (!allowedExts) {
      cb(new Error('Desteklenmeyen MIME tipi. Lütfen geçerli bir görsel veya video yükleyin.'));
      return;
    }

    if (!allowedExts.includes(ext)) {
      cb(new Error(`Dosya uzantısı (${ext}) MIME tipiyle (${file.mimetype}) uyuşmuyor.`));
      return;
    }

    cb(null, true);
  },
});

import { companyAccess } from '../../middleware/company-access';

// Company-scoped routes (/companies/:companyId/contents)

const companyRouter = Router({ mergeParams: true });
companyRouter.use(authenticate);
companyRouter.use(agencyScope());
companyRouter.use(companyAccess('companyId'));

companyRouter.get(
  '/calendar',
  validate({ params: companyIdParamSchema, query: calendarQuerySchema }),
  contentsController.getCalendar,
);

companyRouter.get(
  '/workflow-snapshot',
  validate({ params: companyIdParamSchema }),
  contentsController.getWorkflowSnapshot,
);

companyRouter.get(
  '/',
  validate({ params: companyIdParamSchema }),
  contentsController.listByCompany,
);

companyRouter.post(
  '/',
  validate({ params: companyIdParamSchema, body: createContentSchema }),
  contentsController.create,
);

// Direct routes (/contents)

const directRouter = Router();
directRouter.use(authenticate);
directRouter.use(agencyScope());

directRouter.get(
  '/',
  validate({ query: contentsListQuerySchema }),
  contentsController.listGlobal,
);

directRouter.get(
  '/calendar',
  validate({ query: calendarQuerySchema }),
  contentsController.getCalendar,
);

directRouter.get(
  '/:id',
  validate({ params: contentIdParamSchema }),
  contentsController.getById,
);

directRouter.put(
  '/:id',
  validate({ params: contentIdParamSchema, body: updateContentSchema }),
  contentsController.update,
);

directRouter.delete(
  '/:id',
  validate({ params: contentIdParamSchema }),
  contentsController.softDelete,
);

directRouter.put(
  '/:id/status',
  validate({ params: contentIdParamSchema, body: changeStatusSchema }),
  contentsController.changeStatus,
);

directRouter.put(
  '/:id/assign',
  validate({ params: contentIdParamSchema, body: assignContentSchema }),
  contentsController.assign,
);

directRouter.post(
  '/:id/approve',
  validate({ params: contentIdParamSchema, body: approveRejectSchema }),
  contentsController.approve,
);

directRouter.post(
  '/:id/reject',
  validate({ params: contentIdParamSchema, body: rejectSchema }),
  contentsController.reject,
);

directRouter.get(
  '/:id/versions',
  validate({ params: contentIdParamSchema }),
  contentsController.listVersions,
);

directRouter.get(
  '/:id/comments',
  validate({ params: contentIdParamSchema }),
  contentsController.listComments,
);

directRouter.post(
  '/:id/comments',
  validate({ params: contentIdParamSchema, body: addCommentSchema }),
  contentsController.addComment,
);

directRouter.post(
  '/:id/media/presigned-url',
  validate({ params: contentIdParamSchema, body: presignedUrlSchema }),
  contentsController.getPresignedUrl,
);


directRouter.post(
  '/:id/media',
  validate({ params: contentIdParamSchema }),
  upload.single('file'),
  contentsController.addMedia,
);

directRouter.post(
  '/:id/media/confirm',
  validate({ params: contentIdParamSchema, body: confirmMediaSchema }),
  contentsController.confirmMedia,
);

directRouter.delete(
  '/:id/media/:mediaId',
  validate({ params: contentIdParamSchema }),
  contentsController.removeMedia,
);

export { companyRouter as contentCompanyRoutes, directRouter as contentDirectRoutes };
