const router = require('express').Router();
const coursesController = require('../controllers/course');


router.get('/', coursesController.allOnGoingCourse);



module.exports = router;
