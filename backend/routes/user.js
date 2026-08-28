const router = require('express').Router();
const userController = require('../controllers/user');
const isAuth = require('../middlewares/isAuth');

router.post('/signup', userController.singup);
router.post('/login', userController.login);

router.get('/profile', isAuth, userController.profile);
router.put('/profile', isAuth, userController.updateProfile);
router.put('/password', isAuth, userController.updatePassword);

router.get('/credit-package', isAuth, userController.getMyCreditPackage);
router.get('/courses', isAuth, userController.getMyCourses);

module.exports = router;
