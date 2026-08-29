const { dataSource } = require("../db/data-source");
const appError = require("../util/appError");
const { isValidString } = require("../util/validation");

const revenueController = {  
  //M6 POST /api/credit-package/{creditPackageId}
  async monthRevenue(req,res,next){
    const userId = req.user.id ;
    const {month} = req.query;
  
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
    
    /*   
    dataSource.query >> 回傳多筆陣列
    偷吃步:: 
    讓資料庫去計算 && 只帶回一筆data
    why Camel's naming rule in column alias (AS totCourse..) become lower-cases column name from db returning  ?
    1.tot_price 所有課程總額
    2.tot_course 課程總數
    3.cnt_course 教練在當月的有效課數
    4.participants 當月的上課會員
    */
    const avgCourse = await dataSource.query(`
      SELECT SUM(price) AS tot_price , 
             SUM(credit_amount) AS tot_course,
            (
              SELECT COUNT(*) 
              FROM course_booking cb
              INNER JOIN course co ON cb.course_id = co.id
              AND co.user_id = $1              
              WHERE cb.cancelled_at IS NULL
              AND EXTRACT(YEAR FROM cb.created_at )  = $2
              AND EXTRACT(MONTH FROM cb.created_at )  = $3
            ) AS cnt_course,
            (
              SELECT DISTINCT COUNT(cb.user_id) 
              FROM  course_booking cb
              INNER JOIN course co ON cb.course_id = co.id
              AND co.user_id = $1              
              WHERE cb.cancelled_at IS NULL
              AND EXTRACT(YEAR FROM cb.created_at )  = $2
              AND EXTRACT(MONTH FROM cb.created_at )  = $3 
            ) AS participants
      FROM credit_package  `,
      [userId, dtYear, dtMonth],
    );      
    
    if(!avgCourse) return next(appError(500,'Server Error'));
    
    //console.log(avgCourse[0]);

    const avgPrice = avgCourse[0].tot_price / avgCourse[0].tot_course ;
    
    let intRevenue = 0;
    let intParticipants = 0 ;
    let intCntCourse = 0 ;    

    if (Number(avgCourse[0].cnt_course) > 0 ){      
        intRevenue = Math.floor(avgCourse[0].cnt_course *avgPrice ),
        intParticipants = Number(avgCourse[0].participants),
        intCntCourse  = Number(avgCourse[0].cnt_course)    
    };       
     
    const dataTotal = {
      revenue : intRevenue,
      participants : intParticipants,
      course_count : intCntCourse
    }
   
    //console.log(dataTotal) ;
    
    res.status(200).json({ 
      status: 'success', 
      data: {
        total: dataTotal
      }      
    });
  },
};
module.exports = revenueController;
