import { Category, Document } from './types';

export const CATEGORIES: Category[] = [
  { id: 'cat1', nameKey: 'categories.construction', iconName: 'construction', viewPermissions: ['guest', 'foreman', 'designer', 'admin'] },
  { id: 'cat2', nameKey: 'categories.electrical', iconName: 'electrical', viewPermissions: ['designer', 'admin'] },
  { id: 'cat3', nameKey: 'categories.safety', iconName: 'safety', viewPermissions: ['foreman', 'designer', 'admin'] },
  { id: 'cat4', nameKey: 'categories.logistics', iconName: 'logistics', viewPermissions: ['designer', 'admin'] },
  { id: 'cat5', nameKey: 'categories.it', iconName: 'it', viewPermissions: ['designer', 'admin'] },
  { id: 'cat6', nameKey: 'categories.hr', iconName: 'hr', viewPermissions: ['admin'] },
  { id: 'cat7', nameKey: 'categories.finance', iconName: 'finance', viewPermissions: ['admin'] },
  { id: 'cat8', nameKey: 'categories.legal', iconName: 'legal', viewPermissions: ['admin'] },
];

export const RECENT_DOCUMENTS: Document[] = [
  { 
    id: 'doc1', 
    titleKey: 'documents.titles.matSpecQ3', 
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), 
    categoryKey: 'categories.construction', 
    tags: ['update_q3', 'urgent', 'materials'],
    content: {
      en: {
        intro: 'This document describes the standard procedures and requirements related to the topic of "Building Material Specifications Q3 (Update)". It is intended for use by qualified personnel to ensure quality, safety, and compliance with company standards.',
        section1Title: 'Section 1: Material Requirements',
        section1Body: 'All materials used must meet the specifications listed in Appendix A. Each batch must be accompanied by a certificate of conformity. The use of materials from unverified suppliers is prohibited without prior approval from the quality control department.',
        section1List: 'Main component: Type-A, strength class 5.\nAuxiliary fasteners: Steel, grade S235, with anti-corrosion coating.\nInsulation materials: Non-combustible, class V-0.',
        section2Title: 'Section 2: Installation Procedures',
        section2Body: 'Installation should be carried out according to the technological map TK-1138. The work area must be fenced off and marked with warning signs. Before starting work, ensure there is no voltage and obtain permission from the responsible person.',
        importantNote: 'Important: Always use personal protective equipment (PPE), including a helmet, safety glasses, and gloves, during installation work.',
        section3Title: 'Section 3: Safety Standards',
        section3Body: 'Personnel must undergo mandatory safety training before being allowed to work. In case of an emergency, immediately stop work, de-energize the equipment, and act according to the evacuation plan. The first-aid kit must be in an easily accessible place.',
      },
      uk: {
        intro: 'Цей документ описує стандартні процедури та вимоги, що стосуються теми "Специфікації будматеріалів Q3 (Оновлення)". Він призначений для використання кваліфікованим персоналом для забезпечення якості, безпеки та відповідності стандартам компанії.',
        section1Title: 'Розділ 1: Вимоги до матеріалів',
        section1Body: 'Усі матеріали, що використовуються, повинні відповідати специфікаціям, наведеним у Додатку А. Кожна партія повинна супроводжуватися сертифікатом відповідності. Забороняється використання матеріалів від неперевірених постачальників без попереднього погодження з відділом контролю якості.',
        section1List: 'Головний компонент: Тип-А, клас міцності 5.\nДопоміжні кріплення: Сталь, марка S235, з антикорозійним покриттям.\nІзоляційні матеріали: Негорючі, клас V-0.',
        section2Title: 'Розділ 2: Процедури монтажу',
        section2Body: 'Монтаж слід проводити відповідно до технологічної карти TK-1138. Робоча зона повинна бути огороджена та позначена попереджувальними знаками. Перед початком робіт необхідно переконатися у відсутності напруги та отримати дозвіл від відповідальної особи.',
        importantNote: 'Важливо: Завжди використовуйте засоби індивідуального захисту (ЗІЗ), включаючи каску, захисні окуляри та рукавиці, під час виконання монтажних робіт.',
        section3Title: 'Розділ 3: Стандарти безпеки',
        section3Body: 'Персонал повинен пройти обов\'язковий інструктаж з техніки безпеки перед допуском до робіт. У разі виникнення надзвичайної ситуації слід негайно припинити роботу, знеструмити обладнання та діяти згідно з планом евакуації. Аптечка першої допомоги повинна знаходитись у легкодоступному місці.',
      }
    }
  },
  { 
    id: 'doc2', 
    titleKey: 'documents.titles.netSecPol', 
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), 
    categoryKey: 'categories.it', 
    tags: ['security', 'IT', 'policy'],
    content: {
      en: {
        intro: 'This document describes the standard procedures and requirements related to the topic of "Network Security Policy v2.1". It is intended for use by qualified personnel to ensure quality, safety, and compliance with company standards.',
        section1Title: 'Section 1: Access Control',
        section1Body: 'Access to network resources is granted based on the principle of least privilege. All access requests must be approved by the department head and IT security.',
        section1List: 'User authentication: Two-factor authentication is mandatory.\nPassword policy: Minimum 12 characters, including upper/lower case, numbers, and symbols.\nRegular access reviews: Conducted quarterly.',
        section2Title: 'Section 2: Data Protection',
        section2Body: 'All sensitive data must be encrypted both in transit and at rest. Data classification policies must be adhered to at all times.',
        importantNote: 'Important: Any suspected data breach must be reported to the IT security team within one hour of discovery.',
        section3Title: 'Section 3: Incident Response',
        section3Body: 'The incident response plan outlines the procedures for identifying, containing, eradicating, and recovering from security incidents.',
      },
      uk: {
        intro: 'Цей документ описує стандартні процедури та вимоги, що стосуються теми "Політика мережевої безпеки v2.1". Він призначений для використання кваліфікованим персоналом для забезпечення якості, безпеки та відповідності стандартам компанії.',
        section1Title: 'Розділ 1: Контроль доступу',
        section1Body: 'Доступ до мережевих ресурсів надається за принципом найменших привілеїв. Усі запити на доступ мають бути затверджені керівником відділу та службою ІТ-безпеки.',
        section1List: 'Аутентифікація користувачів: Двофакторна аутентифікація є обов\'язковою.\nПарольна політика: Мінімум 12 символів, включаючи великі/малі літери, цифри та символи.\nРегулярні перевірки доступу: проводяться щоквартально.',
        section2Title: 'Розділ 2: Захист даних',
        section2Body: 'Усі конфіденційні дані повинні бути зашифровані як під час передачі, так і в стані спокою. Політика класифікації даних повинна дотримуватися в будь-який час.',
        importantNote: 'Важливо: Про будь-яку підозру на витік даних необхідно повідомити групу ІТ-безпеки протягом однієї години після виявлення.',
        section3Title: 'Розділ 3: Реагування на інциденти',
        section3Body: 'План реагування на інциденти окреслює процедури виявлення, стримування, усунення та відновлення після інцидентів безпеки.',
      }
    }
  },
  { 
    id: 'doc3', 
    titleKey: 'documents.titles.fireDrill', 
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 
    categoryKey: 'categories.safety', 
    tags: ['safety', 'training', 'evacuation'], 
    content: { 
      en: {
        intro: 'This document outlines the mandatory annual fire drill procedures for all personnel to ensure a swift and safe evacuation in case of a fire emergency.',
        section1Title: 'Section 1: Alarm Activation and Recognition',
        section1Body: 'All personnel must be familiar with the sound of the fire alarm. Upon hearing the continuous alarm, all activities must cease immediately. Do not assume it is a drill unless explicitly stated beforehand.',
        section1List: 'Alarm type: Continuous high-pitched siren.\nImmediate action: Stop work, turn off machinery if safe.\nDo not use elevators.',
        section2Title: 'Section 2: Evacuation Routes and Exits',
        section2Body: 'Evacuation maps are posted in all common areas and near exits. Familiarize yourself with your primary and secondary evacuation routes. Fire wardens will guide personnel towards the nearest safe exit.',
        importantNote: 'Important: Keep all fire exits and routes clear of obstructions at all times. Report any blockages to your supervisor immediately.',
        section3Title: 'Section 3: Assembly Points',
        section3Body: 'Proceed to the designated assembly point for your department. Assembly points are located in the main parking lot (Point A) and the rear green area (Point B). Report to your fire warden for a head count. Do not re-enter the building until the "all-clear" is given by emergency services.',
      },
      uk: {
        intro: 'Цей документ описує обов\'язкові щорічні процедури пожежних навчань для всього персоналу з метою забезпечення швидкої та безпечної евакуації у разі пожежної небезпеки.',
        section1Title: 'Розділ 1: Активація та розпізнавання тривоги',
        section1Body: 'Весь персонал повинен бути знайомий зі звуком пожежної тривоги. Почувши безперервний сигнал, необхідно негайно припинити будь-яку діяльність. Не вважайте, що це тренування, якщо про це не було оголошено заздалегідь.',
        section1List: 'Тип сигналу: Безперервна сирена високого тону.\nНегайні дії: Припинити роботу, вимкнути обладнання, якщо це безпечно.\nНе користуватися ліфтами.',
        section2Title: 'Розділ 2: Шляхи евакуації та виходи',
        section2Body: 'Карти евакуації розміщені у всіх загальних зонах та біля виходів. Ознайомтеся з вашими основним та запасним шляхами евакуації. Відповідальні за пожежну безпеку направлятимуть персонал до найближчого безпечного виходу.',
        importantNote: 'Важливо: Тримайте всі пожежні виходи та шляхи вільними від перешкод у будь-який час. Негайно повідомляйте свого керівника про будь-які загородження.',
        section3Title: 'Розділ 3: Точки збору',
        section3Body: 'Прямуйте до призначеної точки збору вашого відділу. Точки збору розташовані на головній автостоянці (Точка А) та на задній зеленій зоні (Точка Б). Зверніться до свого відповідального за пожежну безпеку для переклички. Не повертайтеся в будівлю до отримання сигналу "відбій" від аварійних служб.',
      } 
    } 
  },
  { 
    id: 'doc4', 
    titleKey: 'documents.titles.substationMaint', 
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 
    categoryKey: 'categories.electrical', 
    tags: ['schedule', 'maintenance', 'high-voltage'], 
    content: { 
      en: {
        intro: 'This document details the preventive maintenance schedule for high-voltage substations. Adherence to this schedule is critical for operational reliability and safety.',
        section1Title: 'Section 1: Weekly Checks (Visual Inspection)',
        section1Body: 'Perform a walk-through inspection of the substation. Check for any visible signs of damage, leaks, or overheating. Ensure all enclosures are securely locked.',
        section1List: 'Check transformer oil levels.\nInspect insulators for cracks or contamination.\nListen for unusual noises (arcing, buzzing).',
        section2Title: 'Section 2: Monthly Checks (Non-Intrusive)',
        section2Body: 'Conduct thermal imaging scans on all connections, breakers, and transformers to detect potential hot spots. Clean all housings and control panels.',
        importantNote: 'Important: Lockout-Tagout (LOTO) procedures must be strictly followed before any physical contact with equipment. Only certified personnel are authorized to perform maintenance.',
        section3Title: 'Section 3: Annual Checks (Intrusive)',
        section3Body: 'A full shutdown is required. Perform functional testing of all circuit breakers and protective relays. Test transformer oil for dielectric strength and contaminants. Check and tighten all electrical connections.',
      },
      uk: {
        intro: 'Цей документ детально описує графік профілактичного обслуговування високовольтних підстанцій. Дотримання цього графіка є критично важливим для надійності роботи та безпеки.',
        section1Title: 'Розділ 1: Щотижневі перевірки (Візуальний огляд)',
        section1Body: 'Виконайте обхід та огляд підстанції. Перевірте наявність будь-яких видимих ознак пошкодження, витоків або перегріву. Переконайтеся, що всі корпуси надійно замкнені.',
        section1List: 'Перевірити рівень трансформаторного масла.\nОглянути ізолятори на наявність тріщин або забруднень.\nПрислухатися до незвичних звуків (іскріння, гудіння).',
        section2Title: 'Розділ 2: Щомісячні перевірки (Неінвазивні)',
        section2Body: 'Проведіть теплове сканування всіх з\'єднань, вимикачів та трансформаторів для виявлення потенційних гарячих точок. Очистіть усі корпуси та панелі керування.',
        importantNote: 'Важливо: Процедури блокування/маркування (LOTO) повинні суворо дотримуватися перед будь-яким фізичним контактом з обладнанням. Тільки сертифікований персонал має право виконувати технічне обслуговування.',
        section3Title: 'Розділ 3: Щорічні перевірки (Інвазивні)',
        section3Body: 'Потрібне повне відключення. Виконайте функціональне тестування всіх автоматичних вимикачів та захисних реле. Перевірте трансформаторне масло на діелектричну міцність та наявність домішок. Перевірте та затягніть усі електричні з\'єднання.',
      } 
    } 
  },
  { 
    id: 'doc5', 
    titleKey: 'documents.titles.q2report', 
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 
    categoryKey: 'categories.finance', 
    tags: ['finance', 'report', 'quarterly'], 
    content: { 
      en: {
        intro: 'This document presents the quarterly financial report for Q2. It provides an overview of the company\'s performance, key financial metrics, and a comparison against the previous quarter and the same quarter last year.',
        section1Title: 'Section 1: Executive Summary',
        section1Body: 'Q2 was a strong quarter with a 15% increase in revenue year-over-year. Net profit margin improved by 2% due to successful cost optimization initiatives. All major projects are on track and within budget.',
        section1List: 'Total Revenue: $12.5M (+15% YoY)\nNet Profit: $1.8M (+25% YoY)\nOperating Margin: 14.4%',
        section2Title: 'Section 2: Departmental Performance',
        section2Body: 'The Construction division saw the highest growth at 22%, driven by the new residential complex project. The Logistics department successfully reduced shipping costs by 8% through route optimization.',
        importantNote: 'Important: The projected revenue for Q3 has been revised upwards to $13.2M based on new contracts secured in late Q2. Detailed projections are available in Appendix B.',
        section3Title: 'Section 3: Cash Flow Statement',
        section3Body: 'Operating cash flow remains robust, providing sufficient liquidity for ongoing operations and planned capital expenditures. A detailed breakdown of cash inflows and outflows is provided for analysis.',
      },
      uk: {
        intro: 'Цей документ представляє квартальний фінансовий звіт за 2-й квартал. Він надає огляд результатів діяльності компанії, ключові фінансові показники та порівняння з попереднім кварталом та тим самим кварталом минулого року.',
        section1Title: 'Розділ 1: Загальний огляд',
        section1Body: '2-й квартал був сильним, із зростанням доходу на 15% порівняно з минулим роком. Чиста рентабельність покращилася на 2% завдяки успішним ініціативам з оптимізації витрат. Усі основні проекти йдуть за графіком та в межах бюджету.',
        section1List: 'Загальний дохід: $12.5 млн (+15% р/р)\nЧистий прибуток: $1.8 млн (+25% р/р)\nОпераційна маржа: 14.4%',
        section2Title: 'Розділ 2: Результати за департаментами',
        section2Body: 'Будівельний підрозділ показав найбільше зростання на 22%, завдяки новому проекту житлового комплексу. Департамент логістики успішно скоротив витрати на доставку на 8% за рахунок оптимізації маршрутів.',
        importantNote: 'Важливо: Прогнозований дохід на 3-й квартал було переглянуто в бік збільшення до $13.2 млн на основі нових контрактів, укладених наприкінці 2-го кварталу. Детальні прогнози доступні в Додатку Б.',
        section3Title: 'Розділ 3: Звіт про рух грошових коштів',
        section3Body: 'Операційний грошовий потік залишається стабільним, забезпечуючи достатню ліквідність для поточної діяльності та запланованих капітальних витрат. Надається детальний аналіз надходжень та відтоків грошових коштів.',
      } 
    } 
  },
  { 
    id: 'doc6', 
    titleKey: 'documents.titles.gdpr', 
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), 
    categoryKey: 'categories.legal', 
    tags: ['legal', 'GDPR', 'policy', 'data-protection'], 
    content: { 
      en: {
        intro: 'This document establishes the company\'s protocol for compliance with the General Data Protection Regulation (GDPR). It applies to all processing of personal data of individuals residing in the European Union.',
        section1Title: 'Section 1: Data Subject Rights',
        section1Body: 'The company must facilitate the exercise of data subject rights, including the right of access, rectification, erasure ("right to be forgotten"), and data portability. All requests must be processed within 30 days.',
        section1List: 'Right of Access: Provide a copy of personal data upon request.\nRight to Rectification: Correct inaccurate personal data.\nRight to Erasure: Delete personal data when no longer necessary.',
        section2Title: 'Section 2: Data Breach Notification Protocol',
        section2Body: 'In the event of a personal data breach, the Data Protection Officer (DPO) must be notified immediately. The DPO will assess the risk and, if required, notify the relevant supervisory authority within 72 hours.',
        importantNote: 'Important: All employees are responsible for identifying and reporting potential data breaches. Failure to report a breach can result in significant legal and financial penalties.',
        section3Title: 'Section 3: Data Protection by Design and by Default',
        section3Body: 'All new projects, systems, and processes that involve the processing of personal data must undergo a Data Protection Impact Assessment (DPIA). Privacy-enhancing measures must be integrated from the outset.',
      },
      uk: {
        intro: 'Цей документ встановлює протокол компанії щодо дотримання Загального регламенту про захист даних (GDPR). Він застосовується до всієї обробки персональних даних осіб, які проживають в Європейському Союзі.',
        section1Title: 'Розділ 1: Права суб\'єктів даних',
        section1Body: 'Компанія повинна сприяти реалізації прав суб\'єктів даних, включаючи право на доступ, виправлення, видалення ("право на забуття") та перенесення даних. Усі запити мають бути оброблені протягом 30 днів.',
        section1List: 'Право на доступ: Надавати копію персональних даних за запитом.\nПраво на виправлення: Виправляти неточні персональні дані.\nПраво на видалення: Видаляти персональні дані, коли вони більше не потрібні.',
        section2Title: 'Розділ 2: Протокол повідомлення про витік даних',
        section2Body: 'У разі витоку персональних даних необхідно негайно повідомити Відповідального за захист даних (DPO). DPO оцінить ризик і, за необхідності, повідомить відповідний наглядовий орган протягом 72 годин.',
        importantNote: 'Важливо: Усі співробітники несуть відповідальність за виявлення та повідомлення про потенційні витоки даних. Неповідомлення про витік може призвести до значних юридичних та фінансових штрафів.',
        section3Title: 'Розділ 3: Захист даних за задумом та за замовчуванням',
        section3Body: 'Усі нові проекти, системи та процеси, що включають обробку персональних даних, повинні проходити Оцінку впливу на захист даних (DPIA). Заходи щодо підвищення конфіденційності повинні бути інтегровані з самого початку.',
      } 
    } 
  },
  { 
    id: 'doc7', 
    titleKey: 'documents.titles.whInventory', 
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 
    categoryKey: 'categories.logistics', 
    tags: ['inventory', 'warehouse', 'logistics', 'procedure'],
    content: {
      en: {
        intro: 'This protocol outlines the standardized procedures for inventory management within all company warehouses to ensure accuracy, efficiency, and accountability.',
        section1Title: 'Section 1: Goods Receipt and Put-Away',
        section1Body: 'All incoming shipments must be verified against the purchase order. Any discrepancies must be noted and reported to procurement within 24 hours. Items must be scanned into the Warehouse Management System (WMS) and stored in their designated locations.',
        section1List: 'Verify quantities and check for damage.\nScan each item/pallet into WMS.\nMove goods to assigned storage bins.',
        section2Title: 'Section 2: Cycle Counting',
        section2Body: 'A continuous cycle counting program must be maintained to ensure inventory accuracy. High-value (Class A) items must be counted monthly, Class B items quarterly, and Class C items semi-annually. All counts must be recorded in the WMS.',
        importantNote: 'Important: Warehouse operations should not be halted for cycle counting. Counts should be integrated into daily workflows to minimize disruption.',
        section3Title: 'Section 3: Discrepancy Reporting and Resolution',
        section3Body: 'Any discrepancies found during cycle counts or order picking must be investigated immediately. A Discrepancy Report must be filled out and submitted to the warehouse manager. The manager is responsible for root cause analysis and implementing corrective actions.',
      },
      uk: {
        intro: 'Цей протокол описує стандартизовані процедури управління запасами на всіх складах компанії для забезпечення точності, ефективності та підзвітності.',
        section1Title: 'Розділ 1: Приймання та розміщення товарів',
        section1Body: 'Усі вхідні поставки повинні перевірятися на відповідність замовленню на закупівлю. Будь-які розбіжності мають бути зафіксовані та повідомлені відділу закупівель протягом 24 годин. Товари повинні бути відскановані в Систему управління складом (WMS) та розміщені у визначених місцях.',
        section1List: 'Перевірити кількість та наявність пошкоджень.\nВідсканувати кожен товар/палету в WMS.\nПеремістити товари до призначених місць зберігання.',
        section2Title: 'Розділ 2: Циклічна інвентаризація',
        section2Body: 'Для забезпечення точності запасів необхідно підтримувати програму безперервної циклічної інвентаризації. Товари високої вартості (Клас А) повинні перераховуватися щомісяця, товари Класу Б - щоквартально, а Класу С - раз на півроку. Усі підрахунки мають бути зафіксовані в WMS.',
        importantNote: 'Важливо: Складські операції не повинні зупинятися для проведення циклічної інвентаризації. Підрахунки слід інтегрувати в щоденні робочі процеси, щоб мінімізувати перебої.',
        section3Title: 'Розділ 3: Звітування та вирішення розбіжностей',
        section3Body: 'Будь-які розбіжності, виявлені під час циклічної інвентаризації або комплектації замовлень, мають бути негайно розслідувані. Необхідно заповнити Звіт про розбіжності та подати його менеджеру складу. Менеджер несе відповідальність за аналіз першопричин та впровадження коригувальних дій.',
      }
    }
  },
  { 
    id: 'doc8', 
    titleKey: 'documents.titles.onboarding', 
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 
    categoryKey: 'categories.hr', 
    tags: ['hr', 'onboarding', 'new-hire', 'checklist'],
    content: {
      en: {
        intro: 'The employee onboarding process is designed to welcome new hires and integrate them into the company culture smoothly, ensuring they have the tools and information needed for success.',
        section1Title: 'Section 1: Pre-First Day',
        section1Body: 'Before the new hire\'s start date, HR and the hiring manager must complete several key tasks to ensure a smooth arrival. This includes preparing all necessary paperwork and ensuring technical assets are ready.',
        section1List: 'Send welcome email with first-day information.\nComplete all required HR paperwork digitally.\nCoordinate with IT to prepare laptop, accounts, and access badges.',
        section2Title: 'Section 2: First Week Itinerary',
        section2Body: 'The first week is crucial for making a positive impression. The focus is on orientation, introductions, and initial training.',
        importantNote: 'Important: The hiring manager must schedule a one-on-one meeting with the new hire on their first day to review their role, responsibilities, and the 30-60-90 day plan.',
        section3Title: 'Section 3: 30-60-90 Day Plan',
        section3Body: 'A structured plan helps the new hire understand expectations and milestones. The 30-day mark focuses on learning, 60 days on contribution, and 90 days on taking initiative. Regular check-ins are essential.',
      },
      uk: {
        intro: 'Процес адаптації співробітників (онбординг) розроблений для того, щоб вітати нових працівників та плавно інтегрувати їх у корпоративну культуру, забезпечуючи їх необхідними інструментами та інформацією для успіху.',
        section1Title: 'Розділ 1: Перед першим днем',
        section1Body: 'До дати виходу нового співробітника, HR та менеджер, що наймає, повинні виконати кілька ключових завдань для забезпечення безпроблемного початку роботи. Це включає підготовку всіх необхідних документів та технічних засобів.',
        section1List: 'Надіслати вітальний лист з інформацією про перший день.\nЗавершити оформлення всіх необхідних кадрових документів у цифровому вигляді.\nСкоординувати з ІТ підготовку ноутбука, облікових записів та пропусків.',
        section2Title: 'Розділ 2: План на перший тиждень',
        section2Body: 'Перший тиждень є вирішальним для створення позитивного враження. Основна увага приділяється орієнтації, знайомствам та початковому навчанню.',
        importantNote: 'Важливо: Менеджер, що наймає, повинен запланувати зустріч один на один з новим співробітником у його перший день, щоб обговорити його роль, обов\'язки та план на 30-60-90 днів.',
        section3Title: 'Розділ 3: План на 30-60-90 днів',
        section3Body: 'Структурований план допомагає новому співробітнику зрозуміти очікування та ключові етапи. 30-денний термін зосереджений на навчанні, 60 днів - на внесенні вкладу, а 90 днів - на прояві ініціативи. Регулярні зустрічі є обов\'язковими.',
      }
    }
  },
  { 
    id: 'doc9', 
    titleKey: 'documents.titles.concreteChecklist', 
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    categoryKey: 'categories.construction', 
    tags: ['concrete', 'quality-control', 'checklist', 'construction'],
    content: {
      en: {
        intro: 'This checklist must be completed for every concrete pour to ensure compliance with engineering specifications and quality standards.',
        section1Title: 'Section 1: Pre-Pour Inspection',
        section1Body: 'Before ordering concrete, the site foreman must inspect and sign off on all preparatory work. This ensures that the pour can proceed without delays or quality compromises.',
        section1List: 'Formwork is clean, properly braced, and oiled.\nReinforcing steel is correctly placed, tied, and has adequate cover.\nAll embedded items (conduits, anchors) are securely in position.',
        section2Title: 'Section 2: During-Pour Monitoring',
        section2Body: 'Continuous monitoring during the pour is essential to control the quality of the final product. The site engineer or a qualified technician must be present throughout.',
        importantNote: 'Important: If a slump test or temperature reading is outside the specified range, the truck must be rejected. Do not add water to the mix on-site without engineer approval.',
        section3Title: 'Section 3: Post-Pour Procedures',
        section3Body: 'Proper finishing and curing are critical for concrete strength and durability. These steps must be initiated at the correct time based on weather conditions and mix design.',
      },
      uk: {
        intro: 'Цей контрольний список повинен бути заповнений для кожної заливки бетону для забезпечення відповідності інженерним специфікаціям та стандартам якості.',
        section1Title: 'Розділ 1: Перевірка перед заливкою',
        section1Body: 'Перед замовленням бетону прораб повинен перевірити та підписати всі підготовчі роботи. Це гарантує, що заливка може проходити без затримок або погіршення якості.',
        section1List: 'Опалубка чиста, належним чином закріплена та змащена.\nАрматурна сталь правильно розміщена, зв\'язана та має достатній захисний шар.\nУсі заставні деталі (труби, анкери) надійно закріплені.',
        section2Title: 'Розділ 2: Контроль під час заливки',
        section2Body: 'Безперервний контроль під час заливки є необхідним для забезпечення якості кінцевого продукту. Інженер або кваліфікований технік повинен бути присутнім протягом усього процесу.',
        importantNote: 'Важливо: Якщо результати випробування на осадку конуса або вимірювання температури виходять за межі зазначеного діапазону, вантажівка повинна бути відхилена. Не додавайте воду до суміші на місці без дозволу інженера.',
        section3Title: 'Розділ 3: Процедури після заливки',
        section3Body: 'Правильне оздоблення та догляд за бетоном є критично важливими для його міцності та довговічності. Ці кроки повинні бути розпочаті в потрібний час, враховуючи погодні умови та склад суміші.',
      }
    }
  },
];