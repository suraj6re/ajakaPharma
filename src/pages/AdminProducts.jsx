import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BeakerIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ 
    product_id: '', 
    product_name: '', 
    category: '', 
    composition: '', 
    dosage_form: '', 
    price: '' 
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(prod => {
        const productName = prod.basicInfo?.name || prod.product_name || prod.name || '';
        const category = prod.basicInfo?.category || prod.category || '';
        const composition = prod.medicalInfo?.composition || prod.composition || '';
        
        return productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               category.toLowerCase().includes(searchTerm.toLowerCase()) ||
               composition.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      // Handle nested response structure: response.data.data.products or response.data.products
      const data = response.data?.data?.products || response.data?.products || response.data?.data || response.data || [];
      console.log('Products fetched:', data); // Debug log
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    setEditProduct(product);
    if (product) {
      // Handle nested structure from MongoDB
      setForm({
        product_id: product.productId || product.product_id || '',
        product_name: product.basicInfo?.name || product.product_name || product.name || '',
        category: product.basicInfo?.category || product.category || '',
        composition: product.medicalInfo?.composition || product.composition || '',
        dosage_form: product.medicalInfo?.dosageForm || product.dosage_form || '',
        price: product.businessInfo?.mrp || product.price || ''
      });
    } else {
      setForm({ 
        product_id: '', 
        product_name: '', 
        category: '', 
        composition: '', 
        dosage_form: '', 
        price: '' 
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.product_name) {
      toast.error('Product name is required');
      return;
    }

    try {
      // Convert flat form to nested structure expected by API
      const productData = {
        productId: form.product_id || undefined,
        basicInfo: {
          name: form.product_name,
          category: form.category || 'General'
        },
        medicalInfo: {
          composition: form.composition || '',
          dosageForm: form.dosage_form || ''
        },
        businessInfo: {
          mrp: form.price ? Number(form.price) : 0
        }
      };

      if (editProduct) {
        await updateProduct(editProduct._id, productData);
        toast.success('Product updated successfully!');
      } else {
        await addProduct(productData);
        toast.success('Product added successfully!');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const headers = headerLine.split(',').map(h => h.trim());
      
      const rows = lines.map(line => {
        const cols = line.split(',');
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = (cols[i] || '').replace(/^"|"$/g, '');
        });
        return obj;
      });

      const normalized = rows.map(r => ({
        productId: r.product_id || r.productId || undefined,
        basicInfo: {
          name: r.product_name || r.name || '',
          category: r.category || 'General'
        },
        medicalInfo: {
          composition: r.composition || '',
          dosageForm: r.dosage_form || r.dosageform || r.dosageForm || ''
        },
        businessInfo: {
          mrp: r.price ? Number(r.price) : 0
        }
      })).filter(r => r.basicInfo.name);

      let successCount = 0;
      for (const p of normalized) {
        try {
          await addProduct(p);
          successCount++;
        } catch (err) {
          console.error('Error importing product:', err);
        }
      }

      toast.success(`Imported ${successCount} products successfully!`);
      fetchProducts();
    } catch (err) {
      console.error('Error importing CSV:', err);
      toast.error('Failed to import CSV');
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <BeakerIcon className="w-8 h-8 mr-3 text-primary-600" />
                  Manage Products
                </h1>
                <p className="text-gray-600 mt-1">Add, edit, and manage product catalog</p>
              </div>
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer">
                  <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                  Import CSV
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                </label>
                <button 
                  onClick={() => openModal()} 
                  className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, category, or composition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </motion.div>

          {/* Products Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Composition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage Form</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((prod, index) => (
                      <tr key={prod._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prod.productId || prod.product_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {prod.basicInfo?.name || prod.product_name || prod.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {prod.basicInfo?.category || prod.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {prod.medicalInfo?.composition || prod.composition || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {prod.medicalInfo?.dosageForm || prod.dosage_form || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {prod.businessInfo?.mrp || prod.price ? `₹${prod.businessInfo?.mrp || prod.price}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => openModal(prod)} 
                              className="inline-flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                            >
                              <PencilIcon className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(prod._id)} 
                              className="inline-flex items-center text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BeakerIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try a different search term' : 'Add your first product to get started'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          {!loading && products.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-primary-600">{products.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Set(products.map(p => p.basicInfo?.category || p.category).filter(Boolean)).size}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">Dosage Forms</p>
                <p className="text-2xl font-bold text-primary-600">
                  {new Set(products.map(p => p.medicalInfo?.dosageForm || p.dosage_form).filter(Boolean)).size}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Product ID</label>
                    <input 
                      type="text" 
                      name="product_id" 
                      value={form.product_id} 
                      onChange={handleChange} 
                      className="form-input" 
                      placeholder="Auto-generated if left blank" 
                    />
                  </div>
                  <div>
                    <label className="form-label">Product Name *</label>
                    <input 
                      type="text" 
                      name="product_name" 
                      value={form.product_name} 
                      onChange={handleChange} 
                      className="form-input" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Category</label>
                    <input 
                      type="text" 
                      name="category" 
                      value={form.category} 
                      onChange={handleChange} 
                      className="form-input"
                      placeholder="Antibiotic, Analgesic, etc."
                    />
                  </div>
                  <div>
                    <label className="form-label">Dosage Form</label>
                    <input 
                      type="text" 
                      name="dosage_form" 
                      value={form.dosage_form} 
                      onChange={handleChange} 
                      className="form-input"
                      placeholder="Tablet, Capsule, Syrup, etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Composition</label>
                    <input 
                      type="text" 
                      name="composition" 
                      value={form.composition} 
                      onChange={handleChange} 
                      className="form-input"
                      placeholder="e.g., Paracetamol 500mg"
                    />
                  </div>
                  <div>
                    <label className="form-label">Price (₹)</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      name="price" 
                      value={form.price} 
                      onChange={handleChange} 
                      className="form-input"
                      placeholder="25.00"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200"
                  >
                    {editProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
