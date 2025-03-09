var express = require("express");
const router = express.Router();

var { class1 } = require('../controller/Controller');

router.post("/SignUp",class1.SignUp);
router.post("/SignIn",class1.SignIn);
router.post("/SetShare",class1.SetShare);
router.post("/PurchaseCurrency",class1.PurchaseCurrency);
router.post("/PurchaseShare",class1.PurchaseShare);
router.post("/CheckReferralCodeStatus",class1.CheckReferralCodeStatus);
router.post("/UserStatus",class1.UserStatus);
router.post("/GetPurchaseShare",class1.GetPurchaseShare);

module.exports = router;