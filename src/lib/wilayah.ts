/**
 * Daftar provinsi dan kabupaten/kota Indonesia, dipanggang sebagai data statis.
 *
 * Sengaja tidak diambil dari API saat runtime. Wilayah administratif hampir
 * tidak pernah berubah, datanya cuma ~11 KB, dan satu lagi ketergantungan
 * pihak ketiga berarti satu lagi hal yang bisa mati atau diblokir CSP - persis
 * yang sudah terjadi pada pencarian sekolah.
 *
 * Ejaannya diselaraskan dengan Dapodik (sumber yang mengisi kolom ini otomatis
 * ketika sekolah dipilih): "Kab. Bogor", "Kota Bandung", "DKI Jakarta". Dicek
 * terhadap 420 sekolah nyata di 17 provinsi - seluruh kabupaten/kota cocok
 * persis, dan hanya dua nama provinsi yang ditulis berbeda oleh Dapodik
 * ("D.K.I. Jakarta", "D.I. Yogyakarta"), yang dinormalkan di cleanPropinsi.
 *
 * Catatan: sumbernya masih 34 provinsi, jadi empat provinsi pemekaran Papua
 * (2022) belum ada di daftar. Combobox-nya tetap menerima ketikan bebas, jadi
 * pengguna di sana masih bisa mengisi sendiri.
 */
export interface Wilayah {
  province: string;
  cities: string[];
}

export const WILAYAH: Wilayah[] = [
  {
    "province": "Aceh",
    "cities": [
      "Kab. Aceh Barat",
      "Kab. Aceh Barat Daya",
      "Kab. Aceh Besar",
      "Kab. Aceh Jaya",
      "Kab. Aceh Selatan",
      "Kab. Aceh Singkil",
      "Kab. Aceh Tamiang",
      "Kab. Aceh Tengah",
      "Kab. Aceh Tenggara",
      "Kab. Aceh Timur",
      "Kab. Aceh Utara",
      "Kab. Bener Meriah",
      "Kab. Bireuen",
      "Kab. Gayo Lues",
      "Kab. Nagan Raya",
      "Kab. Pidie",
      "Kab. Pidie Jaya",
      "Kab. Simeulue",
      "Kota Banda Aceh",
      "Kota Langsa",
      "Kota Lhokseumawe",
      "Kota Sabang",
      "Kota Subulussalam"
    ]
  },
  {
    "province": "Bali",
    "cities": [
      "Kab. Badung",
      "Kab. Bangli",
      "Kab. Buleleng",
      "Kab. Gianyar",
      "Kab. Jembrana",
      "Kab. Karang Asem",
      "Kab. Klungkung",
      "Kab. Tabanan",
      "Kota Denpasar"
    ]
  },
  {
    "province": "Banten",
    "cities": [
      "Kab. Lebak",
      "Kab. Pandeglang",
      "Kab. Serang",
      "Kab. Tangerang",
      "Kota Cilegon",
      "Kota Serang",
      "Kota Tangerang",
      "Kota Tangerang Selatan"
    ]
  },
  {
    "province": "Bengkulu",
    "cities": [
      "Kab. Bengkulu Selatan",
      "Kab. Bengkulu Tengah",
      "Kab. Bengkulu Utara",
      "Kab. Kaur",
      "Kab. Kepahiang",
      "Kab. Lebong",
      "Kab. Mukomuko",
      "Kab. Rejang Lebong",
      "Kab. Seluma",
      "Kota Bengkulu"
    ]
  },
  {
    "province": "DI Yogyakarta",
    "cities": [
      "Kab. Bantul",
      "Kab. Gunung Kidul",
      "Kab. Kulon Progo",
      "Kab. Sleman",
      "Kota Yogyakarta"
    ]
  },
  {
    "province": "DKI Jakarta",
    "cities": [
      "Kab. Kepulauan Seribu",
      "Kota Jakarta Barat",
      "Kota Jakarta Pusat",
      "Kota Jakarta Selatan",
      "Kota Jakarta Timur",
      "Kota Jakarta Utara"
    ]
  },
  {
    "province": "Gorontalo",
    "cities": [
      "Kab. Boalemo",
      "Kab. Bone Bolango",
      "Kab. Gorontalo",
      "Kab. Gorontalo Utara",
      "Kab. Pohuwato",
      "Kota Gorontalo"
    ]
  },
  {
    "province": "Jambi",
    "cities": [
      "Kab. Batang Hari",
      "Kab. Bungo",
      "Kab. Kerinci",
      "Kab. Merangin",
      "Kab. Muaro Jambi",
      "Kab. Sarolangun",
      "Kab. Tanjung Jabung Barat",
      "Kab. Tanjung Jabung Timur",
      "Kab. Tebo",
      "Kota Jambi",
      "Kota Sungai Penuh"
    ]
  },
  {
    "province": "Jawa Barat",
    "cities": [
      "Kab. Bandung",
      "Kab. Bandung Barat",
      "Kab. Bekasi",
      "Kab. Bogor",
      "Kab. Ciamis",
      "Kab. Cianjur",
      "Kab. Cirebon",
      "Kab. Garut",
      "Kab. Indramayu",
      "Kab. Karawang",
      "Kab. Kuningan",
      "Kab. Majalengka",
      "Kab. Pangandaran",
      "Kab. Purwakarta",
      "Kab. Subang",
      "Kab. Sukabumi",
      "Kab. Sumedang",
      "Kab. Tasikmalaya",
      "Kota Bandung",
      "Kota Banjar",
      "Kota Bekasi",
      "Kota Bogor",
      "Kota Cimahi",
      "Kota Cirebon",
      "Kota Depok",
      "Kota Sukabumi",
      "Kota Tasikmalaya"
    ]
  },
  {
    "province": "Jawa Tengah",
    "cities": [
      "Kab. Banjarnegara",
      "Kab. Banyumas",
      "Kab. Batang",
      "Kab. Blora",
      "Kab. Boyolali",
      "Kab. Brebes",
      "Kab. Cilacap",
      "Kab. Demak",
      "Kab. Grobogan",
      "Kab. Jepara",
      "Kab. Karanganyar",
      "Kab. Kebumen",
      "Kab. Kendal",
      "Kab. Klaten",
      "Kab. Kudus",
      "Kab. Magelang",
      "Kab. Pati",
      "Kab. Pekalongan",
      "Kab. Pemalang",
      "Kab. Purbalingga",
      "Kab. Purworejo",
      "Kab. Rembang",
      "Kab. Semarang",
      "Kab. Sragen",
      "Kab. Sukoharjo",
      "Kab. Tegal",
      "Kab. Temanggung",
      "Kab. Wonogiri",
      "Kab. Wonosobo",
      "Kota Magelang",
      "Kota Pekalongan",
      "Kota Salatiga",
      "Kota Semarang",
      "Kota Surakarta",
      "Kota Tegal"
    ]
  },
  {
    "province": "Jawa Timur",
    "cities": [
      "Kab. Bangkalan",
      "Kab. Banyuwangi",
      "Kab. Blitar",
      "Kab. Bojonegoro",
      "Kab. Bondowoso",
      "Kab. Gresik",
      "Kab. Jember",
      "Kab. Jombang",
      "Kab. Kediri",
      "Kab. Lamongan",
      "Kab. Lumajang",
      "Kab. Madiun",
      "Kab. Magetan",
      "Kab. Malang",
      "Kab. Mojokerto",
      "Kab. Nganjuk",
      "Kab. Ngawi",
      "Kab. Pacitan",
      "Kab. Pamekasan",
      "Kab. Pasuruan",
      "Kab. Ponorogo",
      "Kab. Probolinggo",
      "Kab. Sampang",
      "Kab. Sidoarjo",
      "Kab. Situbondo",
      "Kab. Sumenep",
      "Kab. Trenggalek",
      "Kab. Tuban",
      "Kab. Tulungagung",
      "Kota Batu",
      "Kota Blitar",
      "Kota Kediri",
      "Kota Madiun",
      "Kota Malang",
      "Kota Mojokerto",
      "Kota Pasuruan",
      "Kota Probolinggo",
      "Kota Surabaya"
    ]
  },
  {
    "province": "Kalimantan Barat",
    "cities": [
      "Kab. Bengkayang",
      "Kab. Kapuas Hulu",
      "Kab. Kayong Utara",
      "Kab. Ketapang",
      "Kab. Kubu Raya",
      "Kab. Landak",
      "Kab. Melawi",
      "Kab. Mempawah",
      "Kab. Sambas",
      "Kab. Sanggau",
      "Kab. Sekadau",
      "Kab. Sintang",
      "Kota Pontianak",
      "Kota Singkawang"
    ]
  },
  {
    "province": "Kalimantan Selatan",
    "cities": [
      "Kab. Balangan",
      "Kab. Banjar",
      "Kab. Barito Kuala",
      "Kab. Hulu Sungai Selatan",
      "Kab. Hulu Sungai Tengah",
      "Kab. Hulu Sungai Utara",
      "Kab. Kota Baru",
      "Kab. Tabalong",
      "Kab. Tanah Bumbu",
      "Kab. Tanah Laut",
      "Kab. Tapin",
      "Kota Banjar Baru",
      "Kota Banjarmasin"
    ]
  },
  {
    "province": "Kalimantan Tengah",
    "cities": [
      "Kab. Barito Selatan",
      "Kab. Barito Timur",
      "Kab. Barito Utara",
      "Kab. Gunung Mas",
      "Kab. Kapuas",
      "Kab. Katingan",
      "Kab. Kotawaringin Barat",
      "Kab. Kotawaringin Timur",
      "Kab. Lamandau",
      "Kab. Murung Raya",
      "Kab. Pulang Pisau",
      "Kab. Seruyan",
      "Kab. Sukamara",
      "Kota Palangka Raya"
    ]
  },
  {
    "province": "Kalimantan Timur",
    "cities": [
      "Kab. Berau",
      "Kab. Kutai Barat",
      "Kab. Kutai Kartanegara",
      "Kab. Kutai Timur",
      "Kab. Mahakam Hulu",
      "Kab. Paser",
      "Kab. Penajam Paser Utara",
      "Kota Balikpapan",
      "Kota Bontang",
      "Kota Samarinda"
    ]
  },
  {
    "province": "Kalimantan Utara",
    "cities": [
      "Kab. Bulungan",
      "Kab. Malinau",
      "Kab. Nunukan",
      "Kab. Tana Tidung",
      "Kota Tarakan"
    ]
  },
  {
    "province": "Kepulauan Bangka Belitung",
    "cities": [
      "Kab. Bangka",
      "Kab. Bangka Barat",
      "Kab. Bangka Selatan",
      "Kab. Bangka Tengah",
      "Kab. Belitung",
      "Kab. Belitung Timur",
      "Kota Pangkal Pinang"
    ]
  },
  {
    "province": "Kepulauan Riau",
    "cities": [
      "Kab. Bintan",
      "Kab. Karimun",
      "Kab. Kepulauan Anambas",
      "Kab. Lingga",
      "Kab. Natuna",
      "Kota B A T A M",
      "Kota Tanjung Pinang"
    ]
  },
  {
    "province": "Lampung",
    "cities": [
      "Kab. Lampung Barat",
      "Kab. Lampung Selatan",
      "Kab. Lampung Tengah",
      "Kab. Lampung Timur",
      "Kab. Lampung Utara",
      "Kab. Mesuji",
      "Kab. Pesawaran",
      "Kab. Pesisir Barat",
      "Kab. Pringsewu",
      "Kab. Tanggamus",
      "Kab. Tulang Bawang Barat",
      "Kab. Tulangbawang",
      "Kab. Way Kanan",
      "Kota Bandar Lampung",
      "Kota Metro"
    ]
  },
  {
    "province": "Maluku",
    "cities": [
      "Kab. Buru",
      "Kab. Buru Selatan",
      "Kab. Kepulauan Aru",
      "Kab. Maluku Barat Daya",
      "Kab. Maluku Tengah",
      "Kab. Maluku Tenggara",
      "Kab. Maluku Tenggara Barat",
      "Kab. Seram Bagian Barat",
      "Kab. Seram Bagian Timur",
      "Kota Ambon",
      "Kota Tual"
    ]
  },
  {
    "province": "Maluku Utara",
    "cities": [
      "Kab. Halmahera Barat",
      "Kab. Halmahera Selatan",
      "Kab. Halmahera Tengah",
      "Kab. Halmahera Timur",
      "Kab. Halmahera Utara",
      "Kab. Kepulauan Sula",
      "Kab. Pulau Morotai",
      "Kab. Pulau Taliabu",
      "Kota Ternate",
      "Kota Tidore Kepulauan"
    ]
  },
  {
    "province": "Nusa Tenggara Barat",
    "cities": [
      "Kab. Bima",
      "Kab. Dompu",
      "Kab. Lombok Barat",
      "Kab. Lombok Tengah",
      "Kab. Lombok Timur",
      "Kab. Lombok Utara",
      "Kab. Sumbawa",
      "Kab. Sumbawa Barat",
      "Kota Bima",
      "Kota Mataram"
    ]
  },
  {
    "province": "Nusa Tenggara Timur",
    "cities": [
      "Kab. Alor",
      "Kab. Belu",
      "Kab. Ende",
      "Kab. Flores Timur",
      "Kab. Kupang",
      "Kab. Lembata",
      "Kab. Malaka",
      "Kab. Manggarai",
      "Kab. Manggarai Barat",
      "Kab. Manggarai Timur",
      "Kab. Nagekeo",
      "Kab. Ngada",
      "Kab. Rote Ndao",
      "Kab. Sabu Raijua",
      "Kab. Sikka",
      "Kab. Sumba Barat",
      "Kab. Sumba Barat Daya",
      "Kab. Sumba Tengah",
      "Kab. Sumba Timur",
      "Kab. Timor Tengah Selatan",
      "Kab. Timor Tengah Utara",
      "Kota Kupang"
    ]
  },
  {
    "province": "Papua",
    "cities": [
      "Kab. Asmat",
      "Kab. Biak Numfor",
      "Kab. Boven Digoel",
      "Kab. Deiyai",
      "Kab. Dogiyai",
      "Kab. Intan Jaya",
      "Kab. Jayapura",
      "Kab. Jayawijaya",
      "Kab. Keerom",
      "Kab. Kepulauan Yapen",
      "Kab. Lanny Jaya",
      "Kab. Mamberamo Raya",
      "Kab. Mamberamo Tengah",
      "Kab. Mappi",
      "Kab. Merauke",
      "Kab. Mimika",
      "Kab. Nabire",
      "Kab. Nduga",
      "Kab. Paniai",
      "Kab. Pegunungan Bintang",
      "Kab. Puncak",
      "Kab. Puncak Jaya",
      "Kab. Sarmi",
      "Kab. Supiori",
      "Kab. Tolikara",
      "Kab. Waropen",
      "Kab. Yahukimo",
      "Kab. Yalimo",
      "Kota Jayapura"
    ]
  },
  {
    "province": "Papua Barat",
    "cities": [
      "Kab. Fakfak",
      "Kab. Kaimana",
      "Kab. Manokwari",
      "Kab. Manokwari Selatan",
      "Kab. Maybrat",
      "Kab. Pegunungan Arfak",
      "Kab. Raja Ampat",
      "Kab. Sorong",
      "Kab. Sorong Selatan",
      "Kab. Tambrauw",
      "Kab. Teluk Bintuni",
      "Kab. Teluk Wondama",
      "Kota Sorong"
    ]
  },
  {
    "province": "Riau",
    "cities": [
      "Kab. Bengkalis",
      "Kab. Indragiri Hilir",
      "Kab. Indragiri Hulu",
      "Kab. Kampar",
      "Kab. Kepulauan Meranti",
      "Kab. Kuantan Singingi",
      "Kab. Pelalawan",
      "Kab. Rokan Hilir",
      "Kab. Rokan Hulu",
      "Kab. S I A K",
      "Kota D U M A I",
      "Kota Pekanbaru"
    ]
  },
  {
    "province": "Sulawesi Barat",
    "cities": [
      "Kab. Majene",
      "Kab. Mamasa",
      "Kab. Mamuju",
      "Kab. Mamuju Tengah",
      "Kab. Mamuju Utara",
      "Kab. Polewali Mandar"
    ]
  },
  {
    "province": "Sulawesi Selatan",
    "cities": [
      "Kab. Bantaeng",
      "Kab. Barru",
      "Kab. Bone",
      "Kab. Bulukumba",
      "Kab. Enrekang",
      "Kab. Gowa",
      "Kab. Jeneponto",
      "Kab. Kepulauan Selayar",
      "Kab. Luwu",
      "Kab. Luwu Timur",
      "Kab. Luwu Utara",
      "Kab. Maros",
      "Kab. Pangkajene Dan Kepulauan",
      "Kab. Pinrang",
      "Kab. Sidenreng Rappang",
      "Kab. Sinjai",
      "Kab. Soppeng",
      "Kab. Takalar",
      "Kab. Tana Toraja",
      "Kab. Toraja Utara",
      "Kab. Wajo",
      "Kota Makassar",
      "Kota Palopo",
      "Kota Parepare"
    ]
  },
  {
    "province": "Sulawesi Tengah",
    "cities": [
      "Kab. Banggai",
      "Kab. Banggai Kepulauan",
      "Kab. Banggai Laut",
      "Kab. Buol",
      "Kab. Donggala",
      "Kab. Morowali",
      "Kab. Morowali Utara",
      "Kab. Parigi Moutong",
      "Kab. Poso",
      "Kab. Sigi",
      "Kab. Tojo Una-una",
      "Kab. Toli-toli",
      "Kota Palu"
    ]
  },
  {
    "province": "Sulawesi Tenggara",
    "cities": [
      "Kab. Bombana",
      "Kab. Buton",
      "Kab. Buton Selatan",
      "Kab. Buton Tengah",
      "Kab. Buton Utara",
      "Kab. Kolaka",
      "Kab. Kolaka Timur",
      "Kab. Kolaka Utara",
      "Kab. Konawe",
      "Kab. Konawe Kepulauan",
      "Kab. Konawe Selatan",
      "Kab. Konawe Utara",
      "Kab. Muna",
      "Kab. Muna Barat",
      "Kab. Wakatobi",
      "Kota Baubau",
      "Kota Kendari"
    ]
  },
  {
    "province": "Sulawesi Utara",
    "cities": [
      "Kab. Bolaang Mongondow",
      "Kab. Bolaang Mongondow Selatan",
      "Kab. Bolaang Mongondow Timur",
      "Kab. Bolaang Mongondow Utara",
      "Kab. Kepulauan Sangihe",
      "Kab. Kepulauan Talaud",
      "Kab. Minahasa",
      "Kab. Minahasa Selatan",
      "Kab. Minahasa Tenggara",
      "Kab. Minahasa Utara",
      "Kab. Siau Tagulandang Biaro",
      "Kota Bitung",
      "Kota Kotamobagu",
      "Kota Manado",
      "Kota Tomohon"
    ]
  },
  {
    "province": "Sumatera Barat",
    "cities": [
      "Kab. Agam",
      "Kab. Dharmasraya",
      "Kab. Kepulauan Mentawai",
      "Kab. Lima Puluh Kota",
      "Kab. Padang Pariaman",
      "Kab. Pasaman",
      "Kab. Pasaman Barat",
      "Kab. Pesisir Selatan",
      "Kab. Sijunjung",
      "Kab. Solok",
      "Kab. Solok Selatan",
      "Kab. Tanah Datar",
      "Kota Bukittinggi",
      "Kota Padang",
      "Kota Padang Panjang",
      "Kota Pariaman",
      "Kota Payakumbuh",
      "Kota Sawah Lunto",
      "Kota Solok"
    ]
  },
  {
    "province": "Sumatera Selatan",
    "cities": [
      "Kab. Banyu Asin",
      "Kab. Empat Lawang",
      "Kab. Lahat",
      "Kab. Muara Enim",
      "Kab. Musi Banyuasin",
      "Kab. Musi Rawas",
      "Kab. Musi Rawas Utara",
      "Kab. Ogan Ilir",
      "Kab. Ogan Komering Ilir",
      "Kab. Ogan Komering Ulu",
      "Kab. Ogan Komering Ulu Selatan",
      "Kab. Ogan Komering Ulu Timur",
      "Kab. Penukal Abab Lematang Ilir",
      "Kota Lubuklinggau",
      "Kota Pagar Alam",
      "Kota Palembang",
      "Kota Prabumulih"
    ]
  },
  {
    "province": "Sumatera Utara",
    "cities": [
      "Kab. Asahan",
      "Kab. Batu Bara",
      "Kab. Dairi",
      "Kab. Deli Serdang",
      "Kab. Humbang Hasundutan",
      "Kab. Karo",
      "Kab. Labuhan Batu",
      "Kab. Labuhan Batu Selatan",
      "Kab. Labuhan Batu Utara",
      "Kab. Langkat",
      "Kab. Mandailing Natal",
      "Kab. Nias",
      "Kab. Nias Barat",
      "Kab. Nias Selatan",
      "Kab. Nias Utara",
      "Kab. Padang Lawas",
      "Kab. Padang Lawas Utara",
      "Kab. Pakpak Bharat",
      "Kab. Samosir",
      "Kab. Serdang Bedagai",
      "Kab. Simalungun",
      "Kab. Tapanuli Selatan",
      "Kab. Tapanuli Tengah",
      "Kab. Tapanuli Utara",
      "Kab. Toba Samosir",
      "Kota Binjai",
      "Kota Gunungsitoli",
      "Kota Medan",
      "Kota Padangsidimpuan",
      "Kota Pematang Siantar",
      "Kota Sibolga",
      "Kota Tanjung Balai",
      "Kota Tebing Tinggi"
    ]
  }
];

export const PROVINCES = WILAYAH.map((w) => w.province);

/** Semua kabupaten/kota, dipakai saat provinsi belum dipilih. */
export const ALL_CITIES = Array.from(
  new Set(WILAYAH.flatMap((w) => w.cities)),
).sort((a, b) => a.localeCompare(b, "id-ID"));

/** Kabupaten/kota pada satu provinsi; seluruhnya kalau provinsinya tidak dikenal. */
export function citiesOf(province: string | null | undefined): string[] {
  if (!province) return ALL_CITIES;
  return WILAYAH.find((w) => w.province === province)?.cities ?? ALL_CITIES;
}

/** Apakah kota ini memang berada di provinsi tersebut. */
export function cityBelongsTo(city: string, province: string): boolean {
  return WILAYAH.some((w) => w.province === province && w.cities.includes(city));
}
