import { useState, useEffect } from 'react';
import { FaNewspaper, FaTrash, FaPlus, FaUser } from 'react-icons/fa';
import { BASE_URL } from "../../config/api";

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/articles`);
        const data = await res.json();
        if (isMounted && data.success) setArticles(data.data);
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
    formData.append('author', author);
    formData.append('content', content);
    formData.append('image', imageFile);

    try {
      const res = await fetch(`${BASE_URL}/api/articles`, {
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
    if (!confirm('Hapus artikel ini?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/articles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setArticles(articles.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-300">
      <h1 className="text-xl font-black text-white flex items-center gap-2">
        <FaNewspaper className="text-[#e11d48]" /> MANAJEMEN ARTIKEL BLOG
      </h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="JUDUL ARTIKEL (Misal: Tips Bore Up GL 100 Jadi 200cc)" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white w-full md:col-span-2" value={title} onChange={e => setTitle(e.target.value)} required />
        <input type="text" placeholder="NAMA PENULIS (Opsional)" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white w-full" value={author} onChange={e => setAuthor(e.target.value)} />
        <input type="file" accept="image/*" className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-xs text-white w-full file:bg-slate-800 file:border-0 file:text-white file:px-3 file:py-1 file:rounded-lg file:mr-3" onChange={e => setImageFile(e.target.files[0])} />
        <textarea placeholder="TULIS ISI ARTIKEL ATAU TIPS OTOMOTIF DI SINI..." rows="6" className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs outline-none text-white w-full md:col-span-2 resize-none" value={content} onChange={e => setContent(e.target.value)} required></textarea>
        <button type="submit" className="bg-[#e11d48] text-white font-bold rounded-xl text-xs hover:bg-red-700 transition-all md:col-span-2 py-3 flex items-center justify-center gap-2">
          <FaPlus /> TERBITKAN ARTIKEL
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center text-xs py-6">Memuat artikel...</div>
        ) : (
          articles.map(a => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between p-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 border border-slate-800">
                  {a.image ? <img src={`${BASE_URL}/uploads/articles/${a.image}`} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-bold">NO IMG</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white text-sm truncate">{a.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">{a.content}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><FaUser /> {a.author}</span>
                <button onClick={() => handleDelete(a.id)} className="text-slate-500 hover:text-[#e11d48] transition-colors"><FaTrash size={12} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminArticles;
