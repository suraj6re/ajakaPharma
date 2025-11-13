import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ product_id: '', product_name: '', category: '', composition: '', dosage_form: '', price: '' });
  const [formError, setFormError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getProducts();
      setProducts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openModal = (product = null) => {
    setEditProduct(product);
    setForm(product ? { ...product } : { product_id: '', product_name: '', category: '', composition: '', dosage_form: '', price: '' });
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditProduct(null); };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.product_name) {
      setFormError('Product name is required.');
      return;
    }
    try {
      if (editProduct) {
        await updateProduct(editProduct._id, { ...form, price: form.price ? Number(form.price) : undefined });
        toast.success('Product updated successfully!');
      } else {
        await addProduct({ ...form, price: form.price ? Number(form.price) : undefined });
        toast.success('Product added successfully!');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setFormError(errorMsg);
      toast.error('Failed to save product: ' + errorMsg);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      <AdminSidebar isOpen={isSidebarOpen} />
      <main className={`pt-20 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
            <div className="flex items-center space-x-3">
              <button onClick={() => openModal()} className="btn-primary">+ Add Product</button>
              <label className="btn-secondary cursor-pointer">
                Import CSV
                <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  const text = await file.text();
                  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
                  const headers = headerLine.split(',').map(h => h.trim());
                  const toObj = (line) => {
                    const cols = line.split(',');
                    const obj = {};
                    headers.forEach((h, i) => { obj[h] = (cols[i] || '').replace(/^"|"$/g, ''); });
                    return obj;
                  };
                  const rows = lines.map(toObj);
                  const normalized = rows.map(r => ({
                    product_id: r.product_id || '',
                    product_name: r.product_name || r.name || '',
                    category: r.category || '',
                    composition: r.composition || '',
                    dosage_form: r.dosage_form || r.dosageform || '',
                    price: r.price ? Number(r.price) : undefined
                  })).filter(r => r.product_name);
                  for (const p of normalized) {
                    try { await addProduct(p); } catch {}
                  }
                  fetchProducts();
                  e.target.value = '';
                }} />
              </label>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {loading ? (
              <div className="text-center py-4">Loading products...</div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 border-b text-left">Product ID</th>
                      <th className="py-2 px-4 border-b text-left">Product Name</th>
                      <th className="py-2 px-4 border-b text-left">Category</th>
                      <th className="py-2 px-4 border-b text-left">Composition</th>
                      <th className="py-2 px-4 border-b text-left">Dosage Form</th>
                      <th className="py-2 px-4 border-b text-left">Price</th>
                      <th className="py-2 px-4 border-b text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(prod => (
                      <tr key={prod._id}>
                        <td className="py-2 px-4 border-b">{prod.product_id}</td>
                        <td className="py-2 px-4 border-b">{prod.product_name}</td>
                        <td className="py-2 px-4 border-b">{prod.category}</td>
                        <td className="py-2 px-4 border-b">{prod.composition}</td>
                        <td className="py-2 px-4 border-b">{prod.dosage_form}</td>
                        <td className="py-2 px-4 border-b">{prod.price}</td>
                        <td className="py-2 px-4 border-b">
                          <button onClick={() => openModal(prod)} className="btn-secondary mr-2">Edit</button>
                          <button onClick={() => handleDelete(prod._id)} className="btn-danger-secondary">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Product ID</label>
                  <input type="text" name="product_id" value={form.product_id} onChange={handleChange} className="form-input" placeholder="Auto-generated if left blank" />
                </div>
                <div>
                  <label className="form-label">Product Name *</label>
                  <input type="text" name="product_name" value={form.product_name} onChange={handleChange} className="form-input" required />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <input type="text" name="category" value={form.category} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Composition</label>
                  <input type="text" name="composition" value={form.composition} onChange={handleChange} className="form-input" placeholder="e.g., Paracetamol 500mg" />
                </div>
                <div>
                  <label className="form-label">Dosage Form</label>
                  <input type="text" name="dosage_form" value={form.dosage_form} onChange={handleChange} className="form-input" placeholder="e.g., Tablet" />
                </div>
                <div>
                  <label className="form-label">Price</label>
                  <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleChange} className="form-input" placeholder="e.g., 25" />
                </div>
                {formError && <div className="text-red-500 text-sm">{formError}</div>}
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editProduct ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
