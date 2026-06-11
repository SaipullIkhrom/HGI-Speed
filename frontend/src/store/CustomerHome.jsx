import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import PopularCategories from '../components/home/PopularCategories';
import FlashSale from '../components/home/FlashSale';
import MotorFilter from '../components/home/MotorFilter';
import BestSellers from '../components/home/BestSellers';
import AllProducts from '../components/home/AllProducts';
import ArticlesAndMember from '../components/home/ArticlesAndMember';
import BrandSlider from '../components/home/BrandSlider';
import Footer from '../components/layout/Footer';
import { BASE_URL } from "../config/api";

const CustomerHome = () => {
  const [searchParams] = useSearchParams();

  // State utama penampung data produk asli dari database
  const [allProducts, setAllProducts] = useState([]);
  // State untuk menangani produk hasil filter/pencarian motor
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Tangkap parameter dinamis dari klik Navbar secara live
  const promo = searchParams.get('promo');
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const official = searchParams.get('official');

  // 1. 🛠️ SINKRONISASI TOTAL: Mengambil data produk berdasarkan parameter URL Navbar
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchNavbarFilteredProducts = async () => {
      try {
        // Bangun query string dinamis untuk dikirim ke backend controller getProducts
        const apiParams = new URLSearchParams();
        if (promo) apiParams.append('promo', promo);
        if (category) apiParams.append('category', category);
        if (search) apiParams.append('search', search);
        if (official) apiParams.append('official', official);

        const res = await fetch(`${BASE_URL}/api/products?${apiParams.toString()}`, {
          signal: controller.signal
        });
        const resData = await res.json();

        if (resData.success && isMounted) {
          setAllProducts(resData.data || []);
          setFilteredProducts(resData.data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Gagal menyaring data produk berdasarkan navigasi:', err);
        }
      }
    };

    fetchNavbarFilteredProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [promo, category, search, official]);

  // 2. Fungsi untuk mengambil data filter dari komponen MotorFilter
  const handleFilterSearch = (brandId, type, year) => {
    fetch(`${BASE_URL}/api/products/search-motor?brand_id=${brandId}&type=${type}&year=${year}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setFilteredProducts(resData.data || []);
        } else {
          setFilteredProducts([]);
        }
      })
      .catch((err) => {
        console.error('Gagal memfilter produk berbasis database:', err);
        setFilteredProducts([]);
      });
  };

  // 3. Fungsi untuk mereset pencarian kembali ke awal
  const handleResetFilter = () => {
    setFilteredProducts(allProducts);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans select-none">
      <Navbar />
      <main>
        {!promo && !category && !search && !official ? (
          <>
            <Hero />
            <PopularCategories />
            <FlashSale />
          </>
        ) : (
          <div className="py-6 bg-slate-900 text-white text-center border-b border-slate-800">
            <Container>
              <p className="text-xs font-mono tracking-widest text-[#e11d48] font-black uppercase">Mode Penyaringan Aktif</p>
              <h2 className="text-sm font-bold text-slate-300 mt-1">
                Menampilkan hasil untuk: {search || category || (promo && 'Promo Tergila') || (official && 'Merk Resmi HGI')}
              </h2>
            </Container>
          </div>
        )}

        {/* Menggunakan Handler Filter Motor Garasi */}
        <MotorFilter onFilterSearch={handleFilterSearch} onReset={handleResetFilter} />

        {/* 2. BAGIAN PRODUK TERLARIS (Murni berdiri sendiri tanpa prop tabrakan) */}
        {!promo && !category && !search && !official && <BestSellers />}

        {/* 3. BAGIAN KATALOG LENGKAP (Responsif disuntik data terfilter) */}
        <AllProducts products={filteredProducts} />

        {/* Menampilkan Artikel, Brand Slider, dan Penutup */}
        <ArticlesAndMember />
        <BrandSlider />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerHome;
