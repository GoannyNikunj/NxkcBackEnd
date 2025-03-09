var { User , PurchaseShare , Share } = require("../model/Schema");
const HTTP = require("../../constant/response.constant");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const { ObjectId } = require('mongodb');

class class1 {
  static SignUp = async (req, res) => {
    try {

      if (req.body.Name && req.body.Phone && req.body.Email && req.body.Password && req.body.ReferralCode) {
        
        let data = new User({
          Name: req.body.Name,
          Email: req.body.Email,
          Phone: req.body.Phone,
          Password: req.body.Password,
          Wallet: 0,
          AccountActivationCode: req.body.ReferralCode,
          AccountType:"User"
        });
  
        data
        .save()
        .then(async (savedUser) => {

          const ExistingUserId = req.body.ReferralCode.substring(0, 24);  
          const ExistingShareId = req.body.ReferralCode.substring(req.body.ReferralCode.length - 24); 

          var ExistingUser = await User.findOne({
            _id : new ObjectId(ExistingUserId)
          });

          if(ExistingUser.AccountType == "User"){

            const Record = await Share.find({
              _id: ExistingShareId,
            });

            let PurchaseSharedata = new PurchaseShare({
              User: new ObjectId(ExistingUserId),
              Share: new ObjectId(ExistingShareId),
              Quantity: 1,
              PurchsePrice: Record[0].Price
            });
  
            await PurchaseSharedata.save();

          }

          var a = {
            message: "User Create Successfully",
            status: `${HTTP.SUCCESS}`,
          };
          res.status(HTTP.SUCCESS).json(a);

        })
        .catch(async (err) => {

          res.send(err);

        });                                                                                                    

      } else {
        var a = { message: "Insufficient Data", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }
      
    } catch (e) {
      
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static SignIn = async (req, res) => {
    try {
      if (req.body.Name && req.body.Password) {

        var UserExist = await User.findOne({
          Name : req.body.Name
        });

        if (UserExist) {

          var Passwordmatch = await bcrypt.compare(
            req.body.Password,
            UserExist.Password
          );

          if(Passwordmatch){

            const Token = jwt.sign(
              { Name: req.body.Name },
              process.env.JWT_SECRET
            );
  
            var a = {
              message: "Login Successfully",
              User: UserExist,
              Token:Token,
              status: `${HTTP.SUCCESS}`,
              error: false,
            };
            res.status(HTTP.SUCCESS).json(a);
          }else{
            var a = { message: "Wrong PassWord", status: `${HTTP.UNAUTHORIZED}` };
            res.status(HTTP.UNAUTHORIZED).json(a);
          }

        } else {
          var a = { message: "User Not Exist", status: `${HTTP.NOT_FOUND}` };
          res.status(HTTP.NOT_FOUND).json(a);
        }                                                                                                     

      } else {
        var a = { message: "Insufficient Data", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }
    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static SetShare = async (req, res) => {
    try {
      if (req.body.Name && req.body.Value && req.body.Time && req.body.Parents) {

        var ShareExist = await Share.findOne({
          Name : req.body.Name
        });

        if (!ShareExist) {

          let data = new Share({
            Name: req.body.Name,
            Value: req.body.Price,
            LaunchTime: req.body.Time,
            CategoryName: req.body.Parents,
          });

          await data.save();

          var a = {
              message: "Share Launch Successfully",
              status: `${HTTP.SUCCESS}`,
          };
          res.status(HTTP.SUCCESS).json(a);

        } else {

          var a = {
            message: "Share Already Exist",
            code: `${HTTP.CONFLICT}`,
          };
          res.status(HTTP.CONFLICT).json(a);

        }                                                                                                     

      } else {
        var a = { message: "Insufficient Data", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }
    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static PurchaseCurrency = async (req, res) => {

    try {
      
      if (req.body.UpdatedAmount && req.body.Name && req.body.Time) {

        await User.findOneAndUpdate({
          Name : req.body.Name
        },{
          Wallet : req.body.UpdatedAmount
        });

        var a = {
            message: "Currency Update Successfully",
            status: `${HTTP.SUCCESS}`,
        };
        res.status(HTTP.SUCCESS).json(a);

      } else {
        var a = { message: "Insufficient Data", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }
    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static PurchaseShare = async (req, res) => {
    try {
      if ( req.body.Name && req.body.Quantity && req.body.UserId ) {

        var ShareExist = await Share.findOne({
          Name : req.body.Name
        });

        if (ShareExist) {

          var UserExist = await User.findOne({
            _id : req.body.UserId
          });

          if(UserExist){

            var CurrencyAmount = ( ShareExist.Price ) * (Quantity) ;

            if( UserExist.Wallet > CurrencyAmount || UserExist.Wallet == CurrencyAmount ){

            }else{
  
            }

          }else{
            var a = { message: "User Not Exist", status: `${HTTP.NOT_FOUND}` };
            res.status(HTTP.NOT_FOUND).json(a);
          }

          let data = new Share({
            Name: req.body.Name,
            Value: req.body.Price,
            LaunchTime: req.body.Time,
            CategoryName: req.body.Parents,
          });

          await data.save();

          var a = {
              message: "Share Launch Successfully",
              status: `${HTTP.SUCCESS}`,
          };
          res.status(HTTP.SUCCESS).json(a);

        } else {

          var a = { message: "Share Not Exist", status: `${HTTP.NOT_FOUND}` };
          res.status(HTTP.NOT_FOUND).json(a);

        }                                                                                                     

      } else {
        var a = { message: "Insufficient Data", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }
    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static CheckReferralCodeStatus = async (req, res) => {
    try {

      if (req.body.SendingReferralCode !== undefined) {

        var UserAndShareExist = true

        var ReferredBy
        var ReferralCode

        if(typeof req.body.SendingReferralCode === "string" && req.body.SendingReferralCode.length === 48){
          
          const ExistingUserId = req.body.SendingReferralCode.substring(0, 24);  
          const ExistingShareId = req.body.SendingReferralCode.substring(req.body.SendingReferralCode.length - 24); 

          var UserExist = await User.findOne({
            _id : ExistingUserId
          });

          var ShareExist = await Share.findOne({
            _id : ExistingShareId
          });

          if(UserExist && ShareExist){

            ReferredBy = UserExist._id ;
            ReferralCode = ShareExist._id ;

          }else{

            var AdminUser = await User.findOne({
              AccountType : "Admin"
            });

            ReferredBy = AdminUser._id ;
            ReferralCode = AdminUser._id ;

            UserAndShareExist = false

          }

        }else{
          
          var UserExist = await User.findOne({
            AccountType : "Admin"
          });

          ReferredBy = UserExist._id
          ReferralCode = UserExist._id

        }

        var a = {
          message: "Referral Code Verified Successfully",
          ReferralCode:ReferralCode,
          ReferredBy:ReferredBy,
          UserAndShareExist:UserAndShareExist,
          status: `${HTTP.SUCCESS}`,
        };
        res.status(HTTP.SUCCESS).json(a);                                                                                                     

      } else {
        var a = { message: "Insufficient Data", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }
      
    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static UserStatus = async (req, res) => {
    try {

      if (req.body.AccountActivationCode) {
        
        var UserArray = await User.find({
          AccountActivationCode: req.body.AccountActivationCode,
        });
  
        var a = {
          data: UserArray,
          message: "User Capture Successfully",
          status: `${HTTP.SUCCESS}`,
        };
        res.status(HTTP.SUCCESS).json(a);

      } else {
        var a = { message: "Insufficient Data", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }
      
    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static GetPurchaseShare = async (req, res) => {
    try {

      if (req.body.UserId && req.body.ShareId) {
        
        var AllPurchaseShare = await PurchaseShare.find({
          User: req.body.UserId,
          Share: req.body.ShareId,
        });
  
        var a = {
          data: AllPurchaseShare,
          message: "Phuchase Share Capture Successfully",
          status: `${HTTP.SUCCESS}`,
        };
        res.status(HTTP.SUCCESS).json(a);

      } else {
        var a = { message: "Insufficient Data", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }
      
    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
}

module.exports = { class1 };
