const { dataSource } = require('../db/data-source');
const appError = require('../util/appError');
const { isValidString, isPositiveInteger, isValidUUID  } = require("../util/validation");
const {IsNull} = require('typeorm');

const coursesController = {
  //M4-4.GET /api/courses
  async allOnGoingCourse(req, res, next) {       

    const now = new Date();  
    const courseRepo = dataSource.getRepository('Course');
    const onGoingCourses = await courseRepo
      .createQueryBuilder('course')
      .innerJoin('User', 'users', 'users.id = course.user_id')
      .innerJoin('Skill', 'skill', 'skill.id = course.skill_id')
      .select([
        'course.id AS id',
        'course.name AS name',
        'course.description AS description',
        'course.start_at AS start_at',
        'course.end_at AS end_at',
        'course.max_participants AS max_participants',
        'course.meeting_url AS meeting_url',
        'users.name AS coach_name',
        'skill.name AS skill_name',
      ])
      .where('course.start_at < :dtNow',{ dtNow : now })   
      .andWhere('course.end_at > :dtNow',{ dtNow : now })
      .orderBy('course.start_at', 'ASC')
      .getRawMany();

      const rtnData =  onGoingCourses.map((item) => {
       return { 
        id: item.id,
        name: item.name,
        description: item.description,
        start_at: item.start_at,
        end_at: item.end_at,
        coach_name: item.coach_name,
        skill_name: item.skill_name,   
        max_participants: Number(item.max_participants),
        meeting_url: item.meeting_url }
      });
      //console.log (`rtndata : ${rtnData}`);
      res.status(200).json({
      status: 'success',
      data: rtnData
    });    
  }, 
  //POST /api/courses/{courseId}  
  async addCourseBooking(req, res, next) {
    const { courseId } = req.params;
    const userId = req.user.id ;
    const courseRepo = dataSource.getRepository('Course');
    const bookingRepo = dataSource.getRepository('CourseBooking');
    const purchaseRepo = dataSource.getRepository('CreditPurchase');

    // ① 查無課程
    const course = await courseRepo.findOneBy({ id: courseId });
     if (!course) return next(appError(400, 'ID錯誤'));

    //已報名（含已取消）
    const existBooking = await bookingRepo.findOneBy({
      user_id: req.user.id,
      course_id: courseId,
    });
    if (existBooking) return next(appError(400, '已經報名過此課程'));

    //剩餘堂數
    const purchases = await purchaseRepo.find({ where: { user_id: userId } });
    const totalCredits = purchases.reduce((sum, p) => sum + p.purchased_credits, 0);
    const usageCount = await bookingRepo.count({
          where: { user_id: req.user.id, cancelled_at: IsNull() },
    });
    if (totalCredits - usageCount <= 0) return next(appError(400, '已無可使用堂數'));

    //超額
    const participantCount = await bookingRepo.count({
    where: { course_id: courseId, cancelled_at: IsNull() },
    });
    if (participantCount >= course.max_participants)
      return next(appError(400, '已達最大參加人數，無法參加'));

    // 通過 → 報名
    await bookingRepo.save({ user_id: userId, course_id: courseId });
  
    res.status(201).json({ 
      status: 'success', 
      data: null 
    });
  },
  //DELETE /api/courses/{courseId}
  // controllers/courses.js — deleteBooking
  async cancellBooking(req, res, next) {
  const {courseId} = req.params ;  
  const userId = req.user.id ;
  const bookingRepo = dataSource.getRepository("CourseBooking");
  const booking = await bookingRepo.findOneBy({
    user_id: userId,
    course_id: courseId,
    cancelled_at: IsNull(),
  });
  if (!booking) return next(appError(400, "ID錯誤"));
  booking.cancelled_at = new Date();
  await bookingRepo.save(booking);
  res.status(200).json({ 
    status: "success", 
    data: null 
  });
},
  
};

module.exports = coursesController;
