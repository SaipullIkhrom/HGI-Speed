/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { BASE_URL } from "../config/api";

// Buat context utama
const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('IDR');
  const [currentRate, setCurrentRate] = useState(1);
  const [currentSymbol, setCurrentSymbol] = useState('Rp');

  // Helper untuk update state kurs & simbol secara sinkron
  const updateCurrencyState = useCallback((currencyCode, currencyList) => {
    const target = currencyList.find(c => c.code === currencyCode) || { exchange_rate: 1, symbol: 'Rp' };
    setSelectedCurrency(currencyCode);
    setCurrentRate(Number(target.exchange_rate));
    setCurrentSymbol(target.symbol);
    localStorage.setItem('global_currency', currencyCode);
  }, []);

  // Ambil data mata uang resmi dari backend
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/currencies`);
        const resData = await res.json();
        if (resData.success) {
          setCurrencies(resData.data);
          const savedCurrency = localStorage.getItem('global_currency') || 'IDR';
          updateCurrencyState(savedCurrency, resData.data);
        }
      } catch (err) {
        console.error('Gagal memuat sistem mata uang global:', err);
      }
    };
    fetchCurrencies();
  }, [updateCurrencyState]);

  // Fungsi pengubah mata uang global
  const changeCurrency = useCallback((currencyCode) => {
    updateCurrencyState(currencyCode, currencies);
  }, [currencies, updateCurrencyState]);

  // Fungsi sakti format uang dari IDR ke mata uang asing
  const formatPrice = useCallback((priceInIDR) => {
    const convertedPrice = Number(priceInIDR) * currentRate;
    const localeFormat = selectedCurrency === 'IDR' ? 'id-ID' : 'en-US';

    return new Intl.NumberFormat(localeFormat, {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'IDR' ? 0 : 2
    }).format(convertedPrice);
  }, [currentRate, selectedCurrency]);

  // Satukan seluruh value ke dalam useMemo
  const contextValue = useMemo(() => ({
    currencies,
    selectedCurrency,
    currentSymbol,
    changeCurrency,
    formatPrice
  }), [currencies, selectedCurrency, currentSymbol, changeCurrency, formatPrice]);

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Validasi properti children
CurrencyProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// 🛠️ INI DIA YANG TADI HILANG: Custom Hook disatukan di bawah
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency harus digunakan di dalam komponen CurrencyProvider');
  }
  return context;
};
