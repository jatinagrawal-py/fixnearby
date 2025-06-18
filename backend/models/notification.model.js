import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
      required: true,
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["User", "Repairer", "Admin"], 
    },
    type: {
      type: String,
      required: true,
      enum: [
        "new_job_request",
        "job_accepted",
        "job_in_progress",
        "job_completed",
        "job_cancelled",
        "new_message",
        "rating_received",
        "system_update",
        "payment_received",
        "quote_provided",
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

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;