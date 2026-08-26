const router = require('express').Router();
const adminCoachController = require('../controllers/admin_coach');
const isAuth = require('../middlewares/isAuth');
const isCoach = require('../middlewares/isCoach');


router.get('/', isAuth, isCoach, adminCoachController.getCoachAllSkills);
router.put('/', isAuth, isCoach, adminCoachController.updCoachAllSkills);

router.get('/courses',isAuth,isCoach,adminCoachController.getCoachAllCourses);
router.post('/courses',isAuth,isCoach,adminCoachController.addOneCourse);

router.get('/courses/:courseId',isAuth,isCoach,adminCoachController.getOneCourse);
router.put('/courses/:courseId',isAuth,isCoach,adminCoachController.updOneCourse);

router.post('/:userId', adminCoachController.uptoCoachesFromUsers);

/*

router.get('/profile', isAuth, userController.profile);
router.put('/profile', isAuth, userController.updateProfile);
router.put('/password', isAuth, userController.updatePassword);
*/
module.exports = router;
