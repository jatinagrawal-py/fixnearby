// backend/routes/serviceRequest.routes.js 
import express from "express";
import {
    createServiceRequest,
    getServiceRequestsByLocation,       
    getUserServiceRequests,            
    updateServiceRequestStatusByCustomer, 
    updateServiceRequestStatusByRepairer,
    acceptQuote,rejectQuote,
    submitRepairerQuote,getAssignedJobs,completeJob,
    PendingOtp
} from "../controllers/serviceRequest.controller.js";
import { userProtectRoute, repairerProtectRoute } from "../middleware/middleware.js"; 

const router = express.Router();

router.post("/", userProtectRoute, createServiceRequest);

router.get("/by-location", repairerProtectRoute, getServiceRequestsByLocation);


router.get("/user/my-requests", userProtectRoute, getUserServiceRequests); 

router.put("/user/:id/status", userProtectRoute, updateServiceRequestStatusByCustomer);

router.get("/repairer/my-requests", repairerProtectRoute, getServiceRequestsByLocation); 

router.put("/repairer/:id/status", repairerProtectRoute, updateServiceRequestStatusByRepairer);


router.put('/user/:id/accept-quote', userProtectRoute, acceptQuote);
router.put('/user/:id/reject-quote', userProtectRoute, rejectQuote);

router.get('/repairer/assigned-jobs', repairerProtectRoute, getAssignedJobs);
router.put('/repairer/:id/quote', repairerProtectRoute, submitRepairerQuote);
router.post('/repairer/:serviceId/complete', repairerProtectRoute, completeJob);
router.post('/repairer/:serviceId/pending', repairerProtectRoute, PendingOtp);

export default router;