LAPORAN PRAKTIKUM (VIRDAN ANDI WARDANA TRPL2D)
DANALISA
ari hasil percobaan, penambahan tabel directors di database bisa berjalan dengan baik. Saat server dijalankan, tabel otomatis terbentuk dan data awal sutradara langsung bisa ditampilkan lewat endpoint /directors. Pengujian dengan Postman juga sukses: GET bisa menampilkan semua data atau data per ID, POST bisa menambah sutradara baru, PUT bisa mengubah data, dan DELETE bisa menghapus data. Setiap perubahan yang dilakukan di API juga langsung terlihat di file database movies.db, jadi alurnya dari client → server → database sudah terbukti jalan.
Selain itu, sistem juga bisa menangani error dengan benar. Misalnya kalau ada input kosong atau ID yang nggak ada, server ngasih respon error yang jelas. Endpoint lama /movies juga tetap aman, artinya penambahan fitur baru (/directors) nggak ganggu fitur yang sudah ada.


KESIMPULAN
Praktikum ini menunjukkan kalau Express.js bisa dihubungkan dengan SQLite dengan cukup mudah, dan kita bisa bikin resource baru (directors) tanpa merusak resource lama (movies). Semua operasi CRUD berjalan lancar, data tersimpan secara permanen di database, dan bisa diuji lewat Postman. Selain itu, praktikum ini juga bikin lebih paham pentingnya validasi input dan penanganan error supaya sistem lebih rapi dan tahan banting. Intinya, tujuan praktikum sudah tercapai karena kita berhasil bikin API yang bisa nyimpen dan ngatur data sutradara secara lengkap.


hasilnya ketika diliat di localhost port 3000
![data nya tertampil](img/satu.jpg)


![saya memkai port 3000](img/dua.jpg)


![getall tampilkan semua data dari directors](img/tiga.jpg)


![data id 1](img/empat.jpg)


![not found jika data tidak ada](img/lima.jpg)


![POST](img/enam.jpg)


![PUT](img/tujuh.jpg)



![DELETE](img/delapan.jpg)


Praktikum ini menunjukkan kalau Express.js bisa dihubungkan dengan SQLite dengan cukup mudah, dan kita bisa bikin resource baru (directors) tanpa merusak resource lama (movies). Semua operasi CRUD berjalan lancar, data tersimpan secara permanen di database, dan bisa diuji lewat Postman. Selain itu, praktikum ini juga bikin lebih paham pentingnya validasi input dan penanganan error supaya sistem lebih rapi dan tahan banting. Intinya, tujuan praktikum sudah tercapai karena kita berhasil bikin API yang bisa nyimpen dan ngatur data sutradara secara lengkap.





LAPORAN PRAKTIKUM : VIRDAN ANDI WARDANA TRPL 2D
1.Pertama tama bikin api buat film
![alt text](<img/api FILM.jpg>)

laluu bikin api untuk sutradaea nya
![screenshot coding](<img/api SUTRADARA.jpg>)

setelah itu kita coba metode CRUD
![data 1](<img/get DATA1.jpg>)

![data 2](<img/get DATA2.jpg>)

saya tambah data nya pakai POST
![data film jadi data ketiga](<img/post DATA3 (BARU).jpg>)
![data directors jadi data ketiga juga](<img/post DATA3 DIRECTORS (BARU).jpg>)

sekarang saya UPDATE data ke 1 aja
![update data 1](<img/update DATA1.jpg>)
![hasil update dari data 1](<img/HASIL UPDATE.jpg>)

lalu yang terakhir ada DELETE
![saya coba hapus data 3](<img/delete DATA3.jpg>)
![lalu ini tampilan ketika sudah saya hapus data ke 3](<img/tampilan setelah DELETE.jpg>)






## LAPORAN PRAKTIKUM Pengamanan API ##

NAMA : VIRDAN ANDI WARDANA
NIM : 362458302039
KELAS : TRPL 2 D


## PENDAHULUAN
Dalam dunia pengembangan perangkat lunak modern, keamanan merupakan elemen fundamental yang tidak dapat diabaikan. Modul ini menyoroti pentingnya aspek tersebut melalui topik pengamanan API menggunakan autentikasi dan otorisasi berbasis JSON Web Token (JWT). API, sebagai jembatan komunikasi antara klien dan server, memiliki peran vital dalam pertukaran data. Namun tanpa mekanisme keamanan yang tepat, API dapat menjadi celah besar bagi serangan, pencurian data, dan manipulasi informasi. Karena itulah, modul ini mengarahkan pembelajar untuk memahami dan menerapkan prinsip-prinsip keamanan dalam konteks API berbasis Node.js dan SQLite.

Pendahuluan dalam buku panduan ini menjelaskan bahwa setelah membangun API yang berfungsi dengan baik dan terhubung dengan basis data, langkah penting berikutnya adalah memberikan lapisan keamanan agar tidak semua pihak dapat mengakses data secara bebas. Tanpa autentikasi dan otorisasi, sistem menjadi terbuka dan mudah diserang. Modul ini menjadi panduan bagi mahasiswa atau pengembang untuk belajar bagaimana memverifikasi identitas pengguna (autentikasi) dan membatasi hak akses mereka (otorisasi).

Selain membahas teori, panduan ini juga memberikan petunjuk praktis dalam bentuk sesi latihan yang terstruktur. Di dalamnya dijelaskan bagaimana cara mengimplementasikan endpoint registrasi dan login, melakukan password hashing menggunakan bcrypt, hingga membuat middleware untuk memverifikasi token JWT. Semua langkah tersebut diarahkan agar API memiliki kemampuan untuk mengenali siapa penggunanya dan menentukan apa saja yang boleh mereka lakukan di dalam sistem.

Pendekatan pembelajaran ini tidak hanya menekankan pada teori, tetapi juga praktik langsung dalam kode. Dengan begitu, peserta tidak sekadar memahami konsep, melainkan juga mampu mengaplikasikannya secara nyata dalam proyek pengembangan API yang aman dan efisien. Pada akhirnya, melalui modul ini peserta diharapkan memiliki kesadaran akan urgensi keamanan data serta keterampilan teknis untuk menerapkannya di dunia profesional.

## ANALISA
Isi modul ini dapat dianalisis dari dua sisi utama: teori dan praktik implementasi. Dari sisi teori, modul menekankan dua konsep dasar keamanan dalam sistem API, yaitu autentikasi dan otorisasi. Autentikasi berfungsi untuk memverifikasi siapa pengguna yang mencoba mengakses sistem. Dalam hal ini, identitas pengguna diuji melalui kredensial seperti nama pengguna dan kata sandi. Setelah pengguna terautentikasi dengan benar, tahap berikutnya adalah otorisasi, yaitu menentukan hak akses apa saja yang dimiliki oleh pengguna tersebut. Dengan pembagian peran ini, sistem dapat menjamin bahwa setiap pengguna hanya dapat melakukan tindakan sesuai dengan izin yang diberikan.

Modul kemudian mengulas pentingnya keamanan kata sandi dengan menggunakan hashing dan salting. Hashing merupakan proses mengubah kata sandi menjadi bentuk lain menggunakan algoritma kriptografi satu arah, sehingga kata sandi asli tidak dapat diketahui meski database bocor. Sementara itu, salting menambahkan data acak unik ke setiap kata sandi sebelum dilakukan hashing, agar hasilnya selalu berbeda meskipun dua pengguna memiliki kata sandi yang sama. Dalam konteks Node.js, pustaka bcryptjs digunakan karena memiliki fitur otomatis untuk mengelola proses hashing dan verifikasi kata sandi dengan aman. Langkah-langkah ini mencerminkan praktik terbaik dalam keamanan modern, di mana perlindungan terhadap kredensial menjadi prioritas utama.

Selanjutnya, modul menjelaskan secara rinci konsep dan alur kerja JSON Web Token (JWT). JWT berperan sebagai tiket digital yang dikeluarkan setelah pengguna berhasil diautentikasi. Token ini bersifat self-contained dan stateless, artinya server tidak perlu menyimpan sesi pengguna di dalam memori. Struktur JWT terdiri dari tiga bagian: header, payload, dan signature. Bagian header berisi informasi algoritma dan tipe token, payload menyimpan data pengguna (seperti ID dan waktu kedaluwarsa), sedangkan signature memastikan token tersebut valid dan tidak dimodifikasi. Proses autentikasi menggunakan JWT diawali dari pengguna melakukan login, kemudian server memverifikasi kredensial dan menghasilkan token yang ditandatangani dengan secret key. Token inilah yang akan disertakan oleh klien dalam setiap permintaan berikutnya melalui header Authorization. Server kemudian memverifikasi token tersebut sebelum memproses permintaan. Dengan alur kerja seperti ini, sistem menjadi lebih aman karena setiap permintaan selalu diverifikasi secara kriptografis.




![Register](img/register.jpg)

![Login](img/login.jpg)

![Unauthorized](img/unauthorized.jpg)

![Movies](img/movies.jpg)




![Directors](<img/token kadaluarsa.jpg>)

![Directors](img/director.jpg)

# API FILM DIRECTOR

Proyek ini adalah implementasi API dengan Node.js dan SQLite untuk manajemen data film dan sutradara.
Mendukung autentikasi dan otorisasi menggunakan JSON Web Token (JWT).

## Fitur
- Registrasi dan login pengguna
- Hashing password dengan bcrypt
- Middleware autentikasi JWT
- CRUD untuk data film dan sutradara

## Teknologi
- Node.js
- Express.js
- SQLite
- JWT
- Bcrypt

## Cara Menjalankan
1. Clone repo ini
2. Install dependensi: `npm install`
3. Jalankan server: `npm start`


## KESIMPULAN
Modul “Pengamanan API – Autentikasi dan Autorisasi dengan JWT” memberikan panduan menyeluruh tentang bagaimana membangun sistem API yang aman menggunakan Node.js. Melalui kombinasi teori dan praktik, modul ini berhasil menjelaskan pentingnya keamanan dalam pengembangan perangkat lunak modern, terutama ketika berhadapan dengan data pengguna yang sensitif.

Dari sisi konsep, peserta belajar membedakan autentikasi dan otorisasi serta memahami bagaimana JWT bekerja sebagai standar industri dalam menjaga keamanan sesi pengguna. Penerapan teknik hashing dan salting dengan bcrypt menjadi pelajaran berharga dalam menjaga kerahasiaan kata sandi. Sedangkan dari sisi implementasi, pembuatan endpoint, middleware, dan perlindungan rute memberikan pemahaman teknis yang langsung bisa diterapkan pada proyek nyata.

Kesimpulannya, modul ini tidak sekadar mengajarkan bagaimana menulis kode untuk autentikasi, melainkan juga menanamkan kesadaran akan tanggung jawab etis seorang pengembang dalam menjaga keamanan data. Dengan menerapkan prinsip-prinsip yang dijelaskan, sebuah API dapat berfungsi secara efisien, terlindung dari serangan umum, dan memberikan kepercayaan lebih kepada pengguna. Secara keseluruhan, buku panduan ini menjadi landasan penting bagi siapa pun yang ingin memahami dan menguasai aspek keamanan dalam rekayasa perangkat lunak berbasis Node.js.