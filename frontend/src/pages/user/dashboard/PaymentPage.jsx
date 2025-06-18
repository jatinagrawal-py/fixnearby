import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Loader2, XCircle } from 'lucide-react';
import { getPaymentDetailsById, getServiceRequestById, createRazorpayOrder, verifyAndTransferPayment } from '../../../services/apiService';

const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

const PaymentPage = () => {
    console.log("PaymentPage component rendering!");
    const { paymentId } = useParams();
    console.log("[PaymentPage Component] Payment ID from useParams:", paymentId);
    const navigate = useNavigate();

    const [paymentDetails, setPaymentDetails] = useState(null);
    const [serviceDetails, setServiceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');

    useEffect(() => {
        const fetchAllDetails = async () => {
            try {
                setLoading(true);
                setError(null); 

                if (!paymentId) {
                    console.error("[PaymentPage - fetchAllDetails] Payment ID is missing in URL parameters.");
                    setError("Invalid payment link. Payment ID is missing.");
                    setLoading(false);
                    return;
                }
                console.log("[PaymentPage - fetchAllDetails] Initiating fetch for payment details for ID:", paymentId);
                const paymentResponse = await getPaymentDetailsById(paymentId);
                console.log("[PaymentPage - fetchAllDetails] Raw paymentResponse from apiService:", paymentResponse);

                if (!paymentResponse || !paymentResponse.success) {
                    const msg = paymentResponse?.message || "Failed to load payment details from API.";
                    console.error("[PaymentPage - fetchAllDetails] Payment API call failed or returned success:false. Message:", msg);
                    setError(msg);
                    setLoading(false);
                    return;
                }

                const fetchedPaymentDetails = paymentResponse.data;
                setPaymentDetails(fetchedPaymentDetails);
                console.log("[PaymentPage - fetchAllDetails] Payment details set to state:", fetchedPaymentDetails);

                const allowedPaymentRecordStatuses = ['created', 'pending'];
                if (!allowedPaymentRecordStatuses.includes(fetchedPaymentDetails.status)) {
                    console.warn(`[PaymentPage - fetchAllDetails] Payment record status '${fetchedPaymentDetails.status}' is not allowed for processing.`);
                    setError(`This payment record is in '${fetchedPaymentDetails.status}' status and cannot be processed.`);
                    setLoading(false);
                    return;
                }
                let currentServiceRequestId = null;
                if (fetchedPaymentDetails.serviceRequest) {
                    currentServiceRequestId = typeof fetchedPaymentDetails.serviceRequest === 'object' && fetchedPaymentDetails.serviceRequest._id
                        ? fetchedPaymentDetails.serviceRequest._id
                        : fetchedPaymentDetails.serviceRequest; 

                    console.log("[PaymentPage - fetchAllDetails] Initiating fetch for service details for ID:", currentServiceRequestId);
                    const serviceResponse = await getServiceRequestById(currentServiceRequestId);
                    console.log("[PaymentPage - fetchAllDetails] Raw serviceResponse from apiService:", serviceResponse);
                    if (!serviceResponse || serviceResponse.message) {
                        const msg = serviceResponse?.message || "Could not fetch associated service details.";
                        console.error("[PaymentPage - fetchAllDetails] Service API call failed or returned an error. Message:", msg);
                        setError(msg);
                        setLoading(false);
                        return;
                    }

                    const fetchedServiceDetails = serviceResponse; 
                    setServiceDetails(fetchedServiceDetails);
                    console.log("[PaymentPage - fetchAllDetails] Service details set to state:", fetchedServiceDetails);

                    const allowedServiceStatuses = ['quoted', 'accepted', 'in_progress', 'pending_payment'];
                    if (!allowedServiceStatuses.includes(fetchedServiceDetails.status)) {
                        console.warn(`[PaymentPage - fetchAllDetails] Associated service status '${fetchedServiceDetails.status}' is not allowed for payment.`);
                        setError(`The associated service is in '${fetchedServiceDetails.status}' status and cannot be paid.`);
                        setLoading(false);
                        return;
                    }

                } else {
                    console.warn("[PaymentPage - fetchAllDetails] Payment record does not contain a linked service request ID.");
                    setError("Could not find associated service details for this payment.");
                    setLoading(false);
                    return;
                }

            } catch (err) {
                console.error('[PaymentPage - fetchAllDetails] Caught error in try/catch block:', err);
                const errorMessage = err.message || 'Failed to load payment or service details. Please try again.';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (paymentId) {
            fetchAllDetails();
        }
    }, [paymentId, navigate]);
    useEffect(() => {
        if (!loading && !error && paymentDetails && serviceDetails && window.Razorpay === undefined) {
            console.log("[PaymentPage - useEffect] All details loaded. Attempting to load Razorpay script.");
            loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        }
    }, [loading, error, paymentDetails, serviceDetails]);


    const handlePayment = async () => {
        if (!paymentDetails || !serviceDetails || paymentDetails.amount <= 0) {
            setError("Cannot initiate payment: Details not fully loaded or invalid amount.");
            return;
        }
        const allowedPaymentRecordStatusesForInitiation = ['created', 'pending'];
        if (!allowedPaymentRecordStatusesForInitiation.includes(paymentDetails.status)) {
            setError(`Payment cannot be initiated as its record is in '${paymentDetails.status}' status.`);
            return;
        }
        const allowedServiceStatusesForInitiation = ['quoted', 'accepted', 'in_progress', 'pending_payment'];
        if (!allowedServiceStatusesForInitiation.includes(serviceDetails.status)) {
            setError(`Payment cannot be initiated for a service in '${serviceDetails.status}' status.`);
            return;
        }

        setPaymentProcessing(true);
        setPaymentSuccess(false);
        setPaymentMessage('');
        setError(null);

        try {
            const orderResponse = await createRazorpayOrder(paymentDetails._id);
            console.log("[PaymentPage] Raw Razorpay orderResponse from apiService:", orderResponse);

            if (!orderResponse.success) {
                setError(orderResponse.message || "Failed to create Razorpay order.");
                setPaymentProcessing(false);
                return;
            }

            const { orderId, currency, amount, razorpayKey, serviceTitle, customerName, customerPhone, paymentId: returnedPaymentRecordId } = orderResponse.data;

            if (!window.Razorpay) {
                alert("Razorpay SDK not loaded. Please try again or refresh the page.");
                setPaymentProcessing(false);
                return;
            }

            const options = {
                key: razorpayKey,
                amount: amount,
                currency: currency,
                name: "FixNearby Services",
                description: `Payment for: ${serviceTitle || serviceDetails.title}`,
                order_id: orderId,
                handler: async (response) => {
                    setPaymentProcessing(true);
                    try {
                        const verificationResponse = await verifyAndTransferPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentRecordId: returnedPaymentRecordId 
                        });
                        console.log("Payment verification response:", verificationResponse);

                        if (!verificationResponse.success) {
                            throw new Error(verificationResponse.message || "Verification failed on server.");
                        }

                        setPaymentSuccess(true);
                        setPaymentMessage("Payment successful! Service status updated and payout initiated.");
                        alert("Payment successful! The service has been marked as accepted and payout initiated.");
                        navigate('/user/in-progress');
                    } catch (verifyErr) {
                        console.error("Payment verification failed:", verifyErr);
                        const verifyErrorMessage = verifyErr.message || "Unknown error during verification.";
                        setError("Payment was successful but verification failed: " + verifyErrorMessage);
                        setPaymentSuccess(false);
                        setPaymentMessage("Payment failed to verify. Please contact support.");
                        alert("Payment failed to verify. Please contact support.");
                    } finally {
                        setPaymentProcessing(false);
                    }
                },
                prefill: {
                    name: customerName || serviceDetails.customer?.fullname || '',
                    email: serviceDetails.customer?.email || '',
                    contact: customerPhone || serviceDetails.customer?.phone || ''
                },
                notes: {
                    service_id: serviceDetails._id,
                    payment_record_id: paymentDetails._id
                },
                theme: {
                    color: "#3B82F6"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setPaymentProcessing(false);
                setPaymentSuccess(false);
                const failErrorMessage = response.error.description || 'Unknown error';
                setError(`Payment failed: ${failErrorMessage}. Error Code: ${response.error.code}`);
                setPaymentMessage('Payment failed. Please try again.');
                alert(`Payment Failed: ${failErrorMessage}`);
                console.error("Razorpay Payment Failed:", response.error);
            });
            rzp.open();

        } catch (err) {
            console.error("Error initiating Razorpay order:", err);
            const initErrorMessage = err.message || 'Unknown error.';
            setError(`Failed to initiate payment: ${initErrorMessage}`);
            setPaymentSuccess(false);
            setPaymentMessage('Failed to initiate payment.');
        } finally {
            if (!error && !paymentSuccess) {
                setPaymentProcessing(false);
            }
        }
    };

    const isPayButtonDisabled = paymentProcessing ||
                                !paymentDetails ||
                                !serviceDetails ||
                                paymentDetails.amount <= 0 ||
                                !['created', 'pending'].includes(paymentDetails.status) ||
                                !['quoted', 'accepted', 'in_progress', 'pending_payment'].includes(serviceDetails.status);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-6">
                    <CreditCard className="w-20 h-20 text-blue-600 animate-bounce" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    Complete Payment
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center text-blue-600 text-lg mb-6">
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading Details...
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-lg mb-6 flex items-center justify-center">
                        <XCircle className="w-6 h-6 mr-2" /> {error}
                    </div>
                ) : (
                    <>
                        {paymentDetails && serviceDetails ? (
                            <>
                                <p className="text-lg text-gray-700 mb-2">
                                    Service: <span className="font-semibold text-blue-700">{serviceDetails.title || 'N/A'}</span>
                                </p>
                                <p className="text-lg text-gray-700 mb-4">
                                    Amount: <span className="font-semibold text-green-700">₹{(paymentDetails.amount)?.toFixed(2) || '0.00'}</span>
                                </p>
                                <p className="text-md text-gray-600 mb-8">
                                    This payment will secure your service request and facilitate the payout to the repairer.
                                </p>

                                {paymentSuccess ? (
                                    <div className="flex items-center justify-center bg-green-100 text-green-700 px-6 py-3 rounded-lg text-lg font-semibold mb-4 animate-fade-in">
                                        <CheckCircle className="w-6 h-6 mr-2" /> {paymentMessage || "Payment process completed."}
                                    </div>
                                ) : (
                                    <button
                                        onClick={handlePayment}
                                        disabled={isPayButtonDisabled}
                                        className={`flex items-center justify-center px-8 py-3 rounded-lg text-xl font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl w-full mb-4
                                            ${isPayButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                    >
                                        {paymentProcessing ? (
                                            <>
                                                <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-6 h-6 mr-2" /> Pay Now ₹{(paymentDetails.amount)?.toFixed(2) || '0.00'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </>
                        ) : (
                            <p className="text-md text-gray-600 mb-8">No payment or service details found to initiate payment.</p>
                        )}
                    </>
                )}

                <Link
                    to="/user/inprogress"
                    className="flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300 mt-4"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to In-Progress Services
                </Link>
            </div>
        </div>
    );
};

export default PaymentPage;