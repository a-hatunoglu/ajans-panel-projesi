import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { UserRole } from '../../shared/types/enums';
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
} from './contents.schema';
import * as contentsController from './contents.controller';

// Company-scoped routes (/companies/:companyId/contents)

const companyRouter = Router({ mergeParams: true });
companyRouter.use(authenticate);

companyRouter.get(
  '/calendar',
  validate({ params: companyIdParamSchema, query: calendarQuerySchema }),
  contentsController.getCalendar,
);

companyRouter.get(
  '/',
  validate({ params: companyIdParamSchema }),
  contentsController.listByCompany,
);

companyRouter.post(
  '/',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.DESIGNER),
  validate({ params: companyIdParamSchema, body: createContentSchema }),
  contentsController.create,
);

// Direct routes (/contents)

const directRouter = Router();
directRouter.use(authenticate);

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
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.DESIGNER),
  validate({ params: contentIdParamSchema, body: updateContentSchema }),
  contentsController.update,
);

directRouter.delete(
  '/:id',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.DESIGNER),
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
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR),
  validate({ params: contentIdParamSchema, body: assignContentSchema }),
  contentsController.assign,
);

directRouter.post(
  '/:id/approve',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.CLIENT),
  validate({ params: contentIdParamSchema, body: approveRejectSchema }),
  contentsController.approve,
);

directRouter.post(
  '/:id/reject',
  authorize(UserRole.OWNER, UserRole.ADMIN, UserRole.CLIENT),
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

export { companyRouter as contentCompanyRoutes, directRouter as contentDirectRoutes };
