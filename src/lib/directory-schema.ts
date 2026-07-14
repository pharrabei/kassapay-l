import type { DirectoryKind } from "@/lib/dashboard-i18n"
import type { AppLanguage } from "@/store/language-store"
import type { DirectoryEntity } from "@/store/directories-store"

export type DirectoryFieldType =
  | "text"
  | "textarea"
  | "select"
  | "icon"
  | "file"
  | "date"
  | "number"

export type DirectorySelectSource =
  | "static"
  | "contractors"
  | "objects"
  | "services"
  | "events"
  | "categories"

export interface DirectoryFieldDef {
  key: string
  /** Show in table columns (modal always shows all fields). */
  table?: boolean
  required?: boolean
  type?: DirectoryFieldType
  /** Static options for type=select when optionsSource is static. */
  options?: string[]
  optionsSource?: DirectorySelectSource
  labels: Record<AppLanguage, string>
  placeholders: Record<AppLanguage, string>
}

/** Historical FA icons from old onboarding. */
export const FONT_AWESOME_ICONS = [
  "fa-ticket",
  "fa-landmark",
  "fa-building",
  "fa-map-location-dot",
  "fa-person-chalkboard",
  "fa-calendar",
  "fa-users",
  "fa-star",
  "fa-camera",
  "fa-music",
] as const

const YES_NO = ["Да", "Нет"]
const STATUS_OPTIONS = ["Активно", "Черновик", "Скрыто"]

/** Full field sets restored from historical onboarding (before simplification). */
export const directorySchemas: Record<DirectoryKind, DirectoryFieldDef[]> = {
  contractors: [
    {
      key: "name",
      table: true,
      required: true,
      labels: { ru: "Наименование", kk: "Атауы" },
      placeholders: { ru: 'ТОО "Kassa Museum"', kk: 'ТОО "Kassa Museum"' },
    },
    {
      key: "bin",
      table: true,
      required: true,
      labels: { ru: "БИН", kk: "БИН" },
      placeholders: { ru: "123456789012", kk: "123456789012" },
    },
    {
      key: "bank",
      table: true,
      required: true,
      labels: { ru: "Банк", kk: "Банк" },
      placeholders: {
        ru: "АО «Народный Банк Казахстана»",
        kk: "АО «Народный Банк Казахстана»",
      },
    },
    {
      key: "account",
      table: true,
      required: true,
      labels: { ru: "Лицевой счет", kk: "Жеке шот" },
      placeholders: { ru: "KZ076017191000004317", kk: "KZ076017191000004317" },
    },
    {
      key: "bik",
      table: true,
      required: true,
      labels: { ru: "БИК", kk: "БИК" },
      placeholders: { ru: "HSBKKZKX", kk: "HSBKKZKX" },
    },
    {
      key: "legalAddress",
      table: true,
      labels: { ru: "Юр. адрес", kk: "Заңды мекенжай" },
      placeholders: {
        ru: "г. Алматы, пр. Абая, 10",
        kk: "Алматы қ., Абай даңғ., 10",
      },
    },
  ],
  objects: [
    {
      key: "nameRu",
      table: true,
      required: true,
      labels: { ru: "Наименование рус.", kk: "Орысша атауы" },
      placeholders: { ru: "Главный музей", kk: "Басты музей" },
    },
    {
      key: "nameKk",
      table: true,
      labels: { ru: "Наименование каз.", kk: "Қазақша атауы" },
      placeholders: { ru: "Басты музей", kk: "Басты музей" },
    },
    {
      key: "nameEn",
      table: true,
      labels: { ru: "Наименование анг.", kk: "Ағылшынша атауы" },
      placeholders: { ru: "Main Museum", kk: "Main Museum" },
    },
    {
      key: "shortName",
      table: true,
      labels: { ru: "Сокращенное название", kk: "Қысқа атауы" },
      placeholders: { ru: "Музей", kk: "Музей" },
    },
    {
      key: "contractor",
      table: true,
      required: true,
      type: "select",
      optionsSource: "contractors",
      labels: { ru: "Контрагент", kk: "Контрагент" },
      placeholders: { ru: "Выберите контрагента", kk: "Контрагентті таңдаңыз" },
    },
    {
      key: "address",
      table: true,
      labels: { ru: "Адрес", kk: "Мекенжай" },
      placeholders: {
        ru: "г. Алматы, пр. Абая, 10",
        kk: "Алматы қ., Абай даңғ., 10",
      },
    },
    {
      key: "website",
      table: true,
      labels: { ru: "Адрес веб-сайта", kk: "Веб-сайт" },
      placeholders: { ru: "https://museum.kz", kk: "https://museum.kz" },
    },
    {
      key: "email",
      labels: { ru: "Электронная почта", kk: "Email" },
      placeholders: { ru: "info@museum.kz", kk: "info@museum.kz" },
    },
    {
      key: "phone",
      table: true,
      labels: { ru: "Телефон", kk: "Телефон" },
      placeholders: { ru: "+7 700 000 00 00", kk: "+7 700 000 00 00" },
    },
    {
      key: "icon",
      table: true,
      type: "icon",
      labels: { ru: "Иконка Font Awesome", kk: "Font Awesome белгішесі" },
      placeholders: { ru: "Выберите иконку", kk: "Белгішені таңдаңыз" },
    },
  ],
  events: [
    {
      key: "name",
      table: true,
      required: true,
      labels: { ru: "Наименование", kk: "Атауы" },
      placeholders: { ru: "Экскурсия по музею", kk: "Музей экскурсиясы" },
    },
    {
      key: "logo",
      table: true,
      type: "file",
      labels: { ru: "Логотип", kk: "Логотип" },
      placeholders: { ru: "Загрузить изображение", kk: "Суретті жүктеу" },
    },
    {
      key: "objects",
      table: true,
      type: "select",
      optionsSource: "objects",
      labels: { ru: "Объекты", kk: "Объектілер" },
      placeholders: { ru: "Выберите объект", kk: "Объектіні таңдаңыз" },
    },
    {
      key: "services",
      table: true,
      type: "select",
      optionsSource: "services",
      labels: { ru: "Доступные услуги", kk: "Қолжетімді қызметтер" },
      placeholders: { ru: "Выберите услугу", kk: "Қызметті таңдаңыз" },
    },
    {
      key: "description",
      table: true,
      type: "textarea",
      labels: { ru: "Описание", kk: "Сипаттама" },
      placeholders: {
        ru: "Кратко опишите мероприятие",
        kk: "Іс-шараны қысқаша сипаттаңыз",
      },
    },
    {
      key: "status",
      table: true,
      type: "select",
      optionsSource: "static",
      options: STATUS_OPTIONS,
      labels: { ru: "Статус", kk: "Мәртебе" },
      placeholders: { ru: "Выберите статус", kk: "Мәртебені таңдаңыз" },
    },
  ],
  "service-categories": [
    {
      key: "name",
      table: true,
      required: true,
      labels: { ru: "Наименование", kk: "Атауы" },
      placeholders: { ru: "Входные билеты", kk: "Кіру билеттері" },
    },
    {
      key: "order",
      table: true,
      type: "number",
      labels: { ru: "Порядок отображения", kk: "Көрсету реті" },
      placeholders: { ru: "0", kk: "0" },
    },
    {
      key: "position",
      table: true,
      labels: { ru: "Позиция в форме", kk: "Формадағы орны" },
      placeholders: {
        ru: "Первая после «Все»",
        kk: "«Барлығынан» кейінгі бірінші",
      },
    },
    {
      key: "status",
      table: true,
      type: "select",
      optionsSource: "static",
      options: STATUS_OPTIONS,
      labels: { ru: "Статус", kk: "Мәртебе" },
      placeholders: { ru: "Выберите статус", kk: "Мәртебені таңдаңыз" },
    },
  ],
  services: [
    {
      key: "nameRu",
      table: true,
      required: true,
      labels: { ru: "Наименование рус.", kk: "Орысша атауы" },
      placeholders: { ru: "Взрослый билет", kk: "Ересек билет" },
    },
    {
      key: "nameKk",
      table: true,
      labels: { ru: "Наименование каз.", kk: "Қазақша атауы" },
      placeholders: { ru: "Ересек билет", kk: "Ересек билет" },
    },
    {
      key: "nameEn",
      table: true,
      labels: { ru: "Наименование анг.", kk: "Ағылшынша атауы" },
      placeholders: { ru: "Adult ticket", kk: "Adult ticket" },
    },
    {
      key: "category",
      table: true,
      type: "select",
      optionsSource: "categories",
      labels: { ru: "Категория", kk: "Санат" },
      placeholders: { ru: "Выберите категорию", kk: "Санатты таңдаңыз" },
    },
    {
      key: "salesChannels",
      table: true,
      labels: { ru: "Виды продаж", kk: "Сату түрлері" },
      placeholders: {
        ru: "Kaspi, Сайт, Касса",
        kk: "Kaspi, Сайт, Касса",
      },
    },
    {
      key: "ticketAccounting",
      table: true,
      type: "select",
      optionsSource: "static",
      options: YES_NO,
      labels: { ru: "Учет билетов", kk: "Билет есебі" },
      placeholders: { ru: "Выберите", kk: "Таңдаңыз" },
    },
    {
      key: "multiUse",
      table: true,
      type: "select",
      optionsSource: "static",
      options: YES_NO,
      labels: { ru: "Многоразовый", kk: "Көп реттік" },
      placeholders: { ru: "Выберите", kk: "Таңдаңыз" },
    },
    {
      key: "guide",
      table: true,
      type: "select",
      optionsSource: "static",
      options: YES_NO,
      labels: { ru: "Экскурсовод", kk: "Экскурсовод" },
      placeholders: { ru: "Выберите", kk: "Таңдаңыз" },
    },
  ],
  sessions: [
    {
      key: "nameRu",
      table: true,
      required: true,
      labels: { ru: "Наименование рус.", kk: "Орысша атауы" },
      placeholders: { ru: "Утренний сеанс", kk: "Таңғы сеанс" },
    },
    {
      key: "nameKk",
      table: true,
      labels: { ru: "Наименование каз.", kk: "Қазақша атауы" },
      placeholders: { ru: "Таңғы сеанс", kk: "Таңғы сеанс" },
    },
    {
      key: "nameEn",
      table: true,
      labels: { ru: "Наименование анг.", kk: "Ағылшынша атауы" },
      placeholders: { ru: "Morning session", kk: "Morning session" },
    },
    {
      key: "template",
      table: true,
      type: "select",
      optionsSource: "events",
      labels: { ru: "Шаблон мероприятий", kk: "Іс-шара үлгісі" },
      placeholders: { ru: "Выберите мероприятие", kk: "Іс-шараны таңдаңыз" },
    },
    {
      key: "startDate",
      table: true,
      type: "date",
      labels: { ru: "Дата начала", kk: "Басталу күні" },
      placeholders: { ru: "Выберите дату", kk: "Күнді таңдаңыз" },
    },
    {
      key: "endDate",
      table: true,
      type: "date",
      labels: { ru: "Дата окончания", kk: "Аяқталу күні" },
      placeholders: { ru: "Выберите дату", kk: "Күнді таңдаңыз" },
    },
    {
      key: "weekdays",
      table: true,
      labels: { ru: "Дни недели", kk: "Апта күндері" },
      placeholders: { ru: "Пн, Ср, Пт", kk: "Дс, Сс, Жм" },
    },
    {
      key: "tickets",
      table: true,
      type: "number",
      labels: { ru: "Лимит билетов", kk: "Билет лимиті" },
      placeholders: { ru: "100", kk: "100" },
    },
  ],
}

export function getDirectorySchema(kind: DirectoryKind) {
  return directorySchemas[kind]
}

export function getDirectoryTableFields(kind: DirectoryKind) {
  return directorySchemas[kind].filter((field) => field.table !== false)
}

export function getDirectoryFormFields(kind: DirectoryKind) {
  return directorySchemas[kind]
}

export function entityDisplayName(kind: DirectoryKind, item: DirectoryEntity) {
  const record = item as unknown as Record<string, string>
  if (kind === "objects" || kind === "services" || kind === "sessions") {
    return (
      record.nameRu?.trim() ||
      record.nameKk?.trim() ||
      record.nameEn?.trim() ||
      record.name?.trim() ||
      item.id
    )
  }
  return record.name?.trim() || item.id
}

export function entityFieldValue(item: DirectoryEntity, key: string) {
  const record = item as unknown as Record<string, string>
  // Backward-compat: legacy single `name` maps to nameRu.
  if (
    (key === "nameRu" || key === "nameKk" || key === "nameEn") &&
    !record[key]?.trim() &&
    record.name?.trim()
  ) {
    return key === "nameRu" ? record.name : ""
  }
  return String(record[key] ?? "")
}

export function emptyEntityFromSchema(
  kind: DirectoryKind,
  id: string
): DirectoryEntity {
  const base: Record<string, string> = { id }
  for (const field of directorySchemas[kind]) {
    base[field.key] = ""
  }
  return base as unknown as DirectoryEntity
}

export function entityToRowValues(
  kind: DirectoryKind,
  item: DirectoryEntity
): string[] {
  return getDirectoryTableFields(kind).map((field) => {
    const value = entityFieldValue(item, field.key).trim()
    if (!value) return "—"
    if (field.type === "file" && value.startsWith("data:")) {
      return "Загружено"
    }
    return value
  })
}
