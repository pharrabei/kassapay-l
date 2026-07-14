import type { DirectoryKind } from "@/lib/dashboard-i18n"
import type { AppLanguage } from "@/store/language-store"
import { getDirectoryFormFields } from "@/lib/directory-schema"

export type TourStageId = DirectoryKind

export type LocalizedText = Record<AppLanguage, string>

export interface TourStageConfig {
  id: TourStageId
  route: string
  image: string
  title: LocalizedText
  description: LocalizedText
  addHint: LocalizedText
  fieldHint: LocalizedText
  saveHint: LocalizedText
  /** Short label for the menu item itself (used when navigating TO this stage). */
  menuClickHint: LocalizedText
}

/** Product chain order for interactive onboarding on real directory pages. */
export const TOUR_STAGES: TourStageConfig[] = [
  {
    id: "contractors",
    route: "/dashboard/directories/contractors",
    image: "/Rocket.png",
    title: {
      ru: "Справочник «Контрагенты»",
      kk: "«Контрагенттер» анықтамалығы",
    },
    description: {
      ru: "Контрагент — юридическое лицо для договоров, реквизитов и выплат. Создайте первую запись, чтобы связать объекты и продажи.",
      kk: "Контрагент — келісімшарт, реквизит және төлемдер үшін заңды тұлға. Объектілер мен сатылымды байланыстыру үшін алғашқы жазбаны жасаңыз.",
    },
    addHint: {
      ru: "Нажмите, чтобы добавить контрагента",
      kk: "Контрагентті қосу үшін басыңыз",
    },
    fieldHint: {
      ru: "Заполните это поле",
      kk: "Осы өрісті толтырыңыз",
    },
    saveHint: {
      ru: "Сохраните запись, чтобы завершить этап",
      kk: "Кезеңді аяқтау үшін жазбаны сақтаңыз",
    },
    menuClickHint: {
      ru: "Нажмите «Контрагенты»",
      kk: "«Контрагенттерді» басыңыз",
    },
  },
  {
    id: "objects",
    route: "/dashboard/directories/objects",
    image: "/Kozha Ahmet.png",
    title: {
      ru: "Справочник «Объекты»",
      kk: "«Объектілер» анықтамалығы",
    },
    description: {
      ru: "Объект — площадка или витрина продаж. Привяжите его к контрагенту, который получает платежи.",
      kk: "Объект — сату алаңы немесе витрина. Оны төлем алатын контрагентке байлаңыз.",
    },
    addHint: {
      ru: "Нажмите, чтобы добавить объект",
      kk: "Объектіні қосу үшін басыңыз",
    },
    fieldHint: {
      ru: "Заполните это поле",
      kk: "Осы өрісті толтырыңыз",
    },
    saveHint: {
      ru: "Сохраните объект, чтобы продолжить",
      kk: "Жалғастыру үшін объектіні сақтаңыз",
    },
    menuClickHint: {
      ru: "Нажмите «Объекты»",
      kk: "«Объектілерді» басыңыз",
    },
  },
  {
    id: "events",
    route: "/dashboard/directories/events",
    image: "/events.png",
    title: {
      ru: "Справочник «Мероприятия»",
      kk: "«Іс-шаралар» анықтамалығы",
    },
    description: {
      ru: "Мероприятие объединяет объект и услуги. На его основе позже создаются сеансы.",
      kk: "Іс-шара объект пен қызметтерді біріктіреді. Кейін сеанстар соның негізінде жасалады.",
    },
    addHint: {
      ru: "Нажмите, чтобы добавить мероприятие",
      kk: "Іс-шараны қосу үшін басыңыз",
    },
    fieldHint: {
      ru: "Заполните это поле",
      kk: "Осы өрісті толтырыңыз",
    },
    saveHint: {
      ru: "Сохраните мероприятие",
      kk: "Іс-шараны сақтаңыз",
    },
    menuClickHint: {
      ru: "Нажмите «Мероприятия»",
      kk: "«Іс-шараларды» басыңыз",
    },
  },
  {
    id: "service-categories",
    route: "/dashboard/directories/service-categories",
    image: "/services.png",
    title: {
      ru: "Справочник «Категории услуг»",
      kk: "«Қызмет категориялары» анықтамалығы",
    },
    description: {
      ru: "Категории помогают группировать услуги на витрине (билеты, экскурсии и т.д.).",
      kk: "Категориялар витринада қызметтерді топтауға көмектеседі (билеттер, экскурсиялар және т.б.).",
    },
    addHint: {
      ru: "Нажмите, чтобы добавить категорию",
      kk: "Категорияны қосу үшін басыңыз",
    },
    fieldHint: {
      ru: "Заполните это поле",
      kk: "Осы өрісті толтырыңыз",
    },
    saveHint: {
      ru: "Сохраните категорию",
      kk: "Категорияны сақтаңыз",
    },
    menuClickHint: {
      ru: "Нажмите «Категории услуг»",
      kk: "«Қызмет категорияларын» басыңыз",
    },
  },
  {
    id: "services",
    route: "/dashboard/directories/services",
    image: "/services.png",
    title: {
      ru: "Справочник «Услуги»",
      kk: "«Қызметтер» анықтамалығы",
    },
    description: {
      ru: "Услуги — то, что покупает клиент: билеты, экскурсии и другие позиции продаж.",
      kk: "Қызметтер — клиент сатып алатын нәрсе: билеттер, экскурсиялар және басқа сату позициялары.",
    },
    addHint: {
      ru: "Нажмите, чтобы добавить услугу",
      kk: "Қызметті қосу үшін басыңыз",
    },
    fieldHint: {
      ru: "Заполните это поле",
      kk: "Осы өрісті толтырыңыз",
    },
    saveHint: {
      ru: "Сохраните услугу",
      kk: "Қызметті сақтаңыз",
    },
    menuClickHint: {
      ru: "Нажмите «Услуги»",
      kk: "«Қызметтерді» басыңыз",
    },
  },
  {
    id: "sessions",
    route: "/dashboard/directories/sessions",
    image: "/events.png",
    title: {
      ru: "Справочник «Сеансы»",
      kk: "«Сеанстар» анықтамалығы",
    },
    description: {
      ru: "Сеанс — конкретное расписание мероприятия: даты, дни недели и лимиты билетов.",
      kk: "Сеанс — іс-шараның нақты кестесі: күндер, апта күндері және билет лимиттері.",
    },
    addHint: {
      ru: "Нажмите, чтобы добавить сеанс",
      kk: "Сеансты қосу үшін басыңыз",
    },
    fieldHint: {
      ru: "Заполните это поле",
      kk: "Осы өрісті толтырыңыз",
    },
    saveHint: {
      ru: "Сохраните сеанс — обучение почти завершено",
      kk: "Сеансты сақтаңыз — оқыту аяқталуға жақын",
    },
    menuClickHint: {
      ru: "Нажмите «Сеансы»",
      kk: "«Сеанстарды» басыңыз",
    },
  },
]

export const TOUR_STAGE_IDS = TOUR_STAGES.map((stage) => stage.id)

export const TOUR_WELCOME = {
  title: {
    ru: "Добро пожаловать в KassaPay!",
    kk: "KassaPay-ге қош келдіңіз!",
  },
  description: {
    ru: "Мы проведём вас по системе шаг за шагом: контрагенты, объекты, мероприятия, услуги и сеансы. Подсказки появятся прямо рядом с кнопками и полями.",
    kk: "Жүйе бойынша қадам-қадам жүргіземіз: контрагенттер, объектілер, іс-шаралар, қызметтер және сеанстар. Кеңестер тікелей батырмалар мен өрістердің қасында пайда болады.",
  },
  start: {
    ru: "Начать сейчас",
    kk: "Қазір бастау",
  },
  later: {
    ru: "Позже",
    kk: "Кейінірек",
  },
  continue: {
    ru: "Продолжить",
    kk: "Жалғастыру",
  },
  skipStep: {
    ru: "Пропустить этап",
    kk: "Кезеңді өткізу",
  },
  completedTitle: {
    ru: "Обучение завершено",
    kk: "Оқыту аяқталды",
  },
  completedDescription: {
    ru: "Все основные справочники настроены. Можно возвращаться к ним в любое время.",
    kk: "Барлық негізгі анықтамалықтар бапталды. Оларға кез келген уақытта оралуға болады.",
  },
  progressLabel: {
    ru: "Прогресс обучения",
    kk: "Оқыту барысы",
  },
  resume: {
    ru: "Продолжить обучение",
    kk: "Оқытуды жалғастыру",
  },
  stageDone: {
    ru: "Этап завершён",
    kk: "Кезең аяқталды",
  },
  nextStage: {
    ru: "Откройте следующий справочник через боковое меню",
    kk: "Келесі анықтамалықты бүйір мәзір арқылы ашыңыз",
  },
  openDirectories: {
    ru: "Нажмите «Справочники»",
    kk: "«Анықтамалықтарды» басыңыз",
  },
}

/** Open sidebar detail panel on a section (directories / dashboard / settings). */
export function requestSidebarOpen(section: "directories" | "dashboard" | "settings") {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent("kassapay:open-sidebar", {
      detail: { section },
    })
  )
}

/** Survives hard navigations (static export) for one landing only. */
const TOUR_LAND_KEY = "kassapay-tour-land"

export function stashTourLanding(stageId: TourStageId) {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(TOUR_LAND_KEY, stageId)
  } catch {
    /* private mode */
  }
}

/** Read + clear only when it matches the page we actually landed on. */
export function consumeTourLanding(pathStage: TourStageId | null): TourStageId | null {
  if (typeof window === "undefined" || !pathStage) return null
  try {
    const raw = sessionStorage.getItem(TOUR_LAND_KEY)
    if (!raw || raw !== pathStage) return null
    if (!TOUR_STAGE_IDS.includes(raw as TourStageId)) {
      sessionStorage.removeItem(TOUR_LAND_KEY)
      return null
    }
    sessionStorage.removeItem(TOUR_LAND_KEY)
    return pathStage
  } catch {
    return null
  }
}

export function tourNavTarget(stageId: TourStageId) {
  return `tour-nav-${stageId}`
}

export type GuideStepKind = "add" | "field" | "save"

export interface GuideStep {
  kind: GuideStepKind
  target: string
  fieldKey?: string
  text: LocalizedText
}

export function getTourStage(id: TourStageId | null | undefined) {
  if (!id) return null
  return TOUR_STAGES.find((stage) => stage.id === id) ?? null
}

export function getStageIndex(id: TourStageId) {
  return TOUR_STAGES.findIndex((stage) => stage.id === id)
}

export function getNextStageId(id: TourStageId): TourStageId | null {
  const index = getStageIndex(id)
  if (index < 0) return TOUR_STAGES[0]?.id ?? null
  return TOUR_STAGES[index + 1]?.id ?? null
}

export function getFirstIncompleteStage(
  completed: readonly TourStageId[]
): TourStageId | null {
  return TOUR_STAGES.find((stage) => !completed.includes(stage.id))?.id ?? null
}

export function isTourComplete(completed: readonly TourStageId[]) {
  return TOUR_STAGES.every((stage) => completed.includes(stage.id))
}

/** Build guide steps from schema required fields. */
export function buildGuideSteps(stage: TourStageConfig): GuideStep[] {
  const requiredFields = getDirectoryFormFields(stage.id).filter(
    (field) => field.required
  )

  const steps: GuideStep[] = [
    {
      kind: "add",
      target: "directory-add",
      text: stage.addHint,
    },
  ]

  for (const field of requiredFields) {
    steps.push({
      kind: "field",
      target: `directory-field-${field.key}`,
      fieldKey: field.key,
      text: {
        ru: `Заполните «${field.labels.ru}»`,
        kk: `«${field.labels.kk}» өрісін толтырыңыз`,
      },
    })
  }

  steps.push({
    kind: "save",
    target: "directory-save",
    text: stage.saveHint,
  })

  return steps
}

export function t(text: LocalizedText, language: AppLanguage) {
  return text[language] ?? text.ru
}
