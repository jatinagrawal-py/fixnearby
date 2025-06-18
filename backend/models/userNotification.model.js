import mongoose from "mongoose";

const userNotificationSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "new_job_request_status", 
        "payment_update",
        "new_message",
        "rating_received",
        "system_update",
        "quote_provided",
        "visit_scheduled",
        "reminder",
        "job_accepted",
        "quote_accepted",
        "quote_rejected",
        "repairer_assigned"
      ],
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: { 
      type: String,
    },
    relatedEntity: { 
      id: { type: mongoose.Schema.Types.ObjectId },
      model: { type: String, enum: ["ServiceRequest", "Message", "User", "Repairer"] }
    }
  },
  { timestamps: true }
);

const UserNotification = mongoose.model("UserNotification", userNotificationSchema);

export default UserNotification;
