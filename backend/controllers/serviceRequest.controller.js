// backend/controllers/serviceRequest.controller.js
import ServiceRequest from '../models/serviceRequest.model.js';
import User from '../models/user.model.js';
import Repairer from '../models/repairer.model.js';
import { createUserNotification } from './userNotification.controller.js';
import AcceptOtp from '../models/acceptOtp.model.js';
import { serviceAccepted, serviceCompleteOTP } from './sendsms.js';
import Payment from '../models/payment.model.js';


const formatLocationData = (location) => {
    if (!location) return null;
    return {
        fullAddress: location.fullAddress || '',
        pincode: location.pincode || '',
        city: location.city || '',
        state: location.state || '',
        coordinates: location.coordinates || [],
        captureMethod: location.captureMethod || ''
    };
};

export const createServiceRequest = async (req, res) => {
    try {
        const {
            title,
            serviceType,
            description,
            locationData,
            preferredTimeSlot,
            urgency,
            contactInfo,
            repairerId,
            issue,
            category,
            quotation
        } = req.body;

        const customerId = req.user._id;

        if (
            !title ||
            !serviceType ||
            !description ||
            !locationData ||
            !locationData.fullAddress ||
            !locationData.pincode ||
            !locationData.captureMethod ||
            !preferredTimeSlot ||
            !preferredTimeSlot.time ||
            !preferredTimeSlot.date ||
            !contactInfo
        ) {
            return res.status(400).json({
                message: 'Please provide all required fields: title, service type, description, location details (address, postal code, capture method), preferred date and time, budget, and contact info.'
            });
        }

        const newServiceRequest = new ServiceRequest({
            customer: customerId,
            title: title,
            contactInfo,
            serviceType: serviceType,
            issue,
            category,
            quotation,
            description,
            location: {
                address: locationData.fullAddress,
                pincode: locationData.pincode,
                city: locationData.city,
                state: locationData.state,
                coordinates: locationData.coordinates,
                captureMethod: locationData.captureMethod
            },
            preferredTimeSlot: {
                date: preferredTimeSlot.date,
                time: preferredTimeSlot.time
            },
            urgency,
            repairer: repairerId || null,
            status: repairerId ? 'in_progress' : 'requested'
        });

        await newServiceRequest.save();
        res.status(201).json({ success: true, message: 'Service request created successfully!', data: newServiceRequest });

    } catch (error) {
        console.error('Error creating service request:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: 'Internal server error during service request creation.' });
    }
};

export const getServiceRequestsByLocation = async (req, res) => {
    try {
        const { pincode, serviceType, latitude, longitude, radius, statusFilter } = req.query;

        const isRepairerAccess = req.repairer && req.repairer._id;
        let repairerServices = [];
        let repairerId = null;
        let query = {};

        if (isRepairerAccess) {
            const currentRepairer = await Repairer.findById(req.repairer._id).select('location services');
            if (!currentRepairer) {
                return res.status(404).json({ message: "Repairer profile not found." });
            }
            req.query.pincode = currentRepairer.location?.postalCode;
            repairerServices = currentRepairer.services.map(s => s.name);
            repairerId = currentRepairer._id;
        }

        if (req.query.pincode) {
            query['location.pincode'] = req.query.pincode;
        } else if (latitude && longitude && radius) {
            return res.status(400).json({ message: 'GPS-based search for repairers not yet fully implemented for this endpoint.' });
        } else if (!isRepairerAccess) {
            return res.status(400).json({ message: 'Postal code is required for service search.' });
        }

        if (serviceType) {
            query.serviceType = serviceType.toLowerCase();
        } else if (isRepairerAccess && repairerServices.length > 0) {
            query.serviceType = { $in: repairerServices.map(s => s.toLowerCase()) };
        }

        if (isRepairerAccess) {
            query.$or = [
                { status: 'requested', repairer: null },
                { status: 'in_progress', repairer: repairerId },
                { status: 'completed', repairer: repairerId }
            ];

            if (statusFilter) {
                const specificStatusQuery = [{ status: statusFilter, repairer: repairerId }];
                if (statusFilter === 'requested') {
                    specificStatusQuery.push({ status: 'requested', repairer: null });
                }
                query.$or = specificStatusQuery;
            }
        } else if (statusFilter) {
            query.status = statusFilter;
        } else {
            query.status = 'requested';
        }

        const serviceRequests = await ServiceRequest.find(query)
            .populate('customer', 'fullname phone')
            .populate('repairer', 'fullname businessName phone');

        res.json({
            success: true,
            count: serviceRequests.length,
            data: serviceRequests.map(request => ({
                id: request._id,
                title: request.title,
                description: request.description,
                serviceType: request.serviceType,
                location: formatLocationData(request.location),
                urgency: request.urgency,
                status: request.status,
                customer: request.customer,
                repairer: request.repairer,
                preferredTimeSlot: request.preferredTimeSlot,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            }))
        });

    } catch (error) {
        console.error('Error fetching service requests by location:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during service request retrieval.'
        });
    }
};
export const getUserServiceRequests = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { statusFilter } = req.query;

        let query = { customer: customerId };

        if (statusFilter) {
            const statuses = Array.isArray(statusFilter) ? statusFilter : (typeof statusFilter === 'string' ? statusFilter.split(',') : [statusFilter]);
            query.status = { $in: statuses };
        } else {
            query.status = { $in: ['requested', 'pending_quote', 'quoted', 'accepted', 'in_progress'] };
        }

        console.log('--- DEBUG: getUserServiceRequests called ---');
        console.log('DEBUG: User ID:', customerId);
        console.log('DEBUG: statusFilter from req.query:', statusFilter);
        console.log('DEBUG: Final Mongoose Query:', JSON.stringify(query, null, 2));

        const serviceRequests = await ServiceRequest.find(query)
            .populate('repairer', 'fullname phone businessName')
            .sort({ createdAt: -1 });

        console.log('DEBUG: Number of service requests found:', serviceRequests.length);
        if (serviceRequests.length > 0) {
            serviceRequests.forEach((reqItem, index) => {
                console.log(`DEBUG: [${index}] Service ID: ${reqItem._id}, Status: ${reqItem.status}, Title: ${reqItem.title}`);
            });
        } else {
            console.log(' No service requests found for this query.');
        }

        res.status(200).json({
            success: true,
            count: serviceRequests.length,
            data: serviceRequests.map(request => ({
                id: request._id,
                title: request.title,
                description: request.description,
                serviceType: request.serviceType,
                location: formatLocationData(request.location),
                urgency: request.urgency,
                status: request.status,
                repairer: request.repairer,
                preferredTimeSlot: request.preferredTimeSlot,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt,
                estimatedPrice: request.estimatedPrice,
                quotation: request.quotation
            }))
        });

    } catch (error) {
        console.error('Error fetching service requests by customer:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during service request retrieval for customer.'
        });
    }
};
export const completeJob = async (serviceId, repairerId) => {
    try {

        const serviceRequest = await ServiceRequest.findOne({ _id: serviceId, repairer: repairerId });

        if (!serviceRequest) {
            return res.status(404).json({ success: false, message: 'Service request not found or not assigned to you.' });
        }
        if (serviceRequest.status !== 'accepted' && serviceRequest.status !== 'in_progress' && serviceRequest.status !== 'quoted') {
            return res.status(400).json({ success: false, message: 'Job cannot be completed in its current status.' });
        }
        serviceRequest.status = 'completed';
        serviceRequest.completedAt = new Date();

        await serviceRequest.save();

        res.status(200).json({ success: true, message: 'Job marked as completed successfully!', serviceRequest });

    } catch (error) {
        console.error('Error completing job:', error);
        res.status(500).json({ success: false, message: 'Server error: Failed to complete job.' });
    }
};
export const updateServiceRequestStatusByCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const customerId = req.user._id; // Assuming req.user is populated by your authentication middleware

        if (!status) {
            return res.status(400).json({ message: 'Status is required.' });
        }

        const serviceRequest = await ServiceRequest.findOne({ _id: id, customer: customerId });

        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found or not owned by this user.' });
        }

        let paymentId = null; // Initialize paymentId to null

        if (status === 'cancelled' && ['requested', 'in_progress', 'quoted', 'pending_quote', 'accepted'].includes(serviceRequest.status)) {
            serviceRequest.status = status;
            serviceRequest.cancelledAt = new Date();
            console.log(`[UpdateStatus] Service request ${id} status changed to 'cancelled'.`);
        } else if (status === 'pending_payment' && ['accepted', 'in_progress', 'pending_otp'].includes(serviceRequest.status)) {
            console.log(`[UpdateStatus] Attempting to transition SR ${id} to 'pending_payment'. Current status: ${serviceRequest.status}`);

            // Ensure estimatedPrice is set before creating payment
            if (!serviceRequest.estimatedPrice || serviceRequest.estimatedPrice <= 0) {
                console.error(`[UpdateStatus] ERROR: estimatedPrice is invalid (${serviceRequest.estimatedPrice}) for SR: ${id}`);
                return res.status(400).json({ success: false, message: "Service request must have a valid estimated price to proceed with payment." });
            }
            console.log(`[UpdateStatus] estimatedPrice is valid: ${serviceRequest.estimatedPrice}`);


            // --- Payment Creation/Retrieval Logic ---
            const existingPayment = await Payment.findOne({
                serviceRequest: serviceRequest._id,
                paymentMethod: 'service_completion',
                status: { $in: ['created', 'pending'] } // Look for payments that are created but not yet captured/failed
            });

            if (existingPayment) {
                console.log(`[UpdateStatus] Found existing payment record: ${existingPayment._id} for SR ${id}.`);
                paymentId = existingPayment._id;
            } else {
                console.log(`[UpdateStatus] Creating new payment record for SR: ${id}.`);
                const newPayment = new Payment({
                    serviceRequest: serviceRequest._id,
                    customer: customerId,
                    repairer: serviceRequest.repairer, // Make sure 'repairer' is populated or handled correctly if optional
                    amount: serviceRequest.estimatedPrice,
                    currency: "INR", // Or derive from serviceRequest if applicable
                    paymentMethod: 'service_completion', // This MUST be in your payment.model.js enum
                    status: 'created', // Initial status for new payment
                    description: `Payment for completed service: ${serviceRequest.title}`
                });

                await newPayment.save();
                console.log(`[UpdateStatus] New payment record saved: ${newPayment._id}.`);
                paymentId = newPayment._id;
            }
            // --- End Payment Logic ---

            serviceRequest.status = 'pending_payment'; // Set the service request status
            serviceRequest.completedAt = new Date();
            console.log(`[UpdateStatus] Service request ${id} status set to 'pending_payment'.`);

        } else {
            console.warn(`[UpdateStatus] Invalid transition: from '${serviceRequest.status}' to '${status}' for SR ${id}.`);
            return res.status(400).json({ message: `Invalid status transition from '${serviceRequest.status}' to '${status}' for customer.` });
        }

        await serviceRequest.save(); // Save the updated service request
        console.log(`[UpdateStatus] Service request ${id} saved successfully. Final Status: ${serviceRequest.status}`);

        // Include paymentId in the response if it was set
        res.status(200).json({
            success: true,
            message: `Service request status updated to ${status}.`,
            paymentId: paymentId // Send the paymentId to the frontend
        });

    } catch (error) {
        console.error('[UpdateStatus] Error updating service request status by customer:', error);
        // Log the full error object for better debugging
        console.error('[UpdateStatus] Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({
            success: false,
            message: 'Internal server error during service request status update by customer.'
        });
    }
};
export const updateServiceRequestStatusByRepairer = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const currentUserId = req.repairer._id;

    try {
        const serviceRequest = await ServiceRequest.findById(id).populate('customer');

        if (!serviceRequest) {
            return res.status(404).json({ success: false, message: 'Service request not found.' });
        }

        if (serviceRequest.repairer && serviceRequest.repairer.toString() !== currentUserId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You are not assigned to this request.' });
        }

        if (status === 'accept_request_for_quote' && serviceRequest.status === 'requested' && !serviceRequest.repairer) {
            serviceRequest.repairer = currentUserId;
            serviceRequest.assignedAt = new Date();
            serviceRequest.status = 'pending_quote';

            const rep = await Repairer.findById(serviceRequest.repairer)
            const cus = await User.findById(serviceRequest.customer)
            const name = rep.fullname
            const number = rep.phone
            const usernumber = serviceRequest.contactInfo;
            const username = cus.fullname
            const issue = serviceRequest.issue

            const hehe = await serviceAccepted(usernumber, username, number, name, issue);

            console.log(hehe)
            if (hehe === false) {
                return res.status(400).json({
                    message: "Failed to send Accepted SMS"
                });
            }


            if (serviceRequest.customer) {
                console.log('DEBUG: Service Request Customer ID:', serviceRequest.customer._id);
                console.log('DEBUG: Customer found for notification:', serviceRequest.customer.fullname);
                const notificationResult = await createUserNotification({
                    userId: serviceRequest.customer._id,
                    type: 'repairer_assigned',
                    message: `A repairer has accepted your service request "${serviceRequest.title || 'Unknown Service'}". They will provide a quote shortly!`,
                    link: `/user/dashboard/inprogress`,
                    relatedEntity: {
                        id: serviceRequest._id,
                        model: 'ServiceRequest'
                    }
                });
                if (!notificationResult.success) {
                    console.error('Notification creation failed:', notificationResult.message);
                } else {
                    console.log('SUCCESS: User Notification trigger completed. Notification ID:', notificationResult.notification._id);
                }
            } else {
                console.log('DEBUG: Customer not found or not populated for notification.');
            }

        } else if (status === 'in_progress' && serviceRequest.status === 'accepted' && serviceRequest.repairer.toString() === currentUserId.toString()) {
            serviceRequest.status = 'in_progress';

        } else if (status === 'completed' && serviceRequest.status === 'in_progress' && serviceRequest.repairer.toString() === currentUserId.toString()) {
            serviceRequest.status = 'completed';
            serviceRequest.completedAt = new Date();

            if (serviceRequest.customer) {
                await createUserNotification({
                    userId: serviceRequest.customer._id,
                    type: 'job_completed_by_repairer',
                    message: `Your service request "${serviceRequest.title}" has been marked as completed by the repairer.`,
                    link: `/user/dashboard/jobs/${serviceRequest._id}/feedback`,
                    relatedEntity: { id: serviceRequest._id, model: 'ServiceRequest' }
                });
            }
        }
        else {
            return res.status(400).json({ success: false, message: `Invalid status transition from '${serviceRequest.status}' to '${status}' by repairer.` });
        }

        await serviceRequest.save();
        res.status(200).json({ success: true, message: `Service request status updated to ${serviceRequest.status}`, serviceRequest });

    } catch (error) {
        console.error('Error updating service request status by repairer:', error);
        res.status(500).json({ success: false, message: 'Server error updating service request status.' });
    }
};

export const acceptQuote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const serviceRequest = await ServiceRequest.findOne({ _id: id, customer: userId });

        if (!serviceRequest) {
            return res.status(404).json({ success: false, message: 'Service request not found or not assigned to you.' });
        }
        if (serviceRequest.status !== 'quoted' || !serviceRequest.estimatedPrice || serviceRequest.estimatedPrice <= 0) {
            return res.status(400).json({ success: false, message: 'Cannot accept quote. Request is not in a quotable state or no valid quote has been provided.' });
        }
        serviceRequest.status = 'accepted';
        serviceRequest.acceptedAt = new Date();
        await serviceRequest.save();

        if (serviceRequest.repairer) {
            await createUserNotification({
                userId: serviceRequest.repairer._id,
                type: 'quote_accepted',
                message: `Your quote for "${serviceRequest.title}" was accepted by the customer!`,
                link: `/repairer/dashboard/jobs/${serviceRequest._id}`
            });
        }

        res.status(200).json({ success: true, message: 'Quotation accepted successfully!', serviceRequest });

    } catch (error) {
        console.error('Error in acceptQuote controller:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error while accepting quote.' });
    }
};

export const rejectQuote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    try {
        const serviceRequest = await ServiceRequest.findOne({ _id: id, customer: userId }).populate('repairer');

        if (!serviceRequest) {
            return res.status(404).json({ success: false, message: 'Service request not found or you are not the customer.' });
        }
        if (serviceRequest.status !== 'quoted' || !serviceRequest.estimatedPrice || serviceRequest.estimatedPrice <= 0) {
            return res.status(400).json({ success: false, message: 'Cannot reject quote. Request is not in a quotable state or no valid quote has been provided.' });
        }


        // reject kari agar toh flag +1 hoga wala logic and agar flag +1 hua and 3 se jyada hua toh ma chod denge
        const rep = await Repairer.findById(serviceRequest.repairer);


        // Increment redflag count
        rep.redflag += 1;

        // Check if redflag exceeds threshold
        if (rep.redflag > 3) {
            rep.isbanned = true;
        }

        await rep.save();


        serviceRequest.status = 'rejected';
        await serviceRequest.save();
        const REJECTION_FEE_AMOUNT_PAISA = parseInt(process.env.REJECTION_FEE_AMOUNT_PAISA || '15000');

        const rejectionFeePayment = new Payment({
            serviceRequest: serviceRequest._id,
            customer: userId,
            amount: REJECTION_FEE_AMOUNT_PAISA,
            platformFeePercentage: 100,
            platformFeeAmount: REJECTION_FEE_AMOUNT_PAISA,
            repairerPayoutAmount: 0,
            currency: "INR",
            paymentMethod: 'rejection_fee',
            status: 'created',
            description: `Rejection fee for service request: ${serviceRequest.title}`
        });
        await rejectionFeePayment.save();
        if (serviceRequest.repairer) {
            await createUserNotification({
                userId: serviceRequest.repairer._id,
                type: 'quote_rejected',
                message: `Your quote for "${serviceRequest.title}" (₹${serviceRequest.estimatedPrice}) was rejected by the customer. A rejection fee of ₹${REJECTION_FEE_AMOUNT_PAISA / 100} is being processed.`,
                link: `/repairer/notifications`,
                relatedEntity: { id: serviceRequest._id, model: 'ServiceRequest' }
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Quotation rejected successfully! Proceed to pay rejection fee.',
            serviceRequest,
            paymentId: rejectionFeePayment._id
        });

    } catch (error) {
        console.error('Error rejecting quote:', error);
        return res.status(500).json({ success: false, message: 'Server error: Failed to reject quotation.' });
    }
};



export const submitRepairerQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { estimatedPrice } = req.body;
        const repairerId = req.repairer._id;

        if (!estimatedPrice || typeof estimatedPrice !== 'number' || parseFloat(estimatedPrice) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid numeric quote amount greater than zero.',
            });
        }

        const serviceRequest = await ServiceRequest.findOne({ _id: id, repairer: repairerId });

        if (!serviceRequest) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found or not assigned to you.',
            });
        }

        const quotationRange = serviceRequest.quotation; // e.g., "2,000 - 3,500"

        if (!quotationRange || !/^\d{1,3}(,\d{3})?\s*-\s*\d{1,3}(,\d{3})?$/.test(quotationRange)) {
            return res.status(400).json({
                success: false,
                message: 'Quotation range is invalid or missing for this request.',
            });
        }

        const [min, max] = quotationRange
            .split('-')
            .map(part => Number(part.replace(/,/g, '').trim()));

        if (isNaN(min) || isNaN(max)) {
            return res.status(400).json({
                success: false,
                message: 'Failed to parse the quotation range properly.',
            });
        }

        if (estimatedPrice < min || estimatedPrice > max) {
            return res.status(400).json({
                success: false,
                message: `Your estimated price must lie within the AI-suggested range: ₹${min.toLocaleString()} - ₹${max.toLocaleString()}`,
            });
        }

        if (
            serviceRequest.status !== 'pending_quote' &&
            serviceRequest.status !== 'quoted'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Cannot submit or edit quote for a job in its current status.',
            });
        }

        if (
            serviceRequest.status === 'accepted' ||
            serviceRequest.status === 'in_progress' ||
            serviceRequest.status === 'completed'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit quote for an accepted or in-progress/completed job.',
            });
        }

        serviceRequest.estimatedPrice = estimatedPrice;

        if (serviceRequest.status === 'pending_quote') {
            serviceRequest.status = 'quoted';
        }

        await serviceRequest.save();

        res.status(200).json({
            success: true,
            message: 'Quote submitted/updated successfully!',
            serviceRequest,
        });
    } catch (error) {
        console.error('Error submitting/editing repairer quote:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: Failed to submit/edit quote.',
        });
    }
};


export const getAssignedJobs = async (req, res) => {
    try {
        const repairerId = req.repairer._id;

        if (!repairerId) {
            return res.status(401).json({ success: false, message: 'Repairer not authenticated.' });
        }


        const assignedJobs = await ServiceRequest.find({
            repairer: repairerId,
            status: { $in: ['pending_quote', 'quoted', 'accepted', 'in_progress', 'completed', 'pending_otp'] }
        })
            .populate('customer', 'fullname phone contactInfo')
            .sort({ createdAt: -1 });


        res.status(200).json(assignedJobs);
    } catch (error) {
        console.error('Error fetching assigned jobs for repairer:', error);
        res.status(500).json({ success: false, message: 'Server error: Failed to fetch assigned jobs.' });
    }
};

export const getServiceRequestById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[getServiceRequestById] Authenticated User (req.user):`, req.user ? req.user._id : 'N/A');
        console.log(`[getServiceRequestById] Authenticated Repairer (req.repairer):`, req.repairer ? req.repairer._id : 'N/A');

        const serviceRequest = await ServiceRequest.findById(id)
            .populate('customer', 'fullname phone')
            .populate('repairer', 'fullname phone businessName');

        if (!serviceRequest) {
            // This log will confirm if the service request was NOT found by findById
            console.warn(`[getServiceRequestById] Service request with ID ${id} not found in DB.`);
            return res.status(404).json({ message: 'Service request not found.' });
        }

        // These logs will show the fetched data and the IDs for comparison
        console.log(`[getServiceRequestById] Found Service Request: ${serviceRequest._id}`);
        console.log(`[getServiceRequestById] Service Request Customer ID:`, serviceRequest.customer ? serviceRequest.customer._id.toString() : 'N/A');
        console.log(`[getServiceRequestById] Service Request Repairer ID:`, serviceRequest.repairer ? serviceRequest.repairer._id.toString() : 'N/A');

        const isUserAuthorized = req.user && serviceRequest.customer && req.user._id.toString() === serviceRequest.customer._id.toString();
        const isRepairerAuthorized = req.repairer && serviceRequest.repairer && req.repairer._id.toString() === serviceRequest.repairer._id.toString();

        if (!isUserAuthorized && !isRepairerAuthorized) {
            console.warn(`[getServiceRequestById] Unauthorized access attempt for SR ${id}. User: ${req.user?._id}, Repairer: ${req.repairer?._id}`);
            return res.status(403).json({ message: 'You are not authorized to view this service request.' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: serviceRequest._id,
                title: serviceRequest.title,
                description: serviceRequest.description,
                serviceType: serviceRequest.serviceType,
                location: formatLocationData(serviceRequest.location),
                urgency: serviceRequest.urgency,
                status: serviceRequest.status,
                customer: serviceRequest.customer,
                repairer: serviceRequest.repairer,
                preferredTimeSlot: serviceRequest.preferredTimeSlot,
                createdAt: serviceRequest.createdAt,
                updatedAt: serviceRequest.updatedAt
            }
        });

    } catch (error) {
        console.error('Error fetching service request by ID:', error);
        console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const PendingOtp = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const repairerId = req.repairer._id;

        const serviceRequest = await ServiceRequest.findOne({ _id: serviceId, repairer: repairerId });

        const usernumber = serviceRequest.contactInfo
        const issue = serviceRequest.issue
        const estimatedPrice = serviceRequest.estimatedPrice

        const otp = generateOTP()

        await AcceptOtp.findOneAndUpdate({
            serviceId
        }, {
            serviceId,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }, {
            upsert: true,
            new: true
        });



        const status = await serviceCompleteOTP(usernumber, otp, issue, estimatedPrice);
        console.log("otp sent status:", status);
        if (!status) {
            return res.status(400).json({
                message: "Failed to send complete OTP"
            });
        }

        if (!serviceRequest) {
            return res.status(404).json({ success: false, message: 'Service request not found or not assigned to you.' });
        }
        if (serviceRequest.status !== 'accepted' && serviceRequest.status !== 'pending_otp') {
            return res.status(400).json({ success: false, message: 'Job cannot be completed in its current status.' });
        }
        serviceRequest.status = 'pending_otp';
        serviceRequest.completedAt = new Date();

        await serviceRequest.save();

        res.status(200).json({ success: true, message: 'Job marked as completed successfully!', serviceRequest });

    } catch (error) {
        console.error('Error completing job:', error);
        res.status(500).json({ success: false, message: 'Server error: Failed to complete job.' });
    }
};