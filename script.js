const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const todayText = document.getElementById("todayText");
const monthInput = document.getElementById("monthInput");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const todayBtn = document.getElementById("todayBtn");

const dateModal = document.getElementById("dateModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModalBtn = document.getElementById("closeModal");
const detailBadge = document.getElementById("detailBadge");
const detailTitle = document.getElementById("detailTitle");
const detailMeta = document.getElementById("detailMeta");
const detailTags = document.getElementById("detailTags");
const detailList = document.getElementById("detailList");
const markerForm = document.getElementById("markerForm");
const markerName = document.getElementById("markerName");
const markerType = document.getElementById("markerType");
const markerMonth = document.getElementById("markerMonth");
const markerValue = document.getElementById("markerValue");
const markerColor = document.getElementById("markerColor");
const markerList = document.getElementById("markerList");
const selectAllMarkersBtn = document.getElementById("selectAllMarkers");
const invertMarkersBtn = document.getElementById("invertMarkers");
const clearMarkersBtn = document.getElementById("clearMarkers");
const resetMarkersBtn = document.getElementById("resetMarkers");

const MARKER_STORAGE_KEY = "calendar-custom-markers";

const now = new Date();
let viewYear = now.getFullYear();
let viewMonth = now.getMonth();
let customMarkers = loadCustomMarkers();

const pad = (num) => String(num).padStart(2, "0");
const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const zodiacAnimals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

const weekdayShortNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function loadCustomMarkers() {
  try {
    const saved = localStorage.getItem(MARKER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveCustomMarkers() {
  localStorage.setItem(MARKER_STORAGE_KEY, JSON.stringify(customMarkers));
}

function getReadableMarkerRule(marker) {
  if (marker.type === "weekday") return `每${weekdayShortNames[Number(marker.value)]}`;
  if (marker.type === "monthDay") return `每年 ${marker.month} 月 ${marker.value} 日`;
  return `每月 ${marker.value} 号`;
}

function getMatchingMarkers(date) {
  return customMarkers.filter((marker) => {
    if (marker.type === "weekday") return date.getDay() === Number(marker.value);
    if (marker.type === "day") return date.getDate() === Number(marker.value);
    if (marker.type === "monthDay") return date.getMonth() + 1 === Number(marker.month) && date.getDate() === Number(marker.value);
    return false;
  });
}

function updateMarkerMonthOptions() {
  markerMonth.innerHTML = Array.from({ length: 12 }, (_, index) => `<option value="${index + 1}">${index + 1}月</option>`).join("");
  markerMonth.hidden = markerType.value !== "monthDay";
}

function updateMarkerValueOptions() {
  markerValue.innerHTML = "";
  updateMarkerMonthOptions();

  const options = markerType.value === "weekday"
    ? weekdayShortNames.map((name, index) => [index, name])
    : Array.from({ length: 31 }, (_, index) => [index + 1, `${index + 1}号`]);

  options.forEach(([value, label]) => {
    const optionLabel = document.createElement("label");
    optionLabel.className = "marker-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "markerValue";
    checkbox.value = value;

    const text = document.createElement("span");
    text.textContent = label;

    optionLabel.append(checkbox, text);
    markerValue.appendChild(optionLabel);
  });
}

function getSelectedMarkerValues() {
  return [...markerValue.querySelectorAll('input[name="markerValue"]:checked')].map((input) => input.value);
}

function clearSelectedMarkerValues() {
  markerValue.querySelectorAll('input[name="markerValue"]').forEach((input) => {
    input.checked = false;
  });
}

function selectAllMarkerValues() {
  markerValue.querySelectorAll('input[name="markerValue"]').forEach((input) => {
    input.checked = true;
  });
}

function invertSelectedMarkerValues() {
  markerValue.querySelectorAll('input[name="markerValue"]').forEach((input) => {
    input.checked = !input.checked;
  });
}

function renderMarkerList() {
  markerList.innerHTML = "";

  if (!customMarkers.length) {
    const empty = document.createElement("p");
    empty.className = "marker-empty";
    empty.textContent = "还没有自定义标记。可以添加比如：每周一标蓝、每月 15 号标红。";
    markerList.appendChild(empty);
    return;
  }

  customMarkers.forEach((marker) => {
    const item = document.createElement("div");
    item.className = "marker-item";
    item.innerHTML = `
      <span class="marker-dot" style="background:${marker.color}"></span>
      <strong>${marker.name}</strong>
      <small>${getReadableMarkerRule(marker)}</small>
      <button type="button" aria-label="删除 ${marker.name}">删除</button>
    `;
    item.querySelector("button").addEventListener("click", () => {
      customMarkers = customMarkers.filter((target) => target.id !== marker.id);
      saveCustomMarkers();
      renderMarkerList();
      renderCalendar();
    });
    markerList.appendChild(item);
  });
}
function resetCustomMarkers() {
  if (!customMarkers.length) {
    alert("当前没有需要重置的自定义标记。");
    return;
  }

  const confirmed = confirm("确定要删除全部自定义标记吗？此操作不可撤销。");
  if (!confirmed) return;

  customMarkers = [];
  saveCustomMarkers();
  renderMarkerList();
  renderCalendar();
}
function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatToday(date) {
  return `今天是 ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / 86400000) + 1;
}

function getDaysLeftInYear(date) {
  const end = new Date(date.getFullYear(), 11, 31);
  return Math.floor((end - date) / 86400000);
}

function getWeekOfYear(date) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstThursdayDayNumber = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNumber + 3);
  return 1 + Math.round((target - firstThursday) / 604800000);
}

function getZodiacAnimal(year) {
  return zodiacAnimals[(year - 4) % 12];
}

function getConstellation(month, day) {
  const value = month * 100 + day;
  if (value >= 120 && value <= 218) return "水瓶座";
  if (value >= 219 && value <= 320) return "双鱼座";
  if (value >= 321 && value <= 419) return "白羊座";
  if (value >= 420 && value <= 520) return "金牛座";
  if (value >= 521 && value <= 621) return "双子座";
  if (value >= 622 && value <= 722) return "巨蟹座";
  if (value >= 723 && value <= 822) return "狮子座";
  if (value >= 823 && value <= 922) return "处女座";
  if (value >= 923 && value <= 1023) return "天秤座";
  if (value >= 1024 && value <= 1122) return "天蝎座";
  if (value >= 1123 && value <= 1221) return "射手座";
  return "摩羯座";
}

function getQuarter(month) {
  return Math.floor((month - 1) / 3) + 1;
}

function getWeekIndexInMonth(date) {
  return Math.ceil(date.getDate() / 7);
}

function getFestivals(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const week = date.getDay();
  const weekIndex = getWeekIndexInMonth(date);
  const key = `${pad(month)}-${pad(day)}`;
  const fixedFestivals = {
    "01-01": ["元旦"],
    "02-14": ["情人节"],
    "03-08": ["妇女节"],
    "03-12": ["植树节"],
    "04-01": ["愚人节"],
    "05-01": ["劳动节"],
    "05-04": ["青年节"],
    "06-01": ["儿童节"],
    "07-01": ["建党节", "香港回归纪念日"],
    "08-01": ["建军节"],
    "09-10": ["教师节"],
    "10-01": ["国庆节"],
    "10-31": ["万圣夜"],
    "11-11": ["光棍节"],
    "12-24": ["平安夜"],
    "12-25": ["圣诞节"]
  };

  const festivals = [...(fixedFestivals[key] || [])];

  if (month === 5 && week === 0 && weekIndex === 2) festivals.push("母亲节");
  if (month === 6 && week === 0 && weekIndex === 3) festivals.push("父亲节");
  if (month === 11 && week === 4 && weekIndex === 4) festivals.push("感恩节");

  return festivals;
}

function getDateTags(date, belongsToCurrentMonth = true) {
  const tags = [];
  const markers = getMatchingMarkers(date);

  if (!belongsToCurrentMonth) tags.push("邻月");
  if (isSameDate(date, now)) tags.push("今天");
  markers.forEach((marker) => tags.push(marker.name));
  getFestivals(date).forEach((festival) => tags.push(festival));

  return tags;
}

function buildDetailItems(date, belongsToCurrentMonth) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const daysInMonth = new Date(year, month, 0).getDate();
  const festivals = getFestivals(date);
  const markers = getMatchingMarkers(date);

  return [
    ["完整日期", `${year}年${month}月${day}日`],
    ["标准格式", getDateKey(date)],
    ["星期", weekdays[date.getDay()]],
    ["月份", `${monthNames[month - 1]}，本月共有 ${daysInMonth} 天`],
    ["季度", `第 ${getQuarter(month)} 季度`],
    ["年内序号", `今年第 ${getDayOfYear(date)} 天，距离年底还有 ${getDaysLeftInYear(date)} 天`],
    ["周序号", `ISO 第 ${getWeekOfYear(date)} 周`],
    ["节日", festivals.length ? festivals.join("、") : "无常见公历节日"],
    ["自定义标记", markers.length ? markers.map((marker) => `${marker.name}（${getReadableMarkerRule(marker)}）`).join("、") : "无自定义标记"],
    ["生肖", `${getZodiacAnimal(year)}年`],
    ["星座", getConstellation(month, day)],
    ["日期属性", day % 2 === 1 ? "单数日期" : "双数日期"],
    ["页面归属", belongsToCurrentMonth ? "当前月份" : "前后月份补齐日期"]
  ];
}

function createTag(text) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = text;
  return tag;
}

function createDayCell(date, belongsToCurrentMonth) {
  const cell = document.createElement("button");
  const dayNumber = date.getDate();

  cell.type = "button";
  cell.className = "day";
  cell.setAttribute("aria-label", `${date.getFullYear()}年${date.getMonth() + 1}月${dayNumber}日，点击查看详情`);

  const number = document.createElement("span");
  number.className = "day-number";
  number.textContent = dayNumber;

  const markers = getMatchingMarkers(date);
  if (markers.length) {
    const primaryMarker = markers[markers.length - 1];
    cell.style.setProperty("--marker-color", primaryMarker.color);
    cell.classList.add("custom-marked");
    cell.setAttribute("title", markers.map((marker) => marker.name).join("、"));
  }

  cell.append(number);

  if (!belongsToCurrentMonth) cell.classList.add("other-month");
  if (isSameDate(date, now)) cell.classList.add("today");

  cell.addEventListener("click", () => openDateDetail(date, belongsToCurrentMonth));

  return cell;
}

function openDateDetail(date, belongsToCurrentMonth) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const tags = getDateTags(date, belongsToCurrentMonth);
  const items = buildDetailItems(date, belongsToCurrentMonth);

  detailBadge.textContent = belongsToCurrentMonth ? "当前月份日期" : "邻近月份日期";
  detailTitle.textContent = `${year}年${month}月${day}日`;
  detailMeta.textContent = `${weekdays[date.getDay()]} · ${getConstellation(month, day)} · ${getZodiacAnimal(year)}年`;

  detailTags.innerHTML = "";
  tags.forEach((tag) => detailTags.appendChild(createTag(tag)));

  detailList.innerHTML = "";
  items.forEach(([label, value]) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
    detailList.appendChild(li);
  });

  dateModal.classList.add("show");
  dateModal.setAttribute("aria-hidden", "false");
  closeModalBtn.focus();
}

function closeDateDetail() {
  dateModal.classList.remove("show");
  dateModal.setAttribute("aria-hidden", "true");
}

function renderCalendar() {
  calendarGrid.innerHTML = "";

  monthTitle.textContent = `${viewYear}年 ${viewMonth + 1}月`;
  todayText.textContent = formatToday(now);
  monthInput.value = `${viewYear}-${pad(viewMonth + 1)}`;

  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = firstDay.getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    let cellDate;
    let belongsToCurrentMonth = true;

    if (i < firstWeekday) {
      const day = prevMonthDays - firstWeekday + i + 1;
      cellDate = new Date(viewYear, viewMonth - 1, day);
      belongsToCurrentMonth = false;
    } else if (i >= firstWeekday + daysInMonth) {
      const day = i - firstWeekday - daysInMonth + 1;
      cellDate = new Date(viewYear, viewMonth + 1, day);
      belongsToCurrentMonth = false;
    } else {
      const day = i - firstWeekday + 1;
      cellDate = new Date(viewYear, viewMonth, day);
    }

    calendarGrid.appendChild(createDayCell(cellDate, belongsToCurrentMonth));
  }
}

function changeMonth(offset) {
  const target = new Date(viewYear, viewMonth + offset, 1);
  viewYear = target.getFullYear();
  viewMonth = target.getMonth();
  renderCalendar();
}

prevMonthBtn.addEventListener("click", () => changeMonth(-1));
nextMonthBtn.addEventListener("click", () => changeMonth(1));

todayBtn.addEventListener("click", () => {
  viewYear = now.getFullYear();
  viewMonth = now.getMonth();
  renderCalendar();
});

markerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedValues = getSelectedMarkerValues();

  if (!selectedValues.length) {
    alert("请至少选择一个要标记的条件。");
    return;
  }

  const color = markerColor.value;
  const type = markerType.value;

  const newMarkers = selectedValues.map((value) => {
    const rulePreview = { type, value, month: markerMonth.value };
    return {
      id: `${Date.now()}-${type}-${markerMonth.value || "all"}-${value}-${Math.random().toString(16).slice(2)}`,
      name: markerName.value.trim() || getReadableMarkerRule(rulePreview),
      type,
      value,
      month: type === "monthDay" ? markerMonth.value : undefined,
      color
    };
  });

  customMarkers.push(...newMarkers);
  saveCustomMarkers();
  markerForm.reset();
  markerColor.value = color;
  updateMarkerValueOptions();
  renderMarkerList();
  renderCalendar();
});

markerType.addEventListener("change", updateMarkerValueOptions);
selectAllMarkersBtn.addEventListener("click", selectAllMarkerValues);
invertMarkersBtn.addEventListener("click", invertSelectedMarkerValues);
clearMarkersBtn.addEventListener("click", clearSelectedMarkerValues);
resetMarkersBtn.addEventListener("click", resetCustomMarkers);

monthInput.addEventListener("change", (event) => {
  const [year, month] = event.target.value.split("-").map(Number);
  if (!year || !month) return;
  viewYear = year;
  viewMonth = month - 1;
  renderCalendar();
});

closeModalBtn.addEventListener("click", closeDateDetail);
modalBackdrop.addEventListener("click", closeDateDetail);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDateDetail();
  if (event.key === "ArrowLeft") changeMonth(-1);
  if (event.key === "ArrowRight") changeMonth(1);
});

updateMarkerValueOptions();
renderMarkerList();
renderCalendar();
