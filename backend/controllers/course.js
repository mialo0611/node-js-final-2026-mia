const { dataSource } = require('../db/data-source');
const appError = require('../util/appError');
const { isValidString, isPositiveInteger, isValidUUID  } = require("../util/validation");


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
      console.log (`rtndata : ${rtnData}`);
      res.status(200).json({
      status: 'success',
      data: rtnData
    });    
  },

  
};

module.exports = coursesController;
