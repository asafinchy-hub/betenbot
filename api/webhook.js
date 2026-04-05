import CODES from './codes.js';

const LINKS_TLV_THU = 'https://betenmelea.com/product/betenmelea-culinarytour-tlv-thursday/';
const LINKS_TLV_FRI = 'https://betenmelea.com/product/betenmelea-culinarytour-tlv/';
const LINKS_LEV = 'https://betenmelea.com/product/levinsky-tour/';

const CLOSED_MSG =
  'היי 🙂\n' +
  'תודה שפנית ל"בטן מלאה" 💛\n' +
  'המשרד שלנו סגור כרגע, אבל אל דאגה נחזור אלייך ברגע שנפתח 🙏\n\n' +
  'בינתיים נשמח שתכתבו לנו כאן את הבקשה שלכם ואת שמכם המלא 📲✨\n\n' +
  'שעות הפעילות שלנו:\n' +
  'ראשון עד חמישי 9:00 עד 18:00\n' +
  'שישי 9:00 עד 13:00\n\n' +
  'מאחלים לכם יום מקסים 💛';

const sessions = {};

function getSession(id) {
  if (!sessions[id]) {
    sessions[id] = {
      state: 'main',
      history: [],
      confused: 0,
      paused: false,
      tour: '',
      org: '',
      voucherName: '',
      voucherPax: '',
      voucherDate: '',
    };
  }
  return sessions[id];
}

function pushState(session, nextState) {
  if (session.state !== nextState) {
    session.history.push(session.state);
    session.state = nextState;
  }
}

function goBack(session) {
  const prev = session.history.pop();
  session.state = prev || 'main';
}

function goMain(session) {
  session.state = 'main';
  session.history = [];
  session.confused = 0;
}

function normalizeText(text = '') {
  return text
    .trim()
    .toLowerCase()
    .replace(/\u200f/g, '')
    .replace(/\u200e/g, '')
    .replace(/\s+/g, ' ');
}

function extractNumber(text = '') {
  const match = normalizeText(text).match(/^\d+$/);
  return match ? Number(match[0]) : null;
}

function lookup(raw) {
  if (!raw) return null;
  const code = raw.trim().toLowerCase().replace(/\.0$/, '');
  return CODES[code] || null;
}

function isOffHours() {
  const now = new Date();
  const month = now.getUTCMonth();
  const isDST = month >= 2 && month <= 9;
  const offset = isDST ? 3 : 2;

  let hour = now.getUTCHours() + offset;
  let day = now.getUTCDay();

  if (hour >= 24) {
    hour -= 24;
    day = (day + 1) % 7;
  }

  const minutes = hour * 60 + now.getUTCMinutes();

  if (day === 6) return true; // שבת
  if (day >= 0 && day <= 4) return minutes < 9 * 60 || minutes >= 18 * 60; // א-ה
  if (day === 5) return minutes < 9 * 60 || minutes >= 13 * 60; // שישי

  return true;
}

function menu(title, options, withBack = false) {
  const items = [...options];

  if (withBack) {
    items.push('חזרה לשלב הקודם ◀');
    items.push('חזרה לתפריט הראשי 🏠');
  }

  return `${title}\n\n${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
}

function mainMenu() {
  return (
    'היי 👋\n' +
    'אני הדר, מנהלת המשרד של בטן מלאה 🍽️\n' +
    'איזה כיף שפנית אלינו!\n\n' +
    'כדי שאוכל לעזור לך הכי מהר ומדויק, בחר/י מספר מהאפשרויות 👇\n\n' +
    '1. לקבלת מידע על סיור קולינרי\n' +
    '2. הרשמה לסיור קולינרי\n' +
    '3. יש לי הזמנה קיימת ורוצה לעדכן\n' +
    '4. מימוש שובר / קוד הטבה\n' +
    '5. סיור פרטי / לקבוצות וחברות\n' +
    '6. משהו אחר'
  );
}

function infoMenu() {
  return menu(
    'איזה מהסיורים שלנו מעניין אותך? 😍',
    [
      '🔥 הסיור המושחת בתל אביב',
      '🌍 הסיור העולמי בלוינסקי',
      '🏢 סיור פרטי לחברות וארגונים',
      'עדיין לא החלטתי',
    ],
    true
  );
}

function registerMenu() {
  return menu(
    'מעולה 😍 לאיזה סיור תרצו להירשם?',
    [
      '🔥 הסיור המושחת בתל אביב',
      '🌍 הסיור העולמי בלוינסקי',
      '👩‍💼 אני צריכ/ה עזרה מנציגה',
    ],
    true
  );
}

function sendInfoTLV() {
  return menu(
    '🔥 הסיור המושחת בתל אביב\n\n' +
      'סיור שכולו אוכל מוגזם, מנות שוות, כיף ואווירה 🔥\n' +
      'הסיור לא כשר.\n\n' +
      'מה תרצו לדעת?',
    [
      'ימים ושעות',
      'האם כשר / מתאים לשומרי כשרות',
      'פרטים נוספים על הסיור',
      'בא לי להירשם',
      'משהו אחר',
    ],
    true
  );
}

function sendInfoLEV() {
  return menu(
    '🌍 הסיור העולמי בלוינסקי\n\n' +
      'סיור קולינרי כשר, מגוון ומעולה, עם תעודות כשרות ✡️\n\n' +
      'מה תרצו לדעת?',
    [
      'ימים ושעות',
      'כשרות',
      'פרטים נוספים על הסיור',
      'בא לי להירשם',
      'משהו אחר',
    ],
    true
  );
}

function sendPrivateIntro() {
  return menu(
    '🏢 סיור פרטי לחברות וארגונים\n\n' +
      'יש לנו סיורים פרטיים מעולים לקבוצות, ימי גיבוש, צוותים וחוויות משותפות.\n\n' +
      'מה הכי רלוונטי לכם?',
    [
      'אני רוצה שיחזרו אליי עם הצעה',
      'אני רוצה להבין איזה סיור מתאים לנו',
      'יש לנו דרישת כשרות',
    ],
    true
  );
}

function sendUpdateBooking() {
  return (
    'בשמחה 🙂\n\n' +
    'כדי שנוכל לעזור עם הזמנה קיימת, כתבו לנו כאן:\n' +
    'שם מלא\n' +
    'טלפון\n' +
    'תאריך הסיור\n' +
    'ומה תרצו לעדכן\n\n' +
    'הדר תחזור אליכם בהקדם 👩‍💼✅'
  );
}

function sendOther() {
  return 'בטח 🙂 כתבו לנו כאן במה אפשר לעזור והדר תחזור אליכם בהקדם 👩‍💼✅';
}

function sendPayDay() {
  return menu(
    'לאיזה יום תרצו לרכוש מקום לסיור המושחת? 🔥',
    ['יום חמישי', 'יום שישי'],
    true
  );
}

function sendVoucherStart() {
  return (
    'מעולה 🙂\n\n' +
    'כדי שנוכל לבדוק ולממש את השובר בצורה מסודרת, כתבו כאן את השם המלא של מבצע/ת ההזמנה.\n\n' +
    '1. חזרה לשלב הקודם ◀\n' +
    '2. חזרה לתפריט הראשי 🏠'
  );
}

function sendVoucherPax(session) {
  return (
    `תודה ${session.voucherName || ''} 💛\n\n` +
    'לכמה משתתפים מיועד השובר?\n\n' +
    '1. חזרה לשלב הקודם ◀\n' +
    '2. חזרה לתפריט הראשי 🏠'
  );
}

function sendVoucherDate(session) {
  return (
    `מעולה.\n\n` +
    `לכמה משתתפים: ${session.voucherPax}\n\n` +
    'אם כבר יש תאריך מבוקש, כתבו אותו כאן.\n' +
    'אם עדיין אין תאריך, כתבו: דלג\n\n' +
    '1. חזרה לשלב הקודם ◀\n' +
    '2. חזרה לתפריט הראשי 🏠'
  );
}

function sendVoucherCodeRequest() {
  return (
    'מעולה.\n\n' +
    'עכשיו שלחו כאן את קוד השובר / ההטבה.\n' +
    'אפשר לשלוח כמה קודים בהודעות נפרדות או הכל יחד.\n\n' +
    '1. סיימתי לשלוח קודים\n' +
    '2. חזרה לשלב הקודם ◀\n' +
    '3. חזרה לתפריט הראשי 🏠'
  );
}

function sendHumanHandoff() {
  return 'הדר תחזור אליך בהקדם! 👩‍💼✅';
}

function sendConfused(session, fallbackText) {
  session.confused += 1;

  if (session.confused >= 2) {
    session.confused = 0;
    session.paused = true;
    return (
      'לא בטוחה שתפסתי 😅\n\n' +
      'כדי שלא נסתבך, הדר תחזור אליך אישית בהקדם 👩‍💼✅'
    );
  }

  return `לא הצלחתי להבין 🙏\n\n${fallbackText}`;
}

function detectIntent(text) {
  const t = normalizeText(text);

  if (['תפריט', 'תפריט ראשי', 'ראשי', 'menu', 'main'].includes(t)) return 'main';
  if (t.includes('חזרה')) return 'back';

  if (t.includes('סיור') || t.includes('תל אביב') || t.includes('לוינסקי')) return 'tour';
  if (t.includes('הרשמה') || t.includes('להירשם') || t.includes('לרכוש')) return 'register';
  if (t.includes('שובר') || t.includes('קוד') || t.includes('הטבה') || lookup(t)) return 'voucher';
  if (t.includes('הזמנה') || t.includes('לעדכן')) return 'update';
  if (t.includes('חברה') || t.includes('ארגון') || t.includes('קבוצה') || t.includes('פרטי')) return 'private';
  if (t.includes('נציג') || t.includes('נציג/ה') || t.includes('אישי') || t.includes('משהו אחר')) return 'human';

  return 'unknown';
}

async function sendMessage(chatId, text) {
  const instance = process.env.GREEN_API_INSTANCE;
  const token = process.env.GREEN_API_TOKEN;

  if (!instance || !token) {
    throw new Error('Missing GREEN_API_INSTANCE or GREEN_API_TOKEN');
  }

  const url = `https://api.green-api.com/waInstance${instance}/sendMessage/${token}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatId,
      message: text,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Green API send failed: ${resp.status} ${errText}`);
  }
}

async function processMessage(chatId, rawMessage) {
  const session = getSession(chatId);
  const msg = normalizeText(rawMessage);
  const n = extractNumber(msg);
  const voucherType = lookup(msg);

  if (session.paused) {
    return null;
  }

  if (msg === 'תפריט' || msg === 'תפריט ראשי' || msg === 'ראשי' || msg === '0') {
    goMain(session);
    return mainMenu();
  }

  if (session.state === 'main') {
    if (n === 1) {
      session.confused = 0;
      pushState(session, 'info_menu');
      return infoMenu();
    }
    if (n === 2) {
      session.confused = 0;
      pushState(session, 'register_menu');
      return registerMenu();
    }
    if (n === 3) {
      session.confused = 0;
      session.paused = true;
      return sendUpdateBooking();
    }
    if (n === 4) {
      session.confused = 0;
      pushState(session, 'voucher_name');
      return sendVoucherStart();
    }
    if (n === 5) {
      session.confused = 0;
      pushState(session, 'private_menu');
      return sendPrivateIntro();
    }
    if (n === 6) {
      session.confused = 0;
      session.paused = true;
      return sendOther();
    }

    const intent = detectIntent(msg);

    if (intent === 'tour') {
      pushState(session, 'info_menu');
      return infoMenu();
    }
    if (intent === 'register') {
      pushState(session, 'register_menu');
      return registerMenu();
    }
    if (intent === 'voucher') {
      pushState(session, 'voucher_name');
      return sendVoucherStart();
    }
    if (intent === 'update') {
      session.paused = true;
      return sendUpdateBooking();
    }
    if (intent === 'private') {
      pushState(session, 'private_menu');
      return sendPrivateIntro();
    }
    if (intent === 'human') {
      session.paused = true;
      return sendOther();
    }

    return sendConfused(session, mainMenu());
  }

  if (session.state === 'info_menu') {
    if (n === 1) {
      session.confused = 0;
      session.tour = 'tlv';
      pushState(session, 'info_tlv');
      return sendInfoTLV();
    }
    if (n === 2) {
      session.confused = 0;
      session.tour = 'lev';
      pushState(session, 'info_lev');
      return sendInfoLEV();
    }
    if (n === 3) {
      session.confused = 0;
      pushState(session, 'private_menu');
      return sendPrivateIntro();
    }
    if (n === 4) {
      session.confused = 0;
      return (
        'אם אתם מתלבטים 😊\n\n' +
        '🔥 הסיור המושחת בתל אביב מתאים למי שמחפש חוויה מושחתת ולא כשרה.\n' +
        '🌍 הסיור בלוינסקי מתאים למי שמחפש סיור כשר עם תעודות.\n\n' +
        '1. מידע על הסיור המושחת\n' +
        '2. מידע על הסיור בלוינסקי\n' +
        '3. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 5) {
      goBack(session);
      return mainMenu();
    }
    if (n === 6) {
      goMain(session);
      return mainMenu();
    }

    return sendConfused(session, infoMenu());
  }

  if (session.state === 'info_tlv') {
    if (n === 1) {
      return (
        '🔥 הסיור המושחת בתל אביב מתקיים:\n\n' +
        'יום חמישי\n' +
        'יום שישי\n\n' +
        '1. חזרה לשלב הקודם ◀\n' +
        '2. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 2) {
      return (
        'הסיור המושחת בתל אביב אינו כשר.\n\n' +
        '1. חזרה לשלב הקודם ◀\n' +
        '2. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 3) {
      return (
        'זה סיור עשיר, מגוון ומפנק עם הרבה אוכל טוב וחוויה כיפית במיוחד 😍\n\n' +
        '1. חזרה לשלב הקודם ◀\n' +
        '2. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 4) {
      session.confused = 0;
      pushState(session, 'pay_day');
      return sendPayDay();
    }
    if (n === 5) {
      session.paused = true;
      return sendHumanHandoff();
    }
    if (n === 6) {
      goBack(session);
      return infoMenu();
    }
    if (n === 7) {
      goMain(session);
      return mainMenu();
    }

    return sendConfused(session, sendInfoTLV());
  }

  if (session.state === 'info_lev') {
    if (n === 1) {
      return (
        '🌍 הסיור העולמי בלוינסקי מתקיים ביום שישי בבוקר בלבד בשעה 11:00 ✡️\n\n' +
        '1. חזרה לשלב הקודם ◀\n' +
        '2. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 2) {
      return (
        'הסיור בלוינסקי כשר עם תעודות כשרות ✡️\n\n' +
        '1. חזרה לשלב הקודם ◀\n' +
        '2. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 3) {
      return (
        'סיור קולינרי מגוון, כשר, טעים ומעולה בלב לוינסקי ופארק המסילה 😍\n\n' +
        '1. חזרה לשלב הקודם ◀\n' +
        '2. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 4) {
      session.confused = 0;
      pushState(session, 'purchase_lev');
      return (
        'מעולה!\n\n' +
        `לרכישה ושריון מקום:\n👉 ${LINKS_LEV}\n\n` +
        '1. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 5) {
      session.paused = true;
      return sendHumanHandoff();
    }
    if (n === 6) {
      goBack(session);
      return infoMenu();
    }
    if (n === 7) {
      goMain(session);
      return mainMenu();
    }

    return sendConfused(session, sendInfoLEV());
  }

  if (session.state === 'register_menu') {
    if (n === 1) {
      session.confused = 0;
      session.tour = 'tlv';
      pushState(session, 'pay_day');
      return sendPayDay();
    }
    if (n === 2) {
      session.confused = 0;
      session.tour = 'lev';
      pushState(session, 'purchase_lev');
      return (
        'מעולה! לרכישת הסיור בלוינסקי:\n\n' +
        `👉 ${LINKS_LEV}\n\n` +
        '1. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 3) {
      session.paused = true;
      return sendHumanHandoff();
    }
    if (n === 4) {
      goBack(session);
      return mainMenu();
    }
    if (n === 5) {
      goMain(session);
      return mainMenu();
    }

    return sendConfused(session, registerMenu());
  }

  if (session.state === 'pay_day') {
    if (n === 1) {
      goMain(session);
      return (
        'מעולה! לרכישת הסיור המושחת ביום חמישי 🔥\n\n' +
        `👉 ${LINKS_TLV_THU}\n\n` +
        '1. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 2) {
      goMain(session);
      return (
        'מעולה! לרכישת הסיור המושחת ביום שישי 🔥\n\n' +
        `👉 ${LINKS_TLV_FRI}\n\n` +
        '1. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 3) {
      goBack(session);
      return registerMenu();
    }
    if (n === 4) {
      goMain(session);
      return mainMenu();
    }

    return sendConfused(session, sendPayDay());
  }

  if (session.state === 'private_menu') {
    if (n === 1) {
      session.paused = true;
      return (
        'מעולה 🙂\n\n' +
        'כתבו כאן בבקשה:\n' +
        'שם מלא\n' +
        'שם החברה / הארגון\n' +
        'כמות משתתפים משוערת\n' +
        'תאריך מועדף אם יש\n\n' +
        'והדר תחזור אליכם בהקדם 👩‍💼✅'
      );
    }
    if (n === 2) {
      return (
        'מצוין 😊\n\n' +
        '🔥 הסיור המושחת מתאים לחוויה עשירה ולא כשרה\n' +
        '🌍 הסיור בלוינסקי מתאים לקבוצות שמחפשות אופציה כשרה\n\n' +
        '1. שיחזרו אליי עם הצעה\n' +
        '2. חזרה לשלב הקודם ◀\n' +
        '3. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 3) {
      return (
        'אם חשוב לכם כשר, הסיור בלוינסקי הוא האופציה הרלוונטית יותר כי הוא כשר עם תעודות ✡️\n\n' +
        '1. שיחזרו אליי עם הצעה\n' +
        '2. חזרה לשלב הקודם ◀\n' +
        '3. חזרה לתפריט הראשי 🏠'
      );
    }
    if (n === 4) {
      goBack(session);
      return mainMenu();
    }
    if (n === 5) {
      goMain(session);
      return mainMenu();
    }

    return sendConfused(session, sendPrivateIntro());
  }

  if (session.state === 'voucher_name') {
    if (n === 1 && msg.length < 3) {
      goBack(session);
      return mainMenu();
    }
    if (n === 2 && msg.length < 3) {
      goMain(session);
      return mainMenu();
    }

    session.voucherName = rawMessage.trim();
    session.confused = 0;
    pushState(session, 'voucher_pax');
    return sendVoucherPax(session);
  }

  if (session.state === 'voucher_pax') {
    if (n === 1 && msg.length < 3) {
      goBack(session);
      return sendVoucherStart();
    }
    if (n === 2 && msg.length < 3) {
      goMain(session);
      return mainMenu();
    }

    session.voucherPax = rawMessage.trim();
    session.confused = 0;
    pushState(session, 'voucher_date');
    return sendVoucherDate(session);
  }

  if (session.state === 'voucher_date') {
    if (msg === '1') {
      goBack(session);
      return sendVoucherPax(session);
    }
    if (msg === '2') {
      goMain(session);
      return mainMenu();
    }

    session.voucherDate = msg === 'דלג' ? 'לא נבחר' : rawMessage.trim();
    session.confused = 0;
    pushState(session, 'voucher_code');
    return sendVoucherCodeRequest();
  }

  if (session.state === 'voucher_code') {
    if (n === 2) {
      goBack(session);
      return sendVoucherDate(session);
    }
    if (n === 3) {
      goMain(session);
      return mainMenu();
    }

    if (n === 1) {
      session.paused = true;
      return (
        'נהדר! קיבלנו את הפרטים שלכם ✅\n\n' +
        `שם: ${session.voucherName}\n` +
        `כמות משתתפים: ${session.voucherPax}\n` +
        `תאריך מבוקש: ${session.voucherDate}\n\n` +
        'הדר תחזור אליכם בהקדם להמשך טיפול 👩‍💼✅'
      );
    }

    if (voucherType) {
      session.org = voucherType;
      return (
        `קוד התקבל ✅\nסוג ההטבה שזוהה: ${voucherType}\n\n` +
        'אפשר לשלוח קוד נוסף, או ללחוץ:\n' +
        '1. סיימתי לשלוח קודים\n' +
        '2. חזרה לשלב הקודם ◀\n' +
        '3. חזרה לתפריט הראשי 🏠'
      );
    }

    return (
      'לא הצלחתי לזהות את הקוד הזה אוטומטית 🤍\n' +
      'זה בסדר, שלחנו את זה לבדיקה ידנית.\n\n' +
      'אפשר לשלוח קוד נוסף, או ללחוץ:\n' +
      '1. סיימתי לשלוח קודים\n' +
      '2. חזרה לשלב הקודם ◀\n' +
      '3. חזרה לתפריט הראשי 🏠'
    );
  }

  goMain(session);
  return mainMenu();
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send('<h1>Beten Melea Bot ✅</h1>');
    }

    if (process.env.BOT_ACTIVE === 'false') {
      return res.status(200).json({ paused: true });
    }

    const body = req.body;

    if (body?.typeWebhook !== 'incomingMessageReceived') {
      return res.status(200).json({ skipped: true });
    }

    const message =
      body?.messageData?.textMessageData?.textMessage ||
      body?.messageData?.extendedTextMessageData?.text ||
      '';

    const chatId = body?.senderData?.chatId;

    if (!chatId || !message) {
      return res.status(200).json({ skipped: true });
    }

    const session = getSession(chatId);

    if (isOffHours() && session.state === 'main' && !session.menuSent) {
      session.menuSent = true;
      await sendMessage(chatId, CLOSED_MSG);
      return res.status(200).json({ success: true, closed: true });
    }

    const reply = await processMessage(chatId, message);

    if (reply) {
      await sendMessage(chatId, reply);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Bot error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
