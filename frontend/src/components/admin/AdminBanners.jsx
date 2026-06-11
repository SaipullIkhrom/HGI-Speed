import { useState, useEffect } from 'react';
import { FaImage, FaTrash, FaPlus, FaLink } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/banners`);
        const data = await res.json();
        if (isMounted && data.success) setBanners(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('link_url', linkUrl);
    formData.append('image', imageFile);

    try {
      const res = await fetch(`${BASE_URL}/api/banners`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus gambar banner ini?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/banners/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setBanners(banners.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      <h1 className="text-xl font-black text-white flex items-center gap-2">
        <FaImage className="text-[#e11d48]" /> MANAJEMEN BANNER HERO
      </h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="JUDUL BANNER / SLOGAN PROMO" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white w-full" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="text" placeholder="LINK TARGET URL (Misal: /promo atau #)" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white w-full" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">File Gambar Banner (Rekomendasi Landscape / Lebar)</label>
          <input type="file" accept="image/*" className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-xs outline-none text-white w-full file:bg-slate-800 file:border-0 file:text-white file:text-xs file:px-3 file:py-1 file:rounded-lg file:mr-3" onChange={e => setImageFile(e.target.files[0])} required />
        </div>
        <button type="submit" className="bg-[#e11d48] text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-2 h-fit md:mt-5 py-3">
          <FaPlus /> UNGGAH BANNER
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center text-xs py-6">Memuat banner...</div>
        ) : (
          banners.map(b => (
            <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group relative">
              <div className="w-full h-40 bg-slate-950 border-b border-slate-800 overflow-hidden">
                <img src={`${BASE_URL}/uploads/banners/${b.image}`} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 flex justify-between items-center bg-slate-900">
                <div>
                  <h3 className="font-bold text-white text-sm truncate max-w-xs">{b.title}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1"><FaLink /> {b.link_url}</p>
                </div>
                <button onClick={() => handleDelete(b.id)} className="p-2.5 bg-slate-800 hover:bg-rose-950/40 text-slate-500 hover:text-[#e11d48] border border-slate-700 hover:border-rose-900/60 rounded-xl transition-all">
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
