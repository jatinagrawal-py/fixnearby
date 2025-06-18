import mongoose from "mongoose";

const repairerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, 
    },
    upiId:{
      type: String,
      required: true,
      unique: true,
      match : [ /^[\w.-]{2,256}@[a-zA-Z]{3,64}$/ , 'Please enter a valid UPI ID']
    },
    aadharcardNumber: {
      type: String,
      required: true,
      unique: true,
      minlength: 12,
      maxlength: 12,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      minlength: 10,
      maxlength: 10,
    },
    services: [
      {
        name: {
          type: String,
          required: true,
        },
        visitingCharge: {
          type: Number,
          default: 0,
        },
      },
    ],
    pincode: {
      type: String,
      required: true,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    redflag:{
      type:Number,
      default:0,
    },

   isbanned:{
    type:Boolean,
    default:false,
   },
   
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "No biography provided yet. Update your profile!"
    },
    experience: { // In years
      type: Number,
      min: 0,
      default: 0
    },
    profileImageUrl: {
      type: String,
      default: "https://res.cloudinary.com/dvfcp4eqz/image/upload/v1717325603/profile_pictures/user_wqx0pr.png" // Default placeholder image
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: false
      },
      serviceRadius: {
        type: Number,
        default: 25,
        min: 5,
        max: 200
      }
    }
  },
  { timestamps: true }
);

const Repairer = mongoose.model("Repairer", repairerSchema);

export default Repairer;