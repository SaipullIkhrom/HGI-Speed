import db from '../config/db.js';

// =========================================================================
// 1. MEMBUAT TRANSAKSI BARU (REKONSILIASI OTOMATIS SUB-TOTAL & TOTAL HARGA)
// =========================================================================
export const createTransaction = async (req, res) => {
  const { user_id, customer_name, customer_phone, shipping_address, payment_method, items } = req.body;

  // Validasi awal kelengkapan data checkout dari frontend
  if (!customer_name || !customer_phone || !shipping_address || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Data transaksi tidak lengkap!' });
  }

  const orderNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 999);
  const connection = await db.getConnection();

  try {
    // Mulai mode transaksi database (ACID compliance)
    await connection.beginTransaction();

    let calculatedTotalPayment = 0;
    const validatedItems = [];

    // ─── LANGKAH A: VALIDASI STOK & HITUNG SUB-TOTAL AMAN DI BACKEND ───
    for (const item of items) {
      const [productRows] = await connection.query('SELECT stock, name, price FROM products WHERE id = ?', [item.id]);
      if (productRows.length === 0) throw new Error(`Suku cadang dengan ID ${item.id} tidak ditemukan!`);

      const currentStock = productRows[0].stock;
      if (currentStock < item.quantity) throw new Error(`Stok "${productRows[0].name}" tidak mencukupi!`);

      // Ambil harga langsung dari database, bukan dari request body (mencegah manipulasi harga)
      const priceAtPurchase = Number(productRows[0].price);
      const subtotal = priceAtPurchase * Number(item.quantity);

      // Akumulasikan subtotal ke total invoice global
      calculatedTotalPayment += subtotal;

      validatedItems.push({
        id: item.id,
        quantity: item.quantity,
        price: priceAtPurchase,
        subtotal: subtotal
      });
    }

    // ─── LANGKAH B: SIMPAN DATA NOTA MASTER KE TABEL orders (1) ───
    const insertOrderQuery = `
      INSERT INTO orders
        (user_id, order_number, customer_name, customer_phone, shipping_address, total_payment, payment_method, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [orderResult] = await connection.query(insertOrderQuery, [
      user_id || null,
      orderNumber,
      customer_name,
      customer_phone,
      shipping_address,
      calculatedTotalPayment, // Total pembayaran hasil kalkulasi backend yang sah
      payment_method || 'COD',
      'Baru'
    ]);

    const newOrderId = orderResult.insertId;

    // ─── LANGKAH C: SIMPAN PRODUK TERPISAH BESERTA SUB-TOTAL KE order_items (N) ───
    for (const item of validatedItems) {
      const insertItemQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `;

      await connection.query(insertItemQuery, [
        newOrderId,
        item.id,
        item.quantity,
        item.price,      // harga_satuan
        item.subtotal   // subtotal (harga * qty)
      ]);

      // Potong stok produk and update data penjualan item terkait
      await connection.query(
        'UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?',
        [item.quantity, item.quantity, item.id]
      );
    }

    // Kunci seluruh perubahan jika tidak ada kendala stok/query
    await connection.commit();
    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dipisahkan per produk sesuai regulasi!',
      orderId: newOrderId,
      orderNumber,
      total_payment: calculatedTotalPayment
    });

  } catch (error) {
    // Gagalkan seluruh transaksi jika ada satu saja item bermasalah
    await connection.rollback();
    res.status(500).json({ success: false, message: 'Gagal memproses transaksi: ' + error.message });
  } finally {
    connection.release();
  }
};

// =========================================================================
// 2. AMBIL SEMUA RIWAYAT TRANSAKSI USER (MENAMPILKAN PRODUK SECARA TERPISAH)
// =========================================================================
export const getTransactionHistory = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, message: 'User ID wajib disertakan!' });
  }

  try {
    // Menambahkan oi.subtotal ke dalam daftar field data yang diambil
    const query = `
      SELECT
        o.id AS order_id, o.order_number, o.status, o.created_at, o.payment_method, o.total_payment AS total_nota,
        oi.id AS item_id, oi.quantity, oi.price_at_purchase AS price, oi.subtotal AS item_subtotal,
        p.id AS product_id, p.name AS product_name, p.image AS product_image,
        b.name AS brand_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE o.user_id = ?
      ORDER BY o.id DESC, oi.id ASC
    `;

    const [rows] = await db.query(query, [user_id]);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat transaksi: ' + error.message });
  }
};
