import db from '../config/db.js';

// =========================================================================
// 1. AMBIL SEMUA DATA PESANAN MASUK (UNTUK DASHBOARD ADMIN)
// =========================================================================
export const getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pesanan: ' + error.message });
  }
};

// =========================================================================
// 2. SIMPAN PESANAN BARU + POTONG STOK OTOMATIS (SINKRON DENGAN FRONTEND 🛠️)
// =========================================================================
export const createOrder = async (req, res) => {
  const { user_id, customer_name, customer_phone, shipping_address, total_payment, payment_method, items } = req.body;

  if (!customer_name || !customer_phone || !shipping_address || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Data checkout tidak lengkap!' });
  }

  const orderNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 999);
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // A. MASUKKAN DATA INDUK PESANAN (KOLOM total_amount SEKARANG SUDAH DIISI 🚀)
    const insertOrderQuery = `
      INSERT INTO orders
        (user_id, order_number, customer_name, customer_phone, shipping_address, total_amount, total_payment, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Kita passing nilai Number(total_payment) ke dalam dua tempat (untuk total_amount dan total_payment)
    const [orderResult] = await connection.query(insertOrderQuery, [
      user_id || null,
      orderNumber,
      customer_name,
      customer_phone,
      shipping_address,
      Number(total_payment), // ⬅️ Mengisi total_amount biar Railway tidak marah lagi!
      Number(total_payment), // ⬅️ Mengisi total_payment
      payment_method || 'COD',
      'Baru'
    ]);

    const newOrderId = orderResult.insertId;

    // B. Iterasi per item produk: Dipisah secara mandiri di order_items agar tidak menggumpal
    for (const item of items) {
      const [productRows] = await connection.query('SELECT stock, name FROM products WHERE id = ?', [item.id]);
      if (productRows.length === 0) throw new Error(`Suku cadang dengan ID ${item.id} tidak ditemukan!`);

      const currentStock = productRows[0].stock;
      if (currentStock < item.quantity) throw new Error(`Stok "${productRows[0].name}" tidak mencukupi!`);

      // 1. Masukkan data ke order_items secara spesifik per product_id
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [newOrderId, item.id, item.quantity, Number(item.price)]
      );

      // 2. Update stok dan jumlah terjual produk masing-masing secara terpisah
      await connection.query(
        'UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?',
        [item.quantity, item.quantity, item.id]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, message: 'Pesanan berhasil diproses terpisah!', orderId: newOrderId });

  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Gagal memproses pesanan: ' + error.message });
  } finally {
    connection.release();
  }
};

// =========================================================================
// 3. UPDATE STATUS PESANAN (UNTUK PROSES LIVE TRACKING DI PROFIL PELANGGAN)
// =========================================================================
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['Baru', 'Proses', 'Pengiriman', 'Selesai', 'Dibatalkan'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Status tidak valid!' });
  }

  try {
    const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data pesanan tidak ditemukan!' });
    }

    res.status(200).json({ success: true, message: `Status pesanan #${id} berhasil diubah menjadi ${status}!` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengupdate status: ' + error.message });
  }
};

// =========================================================================
// 4. FIX FINAL: AMBIL DETAIL RINCIAN INDUK + DAFTAR BARANG (SINKRON KOLOM BRANDS)
// =========================================================================
export const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // A. Query pertama: Ambil data induk pesanan (orders)
    const [orderRows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);

    if (orderRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Nota pesanan tidak ditemukan di database!' });
    }

    // B. Query kedua: Menggunakan LEFT JOIN ke tabel brands agar terpisah dan jelas nama merknya
    const itemsQuery = `
      SELECT
        oi.id, oi.order_id, oi.product_id, oi.quantity, oi.price_at_purchase AS price,
        p.name AS product_name, p.image AS image, b.name AS brand_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE oi.order_id = ?
    `;
    const [itemRows] = await db.query(itemsQuery, [id]);

    // C. Kembalikan response terstruktur rapi ke frontend
    res.status(200).json({
      success: true,
      data: {
        ...orderRows[0],
        items: itemRows
      }
    });

  } catch (error) {
    console.error("💥 DETAIL MASALAH DATABASE:", error.message);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail rincian pesanan: ' + error.message });
  }
};
