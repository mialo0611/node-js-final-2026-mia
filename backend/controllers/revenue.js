const { dataSource } = require("../db/data-source");
const appError = require("../util/appError");
const { isValidString } = require("../util/validation");

const revenueController = {  
  //M6 POST /api/credit-package/{creditPackageId}
  async monthRevenue(req,res,next){
    const userId = req.user.id ;
    const {month} = req.query;

    console.log(month)  ;
    if (!isValidString(month)) {
      return next(appError(400, "欄位未填寫正確"));
    }
    
    const coachRepo = dataSource.getRepository('Coach');     
    // check if userId not exists in users data then return
    const getUser = await coachRepo.findOneBy({ user_id: userId} );
    if (!getUser) {
      return next(appError(400, '使用者不存在'));
    };
    
    const dtYear = new Date().getFullYear() ;

    const aryMonth = ['january','february','march','april','may','june','july','august','september','october','november','december'];    
    const dtMonth = aryMonth.indexOf(month)+1 ;

    const avgCourse = await dataSource.query(`
      SELECT SUM(price_paid) AS totPrice , 
             SUM(purchased_credits) AS totCourse,
            (
              SELECT COUNT(*) 
              FROM course_booking cb
              INNER JOIN course co ON cb.course_id = co.id
              AND co.user_id = $1
              AND co.cancelled_at IS NULL 
              WHERE cb.cancelled_at IS NULL
              AND EXTRACT(YEAR FROM cb.created_at )  = $2
              AND EXTRACT(MONTH FROM cb.created_at )  = $3
            ) AS cntCourse,
            (
              SELECT DISTINCT COUNT(user_id) 
              FROM  course_booking 
              WHERE cancelled_at IS NULL 
              AND EXTRACT(YEAR FROM created_at )  = $2
              AND EXTRACT(MONTH FROM created_at )  = $3
            ) AS participants
      FROM credit_purchase  `,
      [userId, dtYear, dtMonth],
      );      
    
    if(!avgCourse) return next(appError(500,'Server Error'));
    
    console.log(avgCourse) ;
   
    
    
    res.status(200).json({ 
      status: 'success', 
      data: {
        total: {
          revenue: 0,
          participants: 0,
          course_count: 0
        }
      }      
    });

  }
};
module.exports = revenueController;
