const { IsNull } = require('typeorm');
const { dataSource } = require('../db/data-source');
const appError = require('../util/appError');
const { isValidString, isPositiveInteger, isValidUUID  } = require("../util/validation");
const CoachSkill = require('../entities/CoachSkill');

const coachesController = {
  /*1.GET /api/coaches*/
  async getAllCoaches(req, res, next) {
    
    const { per, page } = req.query;
    //console.log(`per : ${per} page: ${page}` );
    
    if ( !isPositiveInteger(per)  || 
         !isPositiveInteger(page)
        ) {
      next(appError(400, '欄位未填寫正確'));
      return;
    }

    const coachRepo = dataSource.getRepository('Coach');
    const allCoaches = await coachRepo.find({
      relations: {
        user: true,
      },
    });
    if (!allCoaches){
      return next(appError(500, 'Server Error'));
    }
    const coachData = allCoaches.map((data) => ({
      id: data.id,
      user_id:data.user_id,
      name: data.user.name,
    }));
    //console.log(coachData);

    res.status(200).json({
        status: 'success',
        data: coachData
    });           
  },

  /*2.GET /api/coaches/{coachId}*/
  async getOneCoach(req, res, next) {
    
    const {coachId } = req.params;
    if ( !isValidString(coachId) || !isValidUUID(coachId)) {
      next(appError(400, '欄位未填寫正確'));
      return;
    }
    const coachRepo = dataSource.getRepository('Coach');
    const userCoaches = await coachRepo.findOne({
      where: { id: coachId } ,
      relations: {       
        user : true
      },
    });
    if (!userCoaches){
      return next(appError(400, '找不到該教練'));
    }    
    const userData = {
      name:userCoaches.user.name,
      role:userCoaches.user.role
    }
    const coachSkillRepo = dataSource.getRepository('CoachSkill');
    const coachSkill = await coachSkillRepo.find({
      where: { coach_id: coachId } ,
      relations: {            
        skill : true
      },
    })
    if (!coachSkill){
      return next(appError(500, 'Server Error'));
    }
   //console.log(coachSkill);

    const skillData = coachSkill.map((data) => {
      return data.skill.name;
    });

    const coachData = {
        id : userCoaches.id,
        user_id : userCoaches.user_id,
        experience_years : userCoaches.experience_years,
        profile_url: userCoaches.profile_url,
        created_at : userCoaches.created_at,
        updated_at : userCoaches.updated_at,
        skills:skillData
    }

    res.status(200).json({
        status: 'success',
        data: {
          user:userData,
          coach:coachData
        }
    });
  },
  //3.GET /api/coaches/{coachId}/courses
  async getOnGoingCourse(req, res, next) {   
     const {coachId } = req.params;
    if ( !isValidString(coachId) || !isValidUUID(coachId)) {
      next(appError(400, '欄位未填寫正確'));
      return;
    }
    const coachRepo = dataSource.getRepository('Coach');
    const userCoaches = await coachRepo.findOne({
      where: { id: coachId } ,
      relations: {       
        user : true
      },
    });
    if (!userCoaches){
      return next(appError(400, '找不到該教練'));
    }  
    const courseRepo = dataSource.getRepository('Course');
   

    const now = new Date();   
    
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
      .where('course.user_id = :userId', { userId: userCoaches.user_id }) 
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
  //4.GET /api/courses
  async allOnGoingCourse(req, res, next) {       

    const now = new Date();  
    
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
      .Where('course.start_at < :dtNow',{ dtNow : now })   
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

module.exports = coachesController;
