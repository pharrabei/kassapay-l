export type InvoiceTariff = "START" | "BUSINESS" | "ENTERPRISE"
export type InvoicePeriod = "1m" | "3m" | "6m" | "12m"

export interface InvoiceInput {
  companyName: string
  bin: string
  bank: string
  bik: string
  account: string
  legalAddress?: string
  tariff: InvoiceTariff
  tariffPeriod: InvoicePeriod
}

const TARIFF_META: Record<
  InvoiceTariff,
  { name: string; monthlyPrice: number | null }
> = {
  START: { name: "Start", monthlyPrice: 15000 },
  BUSINESS: { name: "Business", monthlyPrice: 35000 },
  ENTERPRISE: { name: "Enterprise", monthlyPrice: null },
}

const PERIOD_META: Record<
  InvoicePeriod,
  { label: string; months: number; discount: number }
> = {
  "1m": { label: "1 месяц", months: 1, discount: 0 },
  "3m": { label: "3 месяца", months: 3, discount: 5 },
  "6m": { label: "6 месяцев", months: 6, discount: 10 },
  "12m": { label: "1 год", months: 12, discount: 15 },
}

const SUPPLIER = {
  name: 'Товарищество с ограниченной ответственностью "KassaPay"',
  shortName: 'ТОО "KassaPay"',
  bin: "240140000001",
  address:
    "Республика Казахстан, г. Алматы, ул. Абая, 150, офис 12",
  phone:
    "тел.: +7 (727) 000-00-00, мобильный тел.: +7 (700) 000-00-00, e-mail: billing@kassapay.kz",
  email: "billing@kassapay.kz",
  bankName: "АО «Народный Банк Казахстана»",
  iik: "KZ076017191000004317",
  bik: "HSBKKZKX",
  kbe: "17",
  knp: "851",
  executor: "Сухачёв Д.С.",
  offerContract: "№ 1 Договор публичной оферты от 01.01.2024 г.",
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function formatDateRu(date: Date) {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString("ru-RU")
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-KZ").format(value)
}

function numberToWordsRu(value: number): string {
  const ones = [
    "",
    "один",
    "два",
    "три",
    "четыре",
    "пять",
    "шесть",
    "семь",
    "восемь",
    "девять",
  ]
  const onesFem = [
    "",
    "одна",
    "две",
    "три",
    "четыре",
    "пять",
    "шесть",
    "семь",
    "восемь",
    "девять",
  ]
  const teens = [
    "десять",
    "одиннадцать",
    "двенадцать",
    "тринадцать",
    "четырнадцать",
    "пятнадцать",
    "шестнадцать",
    "семнадцать",
    "восемнадцать",
    "девятнадцать",
  ]
  const tens = [
    "",
    "",
    "двадцать",
    "тридцать",
    "сорок",
    "пятьдесят",
    "шестьдесят",
    "семьдесят",
    "восемьдесят",
    "девяносто",
  ]
  const hundreds = [
    "",
    "сто",
    "двести",
    "триста",
    "четыреста",
    "пятьсот",
    "шестьсот",
    "семьсот",
    "восемьсот",
    "девятьсот",
  ]

  function triad(n: number, feminine = false): string {
    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100) / 10)
    const o = n % 10
    const parts: string[] = []
    if (h) parts.push(hundreds[h])
    if (t === 1) parts.push(teens[o])
    else {
      if (t) parts.push(tens[t])
      if (o) parts.push((feminine ? onesFem : ones)[o])
    }
    return parts.join(" ")
  }

  if (!Number.isFinite(value) || value < 0) return ""
  if (value === 0) return "ноль"

  const millions = Math.floor(value / 1_000_000)
  const thousands = Math.floor((value % 1_000_000) / 1000)
  const rest = value % 1000
  const parts: string[] = []

  if (millions) {
    const word =
      millions % 10 === 1 && millions % 100 !== 11
        ? "миллион"
        : millions % 10 >= 2 &&
            millions % 10 <= 4 &&
            (millions % 100 < 10 || millions % 100 >= 20)
          ? "миллиона"
          : "миллионов"
    parts.push(`${triad(millions)} ${word}`)
  }

  if (thousands) {
    const word =
      thousands % 10 === 1 && thousands % 100 !== 11
        ? "тысяча"
        : thousands % 10 >= 2 &&
            thousands % 10 <= 4 &&
            (thousands % 100 < 10 || thousands % 100 >= 20)
          ? "тысячи"
          : "тысяч"
    parts.push(`${triad(thousands, true)} ${word}`)
  }

  if (rest) parts.push(triad(rest))
  return parts.join(" ").replace(/\s+/g, " ").trim()
}

function amountInWordsKzt(value: number) {
  const int = Math.floor(value)
  const tiyn = Math.round((value - int) * 100)
  return `${numberToWordsRu(int)} теңге ${String(tiyn).padStart(2, "0")} тиын`
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function calcInvoiceAmount(tariff: InvoiceTariff, period: InvoicePeriod) {
  const meta = TARIFF_META[tariff]
  const periodMeta = PERIOD_META[period]
  if (!meta.monthlyPrice) return { total: 0, isCustom: true as const }
  const total = Math.round(
    meta.monthlyPrice * periodMeta.months * (1 - periodMeta.discount / 100)
  )
  return { total, isCustom: false as const }
}

export function buildInvoiceNumber(date = new Date()) {
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rnd = String(Math.floor(1000 + Math.random() * 9000))
  return `${y}${m}${d}${rnd}`
}

export function generateInvoiceHtml(input: InvoiceInput) {
  const issuedAt = new Date()
  const period = PERIOD_META[input.tariffPeriod] ?? PERIOD_META["1m"]
  const serviceFrom = issuedAt
  const serviceTo = addMonths(issuedAt, period.months)
  const amount = calcInvoiceAmount(input.tariff, input.tariffPeriod)
  const invoiceNo = buildInvoiceNumber(issuedAt)
  const tariffName = TARIFF_META[input.tariff].name
  const serviceName = `Подключение сервиса KassaPay по тарифу ${tariffName} на ${period.label} (с ${formatDateRu(serviceFrom)} до ${formatDateRu(serviceTo)})`
  const totalNumeric = amount.isCustom ? "—" : formatMoney(amount.total)
  const totalDisplay = amount.isCustom
    ? "по договору"
    : `${formatMoney(amount.total)} KZT`
  const totalWords = amount.isCustom
    ? "по договору"
    : amountInWordsKzt(amount.total)
  const purpose = `Оплата счета за номером ${invoiceNo}, от ${formatDateShort(issuedAt)}, за услуги KassaPay.`
  const buyerName = input.companyName.trim()
  const buyerAddress = input.legalAddress?.trim() || "—"

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Счет-заявка № ${escapeHtml(invoiceNo)}</title>
  <style>
    @page { size: A4; margin: 15mm 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #f0f0f0;
      color: #000;
      font-family: "Times New Roman", Times, serif;
      font-size: 12px;
      line-height: 1.35;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 5;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 10px 12px;
      background: #fff;
      border-bottom: 1px solid #ccc;
      font-family: Arial, Helvetica, sans-serif;
    }
    .toolbar button {
      border: 1px solid #333;
      background: #fff;
      color: #000;
      padding: 7px 12px;
      font-size: 12px;
      cursor: pointer;
    }
    .toolbar button.primary {
      background: #111;
      color: #fff;
    }
    .sheet {
      width: 210mm;
      min-height: 297mm;
      margin: 12px auto 24px;
      padding: 16mm 14mm;
      background: #fff;
      box-shadow: 0 0 0 1px #ddd, 0 8px 24px rgba(0,0,0,.08);
    }
    h1 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 700;
      text-align: center;
    }
    .notice {
      border: 1px solid #000;
      padding: 8px 10px;
      margin: 0 0 14px;
    }
    .notice b { display: inline; }
    p { margin: 0 0 8px; }
    .block { margin: 0 0 12px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0 0 12px;
    }
    th, td {
      border: 1px solid #000;
      padding: 5px 6px;
      vertical-align: top;
      text-align: left;
    }
    th {
      font-weight: 700;
      text-align: center;
    }
    .c { text-align: center; }
    .r { text-align: right; }
    .no-border td { border: 0; padding: 2px 0; }
    .sign { margin-top: 28px; }
    .muted { font-size: 11px; }
    @media print {
      body { background: #fff; }
      .toolbar { display: none !important; }
      .sheet {
        width: auto;
        min-height: auto;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
    }
    @media (max-width: 820px) {
      .sheet {
        width: auto;
        min-height: auto;
        margin: 8px;
        padding: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <button type="button" onclick="window.close()">Закрыть</button>
    <button class="primary" type="button" onclick="window.print()">Печать / PDF</button>
  </div>

  <div class="sheet">
    <h1>Счет-заявка № ${escapeHtml(invoiceNo)} от ${escapeHtml(formatDateRu(issuedAt))} г.</h1>

    <div class="notice">
      <b>Внимание!</b>
      Просим Вас обязательно сообщить нам об оплате данного счета на
      <b>${escapeHtml(SUPPLIER.email)}</b>, пришлите, пожалуйста, скан-копию платежного документа.
      В назначении платежа указывайте:
      <b>Оплата счета за номером ${escapeHtml(invoiceNo)}, от ${escapeHtml(formatDateShort(issuedAt))}, за услуги KassaPay.</b>
    </div>

    <div class="block">
      <p><b>Образец заполнения платежного поручения</b></p>
      <table>
        <tr>
          <td style="width:34%"><b>Бенефициар</b></td>
          <td>${escapeHtml(SUPPLIER.name)}<br/>БИН ${escapeHtml(SUPPLIER.bin)}</td>
        </tr>
        <tr>
          <td><b>Банк бенефициара</b></td>
          <td>${escapeHtml(SUPPLIER.bankName)}</td>
        </tr>
        <tr>
          <td><b>ИИК</b></td>
          <td>${escapeHtml(SUPPLIER.iik)}</td>
        </tr>
        <tr>
          <td><b>БИК</b></td>
          <td>${escapeHtml(SUPPLIER.bik)}</td>
        </tr>
        <tr>
          <td><b>Кбе</b></td>
          <td>${escapeHtml(SUPPLIER.kbe)}</td>
        </tr>
        <tr>
          <td><b>Код назначения платежа</b></td>
          <td>${escapeHtml(SUPPLIER.knp)}</td>
        </tr>
      </table>
    </div>

    <div class="block">
      <p><b>Поставщик:</b> БИН ${escapeHtml(SUPPLIER.bin)}, ${escapeHtml(SUPPLIER.name)}, ${escapeHtml(SUPPLIER.address)}, ${escapeHtml(SUPPLIER.phone)}</p>
      <p><b>Покупатель:</b> БИН ${escapeHtml(input.bin)}, ${escapeHtml(buyerName)}, ${escapeHtml(buyerAddress)}, банк: ${escapeHtml(input.bank)}, БИК ${escapeHtml(input.bik)}, ИИК ${escapeHtml(input.account)}</p>
      <p><b>Договор:</b> ${escapeHtml(SUPPLIER.offerContract)}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:28px">№</th>
          <th>Наименование</th>
          <th style="width:54px">Кол-во</th>
          <th style="width:54px">Ед.</th>
          <th style="width:90px">Цена</th>
          <th style="width:90px">Сумма</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="c">1</td>
          <td>${escapeHtml(serviceName)}</td>
          <td class="c">1</td>
          <td class="c">услуга</td>
          <td class="r">${escapeHtml(totalNumeric)}</td>
          <td class="r">${escapeHtml(totalNumeric)}</td>
        </tr>
      </tbody>
    </table>

    <p><b>Всего наименований 1, на сумму ${escapeHtml(totalDisplay)}</b></p>
    <p><b>Итого:</b> ${escapeHtml(totalDisplay)}</p>
    <p><b>Без налога (НДС)</b></p>
    <p><b>Всего к оплате:</b> ${escapeHtml(totalWords)}</p>

    <p class="muted" style="margin-top:12px">
      Счет действителен в течение 5 рабочих дней с даты выставления.
      После оплаты направьте подтверждение на ${escapeHtml(SUPPLIER.email)}.
      Назначение платежа: ${escapeHtml(purpose)}
    </p>

    <div class="sign">
      <p><b>Исполнитель</b> ${escapeHtml(SUPPLIER.executor)}</p>
    </div>
  </div>
</body>
</html>`
}

export function openInvoiceDocument(input: InvoiceInput) {
  const html = generateInvoiceHtml(input)
  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, "_blank", "noopener,noreferrer")

  if (!win) {
    const a = document.createElement("a")
    a.href = url
    a.download = `schet-kassapay-${input.bin}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return Boolean(win)
}
