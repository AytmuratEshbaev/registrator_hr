export const LANGUAGES = [
  { code: "qq", label: "Qq", nativeName: "Qaraqalpaqsha" },
  { code: "uz", label: "Uzb", nativeName: "O'zbekcha" },
  { code: "ru", label: "Rus", nativeName: "Русский" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "qq";
export const LANGUAGE_STORAGE_KEY = "zeyin.language";

type TranslationEntry = Record<LanguageCode, string>;

export const UI_TRANSLATIONS: TranslationEntry[] = [
  { uz: "O'quvchilar qabuli", qq: "Oqiwshılardı qabıllaw", ru: "Прием учеников" },
  { uz: "O'quvchi qabuli", qq: "Oqiwshılardı qabıllaw", ru: "Прием ученика" },
  { uz: "Vakansiyalar", qq: "Vakansiyalar", ru: "Вакансии" },
  { uz: "Boshqaruv paneli", qq: "Basqarıw paneli", ru: "Панель управления" },
  { uz: "Boshqaruv paneliga kirish", qq: "Basqarıw paneline kiriw", ru: "Вход в панель управления" },
  { uz: "O'quvchilar arizalari", qq: "Oqıwshılar arzaları", ru: "Заявки учеников" },
  { uz: "Nomzodlar arizalari", qq: "Talapkerler arzaları", ru: "Заявки кандидатов" },
  { uz: "Chiqish", qq: "Shıǵıw", ru: "Выйти" },
  { uz: "Tizimga kirish", qq: "Sistemaǵa kiriw", ru: "Вход в систему" },
  { uz: "Maxfiy kalit (Parol)", qq: "Parol", ru: "Пароль" },
  { uz: "Parol", qq: "Parol", ru: "Пароль" },
  { uz: "Kirish", qq: "Kiriw", ru: "Войти" },
  { uz: "Arizani Yuborish", qq: "Arzanı jiberiw", ru: "Отправить заявку" },
  { uz: "Yuborilmoqda...", qq: "Jiberilmekte...", ru: "Отправляется..." },
  { uz: "Bosh sahifaga qaytish", qq: "Bas betke qaytıw", ru: "Вернуться на главную" },
  { uz: "Arizangiz qabul qilindi!", qq: "Arzańız qabıl etildi!", ru: "Ваша заявка принята!" },
  { uz: "Nomzod Ma'lumotlari", qq: "Talapker maǵlıwmatları", ru: "Данные кандидата" },
  { uz: "O'quvchi Ma'lumotlari", qq: "Oqıwshi maǵlıwmatları", ru: "Данные ученика" },
  { uz: "Ota-ona Ma'lumotlari", qq: "Ata-ana maǵlıwmatları", ru: "Данные родителей" },
  { uz: "Aloqa Ma'lumotlari", qq: "Baylanıs maǵlıwmatları", ru: "Контактные данные" },
  { uz: "Tanlanayotgan Lavozim", qq: "Tańlanıp atırǵan lawazım", ru: "Выбранная должность" },
  { uz: "Rezyume (CV)", qq: "Rezyume (CV)", ru: "Резюме (CV)" },
  { uz: "Familiyasi", qq: "Familyası", ru: "Фамилия" },
  { uz: "Ismi", qq: "Atı", ru: "Имя" },
  { uz: "Sharifi (Otasining ismi)", qq: "Ákesiniń atı", ru: "Отчество" },
  { uz: "Telefon raqam (Asosiy)", qq: "Telefon nomeri (tiykarǵı)", ru: "Телефон (основной)" },
  { uz: "Telefon raqam (Qo'shimcha)", qq: "Telefon nomeri (qosımsha)", ru: "Телефон (дополнительный)" },
  { uz: "Qabul qilinadigan sinf", qq: "Qabıl etiletuǵın klass", ru: "Класс приема" },
  { uz: "Ochiq vakansiya", qq: "Ashıq vakansiya", ru: "Открытая вакансия" },
  { uz: "Lavozimni tanlang", qq: "Lawazımdı tańlań", ru: "Выберите должность" },
  { uz: "Sinfni tanlang", qq: "Klasstı tańlań", ru: "Выберите класс" },
  { uz: "Rezyumeni yuklash (PDF)", qq: "Rezyumeni júklew (PDF)", ru: "Загрузить резюме (PDF)" },
  { uz: "Til", qq: "Til", ru: "Язык" },
  { uz: "O'quvchi Qabul Formasi", qq: "Oqıwshı qabıllaw forması", ru: "Форма приема ученика" },
  { uz: "Nomzod Ma'lumotlari shakli", qq: "Talapker maglıwmatları forması", ru: "Форма данных кандидата" },
  { uz: "Qo'llab-quvvatlash", qq: "Qollap-quwatlaw", ru: "Поддержка" },
  { uz: "Agarda ro'yxatdan o'tishda qiyinchilikka duch kelsangiz, tizimda muammo yuzaga kelsa yoki qo'shimcha savollaringiz bo'lsa, istalgan vaqtda maktab ma'muriyati bilan bog'lanishingiz mumkin.", qq: "Dizimnen ótiwde qıyınshılıq bolsa yamasa qosımsha sorawlarıńız bolsa, telefon nomerimizge baylanısıwıńız mumkin.", ru: "Если у вас возникли трудности при регистрации, проблемы в системе или возникли дополнительные вопросы, вы можете связаться с администрацией школы." },
  { uz: "Telefon raqamimiz", qq: "Telefon nomerimiz", ru: "Наш телефон" },
  { uz: "Arizalar avtomatik ravishda saqlanadi va real vaqt rejimida ko'rib chiqiladi.", qq: "Arzalar avtomatik saqlanadı hám real waqıtta korip shıǵıladı.", ru: "Заявки автоматически сохраняются и рассматриваются в реальном времени." },
  { uz: "Tug'ilganlik guvohnomasi (metrika) seriyasi va raqami", qq: "Tuwılǵanlıq gúwalıǵı seriyasi ham nomeri", ru: "Серия и номер свидетельства о рождении" },
  { uz: "Seriya", qq: "Seriya", ru: "Серия" },
  { uz: "Tug'ilganlik guvohnomasi seriyasini tanlang va faqat 7 ta raqamini kiriting. (Masalan: I-TAS 1234567)", qq: "Tuwılǵanlıq gúwalıǵı seriyasin saylań hám tek nomerin kiritiń. (Misali: I-TAS 1234567)", ru: "Выберите серию свидетельства и введите только 7 цифр. (Например: I-TAS 1234567)" },
  { uz: "Masalan: Karimov", qq: "Mısalı: Karimov", ru: "Например: Каримов" },
  { uz: "Masalan: Sardor", qq: "Mısalı: Sardar", ru: "Например: Сардор" },
  { uz: "Masalan: Alisherovich", qq: "Mısalı: Alisherovich", ru: "Например: Алишерович" },
  { uz: "Pasport seriyasi va raqami", qq: "Pasport seriyasi ham nomeri", ru: "Серия и номер паспорта" },
  { uz: "Masalan: AA1234567", qq: "Mısalı: AA1234567", ru: "Например: AA1234567" },
  { uz: "Pasport seriyasi va 7 ta raqamini kiriting. (Masalan: AA1234567)", qq: "Pasport seriyasi ham nomerin kiritin. (Misali: AA1234567)", ru: "Введите серию паспорта и 7 цифр. (Например: AA1234567)" },
  { uz: "Iltimos, rezyumeyingizni (CV) PDF shaklida yuklang. Fayl hajmi 5 MB dan oshmasligi kerak.", qq: "Iltimas, rezyumeńizdi (CV) PDF turinde jukleń. Fayl kо́lemi 5 MB dan aspawı kerek.", ru: "Пожалуйста, загрузите резюме (CV) в формате PDF. Размер файла не должен превышать 5 MB." },
  { uz: "Murojaatingiz uchun tashakkur. Maktab ma'muriyati arizangizni tez orada ko'rib chiqadi va siz bilan bog'lanadi.", qq: "Murajaatıńız ushın raxmet.  Arzanı kórip shıǵıp, siz benen baylanısamız.", ru: "Спасибо за обращение. Администрация школы скоро рассмотрит вашу заявку и свяжется с вами." },
  { uz: "Maktab galereyasi", qq: "Mektep galereyası", ru: "Галерея школы" },
  { uz: "Maktabimizdan yorqin lavhalar", qq: "Mektebimizden kórinisler", ru: "Яркие моменты из жизни нашей школы" },
  { uz: "Sinfxonalar", qq: "Klasslar xanaları", ru: "Уютные учебные классы" },
  { uz: "Maktab binosi", qq: "Mektep imaratı", ru: "Здание школы" },
  { uz: "Zamonaviy IT xonasi", qq: "Zamanagóy IT xanası", ru: "Современный IT-класс" },
  { uz: "Kompyuter sinfi", qq: "Kompyuter klası", ru: "Компьютерный класс" },
  { uz: "Robototexnika xonasi", qq: "Robototexnika xanası", ru: "Кабинет робототехники" },
  { uz: "Yashil futbol maydoni", qq: "Jasıl futbol maydanı", ru: "Зеленое футбольное поле" },
  { uz: "Yopiq sport zali", qq: "Jabıq sport zalı", ru: "Спортивный зал" },
  { uz: "Maktab oshxonasi", qq: "Mektep asxanası", ru: "Школьная столовая" },
];

export function buildTranslationMap(language: LanguageCode): Map<string, string> {
  const map = new Map<string, string>();

  for (const entry of UI_TRANSLATIONS) {
    for (const value of Object.values(entry)) {
      map.set(value, entry[language]);
    }
  }

  return map;
}
