import type { DirectoryKind } from "@/lib/dashboard-i18n"
import type { AppLanguage } from "@/store/language-store"
import type { DirectoryEntity } from "@/store/directories-store"

export interface DirectoryFieldDef {
  key: string
  /** Show in table columns (modal always shows all fields). */
  table?: boolean
  required?: boolean
  labels: Record<AppLanguage, string>
}

/** Full field sets restored from historical onboarding (before simplification). */
export const directorySchemas: Record<DirectoryKind, DirectoryFieldDef[]> = {
  contractors: [
    {
      key: "name",
      table: true,
      required: true,
      labels: { ru: "Наименование", kk: "Атауы" },
    },
    {
      key: "bin",
      table: true,
      required: true,
      labels: { ru: "БИН", kk: "БИН" },
    },
    {
      key: "bank",
      table: true,
      required: true,
      labels: { ru: "Банк", kk: "Банк" },
    },
    {
      key: "account",
      table: true,
      required: true,
      labels: { ru: "Лицевой счет", kk: "Жеке шот" },
    },
    {
      key: "bik",
      table: true,
      required: true,
      labels: { ru: "БИК", kk: "БИК" },
    },
    {
      key: "legalAddress",
      table: true,
      labels: { ru: "Юр. адрес", kk: "Заңды мекенжай" },
    },
  ],
  objects: [
    {
      key: "nameRu",
      table: true,
      required: true,
      labels: { ru: "Наименование рус.", kk: "Орысша атауы" },
    },
    {
      key: "nameKk",
      table: true,
      labels: { ru: "Наименование каз.", kk: "Қазақша атауы" },
    },
    {
      key: "nameEn",
      table: true,
      labels: { ru: "Наименование анг.", kk: "Ағылшынша атауы" },
    },
    {
      key: "shortName",
      table: true,
      labels: { ru: "Сокращенное название", kk: "Қысқа атауы" },
    },
    {
      key: "contractor",
      table: true,
      required: true,
      labels: { ru: "Контрагент", kk: "Контрагент" },
    },
    {
      key: "address",
      table: true,
      labels: { ru: "Адрес", kk: "Мекенжай" },
    },
    {
      key: "website",
      table: true,
      labels: { ru: "Адрес веб-сайта", kk: "Веб-сайт" },
    },
    {
      key: "email",
      labels: { ru: "Электронная почта", kk: "Email" },
    },
    {
      key: "phone",
      table: true,
      labels: { ru: "Телефон", kk: "Телефон" },
    },
    {
      key: "icon",
      table: true,
      labels: { ru: "Иконка Font Awesome", kk: "Font Awesome белгішесі" },
    },
  ],
  events: [
    {
      key: "name",
      table: true,
      required: true,
      labels: { ru: "Наименование", kk: "Атауы" },
    },
    {
      key: "logo",
      table: true,
      labels: { ru: "Логотип", kk: "Логотип" },
    },
    {
      key: "objects",
      table: true,
      labels: { ru: "Объекты", kk: "Объектілер" },
    },
    {
      key: "services",
      table: true,
      labels: { ru: "Доступные услуги", kk: "Қолжетімді қызметтер" },
    },
    {
      key: "description",
      table: true,
      labels: { ru: "Описание", kk: "Сипаттама" },
    },
    {
      key: "status",
      table: true,
      labels: { ru: "Статус", kk: "Мәртебе" },
    },
  ],
  "service-categories": [
    {
      key: "name",
      table: true,
      required: true,
      labels: { ru: "Наименование", kk: "Атауы" },
    },
    {
      key: "order",
      table: true,
      labels: { ru: "Порядок отображения", kk: "Көрсету реті" },
    },
    {
      key: "position",
      table: true,
      labels: { ru: "Позиция в форме", kk: "Формадағы орны" },
    },
    {
      key: "status",
      table: true,
      labels: { ru: "Статус", kk: "Мәртебе" },
    },
  ],
  services: [
    {
      key: "nameRu",
      table: true,
      required: true,
      labels: { ru: "Наименование рус.", kk: "Орысша атауы" },
    },
    {
      key: "nameKk",
      table: true,
      labels: { ru: "Наименование каз.", kk: "Қазақша атауы" },
    },
    {
      key: "nameEn",
      table: true,
      labels: { ru: "Наименование анг.", kk: "Ағылшынша атауы" },
    },
    {
      key: "category",
      table: true,
      labels: { ru: "Категория", kk: "Санат" },
    },
    {
      key: "salesChannels",
      table: true,
      labels: { ru: "Виды продаж", kk: "Сату түрлері" },
    },
    {
      key: "ticketAccounting",
      table: true,
      labels: { ru: "Учет билетов", kk: "Билет есебі" },
    },
    {
      key: "multiUse",
      table: true,
      labels: { ru: "Многоразовый", kk: "Көп реттік" },
    },
    {
      key: "guide",
      table: true,
      labels: { ru: "Экскурсовод", kk: "Экскурсовод" },
    },
  ],
  sessions: [
    {
      key: "nameRu",
      table: true,
      required: true,
      labels: { ru: "Наименование рус.", kk: "Орысша атауы" },
    },
    {
      key: "nameKk",
      table: true,
      labels: { ru: "Наименование каз.", kk: "Қазақша атауы" },
    },
    {
      key: "nameEn",
      table: true,
      labels: { ru: "Наименование анг.", kk: "Ағылшынша атауы" },
    },
    {
      key: "template",
      table: true,
      labels: { ru: "Шаблон мероприятий", kk: "Іс-шара үлгісі" },
    },
    {
      key: "startDate",
      table: true,
      labels: { ru: "Дата начала", kk: "Басталу күні" },
    },
    {
      key: "endDate",
      table: true,
      labels: { ru: "Дата окончания", kk: "Аяқталу күні" },
    },
    {
      key: "weekdays",
      table: true,
      labels: { ru: "Дни недели", kk: "Апта күндері" },
    },
    {
      key: "tickets",
      table: true,
      labels: { ru: "Лимит билетов", kk: "Билет лимиті" },
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
    return value || "—"
  })
}
