"use strict";

const amountInput = document.querySelector("#amount");
const clearAmountButton = document.querySelector("#clear-amount");
const rateInput = document.querySelector("#rate");
const results = document.querySelector("#results");
const quickRates = document.querySelectorAll("[data-rate]");
const periods = [5, 10, 20, 30];
const currencyFormatter = new Intl.NumberFormat("zh-TW", {
  style: "currency", currency: "TWD", currencyDisplay: "code", maximumFractionDigits: 0
});

function calculateFutureValue(principal, annualRate, years) {
  return principal === 0 ? 0 : principal * Math.pow(1 + annualRate / 100, years);
}

function formatCurrency(value) {
  return currencyFormatter.format(value).replace(/^TWD\s*/, "NT$");
}

function showMessage(id, message) {
  const element = document.getElementById(id);
  element.textContent = message;
  element.hidden = !message;
}

function readInput(input) {
  if (input.validity.badInput) return NaN;
  return input.value.trim() === "" ? 0 : Number(input.value);
}

function calculate() {
  const amount = readInput(amountInput);
  const rate = readInput(rateInput);
  const validAmount = Number.isFinite(amount) && amount >= 0;
  const validRate = Number.isFinite(rate) && rate >= -100;
  const valid = validAmount && validRate;
  amountInput.setAttribute("aria-invalid", String(!validAmount));
  rateInput.setAttribute("aria-invalid", String(!validRate));
  showMessage("amount-error", !Number.isFinite(amount) ? "請輸入有效金額。" : amount < 0 ? "金額不能為負數。" : "");
  showMessage("rate-error", !validRate ? "請輸入有效報酬率，且不得低於 -100%。" : rate < 0 || rate > 20 ? "請確認報酬率是否正確；建議範圍為 0–20%。" : "");

  for (const button of quickRates) {
    const selected = validRate && rateInput.value !== "" && rate === Number(button.dataset.rate);
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }

  results.replaceChildren(...periods.map(years => {
    const futureValue = valid ? calculateFutureValue(amount, rate, years) : NaN;
    const gain = futureValue - amount;
    const computable = Number.isFinite(futureValue) && Number.isFinite(gain);
    const card = document.createElement("article");
    card.className = "result-card";
    const heading = document.createElement("h3");
    heading.textContent = `${years} 年後`;
    const label = document.createElement("span");
    label.className = "result-label";
    label.textContent = "未來資產總值";
    const value = document.createElement("span");
    value.className = "future-value";
    value.textContent = computable ? formatCurrency(futureValue) : "—";
    const gainLabel = document.createElement("span");
    gainLabel.className = "result-label";
    gainLabel.textContent = "額外複利收益";
    const gainValue = document.createElement("span");
    gainValue.className = "gain";
    const roundedGain = Math.round(gain);
    gainValue.textContent = computable ? `${roundedGain < 0 ? "−" : "+"}${formatCurrency(Math.abs(roundedGain))}` : valid ? "數值超出可計算範圍" : "請確認輸入";
    card.append(heading, label, value, gainLabel, gainValue);
    return card;
  }));

  try {
    if (validAmount) localStorage.setItem("amount", String(amount));
    if (validRate) localStorage.setItem("annualRate", String(rate));
  } catch { /* 儲存不可用時仍可正常計算。 */ }
}

function restoreInput(input, key, minimum) {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null && saved.trim() !== "" && Number.isFinite(Number(saved)) && Number(saved) >= minimum) {
      input.value = saved;
    }
  } catch { /* 使用預設值。 */ }
}

restoreInput(amountInput, "amount", 0);
restoreInput(rateInput, "annualRate", -100);
amountInput.addEventListener("input", calculate);
clearAmountButton.addEventListener("pointerdown", event => {
  // 保留原本的輸入焦點，避免手機鍵盤因點擊按鈕而收起。
  if (event.isPrimary && event.button === 0) event.preventDefault();
});
clearAmountButton.addEventListener("click", () => {
  amountInput.value = "";
  amountInput.focus();
  calculate();
});
rateInput.addEventListener("input", calculate);
for (const button of quickRates) {
  button.addEventListener("click", () => {
    rateInput.value = button.dataset.rate;
    calculate();
  });
}
calculate();

if ("serviceWorker" in navigator && ["https:", "http:"].includes(location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // 離線快取註冊失敗不影響當前頁面計算。
    });
  });
}
