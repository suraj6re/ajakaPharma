import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    DocumentTextIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
// Using local storage for demo - in production would use Firestore

const RequestMRAccess = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        area: '',
        experience: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Scroll to top when component mounts to ensure form is visible
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required fields
            if (!formData.name || !formData.email || !formData.phone || !formData.area) {
                throw new Error('Please fill in all required fields');
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Phone validation (basic)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
                throw new Error('Please enter a valid 10-digit phone number');
            }

            // Submit to backend API
            const { submitMRRequest } = await import('../services/api');
            
            await submitMRRequest({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                area: formData.area,
                experience: formData.experience || ''
            });

            setSuccess(true);
            toast.success('🎉 Application submitted successfully!\nYou will receive a confirmation email shortly.');

            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                area: '',
                experience: ''
            });

        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Application Submitted Successfully!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your interest in joining Ajaka Pharma as a Medical Representative.
                        Your application has been submitted and is under review by our admin team.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        You will receive an email notification once your application is reviewed.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                        Back to Home
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-start justify-center">
            <div className="w-full max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-white rounded-xl shadow-xl p-8 border border-gray-100"
                    id="mr-application-form"
                >
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <UserIcon className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Apply as Medical Representative
                        </h1>
                        <p className="text-lg text-gray-600 max-w-lg mx-auto">
                            Join our team of healthcare professionals and make a difference in patient care.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="form-label flex items-center">
                                <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                                Full Name *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="form-label flex items-center">
                                <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-500" />
                                Email Address *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="form-label flex items-center">
                                <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
                                Phone Number *
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div>
                            <label htmlFor="area" className="form-label flex items-center">
                                <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
                                Area / Territory *
                            </label>
                            <input
                                id="area"
                                name="area"
                                type="text"
                                required
                                value={formData.area}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Enter your preferred area or territory"
                            />
                        </div>

                        <div>
                            <label htmlFor="experience" className="form-label flex items-center">
                                <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500" />
                                Brief Experience (Optional)
                            </label>
                            <textarea
                                id="experience"
                                name="experience"
                                rows="4"
                                value={formData.experience}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Tell us about your relevant experience in pharmaceutical sales or healthcare..."
                            />
                        </div>

                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                            <h3 className="font-semibold text-primary-800 mb-2">What happens next?</h3>
                            <ul className="text-sm text-primary-700 space-y-1">
                                <li>• Your application will be reviewed by our admin team</li>
                                <li>• You'll receive an email notification about the status</li>
                                <li>• If approved, you'll get login credentials to access the MR portal</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                            <Link
                                to="/"
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium text-center transition-colors duration-200"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default RequestMRAccess;