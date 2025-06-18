// backend/controllers/repairer.controller.js
import Repairer from "../models/repairer.model.js";
import BlacklistToken from "../models/blacklistToken.model.js";
import Otp from "../models/otp.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../libs/utils.js";
import ServiceRequest from "../models/serviceRequest.model.js";
import Conversation from "../models/conversation.model.js"; 
import Message from "../models/message.model.js";     
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js"; 
import { sendSignupOTP, serviceAccepted } from "./sendsms.js";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const getOtp = async (req, res) => { 
  const {
    phone
  } = req.body;
  console.log("Received phone for OTP:", phone);
  if (!phone) return res.status(400).json({
    message: "phone number is required"
  });
  const user = await Repairer.findOne({
    phone
  });
  if (user) return res.status(400).json({
    message: "Repairer with this phone number already exists"
  });
  const otp_generated = generateOTP();
  try {
    await Otp.findOneAndUpdate({
      phone
    }, {
      phone,
      otp: otp_generated,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    }, {
      upsert: true,
      new: true
    });
    const status = await sendSignupOTP(phone, otp_generated);
    console.log("otp sent status:", status);
    if (!status) {
      return res.status(500).json({
        message: "Failed to send OTP"
      });
    }
    return res.status(200).json({
      message: "OTP sent to phone"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};

export const verifyOtp = async (req, res) => {
  const {
    phone,
    otp
  } = req.body;
  if (!phone || !otp) return res.status(400).json({
    message: "phone number and OTP are required"
  });
  try {
    const record = await Otp.findOne({
      phone
    });
    if (!record) return res.status(400).json({
      message: "No OTP found for this phone number"
    });
    if (record.otp !== otp) return res.status(400).json({
      message: "Invalid verification code."
    });
    if (record.expiresAt < new Date()) return res.status(400).json({
      message: "OTP expired. Please request a new one."
    });
    await Otp.deleteOne({
      phone
    });
    return res.status(200).json({
      message: "OTP verified successfully"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "OTP verification failed"
    });
  }
};

export const signup = async (req, res) => { 
  console.log('Received signup data on backend:', req.body);
  const {
    fullname,
    upiId,
    password,
    aadharcardNumber,
    phone,
    services,
    pincode,
  } = req.body;
  try {
    if (!fullname  || !password || !aadharcardNumber || !phone || !services || !pincode || !upiId) {
      return res.status(400).json({
        message: "All required fields must be filled"
      });
    }
    const existingRepairer = await Repairer.findOne({
      phone
    });
    if (existingRepairer) {
      return res.status(400).json({
        message: "Repairer with this phone number already exists"
      });
    }
    let serviceArray = [];
    if (Array.isArray(services)) {
      serviceArray = services;
    } else if (typeof services === 'string') {
      serviceArray = [{
        name: services,
        visitingCharge: 0
      }];
    } else {
      return res.status(400).json({
        message: "Invalid services format"
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newRepairer = new Repairer({
      fullname,
      password: hashedPassword,
      aadharcardNumber,
      phone,
      upiId,
      services: serviceArray,
      pincode,
    });
    await newRepairer.save();
    generateToken(newRepairer._id, "repairer", res);
    res.status(201).json({
      _id: newRepairer._id,
      fullname: newRepairer.fullname,
      services: newRepairer.services,
      message: "Repairer account created successfully!",
    });
  } catch (error) {
    console.error("Error in signupRepairer controller:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        message: `Validation Error: ${messages.join(', ')}`
      });
    }
    res.status(500).json({
      message: "Internal Server Error during signup. Please try again."
    });
  }
};

export const login = async (req, res) => {
  const {
    phone,
    password
  } = req.body;
  try {
    const repairer = await Repairer.findOne({
      phone
    }).select("+password");
    if (!repairer) return res.status(400).json({
      message: "Invalid credentials"
    });
    const isMatch = await bcrypt.compare(password, repairer.password);
    console.log(isMatch)
    if (!isMatch) return res.status(400).json({
      message: "Invalid credentials"
    });

    generateToken(repairer._id, "repairer", res);

    res.status(200).json({
      _id: repairer._id,
      fullname: repairer.fullname,
      phone: repairer.phone,
      role: "repairer",
    });
  } catch (error) {
    console.error("Error in login controller", error.message);
    res.status(500).json({
      message: "Internal Server Error"
    });
  }
};


export const logout = async (req, res) => { 
  try {
    const token = req.cookies?.jwt;
    if (!token) return res.status(400).json({
      message: "No token found in cookies"
    });
    await BlacklistToken.create({
      token
    });
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
    });
    res.status(200).json({
      message: "Logout successful"
    });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      message: "Server error during logout"
    });
  }
};


export const getDashboardStats = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({
      message: "Unauthorized: Repairer ID not found."
    });
  }

  try {
    const jobsCompletedCount = await ServiceRequest.countDocuments({
      repairer: repairerId,
      status: 'completed'
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const earningsThisMonthResult = await ServiceRequest.aggregate([{
      $match: {
        repairer: repairerId,
        status: 'completed',
        completedAt: {
          $gte: startOfMonth
        },
        estimatedPrice: {
          $exists: true,
          $ne: null,
          $type: "number"
        }
      }
    }, {
      $group: {
        _id: null,
        totalEarnings: {
          $sum: "$estimatedPrice"
        }
      }
    }, ]);
    const earningsThisMonth = earningsThisMonthResult.length > 0 ? earningsThisMonthResult[0].totalEarnings : 0;

    const averageRatingResult = await ServiceRequest.aggregate([{
      $match: {
        repairer: repairerId,
        status: 'completed',
        "rating.stars": {
          $exists: true,
          $ne: null
        }
      }
    }, {
      $group: {
        _id: null,
        avgRating: {
          $avg: "$rating.stars"
        }
      }
    }, ]);
    const averageRating = averageRatingResult.length > 0 ? parseFloat(averageRatingResult[0].avgRating.toFixed(1)) : 0.0;

    const activeJobsCount = await ServiceRequest.countDocuments({
      repairer: repairerId,
      status: {
        $in: ['in_progress', 'accepted', 'quoted', 'pending_quote']
      }
    });
    const stats = {
      jobsCompleted: jobsCompletedCount,
      jobsCompletedChange: "N/A",
      earningsThisMonth: earningsThisMonth,
      earningsChange: "N/A",
      averageRating: averageRating,
      ratingChange: "N/A",
      activeJobs: activeJobsCount,
      activeJobsChange: "N/A"
    };
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats."
    });
  }
};


export const getRecentActivity = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({
      message: "Unauthorized: Repairer ID not found."
    });
  }

  try {
    const recentServiceRequests = await ServiceRequest.find({
        repairer: repairerId
      })
      .sort({
        updatedAt: -1
      })
      .limit(5)
      .populate('customer', 'fullname')
      .lean();

    const activity = recentServiceRequests.map(sr => {
      let message = "";
      let type = "";
      let amount = null;

      const diffMs = new Date() - sr.updatedAt;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = '';
      if (diffMins < 60) {
        timeAgo = `${diffMins} mins ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hours ago`;
      } else {
        timeAgo = `${diffDays} days ago`;
      }

      if (sr.status === 'completed') {
        type = "completed";
        message = `Completed ${sr.title} for ${sr.customer?.fullname || 'Unknown Customer'}`;
        amount = sr.estimatedPrice ? `$${sr.estimatedPrice}` : null;
      } else if (sr.status === 'in_progress' || sr.status === 'accepted' || sr.status === 'quoted') {
        type = "accepted";
        message = `Working on: ${sr.title} for ${sr.customer?.fullname || 'Unknown Customer'}`;
      } else if (sr.status === 'requested') {
        type = "new_request";
        message = `New request assigned: ${sr.title} from ${sr.customer?.fullname || 'Unknown Customer'}`;
      } else if (sr.status === 'cancelled') {
        type = "cancelled";
        message = `Job cancelled: ${sr.title} by ${sr.customer?.fullname || 'Unknown Customer'}`;
      }


      return {
        type,
        message,
        time: timeAgo,
        amount
      };
    });

    res.status(200).json(activity);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      message: "Failed to fetch recent activity."
    });
  }
};


export const getNearbyJobs = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({
      message: "Unauthorized: Repairer ID not found."
    });
  }

  try {
    const repairer = await Repairer.findById(repairerId);
    if (!repairer) {
      return res.status(404).json({
        message: "Repairer not found."
      });
    }

    const repairerServices = repairer.services.map(s => s.name);
    const repairerPincode = repairer.pincode;
    const serviceRadius = repairer.preferences.serviceRadius || 25;

    console.log(repairerServices)

    const pincodePrefix = repairerPincode.toString().slice(0, 4);

    const nearbyServiceRequests = await ServiceRequest.find({
        status: 'requested',
        repairer: {
          $eq: null
        },
        serviceType: {
          $in: repairerServices
        },
        "location.pincode": {
          $regex: `^${pincodePrefix}`
        }
      })
      .populate('customer', 'fullname')
      .sort({
        createdAt: 1
      })
      .limit(10)
      .lean();


    const formattedJobs = nearbyServiceRequests.map(sr => ({
      id: sr._id.toString(),
      title: sr.title,
      category: sr.serviceType,
      quotation: sr.quotation,
      issue: sr.issue,
      date: sr.preferredTimeSlot.date,
      time: sr.preferredTimeSlot.time,
      location: sr.location?.address || "Unknown Location",
      pincode: sr.location?.pincode,
      price: sr.estimatedPrice ? `$${sr.estimatedPrice}` : sr.quotation || "Negotiable", // Changed from priceRange to quotation
      urgency: sr.urgency || "medium",
      postedTime: sr.createdAt ? `${Math.floor((new Date() - sr.createdAt) / (1000 * 60))} mins ago` : "N/A",
      description: sr.description,
      customerName: sr.customer?.fullname || 'Unknown Customer',
      customerRating: sr.rating?.stars || 0.0,
      estimatedDuration: "Varies",
      icon: sr.serviceType === "plumbing" ? "Droplets" : sr.serviceType === "electrical" ? "Zap" : sr.serviceType === "carpentry" ? "Hammer" : "Wrench",
      color: sr.serviceType === "plumbing" ? "from-blue-400 to-cyan-500" : sr.serviceType === "electrical" ? "from-yellow-400 to-orange-500" : "from-gray-400 to-gray-500",
      tags: [],
    }));

    res.status(200).json(formattedJobs);
  } catch (error) {
    console.error("Error fetching nearby jobs:", error);
    res.status(500).json({
      message: "Failed to fetch nearby jobs."
    });
  }
};


export const acceptJob = async (req, res) => {
  const {
    jobId
  } = req.params;
  const repairerId = req.repairer?._id;

  if (!jobId || !repairerId) {
    return res.status(400).json({
      message: "Job ID and Repairer ID are required."
    });
  }

  try {
    const serviceRequest = await ServiceRequest.findById(jobId);

    if (!serviceRequest) {
      return res.status(404).json({
        message: "Service Request not found."
      });
    }

    if (serviceRequest.status !== 'requested' || serviceRequest.repairer !== null) {
      return res.status(400).json({
        message: "Service Request is not available for acceptance or already assigned."
      });
    }

    serviceRequest.repairer = repairerId;
    serviceRequest.status = 'accepted';
    serviceRequest.assignedAt = new Date();

    const rep  = await Repairer.findById(repairerId)
    const cus = await User.findById(serviceRequest.customer)
    const name = rep.fullname
    const number = rep.phone
    const usernumber = serviceRequest.contactInfo;
    const username = cus.fullname
    const issue = serviceRequest.issue

    const hehe = await serviceAccepted(usernumber,username,number,name,issue);
    
    console.log(hehe)
    if (hehe===false) {
      return res.status(400).json({
        message: "Failed to send Accepted SMS"
      });
    }


    await serviceRequest.save();

   const conversation = await Conversation.findOneAndUpdate(
        { serviceRequest: jobId }, 
        {
            $addToSet: {
                participants: [repairerId, serviceRequest.customer],
                participantModels: ["Repairer", "User"]
            }
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    const messageCount = await Message.countDocuments({
      conversation: conversation._id
    });
    if (messageCount === 0) {
      const initialMessage = new Message({
        conversation: conversation._id,
        serviceId: serviceRequest._id,
        senderId: repairerId,
        senderModel: 'Repairer',
        receiverId: serviceRequest.customer,
        receiverModel: 'User',
        text: `Hello! I've accepted your request for "${serviceRequest.title}". Let me know if you have any questions.`,
      });
      await initialMessage.save();
      conversation.lastMessage = initialMessage._id;
      await conversation.save(); 
    }


    await Notification.create({
      recipient: serviceRequest.customer,
      recipientModel: 'User',
      type: 'job_accepted',
      message: `Your service request "${serviceRequest.title}" has been accepted by a repairer! Chat with them now.`,
      link: `/user/messages/${conversation._id}`, 
      relatedEntity: {
        id: jobId,
        model: 'ServiceRequest'
      }
    });
      res.status(200).json({
      message: `Service Request ${jobId} accepted successfully!`,
      serviceRequest,
      conversationId: conversation._id 
    });
  } catch (error) {
    console.error("Error accepting service request:", error);
    res.status(500).json({
      message: "Failed to accept service request."
    });
  }
};


export const getRepairerProfile = async (req, res) => {
  const repairerId = req.repairer?._id;
  if (!repairerId) {
    return res.status(401).json({
      message: "Unauthorized: Repairer ID not found."
    });
  }
  try {
    const repairer = await Repairer.findById(repairerId).select("-password");
    if (!repairer) {
      return res.status(404).json({
        message: "Repairer not found."
      });
    }
    res.status(200).json(repairer);
  } catch (error) {
    console.error("Error fetching repairer profile:", error);
    res.status(500).json({
      message: "Failed to fetch repairer profile."
    });
  }
};

export const updateRepairerProfile = async (req, res) => {
    const repairerId = req.repairer._id; 
    const { 
        fullname, 
        phone, 
        pincode, 
        bio, 
        experience, 
        profileImageUrl, 
        services,
        upiId 
    } = req.body;

    try {
        const repairer = await Repairer.findById(repairerId);

        if (!repairer) {
            return res.status(404).json({ message: "Repairer not found." });
        }

        repairer.fullname = fullname !== undefined ? fullname : repairer.fullname;
        repairer.phone = phone !== undefined ? phone : repairer.phone;
        repairer.pincode = pincode !== undefined ? pincode : repairer.pincode;
        repairer.bio = bio !== undefined ? bio : repairer.bio;
        repairer.experience = experience !== undefined ? experience : repairer.experience;
        repairer.profileImageUrl = profileImageUrl !== undefined ? profileImageUrl : repairer.profileImageUrl;
        
        repairer.upiId = upiId !== undefined ? upiId : repairer.upiId;


        if (services && Array.isArray(services)) {
          
            const validServices = services.filter(s => s.name && s.name.trim() !== '' && s.visitingCharge !== undefined && s.visitingCharge >= 0);
            repairer.services = validServices;
        }

        await repairer.save();
        const updatedRepairer = await Repairer.findById(repairerId).select('-password -aadharcardNumber'); 

        res.status(200).json({
            message: "Profile updated successfully!",
            repairer: updatedRepairer
        });

    } catch (error) {
        console.error("Error updating repairer profile:", error);
        if (error.code === 11000) {
            let field = Object.keys(error.keyValue)[0];
            let value = error.keyValue[field];
            return res.status(400).json({ message: `A repairer with that ${field} '${value}' already exists.` });
        }
        res.status(500).json({ message: "Failed to update profile. " + error.message });
    }
};

export const createRepairerConversation = async (req, res) => {
    const { serviceRequestId } = req.body;
    const repairerId = req.repairer?._id;

    if (!serviceRequestId || !repairerId) {
        return res.status(400).json({ message: "Service Request ID and Repairer ID are required." });
    }

    try {
        const serviceRequest = await ServiceRequest.findById(serviceRequestId).populate('customer').populate('repairer').lean();

        if (!serviceRequest) {
            return res.status(404).json({ message: "Service Request not found." });
        }

        if (!serviceRequest.repairer) {
            return res.status(403).json({ message: "Service request is not yet assigned to a repairer." });
        }

        if (serviceRequest.repairer._id.toString() !== repairerId.toString()) {
             return res.status(403).json({ message: "You are not the assigned repairer for this service request." });
        }

        const customerId = serviceRequest.customer?._id;

        if (!customerId) {
            return res.status(400).json({ message: "Customer ID not found for this service request." });
        }

        let conversation = await Conversation.findOne({ serviceRequest: serviceRequestId });

        if (conversation) {
            return res.status(200).json({
                message: "Conversation already exists.",
                conversationId: conversation._id
            });
        }

        conversation = new Conversation({
            participants: [repairerId, customerId],
            participantModels: ["Repairer", "User"],
            serviceRequest: serviceRequestId,
        });

        await conversation.save();

        // --- Start of Automatic Message Logic (UPDATED FIELD NAMES) ---
        const initialMessage = new Message({
            conversation: conversation._id,
            serviceId: serviceRequest._id,
            senderId: repairerId, // Changed to senderId
            senderModel: 'Repairer',
            receiverId: customerId, // Changed to receiverId
            receiverModel: 'User',
            text: `Hello from your assigned repairer! I'm ready to discuss your ${serviceRequest.serviceType} service.`,
        });

        await initialMessage.save();

        conversation.lastMessage = initialMessage._id;
        await conversation.save();
        // --- End of Automatic Message Logic ---

        res.status(201).json({
            message: "Conversation created successfully.",
            conversationId: conversation._id
        });

    } catch (error) {
        console.error("Error creating repairer conversation:", error);
        res.status(500).json({ message: "Failed to create conversation." });
    }
};

export const updateRepairerSettings = async (req, res) => {
  const repairerId = req.repairer?._id;
  const {
    emailNotifications,
    smsNotifications,
    serviceRadius
  } = req.body;

  if (!repairerId) {
    return res.status(401).json({
      message: "Unauthorized: Repairer ID not found."
    });
  }

  try {
    const repairer = await Repairer.findById(repairerId);
    if (!repairer) {
      return res.status(404).json({
        message: "Repairer not found."
      });
    }

    if (repairer.preferences === undefined) {
      repairer.preferences = {};
    }
    if (emailNotifications !== undefined) repairer.preferences.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) repairer.preferences.smsNotifications = smsNotifications;
    if (serviceRadius !== undefined) repairer.preferences.serviceRadius = serviceRadius;

    await repairer.save();

    res.status(200).json({
      message: "Settings updated successfully!",
      preferences: repairer.preferences
    });
  } catch (error) {
    console.error("Error updating repairer settings:", error);
    res.status(500).json({
      message: "Failed to update repairer settings."
    });
  }
};
export const getRepairerAnalytics = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({
      message: "Unauthorized: Repairer ID not found."
    });
  }

  try {
    const jobsCompleted = await ServiceRequest.countDocuments({
      repairer: repairerId,
      status: 'completed'
    });
    const totalEarningsResult = await ServiceRequest.aggregate([{
      $match: {
        repairer: repairerId,
        status: 'completed',
        estimatedPrice: {
          $exists: true,
          $ne: null,
          $type: "number"
        }
      }
    }, {
      $group: {
        _id: null,
        total: {
          $sum: "$estimatedPrice"
        }
      }
    }, ]);
    const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0;
    const monthlyEarnings = [];
    const currentMonth = new Date();
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i + 1, 0);

      const earningsInMonthResult = await ServiceRequest.aggregate([{
        $match: {
          repairer: repairerId,
          status: 'completed',
          completedAt: {
            $gte: monthStart,
            $lte: monthEnd
          },
          estimatedPrice: {
            $exists: true,
            $ne: null,
            $type: "number"
          }
        }
      }, {
        $group: {
          _id: null,
          total: {
            $sum: "$estimatedPrice"
          }
        }
      }, ]);
      monthlyEarnings.unshift(earningsInMonthResult.length > 0 ? earningsInMonthResult[0].total : 0);
    }

    const topServices = await ServiceRequest.aggregate([{
      $match: {
        repairer: repairerId,
        status: 'completed'
      }
    }, {
      $group: {
        _id: "$serviceType",
        count: {
          $sum: 1
        }
      }
    }, {
      $sort: {
        count: -1
      }
    }, {
      $limit: 3
    }, ]);

    res.status(200).json({
      jobsCompleted,
      totalEarnings,
      monthlyEarnings,
      topServices,
    });

  } catch (error) {
    console.error("Error fetching repairer analytics:", error);
    res.status(500).json({
      message: "Failed to fetch repairer analytics."
    });
  }
};
export const getRepairerConversations = async (req, res) => {
    const repairerId = req.repairer._id; 

    try {
        const conversations = await Conversation.find({ participants: repairerId })
            .populate({
                path: 'serviceRequest',
                select: 'title customer status', 
                populate: {
                    path: 'customer',
                    select: 'fullname' 
                }
            })
            .populate({
                path: 'lastMessage',
                select: 'text createdAt senderId' 
            })
            .sort({ updatedAt: -1 })
            .lean(); 
        const activeConversations = conversations.filter(conv => {
       
            return conv.serviceRequest &&
                   conv.serviceRequest.status !== 'completed' &&
                   conv.serviceRequest.status !== 'cancelled' &&
                   conv.serviceRequest.status !== 'rejected'; 
        });
        const formattedConversations = activeConversations.map(conv => {
            const customerParticipant = conv.serviceRequest?.customer;
            const otherParticipantName = customerParticipant?.fullname || `Customer (ID: ${conv.serviceRequest?.customer?._id?.toString().substring(0, 4)})`;

            const isChatActive = !['completed', 'cancelled', 'rejected'].includes(conv.serviceRequest?.status);


            return {
                id: conv._id.toString(),
                serviceId: conv.serviceRequest?._id.toString(),
                title: conv.serviceRequest?.title || 'Unknown Service Request',
                sender: otherParticipantName, 
                lastMessage: conv.lastMessage?.text || 'No messages yet.',
                time: conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '',
                unread: false, 
                isActive: isChatActive 
            };
        });

        res.status(200).json(formattedConversations);

    } catch (error) {
        console.error("Error fetching repairer conversations:", error);
        res.status(500).json({ message: "Failed to retrieve conversations." });
    }
};

export const getConversationMessages = async (req, res) => {
  const {
    conversationId
  } = req.params; 
  const repairerId = req.repairer?._id;

  if (!conversationId || !repairerId) {
    return res.status(400).json({
      message: "Conversation ID and Repairer ID are required."
    });
  }

  try {
    const conversation = await Conversation.findById(conversationId).populate('serviceRequest', 'status'); // Populate serviceRequest for status check

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found."
      });
    }

    if (!conversation.participants.some(p => p.toString() === repairerId.toString())) { 
      return res.status(403).json({
        message: "You are not a participant in this conversation."
      });
    }

    // Check if chat is allowed for this job status
    const serviceRequest = conversation.serviceRequest;
    if (!serviceRequest || ['completed', 'cancelled', 'rejected'].includes(serviceRequest.status)) {
      return res.status(200).json({
        conversationId: conversation._id,
        messages: [], // Return empty messages if chat is inactive
        chatEnded: true,
        chatEndedReason: `Chat is no longer active for this job. Job status is ${serviceRequest?.status || 'unknown'}.`
      });
    }

    const messages = await Message.find({
        conversation: conversation._id
      })
      .sort({
        createdAt: 1
      })
      .lean();

    const populatedMessages = await Promise.all(messages.map(async (msg) => {
      let senderName = "Unknown";
      if (msg.senderModel === "Repairer") {
        const sender = await Repairer.findById(msg.senderId).select('fullname').lean();
        senderName = sender?.fullname || "Repairer";
      } else if (msg.senderModel === "User") {
        const sender = await User.findById(msg.senderId).select('fullname').lean();
        senderName = sender?.fullname || "Customer";
      }
      return { ...msg,
        senderName
      };
    }));

    res.status(200).json({
      conversationId: conversation._id,
      messages: populatedMessages,
      chatEnded: false // Indicate chat is active
    });

  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).json({
      message: "Failed to fetch messages for conversation."
    });
  }
};

export const getRepairerNotifications = async (req, res) => {
  const repairerId = req.repairer?._id;

  if (!repairerId) {
    return res.status(401).json({
      message: "Unauthorized: Repairer ID not found."
    });
  }

  try {
    const notifications = await Notification.find({
        recipient: repairerId,
        recipientModel: 'Repairer'
      })
      .sort({
        createdAt: -1
      })
      .limit(20)
      .lean();

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching repairer notifications:", error);
    res.status(500).json({
      message: "Failed to fetch notifications."
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const {
    notificationId
  } = req.params;
  const repairerId = req.repairer?._id;

  if (!notificationId || !repairerId) {
    return res.status(400).json({
      message: "Notification ID and Repairer ID are required."
    });
  }

  try {
    const notification = await Notification.findOneAndUpdate({
      _id: notificationId,
      recipient: repairerId,
      recipientModel: 'Repairer'
    }, {
      read: true
    }, {
      new: true
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found or you are not the recipient."
      });
    }

    res.status(200).json({
      message: "Notification marked as read.",
      notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      message: "Failed to mark notification as read."
    });
  }
};