const CONFIG = {
  googleAppsScriptUrl: "https://script.google.com/macros/s/AKfycbx_acqxXYQmUY9n-TgsVYBXscE0o3iq4VGQh1dC7opSAqhtbJZhCdy8kRYFqZB_-T8Now/exec"
};

const introLoader = document.getElementById("introLoader");
if (introLoader) {
  const introKey = "wiseInsuranceIntroPlayed";
  const alreadyPlayed = sessionStorage.getItem(introKey) === "Y";
  if (alreadyPlayed) {
    introLoader.classList.add("hide");
  } else {
    document.body.classList.add("intro-active");
    window.addEventListener("load", () => {
      // 3문구(보험을 넘어 / 금융의 모든 것 / 현명한 보험)가 다 나타난 뒤 0.8초 함께 유지하고
      // 화면 전체가 자연스럽게 페이드아웃되며 메인 Hero로 전환
      window.setTimeout(() => {
        document.body.classList.remove("intro-active");
        introLoader.classList.add("hide");
        sessionStorage.setItem(introKey, "Y");
      }, 3850);
    });
  }
}

const isMobile = window.matchMedia("(max-width: 768px)").matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

document.querySelectorAll("[data-mobile-href]").forEach((link) => {
  if (isMobile) link.href = link.dataset.mobileHref;
});

const comments = {
  "암 보장": "진단비, 항암치료, 표적항암, 재진단 보장 여부를 함께 확인하는 것이 중요합니다.",
  "뇌·심장 보장": "진단 범위가 좁지 않은지, 수술비와 후유장해 보장이 함께 준비되어 있는지 확인해야 합니다.",
  "실손의료비": "현재 실손 세대, 자기부담금, 비급여 보장 범위와 보험료 변동 가능성을 확인해야 합니다.",
  "수술비": "질병·상해 수술비가 넓게 준비되어 있는지, 특정 수술비와 중복되는 부분을 확인해야 합니다.",
  "입원비": "장기 입원 가능성과 간병 부담까지 함께 고려해 실제 필요한 수준을 확인해야 합니다.",
  "운전자보험": "교통사고 처리지원금, 변호사 선임비용, 벌금 보장이 현재 기준에 맞는지 확인해야 합니다.",
  "어린이보험": "성장기 질병, 상해, 후유장해, 주요 진단비가 균형 있게 준비되어 있는지 확인해야 합니다.",
  "보험금 청구": "진단서, 입퇴원확인서, 진료비 영수증, 세부내역서 등 필요한 서류를 먼저 확인하는 것이 좋습니다.",
  "기존 보험 점검": "갱신형 비중, 중복 보장, 보장 공백, 납입 부담을 한 번에 정리하는 것이 좋습니다."
};

function selectedCoverage() {
  return [...document.querySelectorAll('input[name="coverage"]:checked')].map((input) => input.value);
}

function updateCoverageComment() {
  const box = document.getElementById("coverageComment");
  if (!box) return;
  const selected = selectedCoverage();
  if (!selected.length) {
    box.innerHTML = "<strong>선택한 보장에 따라 핵심 체크 포인트가 표시됩니다.</strong><ul><li>현재 가입 내역, 보장 범위, 보험료 부담을 함께 확인하는 것이 좋습니다.</li></ul>";
    return;
  }
  const title = selected.length === 1 ? `${selected[0]} 체크 포인트` : "선택한 보장의 핵심 체크 포인트";
  box.innerHTML = `<strong>${title}</strong><ul>${selected.map((item) => `<li>${comments[item]}</li>`).join("")}</ul>`;
}

document.querySelectorAll('input[name="coverage"]').forEach((input) => {
  input.addEventListener("change", updateCoverageComment);
});
updateCoverageComment();

function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

document.querySelectorAll('input[name="phone"]').forEach((input) => {
  input.addEventListener("input", () => {
    input.value = formatPhone(input.value);
  });
});

const submitModal = document.getElementById("submitModal");

function setSubmitModal(state) {
  if (!submitModal) return;
  const title = submitModal.querySelector("h3");
  const desc = submitModal.querySelector("p");
  submitModal.classList.add("show");
  submitModal.classList.toggle("done", state === "done");
  submitModal.setAttribute("aria-hidden", "false");
  if (state === "loading") {
    title.textContent = "신청 정보를 전송 중입니다";
    desc.textContent = "잠시만 기다려 주세요.";
  } else if (state === "done") {
    title.textContent = "신청이 완료되었습니다!";
    desc.textContent = "곧 연락드리겠습니다!";
  }
}

function closeSubmitModal() {
  if (!submitModal) return;
  submitModal.classList.remove("show", "done");
  submitModal.setAttribute("aria-hidden", "true");
}

if (submitModal) {
  submitModal.addEventListener("click", (event) => {
    if (event.target === submitModal || event.target.closest("[data-modal-close]")) {
      closeSubmitModal();
    }
  });
}

function utm() {
  const params = new URLSearchParams(location.search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    page_url: location.href
  };
}

function currentPageName(formType) {
  const path = location.pathname.split("/").pop() || "index.html";
  const names = {
    "index.html": "메인 페이지",
    "insurance.html": "보험 상담 페이지",
    "recruit.html": "입사 문의 페이지",
    "lecture.html": "세일즈 코칭 페이지",
    "program.html": "프로그램 문의 페이지"
  };
  return names[path] || formType || document.title || "현명한 보험";
}

function legacyFormType(formType) {
  const path = location.pathname.split("/").pop() || "";
  if (path === "recruit.html" || formType.includes("입사")) return "recruit";
  return "consult";
}

async function submitLead(form) {
  const message = form.querySelector(".form-message");
  const submitButton = form.querySelector('button[type="submit"]');
  const name = form.elements.name?.value.trim() || "";
  const phone = form.elements.phone?.value.trim() || "";
  const privacy = form.elements.privacy?.checked;
  const formType = form.dataset.formType || "문의";
  const coverage = selectedCoverage();
  const pageName = currentPageName(formType);
  const legacyType = legacyFormType(formType);

  message.classList.remove("error");
  message.textContent = "";

  if (!name || !phone || !privacy) {
    message.classList.add("error");
    message.textContent = "이름, 연락처, 개인정보 동의를 확인해 주세요.";
    return;
  }

  const payload = {
    createdAt: new Date().toISOString(),
    timestamp: new Date().toLocaleString("ko-KR"),
    brand: "현명한 보험",
    advisor: "배진우",
    expert: "배진우",
    formType: legacyType,
    requestType: formType,
    pageName,
    requestPage: pageName,
    pageTitle: document.title,
    name,
    phone,
    type: formType,
    exp: formType,
    loc: "",
    region: "",
    message: coverage.length ? `선택 보장: ${coverage.join(", ")}` : `${pageName} / ${formType} 신청`,
    area: "",
    age: "",
    memo: coverage.length ? `선택 보장: ${coverage.join(", ")}` : `${formType} 신청`,
    coverage: coverage.join(", "),
    privacyConsent: privacy ? "Y" : "N",
    source: "현명한 보험 개인 브랜딩 홈페이지",
    telegramTitle: `[현명한 보험] ${pageName} 신청`,
    ...utm()
  };

  try {
    submitButton.disabled = true;
    submitButton.dataset.originalText = submitButton.textContent;
    submitButton.textContent = "전송 중...";
    setSubmitModal("loading");
    localStorage.setItem("wise-insurance-last-lead", JSON.stringify(payload));
    await fetch(CONFIG.googleAppsScriptUrl, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    form.reset();
    updateCoverageComment();
    message.textContent = "";
    setSubmitModal("done");
  } catch (error) {
    message.classList.add("error");
    message.textContent = "접수 중 문제가 발생했습니다. 카카오톡 또는 전화 상담을 이용해 주세요.";
    closeSubmitModal();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = submitButton.dataset.originalText || "신청하기";
  }
}

document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitLead(form);
  });
});
