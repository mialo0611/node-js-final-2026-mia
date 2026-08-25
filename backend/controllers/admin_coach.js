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
    if (!isValidString(description) || 
        !isValidString(profile_image_url) ) {
      return next(appError(400, '欄位未填寫正確'));      
    };    
    if (!profile_image_url.toLowerCase().startsWith('http')) {
      return next(appError(400, '欄位未填寫正確'));
    };
    const userRepo = dataSource.getRepository('User');
    const coachRepo = dataSource.getRepository('Coach');

    // check if userId not exists in users data then return
    const getUser = await userRepo.findOneBy({ id: userId });
    if (!getUser) {
      return next(appError(404, '使用者不存在'));
    };
    // check if userId exists in coash data then return 
    const getCoach = await coachRepo.findOneBy({ user_id: userId });
    if (getCoach) {
      return next(appError(400, '使用者已是教練'));
    };
    //1.新增教練資料
    const addCoach = await coachRepo.create({
      user_id: userId,
      experience_years: experience_years,
      description: description,
      profile_image_url: profile_image_url
    });
    const newCoach = await coachRepo.save(addCoach);
    if (!newCoach) {
      return next(appError(500, '升級教練失敗'));
    };
    //2.教練資料新增成功後再update教練資料
    if (getUser) {
      getUser.role = 'COACH';
      const updUser = await userRepo.save(getUser);
      if (!updUser) {
        return next(appError(500, '升級教練失敗'));
      }else{
        res.status(201).json({
          status: 'success',
          data: {
            user: {
              name: getUser.name,
              role: getUser.role
            },
            coach: {
              id: newCoach.id,
              user_id: newCoach.user_id,
              experience_years: newCoach.experience_years,
              description: newCoach.description,
              profile_image_url: newCoach.profile_image_url,
              created_at: newCoach.created_at,
              updated_at: newCoach.updated_at
            }
          }
        }); 
      }
    }   
  },
  /*2.get coach's personal data & skills*/
  async getDataAndSkills(req, res, next) {
    const coachId = req.user.id ;
    const coachRepo = dataSource.getRepository('Coach') ;
    const coachSkillRepo = dataSource.getRepository('CoachSkill');
    const coachSkills = await coachSkillRepo.find({
      where: { user: { id: coachId }},
      relations: { skill: true },      
    });

    res.status(201).json({
      status: 'success',
      message: '登入成功',
      data: {
        token: token,
        user: { name: getUser.name }
      }
    });
  },
  /*3.update coach's personal data  
  async profile(req, res, next) {
    //req.user is set by the isAuth middleware    
    res.json({ 
      status: 'success', 
      data: {
        user: { name: req.user.name, email: req.user.email }
      }
    }); 
  },*/
  /*4.get coach's personal courses 
  async updateProfile(req, res, next) {
    

    res.status(200).json({
       status: 'success', 
       data: {
        user:{          
          name: req.user.name
        }
      }
    });
  },*/
  /*5.add a new course
  async updatePassword(req, res, next) {
    
    res.status(200).json({
      status: 'success',
      message: '密碼更新成功'
    });
  },*/
  /*6.update a existed course*/
  async updateCourse(req, res, next) {
    
    res.status(200).json({
      status: 'success',
      message: '密碼更新成功'
    });
  },
};

module.exports = adminCoachController;
