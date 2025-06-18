import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server as SocketIOServer } from 'socket.io';
import app from "./app.js";
import mongoose from 'mongoose';
import ServiceRequest from './models/serviceRequest.model.js';
import Conversation from './models/conversation.model.js';
import Message from './models/message.model.js';
import Notification from './models/notification.model.js';
import User from './models/user.model.js';
import Repairer from './models/repairer.model.js';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`Socket.IO user connected: ${socket.id}`);

  socket.on('joinRoom', async (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation room: ${conversationId}`);

    try {
      const conversation = await Conversation.findById(conversationId).populate('serviceRequest');
      if (!conversation) {
        socket.emit('chatError', 'Conversation not found.');
        return;
      }

      const serviceRequest = conversation.serviceRequest;

      if (!serviceRequest || ['completed', 'cancelled', 'rejected'].includes(serviceRequest.status)) {
        const statusReason = serviceRequest ? `Job status is ${serviceRequest.status}.` : "Service Request not found or its status is invalid.";
        socket.emit('chatEnded', `Chat is no longer active for this job. ${statusReason}`);
        return;
      }

      const messages = await Message.find({ conversation: conversationId })
        .sort({ createdAt: 1 })
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
        return { ...msg, senderName };
      }));

      socket.emit('pastMessages', populatedMessages);

    } catch (error) {
      console.error('Error joining room or fetching past messages:', error);
      socket.emit('chatError', 'Failed to join chat or load messages due to server error.');
    }
  });

  socket.on('sendMessage', async ({ conversationId, senderId, senderModel, message }) => {
    try {
      const conversation = await Conversation.findById(conversationId).populate('serviceRequest');
      if (!conversation) {
        socket.emit('chatError', 'Conversation not found.');
        return;
      }

      const serviceRequest = conversation.serviceRequest;

      if (!serviceRequest || ['completed', 'cancelled', 'rejected'].includes(serviceRequest.status)) {
        const statusReason = serviceRequest ? `Job status is ${serviceRequest.status}.` : "Service Request not found.";
        socket.emit('chatEnded', `Chat is no longer active for this job. ${statusReason}`);
        return;
      }

      if (!conversation.participants.some(p => p.toString() === senderId.toString())) {
        socket.emit('chatError', 'You are not a participant in this conversation.');
        return;
      }

      let senderName;
      if (senderModel === 'User') {
        const userDoc = await User.findById(senderId).select('fullname');
        senderName = userDoc ? userDoc.fullname : 'Unknown User';
      } else if (senderModel === 'Repairer') {
        const repairerDoc = await Repairer.findById(senderId).select('fullname');
        senderName = repairerDoc ? repairerDoc.fullname : 'Unknown Repairer';
      } else {
        senderName = 'System';
      }

      const receiverId = conversation.participants.find(p => p.toString() !== senderId.toString());
      const receiverModelIndex = conversation.participants.findIndex(p => p.toString() === receiverId?.toString());
      const receiverModel = receiverModelIndex !== -1 ? conversation.participantModels[receiverModelIndex] : null;

      if (!receiverId || !receiverModel) {
        console.error("Could not determine receiver for conversation:", conversationId);
        socket.emit('chatError', 'Failed to send message: receiver not found.');
        return;
      }

      const newMessage = new Message({
        conversation: conversationId,
        serviceId: serviceRequest._id,
        senderId,
        senderModel,
        receiverId,
        receiverModel,
        text: message,
      });
      await newMessage.save();

      conversation.lastMessage = newMessage._id;
      conversation.updatedAt = new Date();
      await conversation.save();

      io.to(conversationId).emit('receiveMessage', {
        _id: newMessage._id,
        conversation: newMessage.conversation,
        serviceId: newMessage.serviceId,
        senderId: newMessage.senderId,
        senderModel: newMessage.senderModel,
        senderName: senderName,
        message: newMessage.text,
        timestamp: newMessage.createdAt,
      });

      await Notification.create({
        recipient: receiverId,
        recipientModel: receiverModel,
        type: 'new_message',
        message: `New message from ${senderName} regarding job "${serviceRequest.title}"`,
        link: `/${receiverModel.toLowerCase()}/messages/${conversationId}`,
        relatedEntity: { id: newMessage._id, model: 'Message' }
      });

    } catch (error) {
      console.error('Error saving or emitting message:', error);
      socket.emit('chatError', `Failed to send message: ${error.message || 'Server error'}`);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket.IO user disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
