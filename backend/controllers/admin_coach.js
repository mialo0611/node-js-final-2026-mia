const { IsNull } = require('typeorm');
const { dataSource } = require('../db/data-source');
const appError = require('../util/appError');
const { isValidString} = require("../util/validation");

const adminCoachController = {
  /*1.Up to coaches from users*/
  async uptoCoachesFromUsers(req, res, next) {
    const { userId } = req.params;
    const { experience_years, description, profile_image_url } = req.body;

    if (typeof experience_years !== 'number' || experience_years <= 0) {
      return next(appError(400, '欄位未填寫正確'));      
    };
    if (!isValidString(description)  ) {
      return next(appError(400, '欄位未填寫正確'));      
    };    
    if (isValidString(profile_image_url) && !profile_image_url.toLowerCase().startsWith('https')) {
      return next(appError(400, '欄位未填寫正確'));
    };
    const userRepo = dataSource.getRepository('User');
    const coachRepo = dataSource.getRepository('Coach');

    // check if userId not exists in users data then return
    const getUser = await userRepo.findOne({ where:{id: userId} });
    if (!getUser) {
      return next(appError(400, '使用者不存在'));
    };

    // check if userId exists in coash data then return    
    if (getUser.role === 'COACH') {
      return next(appError(409, '使用者已是教練'));
    };
    //1.新增教練資料
    const addCoach = await coachRepo.create({
      user_id: userId,
      experience_years: experience_years,
      description: description.trim(),
      profile_image_url: profile_image_url || null
    });
    const newCoach = await coachRepo.save(addCoach);
    if (!newCoach) {
      return next(appError(500, 'Server Error'));
    };
    //2.教練資料新增成功後再update教練資料
    getUser.role = 'COACH';
    const updUser = await userRepo.save(getUser);
    if (!updUser) {
      return next(appError(500, 'Server Error'));
    };  

    res.status(201).json({
        status: 'success',
        data: {
          user: {
            name: getUser.name,
            role: getUser.role
          },
          coach: newCoach,
        },
    });           
  },

  /*2.get coach's personal data & skills*/
  async getCoachAllSkills(req, res, next) {
    const userId = req.user.id ;
    const coachRepo = dataSource.getRepository('Coach') ;    
    const getCoach = await coachRepo.findOne({ where: { user_id: userId } });
    
    if (!getCoach){
      return next(appError(401, '使用者尚未成為教練'));      
    };

    const coachSkillRepo = dataSource.getRepository('CoachSkill');
    
    const coachSkills = await coachSkillRepo.find({
      where: { coach_id :getCoach.id }
    });
    const skillIds = coachSkills.map((item) => item.skill_id);

    res.status(200).json({
      status: 'success',      
      data: {
        id:getCoach.id,
        experience_years : getCoach.experience_years,
        description : getCoach.description,
        profile_image_url: getCoach.profile_image_url,
        skill_ids : skillIds,
      }
    });
  },
  /*3.update coach's personal data  */
  async updCoachAllSkills(req, res, next) {
    const { experience_years, description,profile_image_url,skill_ids } = req.body;
    if (typeof experience_years !== 'number' || experience_years <= 0) {
      return next(appError(400, '欄位未填寫正確'));      
    };
    if (!isValidString(description)) {
      return next(appError(400, '欄位未填寫正確'));      
    };    
    if (isValidString(profile_image_url) && 
        !profile_image_url.toLowerCase().startsWith('https')) {
      return next(appError(400, '欄位未填寫正確'));
    };
    const isInvalidSkillIds = 
      !Array.isArray(skill_ids) || 
      skill_ids.length === 0 || 
      !skill_ids.every(id => typeof id === 'string' && id.trim() !== '');

    if (isInvalidSkillIds) {   
      return next(appError(400, '欄位未填寫正確'));
    }
    const userId = req.user.id ;
    const coachRepo = dataSource.getRepository('Coach') ;    
    const getCoach = await coachRepo.findOneBy({user_id: userId});
    if (!getCoach){
      return next(appError(401, '使用者尚未成為教練')); 
    }
    //以下直接改成下update
    if (getCoach) {     
      getCoach.experience_years = experience_years;
      getCoach.description = description;
      getCoach.profile_image_url=profile_image_url;
      const updCoach = await coachRepo.save(getCoach);
      if (!updCoach) {
        return next(appError(500, '教練資料更新失敗'));
      };
    };
    const coachSkillRepo = dataSource.getRepository('CoachSkill');
    await coachSkillRepo.delete({ coach_id: getCoach.id });

    const newCoachSkills = skill_ids.map((skillId) => ({
      coach_id: getCoach.id,
      skill_id: skillId,
    }));

    // 若有技能，整批寫入新的關聯
    if (newCoachSkills.length > 0) {
      await coachSkillRepo.insert(newCoachSkills)
    };

    res.status(200).json({
      status: 'success',      
      data: {
        id:getCoach.id,
        experience_years : getCoach.experience_years,
        description : getCoach.description,
        profile_image_url: getCoach.profile_image_url,
        skill_ids : skill_ids        
      }
    });
  },
  /*4.get coach's personal courses */
  async getCoachAllCourses(req, res, next) {
    const userId = req.user.id ;
    const coachRepo = dataSource.getRepository('Coach');
    const getCoach = await coachRepo.findOneBy({user_id: userId});  
    if (!getCoach){
      return next(appError(401, '使用者尚未成為教練'));      
    };
    
    const courseRepo = dataSource.getRepository('Course') ;   
      
    
    const Courses = await courseRepo.find({
      select: {id:true,
               name:true,
               status:true,
               start_at:true,
               end_at:true,
               max_participants:true,
               meeting_url:true,
               participants:true
              },
      where: { user_id :userId ,cancelled_at: IsNull()} , 
      order: { start_at: 'ASC'}      
    });
    if (!Courses){
      return next(appError(500,'Server Errors'));
    }
    const now = new Date();
    const result = Courses.map((course) => {
      let status = '尚未開始';
      const startAt = new Date(course.start_at);
      const endAt = new Date(course.end_at);

      if (now > startAt && now <= endAt) {
        status = '進行中';
      } else if (now > endAt) {
        status = '已結束';
      }
      return {
        id: course.id,
        name: course.name,
        status,
        start_at: course.start_at,
        end_at: course.end_at,
        max_participants:course.max_participants,
        meeting_url:course.meeting_url,
        participants:course.participants        
      };
    });
    //console.log(result)
    res.status(200).json({
      status: 'success',
        data: result
    });
  },
  /*5.add a new course */
  async addOneCourse(req, res, next) {
    const { skill_id,name, description,start_at,end_at,max_participants,meeting_url } = req.body;
    if (typeof max_participants !== 'number' || max_participants <= 0) {
      return next(appError(400, '欄位未填寫正確'));      
    };
    if (!isValidString(skill_id) || 
        !isValidString(name) || 
        !isValidString(description) ||
        !isValidString(start_at) ||
        !isValidString(end_at) ) {
          return next(appError(400, '欄位未填寫正確'));      
    };    
    if (isValidString(meeting_url) && 
        !meeting_url.toLowerCase().startsWith('https')) {
        return next(appError(400, '欄位未填寫正確'));
    };
    
    const userId = req.user.id ;
    const coachRepo = dataSource.getRepository('Coach') ;    
    const getCoach = await coachRepo.findOneBy({user_id: userId});
    if (!getCoach){
      return next(appError(401, '使用者尚未成為教練')); 
    }
    const courseRepo = dataSource.getRepository('Course');
    const newCourse = courseRepo.create({
      user_id : userId,
      skill_id:skill_id,
      name:name,
      description:description,
      start_at:start_at,
      end_at : end_at,
      max_participants:max_participants,
      meeting_url:meeting_url
    });
    const getNewCourse = await courseRepo.save(newCourse);
    if (!getNewCourse){
      return next(appError(500,'Server Error'));
    };
   
    res.status(201).json({
      status: 'success',
      data:{
        course:{
          id:getNewCourse.id,
          user_id : getNewCourse.user_id,
          skill_id :getNewCourse.skill_id,
          name:getNewCourse.name,    
          description:getNewCourse.description,
          start_at : getNewCourse.start_at,
          end_at : getNewCourse.end_at,
          meeting_url:getNewCourse.meeting_url,
          created_at:getNewCourse.created_at,
          updated_at:getNewCourse.updated_at
        }
      }
    });
  },
  /*6.get a existed course*/
  async getOneCourse(req, res, next) {
    const userId = req.user.id ;
    const {courseId } = req.params;
    const courseRepo = dataSource.getRepository('Course');
    const getCourse = await courseRepo.findOne({
      where:{id:courseId, user_id : userId } });
    if (!getCourse ) {
      return next(appError(400,'課程不存在'));
    }
    const skillRepo = dataSource.getRepository('Skill')
    const getSkill = await skillRepo.findOneBy({ id: getCourse.skill_id });
    if (!getSkill){
      return next(appError(500,'Server Error'));
    }

    console.log(`one course Hello User ${userId}`)
    res.status(200).json({
      status: 'success',
      data:{        
          id:getCourse.id,
          name:getCourse.name,
          description:getCourse.description,
          start_at : getCourse.start_at,
          end_at : getCourse.end_at,
          max_participants:getCourse.max_participants,
          skill_name:getSkill.name,
          skill_id : getCourse.skill_id,
          meeting_url:getCourse.meeting_url,                          
      }
    });
  },
  async updOneCourse(req, res, next) {
    
    const { courseId } = req.params;
    const {
      skill_id,
      name,
      description,
      start_at,
      end_at,
      max_participants,
      meeting_url,
    } = req.body;

   

     if (!isValidString(skill_id) || 
        !isValidString(name) || 
        !isValidString(description) ||
        !isValidString(start_at) ||
        !isValidString(end_at) ) {
          return next(appError(400, '欄位未填寫正確'));      
    };    

    if (typeof max_participants !== 'number' || max_participants <= 0) {
      return next(appError(400, '欄位未填寫正確'));      
    };      
    if (isValidString(meeting_url) && !meeting_url.toLowerCase().startsWith('https')) {
      return next(appError(400, '欄位未填寫正確'));
    };

    const courseRepo = dataSource.getRepository('Course');
    const getCourse = await courseRepo.findOne({
      where: { id: courseId, user_id: req.user.id },
    });
    if (!getCourse ) {
      return next(appError(400,'課程不存在'));
    }
    
    getCourse.skill_id = skill_id;
    getCourse.name = name.trim();
    getCourse.description = description.trim();
    getCourse.start_at = start_at;
    getCourse.end_at = end_at;
    getCourse.max_participants = max_participants;
    getCourse.meeting_url = meeting_url;

    const updatedCourse = await courseRepo.save(getCourse);

    res.status(200).json({
      status: 'success',
      data: {
        course: updatedCourse,
      },
    });
  
  },

  
};

module.exports = adminCoachController;
