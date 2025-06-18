// frontend/src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Loader } from "lucide-react";
import { axiosInstance } from './lib/axios'; 
import { useAuthStore } from './store/authStore';
import { connectSocket, disconnectSocket } from './services/socketService'; 

// Pages
import Landing from './pages/Landing';

// Userauth
import UserGetotp from './pages/user/auth/Getotp';
import UserVerifyotp from './pages/user/auth/Verifyotp';
import UserLogin from './pages/user/auth/Login';
import UserSignup from './pages/user/auth/Signup';

// Repairer auth
import RepairerGetotp from './pages/repairer/auth/Getotp';
import RepairerVerifyotp from './pages/repairer/auth/Verifyotp';
import RepairerLogin from './pages/repairer/auth/Login';
import RepairerSignup from './pages/repairer/auth/Signup';

// UserDashboard
import UserInprogress from './pages/user/dashboard/Inprogress';
import UserPendingservice from './pages/user/dashboard/Pendingservice';
import UserMaindashboard from './pages/user/dashboard/Maindashboard';
import Showservices from './pages/user/dashboard/Showservices';
import PaymentPage from "./pages/user/dashboard/PaymentPage";
import UserMessagesPage from './pages/user/dashboard/UserMessagesPage';
import UserNotificationsPage from "./pages/user/dashboard/UserNotificationsPage";
import RejectionPaymentPage from "./pages/user/dashboard/RejectionPaymentPage";

// RepairerDashboard
import RepairerMainDashboard from './pages/repairer/dashboard/Maindashboard';
import RepairerInprogress from './pages/repairer/dashboard/Inprogress';
import RepairerSettingsPage from './pages/repairer/dashboard/RepairerSettingsPage';
import RepairerProfilePage from './pages/repairer/dashboard/RepairerProfilePage';
import RepairerAnalyticsPage from './pages/repairer/dashboard/RepairerAnalyticsPage';
import RepairerMessagesPage from './pages/repairer/dashboard/RepairerMessagesPage'; 
import RepairerNotificationsPage from './pages/repairer/dashboard/RepairerNotificationsPage';
import Privacy from "./pages/Privacy";
import TermsCondition from "./pages/TermsCondition";
import ContactUs from "./pages/ContactUs";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const {
    setUser,
    setRepairer,
    setAdmin,
    clearUser,
    clearRepairer,
    clearAdmin,
    isLoading,
    setIsLoading,
    user,
    repairer,
    admin
  } = useAuthStore();

  useEffect(() => {
    console.log("App useEffect: Attempting to connect Socket.IO...");
    connectSocket(); 

    const checkAuth = async () => {
      try {
        console.log("ye hai jwt token", document.cookie); // should contain jwt
        const res = await axiosInstance.get("/check-auth");
        const data = res.data;
        console.log("Auth data:", data);

        clearUser();
        clearRepairer();
        clearAdmin();
        if (data.role === "user") {
          setUser(data);
        } else if (data.role === "repairer") {
          setRepairer(data);
        } else if (data.role === "admin") {
          setAdmin(data);
        }
      } catch (err) {
        console.error("Authentication check failed:", err);

        clearUser();
        clearRepairer();
        clearAdmin();
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    checkAuth();
    return () => {
      console.log("App useEffect cleanup: Disconnecting Socket.IO...");
      disconnectSocket();
    };
  }, [clearUser, clearRepairer, clearAdmin, setUser, setRepairer, setAdmin, setIsLoading]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner className="size-10 animate-spin" />
      </div>
    );
  const PrivateRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = user || repairer || admin;
    const currentRole = user ? 'user' : repairer ? 'repairer' : admin ? 'admin' : null;

    if (!isAuthenticated) {
      return <Navigate to="/user/login" replace />; 
    }

    if (allowedRoles && !allowedRoles.includes(currentRole)) {
     
      return <Navigate to="/unauthorized" replace />; 
    }

    return children;
  };


  return (
    <div>
      <Routes>

        <Route path="/" element={<Landing />}/>

        <Route path="/privacy-policy" element={<Privacy />}/>

        <Route path="/terms-and-conditions" element={<TermsCondition />}/>

        <Route path="/contact-us" element={<ContactUs />}/>



        <Route path="/user/getotp" element={user ? <Navigate to="/user/dashboard" /> : <UserGetotp />} />
        <Route path="/user/verify-otp" element={user ? <Navigate to="/user/dashboard" /> : <UserVerifyotp />} />
        <Route path="/user/login" element={user ? <Navigate to="/user/dashboard" /> : <UserLogin />} />
        <Route path="/user/signup" element={user ? <Navigate to="/user/dashboard" /> : <UserSignup />} />

        <Route path="/repairer/getotp" element={repairer ? <Navigate to="/repairer/dashboard" /> : <RepairerGetotp />} />
        <Route path="/repairer/verify-otp" element={repairer ? <Navigate to="/repairer/dashboard" /> : <RepairerVerifyotp />} />
        <Route path="/repairer/login" element={repairer ? <Navigate to="/repairer/dashboard" /> : <RepairerLogin />} />
        <Route path="/repairer/signup" element={repairer ? <Navigate to="/repairer/dashboard" /> : <RepairerSignup />} />
   
          
        <Route path="/user/dashboard" element={user ?  <UserMaindashboard /> :  <Navigate to="/user/login" />} />
        <Route path="/user/inprogress" element={ user ?  <UserInprogress /> :  <Navigate to="/user/login" />} />
        <Route path="/user/pending-service" element={user ?  <UserPendingservice /> :  <Navigate to="/user/login" />} />
        <Route path="/user/show-services" element={user ?  <Showservices /> :  <Navigate to="/user/login" />} />
        <Route path="/user/messages/:conversationId?" element={user ?  <UserMessagesPage /> :  <Navigate to="/user/login" />} />
        <Route path="/user/chat/:serviceId" element={user ? <UserMessagesPage /> : <Navigate to="/user/login" />} /> 
        <Route path="/user/payment/:paymentId" element={user ? <PaymentPage /> : <Navigate to="/user/login" />} /> 
        <Route path="/user/notifications" element={<PrivateRoute allowedRoles={['user']}><UserNotificationsPage /></PrivateRoute>}/>
        <Route path="/rejection-fee/:paymentId" element={<RejectionPaymentPage />} />

          
          
        <Route path="/repairer/dashboard" element={repairer ?  <RepairerMainDashboard /> :  <Navigate to="/repairer/login" />} />
        <Route path="/repairer/settings" element={repairer ?  <RepairerSettingsPage /> :  <Navigate to="/repairer/login" />} />
        <Route path="/repairer/profile" element={repairer ?  <RepairerProfilePage /> :  <Navigate to="/repairer/login" />} />
        <Route path="/repairer/analytics" element={repairer ?  <RepairerAnalyticsPage /> :  <Navigate to="/repairer/login" />} />
        <Route path="/repairer/inprogress" element={repairer ?  <RepairerInprogress /> :  <Navigate to="/repairer/login" />} />
        <Route path="/repairer/notifications" element={repairer ?  <RepairerNotificationsPage /> :  <Navigate to="/repairer/login" />} />
        <Route path="/repairer/messages/:conversationId?" element={repairer ?  <RepairerMessagesPage /> :  <Navigate to="/repairer/login" />} />


        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin']}><div>Admin Dashboard Placeholder</div></PrivateRoute>} />

        {/* Unauthorized Access Page */}
        <Route path="/unauthorized" element={
          <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800">
            <p className="text-xl font-semibold">403 - Unauthorized Access</p>
            <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
            <Link to="/" className="mt-4 text-blue-600 hover:underline">Go to Home</Link>
          </div>
        } />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800">
            <p className="text-xl font-semibold">404 - Page Not Found</p>
            <Link to="/" className="mt-4 text-blue-600 hover:underline">Go to Home</Link>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
