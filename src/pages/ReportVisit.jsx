import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../services/AuthContext';
import { getAllDoctors, getProducts } from '../services/api';

const ReportVisit = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [doctorQuery, setDoctorQuery] = useState('');
  const [showDoctorList, setShowDoctorList] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    notes: '',
    productsDiscussed: [],
  });
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsRes, productsRes] = await Promise.all([
          getAllDoctors(),
          getProducts(),
        ]);
        
        // Handle different response structures - ensure arrays
        const doctorsData = doctorsRes.data?.data?.doctors || doctorsRes.data?.data || doctorsRes.data?.doctors || doctorsRes.data || [];
        const productsData = productsRes.data?.data?.products || productsRes.data?.data || productsRes.data?.products || productsRes.data || [];
        
        // Ensure they are arrays
        const doctorsArray = Array.isArray(doctorsData) ? doctorsData : (doctorsData ? [doctorsData] : []);
        const productsArray = Array.isArray(productsData) ? productsData : (productsData ? [productsData] : []);
        
        console.log('✅ Loaded doctors:', doctorsArray.length);
        console.log('✅ Loaded products:', productsArray.length);
        
        // Extract and log cities for debugging
        if (doctorsArray.length > 0) {
          const cities = Array.from(new Set(
            doctorsArray
              .map(d => d.place || d.city || d.location || '')
              .filter(city => city && city.toString().trim() !== '')
              .map(city => city.toString().trim())
          ));
          console.log('🏙️ Available cities from doctors:', cities);
        }
        
        setDoctors(doctorsArray);
        setProducts(productsArray);
      } catch (err) {
        console.error('❌ Error loading data:', err);
        setError(err.response?.data?.message || 'Could not load doctors or products.');
        // Set empty arrays on error
        setDoctors([]);
        setProducts([]);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess('');
    setError('');
  };

  const handleProductSelection = (productId) => {
    setFormData(prev => {
      const newProducts = prev.productsDiscussed.includes(productId)
        ? prev.productsDiscussed.filter(id => id !== productId)
        : [...prev.productsDiscussed, productId];
      return { ...prev, productsDiscussed: newProducts };
    });
  };

  const handleOrderChange = (index, field, value) => {
    const updatedOrders = [...orders];
    updatedOrders[index][field] = value;
    setOrders(updatedOrders);
  };

  const addOrderLine = () => {
    setOrders([...orders, { product: '', quantity: 1 }]);
  };

  const removeOrderLine = (index) => {
    setOrders(orders.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user || (!user._id && !user.id)) throw new Error('User not authenticated.');

      const { submitVisit, createOrder } = await import('../services/api');

      // Prepare visit report data
      const reportData = {
        mr: user._id || user.id,
        doctor: formData.doctorId,
        productsDiscussed: formData.productsDiscussed,
        notes: formData.notes,
        visitDate: new Date().toISOString()
      };

      // Submit visit report
      const visitResponse = await submitVisit(reportData);
      const visitId = visitResponse.data.data._id;

      // Submit orders if any
      const finalOrders = orders.filter(o => o.product && o.quantity > 0);
      if (finalOrders.length > 0) {
        const orderData = {
          mr: user._id || user.id,
          doctor: formData.doctorId,
          visitReport: visitId,
          items: finalOrders.map(o => {
            // Find product to get price
            const product = products.find(p => p._id === o.product);
            const unitPrice = product?.businessInfo?.mrp || product?.price || 0;
            
            return {
              product: o.product,
              quantity: parseInt(o.quantity),
              unitPrice: unitPrice
            };
          }),
          orderDetails: {
            orderType: 'Doctor Order',
            orderDate: new Date()
          }
        };
        await createOrder(orderData);
      }

      setSuccess('Visit reported successfully! 🎉');
      setFormData({ doctorId: '', notes: '', productsDiscussed: [] });
      setOrders([]);
      setSelectedCity('');
      setDoctorQuery('');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/mr-dashboard');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit report');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />
      <main className="ml-64 pt-16 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Report Doctor Visit 📝</h1>
            <p className="text-gray-600 mt-1">Log visit details, discussions, and place orders.</p>
          </div>

          {success && <div className="bg-green-100 text-green-800 p-3 rounded-lg mb-6">{success}</div>}
          {error && <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Visit Details</h2>
              <div className="space-y-6">
                {/* City selection and doctor search */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label htmlFor="city" className="form-label">City *</label>
                    <select
                      id="city"
                      className="form-input"
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setFormData(prev => ({ ...prev, doctorId: '' }));
                        setDoctorQuery('');
                        setShowDoctorList(false);
                      }}
                      required
                    >
                      <option value="">Select a city</option>
                      {Array.from(new Set(
                        doctors
                          .map(d => d.place || d.city || d.location || '')
                          .filter(city => city && city.toString().trim() !== '')
                          .map(city => city.toString().trim())
                      ))
                        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
                        .map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                  </div>
                  
                </div>
                <div>
                  <label htmlFor="doctorInput" className="form-label">Doctor *</label>
                  <div className="relative">
                    <input
                      id="doctorInput"
                      className="form-input pr-10"
                      placeholder={selectedCity ? 'Type to search doctor by name' : 'Select a city first'}
                      value={doctorQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDoctorQuery(value);
                        setShowDoctorList(true);
                        const match = doctors
                          .filter(d => {
                            const doctorCity = (d.place || d.city || d.location || '').toString().trim();
                            return doctorCity === selectedCity;
                          })
                          .find(d => (d.name || '').toLowerCase() === value.toLowerCase());
                        setFormData(prev => ({ ...prev, doctorId: match ? match._id : '' }));
                      }}
                      onFocus={() => selectedCity && setShowDoctorList(true)}
                      disabled={!selectedCity}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 disabled:opacity-50"
                      onClick={() => selectedCity && setShowDoctorList(v => !v)}
                      disabled={!selectedCity}
                      aria-label="Toggle doctor list"
                    >
                      ▼
                    </button>
                    {showDoctorList && selectedCity && (
                      <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                        {doctors
                          .filter(d => {
                            const doctorCity = (d.place || d.city || d.location || '').toString().trim();
                            return doctorCity === selectedCity;
                          })
                          .filter(d => {
                            const doctorName = (d.name || '').toLowerCase();
                            const searchQuery = (doctorQuery || '').toLowerCase();
                            return doctorName.includes(searchQuery);
                          })
                          .map(d => (
                            <button
                              key={d._id}
                              type="button"
                              className="block w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              onClick={() => {
                                setDoctorQuery(d.name || '');
                                setFormData(prev => ({ ...prev, doctorId: d._id }));
                                setShowDoctorList(false);
                              }}
                            >
                              <div className="font-medium">{d.name}</div>
                              {(d.specialization || d.qualification) && (
                                <div className="text-sm text-gray-500">{d.specialization || d.qualification}</div>
                              )}
                            </button>
                          ))}
                        {doctors
                          .filter(d => {
                            const doctorCity = (d.place || d.city || d.location || '').toString().trim();
                            return doctorCity === selectedCity;
                          })
                          .filter(d => {
                            const doctorName = (d.name || '').toLowerCase();
                            const searchQuery = (doctorQuery || '').toLowerCase();
                            return doctorName.includes(searchQuery);
                          }).length === 0 && (
                          <div className="px-3 py-2 text-gray-500 text-center">
                            {selectedCity ? 'No doctors found in this city' : 'Select a city first'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="form-label">Products Discussed *</label>
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
                      {products.map(p => (
                        <label 
                          key={p._id} 
                          className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                            formData.productsDiscussed.includes(p._id) 
                              ? 'bg-primary-50 border-2 border-primary-500' 
                              : 'bg-white border-2 border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={formData.productsDiscussed.includes(p._id)} 
                            onChange={() => handleProductSelection(p._id)} 
                            className="h-5 w-5 rounded text-primary-600 mt-0.5 flex-shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm">
                              {p.basicInfo?.name || p.product_name || p.name || 'Unknown Product'}
                            </div>
                            {p.basicInfo?.category && (
                              <div className="text-xs text-gray-500 mt-1">
                                {p.basicInfo.category}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-500">
                      No products available
                    </div>
                  )}
                  {formData.productsDiscussed.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {formData.productsDiscussed.length} product(s)
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="notes" className="form-label">Notes / Feedback *</label>
                  <textarea id="notes" name="notes" required value={formData.notes} onChange={handleChange} className="form-input" rows="4" placeholder="Enter detailed notes..." />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Place Orders</h2>
              <div className="space-y-4">
                {orders.map((order, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <select 
                      value={order.product} 
                      onChange={(e) => handleOrderChange(index, 'product', e.target.value)} 
                      className="form-input w-1/2"
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.basicInfo?.name || p.product_name || p.name || 'Unknown Product'}
                          {p.basicInfo?.category && ` - ${p.basicInfo.category}`}
                        </option>
                      ))}
                    </select>
                    <input 
                      type="number" 
                      min="1" 
                      value={order.quantity} 
                      onChange={(e) => handleOrderChange(index, 'quantity', e.target.value)} 
                      className="form-input w-1/4" 
                      placeholder="Qty" 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeOrderLine(index)} 
                      className="btn-danger-secondary"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addOrderLine} className="btn-secondary">+ Add Order Line</button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button type="submit" disabled={loading || !formData.doctorId} className="btn-primary disabled:opacity-50">{loading ? 'Submitting...' : '📝 Submit Report & Orders'}</button>
              <button type="button" onClick={() => navigate('/mr-dashboard')} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ReportVisit;