const router = require('express').Router();
const adminCoachController = require('../controllers/admin_coach');
const revenueController = require('../controllers/revenue');
const isAuth = require('../middlewares/isAuth');
const isCoach = require('../middlewares/isCoach');


router.get('/', isAuth, isCoach, adminCoachController.getCoachAllSkills);
router.put('/', isAuth, isCoach, adminCoachController.updCoachAllSkills);

router.get('/courses',isAuth,isCoach,adminCoachController.getCoachAllCourses);
router.post('/courses',isAuth,isCoach,adminCoachController.addOneCourse);

router.get('/courses/:courseId',isAuth,isCoach,adminCoachController.getOneCourse);
router.put('/courses/:courseId',isAuth,isCoach,adminCoachController.updOneCourse);

router.post('/:userId', adminCoachController.uptoCoachesFromUsers);
router.get('/revenue',isAuth,revenueController.monthRevenue);

module.exports = router;
