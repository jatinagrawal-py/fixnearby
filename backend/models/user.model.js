//backend/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
      location: [
        {
        address: { type: String },
        pincode: {
            type: String,
            required: true,
            validate: {
                validator: function(v) {
                    return /^\d{6}$/.test(v);
                },
                message: 'Pincode must be a 6-digit number'
            }
        },
      }
      ],
    role: {
      type: String,
      default: 'user'
    },
},{ timestamps: true }
)

const User = mongoose.model("User", userSchema);

export default User;