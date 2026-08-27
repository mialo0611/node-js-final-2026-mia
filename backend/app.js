const express = require('express');
const cors = require('cors');
//const config = require('./config/index');
const { dataSource } = require('./db/data-source');
const appError = require('./util/appError');

const skill = require('./routes/skill');
const credit_package = require('./routes/credit_package');
const users = require('./routes/user');
<<<<<<< HEAD
const adminCoach = require('./routes/admin_coach');
const coaches = require('./routes/coaches');
const courses = require('./routes/course');
=======
const adminCoach = require("./routes/admin_coach")
>>>>>>> fe83bb73170d2a2c09193574f283a41dbdce4b06


const app = express();
app.use(cors());    
app.use(express.json());

// M0：健康檢查——回純文字 OK，不是 JSON；路徑不在 /api 底下
app.get('/healthcheck', async (req, res,next) => {
  try {
    await dataSource.query('SELECT 1');  // 連線測試
    res.status(200).send('OK');
  } catch (err) {
    res.sendStatus(500).send('Service Unavailable !!');
  }
});

// 之後每完成一個里程碑，路由就多掛一條：
app.use('/api/coaches/skill', skill);
app.use('/api/users', users);
app.use('/api/credit-package', credit_package);

//app.use("/api/admin/coaches/courses", require("./routes/adminCourses")); // ②
//app.use("/api/admin/coaches/revenue", require("./routes/adminRevenue")); // ③
app.use('/api/admin/coaches', adminCoach);
app.use("/api/coaches", coaches); // ⑤ 含 /:coachId
app.use("/api/courses", courses);


// 404（W3）
app.use((req, res,next) => {    
  next(appError(404, '--> 無此路由 <--'));   
  return;   
})

// 錯誤處理守門員（W4：四個參數）
app.use((err, req, res, next) => {
  const statusCode = err.status || 500 ;
  console.error(err)
  res.status(statusCode).json({ 
    status: statusCode === 500 ? 'error' : 'failed', 
    message: err.message || '伺服器錯誤' 
  });
  return;
})


/*
dataSource
  .initialize()
  .then(() => {
    app.listen(config.get("web.port"), () => {
    console.log(`Server running on port ${config.get("web.port")}`);
  });
  }).catch((err) => {
    console.error('資料庫連線失敗', err);
    process.exit(1); // 沒有資料庫就不營業     
});
*/

module.exports = app;
