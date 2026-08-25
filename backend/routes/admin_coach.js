const router = require('express').Router();
const adminCoachController = require('../controllers/admin_coach');
const isAuth = require('../middlewares/isAuth');
const isCoach = require('../middlewares/isCoach');

router.post('/:userId', adminCoachController.uptoCoachesFromUsers);

/*
router.post('/login', userController.login);

router.get('/profile', isAuth, userController.profile);
router.put('/profile', isAuth, userController.updateProfile);
router.put('/password', isAuth, userController.updatePassword);
*/
module.exports = router;
