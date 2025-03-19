var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

const HTTP = require("../../constant/response.constant");
var { generate1Day , Get1M , get1Y , getNextWorkingDay } = require('../Function/Function');

const UserSchema = new mongoose.Schema({
  Name: { type: String, required: true, unique: true },
  Phone: { type: String, required: true },
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  Wallet: { type: Number, required: true },  
  AccountActivationCode: { type: String, required: true},
  AccountType: { type: String, default: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", async function (next) {

  var IsExistUser = await mongoose.model("User").findOne({ Name: this.Name  });
  if(IsExistUser){
    return next({
      message : "User Already Exist",
      status: `${HTTP.CONFLICT}`
    });
  }

  if(this.AccountType == "User"){

      const AdminUser = await mongoose.model("User").findOne({ AccountType: "Admin" });

      var DefaultReferralCode = AdminUser._id.toString() + AdminUser._id.toString();

      if (this.AccountActivationCode !== DefaultReferralCode) {
  
        const existingUser = await mongoose.model("User").findOne({ AccountActivationCode: this.AccountActivationCode });
        if (existingUser) {
          return next({
            message : "Referral Code Expired",
            status: `${HTTP.Expired}`
          });
        }

      }
    
  }

  if (!this.isModified("Password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (err) {
    next(err);
  }

});

var User = mongoose.model('User', UserSchema);

const ShareSchema = new mongoose.Schema({
  Name: { type: String , unique: true},
  Price: { type: Number, required: true },
  CategoryId : { type: mongoose.Schema.Types.ObjectId, required: true },
  LaunchTime: { type: Date,default: Date.now, required: true },
  Investment: { type: Number, required: true,default: 0 },
  PriceData : { type: Array, required: true,default: []  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

var Share = mongoose.model('Share', ShareSchema);

const PurchaseShareSchema = new mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, required: true },
  Share: { type: mongoose.Schema.Types.ObjectId, required: true },
  CategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
  Quantity: { type: Number, required: true },
  PurchsePrice: { type: Number, required: true },
  PurchaseType : { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

var PurchaseShare = mongoose.model('PurchaseShare', PurchaseShareSchema);

const CategorySchema = new mongoose.Schema({
  Type: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

var Category = mongoose.model('Category', CategorySchema);

const NxRecordSchema = new mongoose.Schema({
  Amount: { type: Number, required: true },
  Status: { type: String, required: true },
  TransferId: { type: String, required: true, unique: true },
  User: { type: mongoose.Schema.Types.ObjectId, required: true },
  IsChecked: { type: String, default: "No", required: true },
  Note: { type: String, default: ""  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

var NxRecord = mongoose.model('NxRecord', NxRecordSchema);

const NxAdminRecordSchema = new mongoose.Schema({
  Amount: { type: Number, required: true },
  TransferId: { type: String, required: true, unique: true },
  IsVerified: { type: String, required: true, default: "No" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

var NxAdminRecord = mongoose.model('NxAdminRecord', NxAdminRecordSchema);

const RequestSchema = new mongoose.Schema({
  Amount: { type: Number, required: true },
  User: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

var Request = mongoose.model('Request', RequestSchema);

Category.create({ 
  Type:"Reject"
}).then(CreatedCategory => {

  // Multiple Category Are Possible Like Oil & Gas Operations , Software & Programming ... Etc
  User.create({
    _id:CreatedCategory._id,  
    Name: 'Jay', 
    Phone: '9106871899', 
    Email: 'Jay@Gmail.com', 
    Password: "Jay@123", 
    Wallet:0,
    AccountActivationCode: CreatedCategory._id + CreatedCategory._id, 
    AccountType: 'Admin'
  }).then(async (CreatedUser) => {
        
    //  Create Like Software & Programming  Sector Inside Tata Consultancy Services ( Price 3,812.40 ) , Infosys ( Price 1,832.80 ) ... Etc 

    let today = new Date(); // Current date
    let nextWorkingDay = getNextWorkingDay(today).toLocaleDateString("en-GB");

    var YearData = await get1Y(0);
    await YearData.push({time:nextWorkingDay,value:0});

    var MonthDataArray = await Get1M(0);
    var MonthData = YearData.slice(-MonthDataArray.length + 1);

    var FiveDayData = YearData.slice(-6);
    
    var SinleDayData = await generate1Day(0);

    var PriceData = [SinleDayData,FiveDayData,MonthData,YearData]

    var LunchingTime = YearData[0].time.split('/');

    let Day = Number(LunchingTime[0]) >= 10 ? LunchingTime[0] : `0${LunchingTime[0]}`;
    let Month = Number(LunchingTime[1]) >= 10 ? LunchingTime[1] : `0${LunchingTime[1]}`;

    let ITime = `${LunchingTime[2]}-${Month}-${Day}T00:00:00.000+00:00`;

    Share.create({ 
      _id:CreatedCategory._id, 
      Name: "", 
      Price: 0, 
      CategoryId: CreatedUser._id,
      LaunchTime: ITime,
      Investment:0,
      PriceData:PriceData
    }).then(CreatedShare => { console.log('Default Data Create') 
    }); 

  })

}).catch(err => console.error('Default Data Already Exist'));

module.exports = { User , PurchaseShare , Share , Category , NxRecord , NxAdminRecord , Request };