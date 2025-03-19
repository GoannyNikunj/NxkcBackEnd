var {
  User,
  PurchaseShare,
  Share,
  Category,
  NxRecord,
  NxAdminRecord,
  Request
} = require("../model/Schema");
const HTTP = require("../../constant/response.constant");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const { ObjectId } = require("mongodb");

var {
  generate1Day,
  generateLast5WorkingDays,
  Get1M,
  get1Y,
  convertToISO,
  getNextWorkingDay,
} = require("../Function/Function");

class class1 {
  static SignUp = async (req, res) => {
    try {
      if (
        req.body.Name &&
        req.body.Phone &&
        req.body.Email &&
        req.body.Password &&
        req.body.ReferralCode
      ) {
        let data = new User({
          Name: req.body.Name,
          Email: req.body.Email,
          Phone: req.body.Phone,
          Password: req.body.Password,
          Wallet: 0,
          AccountActivationCode: req.body.ReferralCode,
          AccountType: "User",
        });

        data
          .save()
          .then(async (savedUser) => {
            const ExistingUserId = req.body.ReferralCode.substring(0, 24);
            const ExistingShareId = req.body.ReferralCode.substring(
              req.body.ReferralCode.length - 24
            );

            var ExistingUser = await User.findOne({
              _id: new ObjectId(ExistingUserId),
            });

            if (ExistingUser.AccountType == "User") {
              const Record = await Share.find({
                _id: ExistingShareId,
              });

              let PurchaseSharedata = new PurchaseShare({
                User: new ObjectId(ExistingUserId),
                Share: new ObjectId(ExistingShareId),
                CategoryId: new ObjectId(Record[0].CategoryId),
                Quantity: 1,
                PurchsePrice: Record[0].Price,
                PurchaseType: "Free Purchase",
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
          Name: req.body.Name,
        });

        if (UserExist) {
          var Passwordmatch = await bcrypt.compare(
            req.body.Password,
            UserExist.Password
          );

          if (Passwordmatch) {
            const Token = jwt.sign(
              { Name: req.body.Name },
              process.env.JWT_SECRET
            );

            var a = {
              message: "Login Successfully",
              User: UserExist,
              Token: Token,
              status: `${HTTP.SUCCESS}`,
              error: false,
            };
            res.status(HTTP.SUCCESS).json(a);
          } else {
            var a = {
              message: "Wrong PassWord",
              status: `${HTTP.UNAUTHORIZED}`,
            };
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
      if (
        req.body.Name &&
        req.body.Price &&
        req.body.Time &&
        req.body.Parents
      ) {
        var ShareExist = await Share.findOne({
          Name: req.body.Name,
        });

        if (!ShareExist) {
          let today = new Date(); // Current date
          let nextWorkingDay =
            getNextWorkingDay(today).toLocaleDateString("en-GB");

          var SinleDayData = await generate1Day(req.body.Price);

          var YearData = await get1Y(req.body.Price);
          await YearData.slice(1);
          await YearData.push({
            time: nextWorkingDay,
            value: SinleDayData[SinleDayData.length - 1].value,
          });

          var MonthDataAray = await Get1M(req.body.Price);
          var MonthData = YearData.slice(-MonthDataAray.length + 1);

          var FiveDayData = YearData.slice(-6);

          var PriceData = [SinleDayData, FiveDayData, MonthData, YearData];

          var FormattedLaunchTime = await convertToISO(YearData[0].time);

          let data = new Share({
            Name: req.body.Name,
            Price: YearData[0].value,
            LaunchTime: FormattedLaunchTime,
            CategoryId: req.body.Parents,
            Investment: 0,
            PriceData: PriceData,
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
      if (
        req.body.UpdatedAmount !== undefined &&
        req.body.Name &&
        req.body.Time
      ) {
        await User.findOneAndUpdate(
          {
            Name: req.body.Name,
          },
          {
            Wallet: req.body.UpdatedAmount,
          }
        );

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
      if (
        req.body.ShareId &&
        req.body.Quantity &&
        req.body.UserId &&
        req.body.PurchaseType
      ) {
        var ShareExist = await Share.findOne({
          _id: req.body.ShareId,
        });

        if (ShareExist) {
          var UserExist = await User.findOne({
            _id: req.body.UserId,
            AccountType: "User",
          });

          if (!UserExist) {
            var a = { message: "User Not Exist", status: `${HTTP.NOT_FOUND}` };
            res.status(HTTP.NOT_FOUND).json(a);
          }

          let data = new PurchaseShare({
            User: new ObjectId(req.body.UserId),
            Share: new ObjectId(req.body.ShareId),
            CategoryId: new ObjectId(ShareExist.CategoryId),
            Quantity: req.body.Quantity,
            PurchsePrice: req.body.PurchsePrice,
            PurchaseType: req.body.PurchaseType,
          });

          await data.save();

          var a = {
            message: "Share Purchase Successfully",
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
        var UserAndShareExist = true;

        var ReferredBy;
        var ReferralCode;

        if (
          typeof req.body.SendingReferralCode === "string" &&
          req.body.SendingReferralCode.length === 48
        ) {
          const ExistingUserId = req.body.SendingReferralCode.substring(0, 24);
          const ExistingShareId = req.body.SendingReferralCode.substring(
            req.body.SendingReferralCode.length - 24
          );

          var UserExist = await User.findOne({
            _id: ExistingUserId,
          });

          var ShareExist = await Share.findOne({
            _id: ExistingShareId,
          });

          if (UserExist && ShareExist) {
            ReferredBy = UserExist._id;
            ReferralCode = ShareExist._id;
          } else {
            var AdminUser = await User.findOne({
              AccountType: "Admin",
            });

            ReferredBy = AdminUser._id;
            ReferralCode = AdminUser._id;

            UserAndShareExist = false;
          }
        } else {
          var UserExist = await User.findOne({
            AccountType: "Admin",
          });

          ReferredBy = UserExist._id;
          ReferralCode = UserExist._id;
        }

        var a = {
          message: "Referral Code Verified Successfully",
          ReferralCode: ReferralCode,
          ReferredBy: ReferredBy,
          UserAndShareExist: UserAndShareExist,
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
  static GetAllPurchaseShare = async (req, res) => {
    try {
      if (req.body.UserId) {
        var AllPurchaseShare = await PurchaseShare.find({
          User: req.body.UserId,
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
  static AllShare = async (req, res) => {
    try {
      var AllShare = await Share.find({
        Name: { $ne: "" },
      });

      var a = {
        data: AllShare,
        message: "Phuchase Share Capture Successfully",
        status: `${HTTP.SUCCESS}`,
      };
      res.status(HTTP.SUCCESS).json(a);
    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static GetShare = async (req, res) => {
    try {
      if (req.body._id) {
        var ShareData = await Share.find({
          _id: req.body._id,
        });

        var a = {
          data: ShareData,
          message: "Share Capture Successfully",
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
  static MToNx = async (req, res) => {
    try {

      if (
        req.body.Amount &&
        req.body.Status &&
        req.body.TransferId &&
        req.body.User
      ) {

        var IdExist = await NxRecord.findOne({
          TransferId: req.body.TransferId,
        });

        if (!IdExist) {
          let data = new NxRecord({
            Amount: req.body.Amount,
            Status: req.body.Status,
            TransferId: req.body.TransferId,
            User: req.body.User,
            IsChecked: "No",
          });

          data.save();

          var a = {
            message: "Request Add Successfully",
            status: `${HTTP.SUCCESS}`,
          };
          res.status(HTTP.SUCCESS).json(a);
        } else {
          var a = {
            message: "Id Already Use",
            code: `${HTTP.CONFLICT}`,
          };
          res.status(HTTP.CONFLICT).json(a);
        }

      } else {
        var a = { message: "Insufficient Data 2", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }

    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static NxAdminRecord = async (req, res) => {
    try {

      if (
        req.body.Amount &&
        req.body.TransferId
      ) {

        var IdExist = await NxAdminRecord.findOne({
          TransferId: req.body.TransferId,
        });

        if (!IdExist) {
          
          let data = new NxAdminRecord({
            Amount: req.body.Amount,
            TransferId: req.body.TransferId
          });

          data.save();

          var a = {
            message: "Request Add Successfully",
            status: `${HTTP.SUCCESS}`,
          };
          res.status(HTTP.SUCCESS).json(a);
        } else {
          var a = {
            message: "Id Already Use",
            code: `${HTTP.CONFLICT}`,
          };
          res.status(HTTP.CONFLICT).json(a);
        }

      } else {
        var a = { message: "Insufficient Data 2", status: `${HTTP.BAD_REQUEST}` };
        res.status(HTTP.BAD_REQUEST).json(a);
      }

    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static GetNxAdminRecord = async (req, res) => {
    try {

      var AllNxAdminRecord = await NxAdminRecord.find({
        IsVerified: "No",
      });

      var a = {
        data: AllNxAdminRecord,
        message: "Nx Admin record Capture Successfully",
        status: `${HTTP.SUCCESS}`,
      };
      res.status(HTTP.SUCCESS).json(a);

    } catch (e) {
      console.log(e);

      var a = { message: `${e}`, status: `${HTTP.INTERNAL_SERVER_ERROR}` };
      res.status(HTTP.INTERNAL_SERVER_ERROR).json(a);
    }
  };
  static GetNxRecord = async (req, res) => {
    try {

      if(req.body.User){

        var AllNxRecord = await NxRecord.find({
          User: req.body.User,
        });
  
        var a = {
          data: AllNxRecord,
          message: "Nx Admin record Capture Successfully",
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
  static UserSettlement = async (req, res) => {
    try {

      if (
        req.body.User && req.body.Amount 
      ) {

        var UserRecord = await NxRecord.find({
          IsChecked: "No",
          User: req.body.User,
          Status:"Deposit"
        });

        var ConditionCheck = true
        for(var i=0;i<UserRecord.length;i++){

          var FindQuery = {
            Amount : UserRecord[i].Amount,
            TransferId : UserRecord[i].TransferId,
            IsVerified: "No"
          }

          var AdminRecord = await NxAdminRecord.findOne(FindQuery);

          if(AdminRecord){

            AdminRecord.IsVerified = "Yes"
            AdminRecord.save();

            UserRecord[i].IsChecked = "Yes"

          }else{

            var AllTransferIdFind = await NxAdminRecord.findOne({
              TransferId : UserRecord[i].TransferId,
            });

            var TransferIdFind = await NxAdminRecord.findOne({
              TransferId : UserRecord[i].TransferId,
              IsVerified: "Yes"
            });

            if(!AllTransferIdFind){
              UserRecord[i].Note = "Wrong TransferId"
            }else if(TransferIdFind){
              UserRecord[i].Note = "TransferId Already Use"
            }else{
              UserRecord[i].Note = "Wrong Amount"
            }

            ConditionCheck = false

          }

          UserRecord[i].save();

        }

        if(ConditionCheck){
          
          let data = new Request({
            Amount: req.body.Amount,
            User: req.body.User
          });

          data.save();

        }

          var a = {
            ConditionCheck: ConditionCheck,
            message: "Request Add Successfully",
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
