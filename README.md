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





