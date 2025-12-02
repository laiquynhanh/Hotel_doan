import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import SearchRoomsPage from './pages/SearchRoomsPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import BlogDetailsPage from './pages/BlogDetailsPage';
import ContactPage from './pages/ContactPage';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProfilePage from './pages/ProfilePage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingPage from './pages/BookingPage';
import PaymentResult from './pages/PaymentResult';
// Food & Beverage Pages
import MenuPage from './pages/MenuPage';
import RoomServicePage from './pages/RoomServicePage';
import RestaurantBookingPage from './pages/RestaurantBookingPage';
import MyFoodOrdersPage from './pages/MyFoodOrdersPage';
import MyReservationsPage from './pages/MyReservationsPage';
// Admin Components - Lazy loaded for code splitting
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const RoomManagement = lazy(() => import('./pages/admin/RoomManagement'));
const BookingManagement = lazy(() => import('./pages/admin/BookingManagement'));
const FoodMenuManagement = lazy(() => import('./pages/admin/FoodMenuManagement'));
const FoodOrdersManagement = lazy(() => import('./pages/admin/FoodOrdersManagement'));
const RestaurantTablesManagement = lazy(() => import('./pages/admin/RestaurantTablesManagement'));
const TableReservationsManagement = lazy(() => import('./pages/admin/TableReservationsManagement'));
const CouponManagement = lazy(() => import('./pages/admin/CouponManagement'));
const ReviewManagement = lazy(() => import('./pages/admin/ReviewManagement'));
import './App.css';

// Loading component
const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ToastContainer />
          <Header />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/search-rooms" element={<SearchRoomsPage />} />
            <Route path="/room-details/:id" element={<RoomDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            
            {/* Food & Beverage Routes */}
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/room-service" element={<RoomServicePage />} />
            <Route path="/restaurant-booking" element={<RestaurantBookingPage />} />
            <Route path="/my-food-orders" element={<MyFoodOrdersPage />} />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="rooms" element={<RoomManagement />} />
              <Route path="bookings" element={<BookingManagement />} />
              {/* Food & Beverage Admin */}
              <Route path="food-menu" element={<FoodMenuManagement />} />
              <Route path="food-orders" element={<FoodOrdersManagement />} />
              <Route path="restaurant-tables" element={<RestaurantTablesManagement />} />
              <Route path="table-reservations" element={<TableReservationsManagement />} />
              {/* Coupon & Review Management */}
              <Route path="coupons" element={<CouponManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
            </Route>
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
