import mongoose from "mongoose";

const acceptOtpSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
    },
   otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 60 * 1000), 
  },
  },
  { timestamps: true }
);

acceptOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AcceptOtp = mongoose.model("AcceptOtp", acceptOtpSchema);

export default AcceptOtp;