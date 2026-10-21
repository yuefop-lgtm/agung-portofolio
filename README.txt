AGUNG.SPACE - JUJUTSU PERSONAL DASHBOARD

FILES
- index.html : struktur halaman dan komponen
- style.css  : desain responsif dan animasi
- script.js  : login demo, navigasi, form, tema, dan localStorage
- server.js  : server Node.js tanpa dependency eksternal
- package.json : metadata dan perintah npm start

CARA MENJALANKAN DI VS CODE (WINDOWS)
1. Ekstrak folder proyek ke Documents, misalnya Documents\agung-jujutsu-dashboard.
2. Buka folder itu di VS Code (File > Open Folder).
3. Buka Terminal > New Terminal.
4. Jalankan: node server.js
5. Buka browser di: http://localhost:3000
6. Login demo: username kusuma, password agung
7. Tekan Ctrl+C di terminal untuk menghentikan server.

CATATAN
- Data dokumen, materi, jadwal, foto, absensi, dan tema disimpan di localStorage browser.
- Data ini tersimpan di browser/perangkat yang sama, bukan database online. Mode incognito, menghapus data browser, atau berpindah perangkat dapat membuat data tidak tersedia.
- Login ini hanya demo sisi browser, bukan sistem keamanan untuk melindungi data sensitif. Jangan unggah informasi rahasia.
- Foto dibatasi 2 MB per file agar penyimpanan browser tidak cepat penuh.
- Google Fonts memerlukan internet; website tetap punya font cadangan jika offline.
