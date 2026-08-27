const router = require('express').Router();
const coachesController = require('../controllers/coaches');


router.get('/', coachesController.getAllCoaches);
router.get('/:coachId',coachesController.getOneCoach);
router.get('/:coachId/courses',coachesController.getOnGoingCourse);



module.exports = router;
