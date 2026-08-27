const router = require('express').Router();
const creditPackageController = require('../controllers/credit_package');
const isAuth = require('../middlewares/isAuth');

router.get('/', creditPackageController.getCreditPackages);
router.post('/', creditPackageController.postCreditPackage);
router.delete('/:creditPackageId', creditPackageController.deleteCreditPackage);

router.post('/:creditPackageId',creditPackageController.purCreditPackage);
module.exports = router;
