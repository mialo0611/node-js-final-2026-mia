const { dataSource } = require('../db/data-source');
const appError = require('../util/appError');
const { isValidString, isValidPassword } = require("../util/validation");

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');


const PW_ERR = '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字';

const userController = {
  /*1.signup*/
  async singup(req, res, next) {
    const { name, email, password } = req.body;
    if (
      !isValidString(name) ||
      !isValidString(email) ||
      !isValidString(password)
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (!isValidPassword(password)) {
      next(appError(400, PW_ERR));
      return;
    }
    const userRepo = dataSource.getRepository('User');
    const existing = await userRepo.findOneBy({ 
      email: email.trim().toLowerCase(),
    });
    if (existing) {
      next(appError(409, 'Email 已被使用'));
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepo.save({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'USER',
    });
    res.status(201).json({
       status: 'success', 
       data: {
        user:{
          id: user.id, 
          name: user.name
        }
      }
    });
  },
  /*2.login*/
  async login(req, res, next) {
    const { email, password } = req.body;
    if (!isValidString(email)) {
      next(appError(400, '電子郵件未填寫正確'));
      return;
    }
    if (!isValidPassword(password)) {
      next(appError(400, PW_ERR));
      return;
    }
    const userRepo = dataSource.getRepository('User');
    const getUser = await userRepo.findOneBy({ 
      email: email.trim().toLowerCase(),
    });
    //find the user by email 
    if (!getUser) {
      next(appError(400, '使用者不存在或密碼輸入錯誤'));
      return;
    }
    //compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, getUser.password);
    if (!isMatch) {
      return next(appError(400, '使用者不存在或密碼輸入錯誤'));
    }
    const token = jwt.sign(
      { id: getUser.id, role: getUser.role },
      config.get('secret.jwtSecret'),
      { expiresIn: config.get('secret.jwtExpiresDay') },
    );

    res.status(201).json({
      status: 'success',
      message: '登入成功',
      data: {
        token: token,
        user: { name: getUser.name }
      }
    });
  },
  /*3.profile */
  async profile(req, res, next) {
    //req.user is set by the isAuth middleware    
    res.json({ 
      status: 'success', 
      data: {
        user: { name: req.user.name, email: req.user.email }
      }
    }); 
  },
  /*4.updateProfile*/
  async updateProfile(req, res, next) {
    const { name } = req.body;
    if (!isValidString(name))  {
      return next(appError(400, "欄位未填寫正確"));
    }
    if (req.user.name === name.trim()) {
      return next(appError(400, "使用者名稱未變更"));
    }
    
    const userRepo = dataSource.getRepository('User');
    const result = await userRepo.update(
      { id: req.user.id }, 
      { name: name.trim()}
    );
    if (result.affected === 0) {
      return next(appError(404, '更新使用者資料失敗')); 
    }
    else{
      const userUpdated = await userRepo.findOneBy({ id: req.user.id });
      req.user.name = userUpdated.name;  //更新 req.user
    }

    res.status(200).json({
       status: 'success', 
       data: {
        user:{          
          name: req.user.name
        }
      }
    });
  },
  /*5.updatePassword*/
  async updatePassword(req, res, next) {
    const { password, new_password,confirm_new_password } = req.body;
    //三欄任一缺漏／空字串：「欄位未填寫正確」
    if (
      !isValidString(password) ||
      !isValidString(new_password) ||
      !isValidString(confirm_new_password)
    ) {
      return next(appError(400, "欄位未填寫正確"));
    }
    //三欄任一不符密碼規則：「密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字」
    if (!isValidPassword(password) || 
        !isValidPassword(new_password) || 
        !isValidPassword(confirm_new_password)  
    ) {
      return next(appError(400, PW_ERR));      
    }
    //新密碼與舊密碼相同：「新密碼不能與舊密碼相同」
    if (password === new_password) {
      return next(appError(400, '新密碼不能與舊密碼相同'));
    }
    //新密碼與確認新密碼不一致
    if (new_password !== confirm_new_password) {
      return next(appError(400, "新密碼與驗證新密碼不一致"));
    }
    //比對目前密碼是否正確   
    const userRepo = dataSource.getRepository('User');
    const getUser = await userRepo.findOneBy({ id: req.user.id });
    const isMatch = await bcrypt.compare(password, getUser.password);
    if (!isMatch) {
      return next(appError(400, "密碼輸入錯誤"));
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const result = await userRepo.update(
      { id: req.user.id },
      { password: hashedPassword }
    );
    if (result.affected === 0) {
      return next(appError(404, '更新密碼失敗'));
    }
    res.status(200).json({
      status: 'success',
      message: '密碼更新成功'
    });
  }
};

module.exports = userController;
