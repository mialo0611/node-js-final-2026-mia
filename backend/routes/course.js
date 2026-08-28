const router = require('express').Router();
const coursesController = require('../controllers/course');
const isAuth = require('../middlewares/isAuth');


router.get('/', coursesController.allOnGoingCourse);
router.post('/:courseId',isAuth,coursesController.addCourseBooking);
router.delete('/:courseId',isAuth,coursesController.cancellBooking);



module.exports = router;
