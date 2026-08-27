const router = require('express').Router();
const creditPackageController = require('../controllers/credit_package');
<<<<<<< HEAD
const isAuth = require('../middlewares/isAuth');
=======
>>>>>>> fe83bb73170d2a2c09193574f283a41dbdce4b06

router.get('/', creditPackageController.getCreditPackages);
router.post('/', creditPackageController.postCreditPackage);
router.delete('/:creditPackageId', creditPackageController.deleteCreditPackage);

<<<<<<< HEAD
router.post('/:creditPackageId',creditPackageController.purCreditPackage);
=======
>>>>>>> fe83bb73170d2a2c09193574f283a41dbdce4b06
module.exports = router;
