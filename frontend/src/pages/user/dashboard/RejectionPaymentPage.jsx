import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft, Loader2, XCircle, IndianRupee } from 'lucide-react';
import { getPaymentDetailsById, createRazorpayOrder, verifyAndTransferPayment } from '../../../services/apiService';
import toast from 'react-hot-toast';

const loadRazorpayScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const RejectionPaymentPage = () => {
    const { paymentId } = useParams();
    const navigate = useNavigate();

    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState('');

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            if (!paymentId) {
                setError("No payment ID provided in the URL.");
                setLoading(false);
                toast.error("No payment ID found.");
                return;
            }
            try {
                setLoading(true);
                const responseData = await getPaymentDetailsById(paymentId);

                if (!responseData.success || !responseData.data) {
                    const msg = responseData.message || 'Failed to load payment details from API.';
                    setError(msg);
                    toast.error(msg);
                    setLoading(false);
                    return;
                }

                setPaymentDetails(responseData.data);

                if (['captured', 'payout_initiated', 'payout_completed'].includes(responseData.data.status)) {
                    setPaymentSuccess(true);
                    setPaymentMessage("This rejection fee has already been paid!");
                    toast.success("Rejection fee already paid!");
                    setTimeout(() => navigate('/user/inprogress'), 3000);
                } else if (responseData.data.paymentMethod !== 'rejection_fee') {
                    setError("This payment is not a rejection fee. Invalid access.");
                    toast.error("Invalid payment type.");
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || 'Failed to load payment details. Please try again.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [paymentId, navigate]);

    useEffect(() => {
        if (!loading && !error && paymentDetails && window.Razorpay === undefined) {
            loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
        }
    }, [loading, error, paymentDetails]);

    const handlePayment = async () => {
        if (!paymentDetails || paymentDetails.amount <= 0 || (paymentDetails.status !== 'created' && paymentDetails.status !== 'pending')) {
            setError("Cannot initiate payment: Invalid payment details or status.");
            toast.error("Cannot initiate payment: Invalid details or already processed.");
            return;
        }

        setPaymentProcessing(true);
        setPaymentSuccess(false);
        setPaymentMessage('');
        setError(null);

        try {
            const orderResponse = await createRazorpayOrder(paymentDetails._id);

            if (!orderResponse.success) {
                setError(orderResponse.message || "Failed to create Razorpay order.");
                toast.error(orderResponse.message || "Failed to create Razorpay order.");
                setPaymentProcessing(false);
                return;
            }

            const { orderId, currency, amount, razorpayKey, serviceTitle, customerName, customerPhone } = orderResponse.data;

            if (!window.Razorpay) {
                alert("Razorpay SDK not loaded. Please try again or refresh the page.");
                setPaymentProcessing(false);
                return;
            }

            const options = {
                key: razorpayKey,
                amount,
                currency,
                name: "FixNearby Rejection Fee",
                description: serviceTitle || "Rejection Fee",
                order_id: orderId,
                handler: async (response) => {
                    setPaymentProcessing(true);
                    try {
                        const verificationResponse = await verifyAndTransferPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentRecordId: paymentDetails._id
                        });

                        if (!verificationResponse.success) {
                            throw new Error(verificationResponse.message || "Verification failed on server.");
                        }

                        setPaymentSuccess(true);
                        setPaymentMessage("Rejection fee paid successfully!");
                        toast.success("Rejection fee paid successfully!");
                        navigate('/user/dashboard');
                    } catch (verifyErr) {
                        const verifyErrorMessage = verifyErr.message || "Payment verification failed. Please contact support.";
                        setError(verifyErrorMessage);
                        setPaymentSuccess(false);
                        setPaymentMessage(verifyErrorMessage);
                        toast.error(verifyErrorMessage);
                    } finally {
                        setPaymentProcessing(false);
                    }
                },
                prefill: {
                    name: customerName || "",
                    email: '',
                    contact: customerPhone || ""
                },
                notes: {
                    payment_record_id: paymentDetails._id,
                    service_request_id: paymentDetails.serviceRequest
                },
                theme: {
                    color: "#EF4444"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setPaymentProcessing(false);
                setPaymentSuccess(false);
                const failErrorMessage = response.error.description || 'Unknown error';
                setError(`Payment failed: ${failErrorMessage}. Error Code: ${response.error.code}`);
                setPaymentMessage('Payment failed. Please try again.');
                toast.error(`Payment Failed: ${failErrorMessage}`);
            });
            rzp.open();

        } catch (err) {
            const initErrorMessage = err.response?.data?.message || err.message || 'Unknown error.';
            setError(`Failed to initiate payment: ${initErrorMessage}`);
            setPaymentSuccess(false);
            setPaymentMessage('Failed to initiate payment.');
            toast.error(`Failed to initiate payment: ${initErrorMessage}`);
        } finally {
            if (!paymentSuccess && !error) {
                setPaymentProcessing(false);
            }
        }
    };

    const isPayButtonDisabled = paymentProcessing || !paymentDetails || paymentDetails.amount <= 0 || ['captured', 'payout_initiated', 'payout_completed'].includes(paymentDetails.status);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 text-gray-800 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full max-w-md text-center transform transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-6">
                    <XCircle className="w-20 h-20 text-red-600 animate-bounce" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    Rejection Fee Payment
                </h1>

                {loading ? (
                    <div className="flex items-center justify-center text-red-600 text-lg mb-6">
                        <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Loading Payment Details...
                    </div>
                ) : error ? (
                    <div className="text-red-600 text-lg mb-6 flex items-center justify-center">
                        <XCircle className="w-6 h-6 mr-2" /> {error}
                    </div>
                ) : paymentDetails ? (
                    <>
                        <p className="text-lg text-gray-700 mb-2">
                            {paymentDetails.description || 'Fee for rejected quotation.'}
                        </p>
                        <p className="text-lg text-gray-700 mb-4">
                            Amount: <span className="font-semibold text-red-700">₹{(paymentDetails.amount / 100)?.toFixed(2) || '0.00'}</span>
                        </p>
                        <p className="text-md text-gray-600 mb-8">
                            This fee is charged for rejecting a quoted service.
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
                                    ${isPayButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                            >
                                {paymentProcessing ? (
                                    <>
                                        <Loader2 className="w-6 h-6 mr-2 animate-spin" /> Processing...
                                    </>
                                ) : (
                                    <>
                                        <IndianRupee className="w-6 h-6 mr-2" />
                                        Pay ₹{(paymentDetails.amount / 100)?.toFixed(2) || '0.00'}
                                    </>
                                )}
                            </button>
                        )}
                    </>
                ) : (
                    <p className="text-md text-gray-600 mb-8">No payment details found to initiate payment.</p>
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

export default RejectionPaymentPage;
