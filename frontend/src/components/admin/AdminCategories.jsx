import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaFolder } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const fetchCategories = () => {
    fetch(`${BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(resData => { if (resData.success) setCategories(resData.data); });
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    const response = await fetch(`${BASE_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategory })
    });

    if (response.ok) {
      setNewCategory('');
      fetchCategories();
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Hapus kategori ini?')) {
      await fetch(`${BASE_URL}/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl font-heading font-bold text-white uppercase tracking-tight">📂 Kelola Kategori Suku Cadang</h2>
        <p className="text-xs text-slate-400 mt-1">Tambah atau hapus kategori utama di halaman depan toko</p>
      </div>

      <form onSubmit={handleAddCategory} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl flex gap-3 max-w-md">
        <input
          type="text"
          placeholder="Nama Kategori Baru (ex: Knalpot, Kelistrikan)"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 w-full text-xs text-white outline-none focus:border-[#e11d48]"
          required
        />
        <button type="submit" className="bg-[#e11d48] text-white rounded-lg px-4 py-2 text-xs font-bold flex items-center gap-1.5 hover:bg-red-700 whitespace-nowrap"><FaPlus /> Tambah</button>
      </form>

      <div className="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden max-w-md">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 font-bold">
              <th className="p-3">Nama Kategori</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30 text-slate-300">
            {categories.map(cat => (
              <tr key={cat.id} className="hover:bg-slate-800/10">
                <td className="p-3 font-medium text-white flex items-center gap-2">
                  <FaFolder className="text-slate-500" /> {cat.name}
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(cat.id)} className="text-slate-500 hover:text-rose-500 transition-colors p-1"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategories;
