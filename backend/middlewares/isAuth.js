const jwt = require('jsonwebtoken');
const { dataSource } = require('../db/data-source');
const config = require('../config');
const appError = require("../util/appError");

async function isAuth(req, res, next) {
    try{
        //1.
        const authHeader = req.headers.authorization;    
        if (!authHeader || !authHeader.startsWith('Bearer ')) { 
            return next(appError(401, '請先登入'));
        }   
        //2.get the token from the header     
        const token = authHeader.split(' ')[1];
        //3.verify the token
        const decoded = await jwt.verify(token, config.get('secret.jwtSecret'));
        //4.check user
        const userRepo = dataSource.getRepository('User');
        const getUser = await userRepo.findOneBy({ id: decoded.id });
        if (!getUser) {
            return next(appError(401, '無效的 token123'));
        }
        req.user = getUser; 
        
        //console.log (`token ==>  ${token}`);
        next();
    }catch(err){
        if (err.name === 'TokenExpiredError') {
            return next(appError(401, 'Token 已過期'));
        }
        return next(appError(401, '無效的 token'));
    }
  
}

module.exports = isAuth;