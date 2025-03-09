var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

const HTTP = require("../../constant/response.constant");

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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

var Share = mongoose.model('Share', ShareSchema);

const PurchaseShareSchema = new mongoose.Schema({
  User: { type: mongoose.Schema.Types.ObjectId, required: true },
  Share: { type: mongoose.Schema.Types.ObjectId, required: true },
  Quantity: { type: Number, required: true },
  PurchsePrice: { type: Number, required: true },
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
  }).then(CreatedUser => {
        
    //  Create Like Software & Programming  Sector Inside Tata Consultancy Services ( Price 3,812.40 ) , Infosys ( Price 1,832.80 ) ... Etc 
    Share.create({ 
      _id:CreatedCategory._id, 
      Name: "", 
      Price: 0, 
      CategoryId: CreatedUser._id
    }).then(CreatedShare => { console.log('Default Data Create') 
    }); 

  })

}).catch(err => console.error('Default Data Already Exist'));

module.exports = { User , PurchaseShare , Share , Category };