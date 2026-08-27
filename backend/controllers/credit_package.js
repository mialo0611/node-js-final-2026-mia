const { dataSource } = require("../db/data-source");
const appError = require("../util/appError");
const { isValidString } = require("../util/validation");

const creditPackageController = {
  async getCreditPackages(req, res, next) {
    try {
    const creditPackages = await dataSource.getRepository('CreditPackage').find({
      select: { id: true, name: true, credit_amount: true, price: true },
      order: { name: 'ASC' },
    });
    res.json({ status: 'success', data: creditPackages });
    return;
    } catch (error) {      
      next(error);
    }
  },

  async postCreditPackage(req, res, next) {
    const { name, credit_amount, price } = req.body;
    //1.名稱不可空白，credit_amount 必須是大於 0 的數字，price 必須是大於 0 的數字
    if (!isValidString(name)) {
      next(appError(400, '欄位未填寫正確'));
      return;
    }
    if (typeof credit_amount !== 'number' || credit_amount <= 0) {
      next(appError(400, 'credit_amount 必須是數字且大於 0 的數值'));
      return;
    }
    if (typeof price !== 'number' || price <= 0) {
      next(appError(400, 'price 必須是數字且大於 0 的數值'));
      return;
    }

    const creditPackageRepo = dataSource.getRepository('CreditPackage');
    //2.組合包名稱不能重覆
    const existing = await creditPackageRepo.findOneBy({ name: name.trim() });
    if (existing) {
      next(appError(409, '組合包名稱不能重覆'));
      return;
    }
    const creditPackage = await creditPackageRepo.save({ 
      name: name.trim(),
      credit_amount: credit_amount,
      price: price
    });
    res.json({ status: 'success', data: creditPackage });
  },

  async deleteCreditPackage(req, res, next) {
    try {
      const { creditPackageId } = req.params;
      const result = await dataSource.getRepository('CreditPackage').delete(creditPackageId);
      if (result.affected === 0) {
        next(appError(400, 'ID錯誤'));
        return;
      }
      res.json({ status: "success" });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
<<<<<<< HEAD
  //M5-1 POST /api/credit-package/{creditPackageId}
  async purCreditPackage(req,res,next){
    const {creditPackageId} = req.params ;
    const cpRepo = dataSource.getRepository('CreditPackage');
    const getCP = await cpRepo.findOneBy({id:creditPackageId});
    if (!getCP){
      return next(appError(400),'ID錯誤');
    }

    const purCPRepo = dataSource.getRepository('CreditPurchase');
    const purCPdata = await purCPRepo.save({
      user_id : req.user.id,
      credit_package_id:getCP.id,
      purchase_credit:getCP.credit_amount,
      price_paid:getCP.price
    });
    if (!purCPdata){
      return next(appError(500),'Server Error');
    }
    res.json({ 
      status: 'success', 
      data: null 
    });

  }
};
=======
};

>>>>>>> fe83bb73170d2a2c09193574f283a41dbdce4b06
module.exports = creditPackageController;
