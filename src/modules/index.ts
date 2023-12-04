import { Router } from 'express';

import auth from './auth/auth.route';
import users from './users/users.route';

const router: Router = Router();

router.use('/auth', auth);
router.use('/users', users);

export default router;
