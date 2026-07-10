// ================================================
// 배진우 - 현명한 보험 개인 페이지 전용
// 이메일(배진우 개인만) + 텔레그램 + 구글시트 연동
// 공용 스크립트(메타리치 시그널그룹)에서 분리한 버전
// 시트도 공용 "공통 접수건"이 아닌, 이 프로젝트에 바인딩된
// 개인 시트("현명한보험 개인 접수건")에 저장됨
// ================================================
//
// 적용 방법 (이미 만든 프로젝트 "배진우 현명한보험 개인"):
// 1. Code.gs 내용을 아래 코드로 전체 교체
// 2. 저장
// 3. 배포 → 배포 관리 → 편집(연필) → 버전: 새 버전 → 배포
//    (URL은 그대로 유지되므로 main.js는 다시 수정할 필요 없음)
// 4. 프로젝트 실행 권한 승인(testAuth 등 실행 후 계정 승인) 완료 필요

const EMAIL_TO = 'jinwoo8506@gmail.com';
const SPREADSHEET_ID = '1ad0oB28CHDSxhzmG1LkyE75zvczp8K7b9fjPnOogPGc';

const TELEGRAM_TOKEN = '8652544241:AAEiwI3_qEnPGmgc8YluREw-LAjNBnXXaNo';
const TELEGRAM_CHAT_ID = '8712434989';

// 메인 진입점
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetUrl = ss.getUrl();

    data.phone = formatPhone(data.phone);

    if (data.formType === 'recruit') {
      saveToSheet(ss, data, '입사지원');
      sendRecruitEmail(data, sheetUrl);
      sendTelegram(buildRecruitMsg(data, sheetUrl));
    } else {
      // 보험상담 / 세일즈코칭 / 프로그램문의 모두 여기로 들어옴 (main.js가 전부 'consult'로 매핑)
      saveToSheet(ss, data, '상담신청');
      sendConsultEmail(data, sheetUrl);
      sendTelegram(buildConsultMsg(data, sheetUrl));
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 전화번호 포맷
function formatPhone(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length > 7) return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7);
  if (digits.length > 3) return digits.slice(0, 3) + '-' + digits.slice(3);
  return digits;
}

// 텔레그램 발송
function sendTelegram(text) {
  const url = 'https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage';
  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    })
  });
}

// 텔레그램 메시지 - 상담
function buildConsultMsg(data, sheetUrl) {
  return '🔔 <b>보험 상담 신청 (현명한 보험)</b>\n\n'
    + '📋 상담 유형 : ' + (data.type || '-') + '\n'
    + '👤 성       함 : ' + data.name + '\n'
    + '📞 연   락   처 : ' + data.phone + '\n'
    + '🎂 연       령 : ' + (data.age || '-') + '\n'
    + '📍 희망지역 : ' + (data.region || '-') + '\n'
    + '💬 문       의 :\n' + (data.message || '(내용 없음)') + '\n\n'
    + '🕐 접수시간 : ' + data.timestamp + '\n'
    + '📊 <a href="' + sheetUrl + '">구글 시트 바로가기</a>';
}

// 텔레그램 메시지 - 입사
function buildRecruitMsg(data, sheetUrl) {
  return '🔔 <b>입사 지원 (현명한 보험)</b>\n\n'
    + '👤 성       함 : ' + data.name + '\n'
    + '📞 연   락   처 : ' + data.phone + '\n'
    + '💼 경       력 : ' + (data.exp || '-') + '\n'
    + '📍 희망근무지 : ' + (data.loc || '-') + '\n'
    + '📝 자기소개 :\n' + (data.memo || '(내용 없음)') + '\n\n'
    + '🕐 접수시간 : ' + data.timestamp + '\n'
    + '📊 <a href="' + sheetUrl + '">구글 시트 바로가기</a>';
}

// 이메일 - 상담
function sendConsultEmail(data, sheetUrl) {
  const subject = '[보험상담] ' + data.name + '님 (' + (data.type || '') + ') | 현명한 보험';

  const body = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    + '  현명한 보험 상담 신청\n'
    + '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    + '■ 접수 시간 : ' + data.timestamp + '\n'
    + '■ 상담 유형 : ' + (data.type || '-') + '\n'
    + '■ 성     함 : ' + data.name + '\n'
    + '■ 연 락 처 : ' + data.phone + '\n'
    + '■ 연     령 : ' + (data.age || '-') + '\n'
    + '■ 희망 지역 : ' + (data.region || '-') + '\n'
    + '■ 문     의 :\n' + (data.message || '(내용 없음)') + '\n\n'
    + '━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    + '  24시간 내 연락 부탁드립니다.\n'
    + '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    + '▶ 구글 시트 바로가기\n' + sheetUrl;

  GmailApp.sendEmail(EMAIL_TO, subject, body);
}

// 이메일 - 입사
function sendRecruitEmail(data, sheetUrl) {
  const subject = '[입사지원] ' + data.name + '님 (' + (data.exp || '') + ') | 현명한 보험';

  const body = '\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    + '  현명한 보험 입사 지원\n'
    + '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    + '■ 접수 시간 : ' + data.timestamp + '\n'
    + '■ 성     함 : ' + data.name + '\n'
    + '■ 연 락 처 : ' + data.phone + '\n'
    + '■ 경력 사항 : ' + (data.exp || '-') + '\n'
    + '■ 희망 근무지 : ' + (data.loc || '-') + '\n'
    + '■ 자기소개 :\n' + (data.memo || '(내용 없음)') + '\n\n'
    + '━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    + '  검토 후 2~3일 내 연락 부탁드립니다.\n'
    + '━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n'
    + '▶ 구글 시트 바로가기\n' + sheetUrl;

  GmailApp.sendEmail(EMAIL_TO, subject, body);
}

// 구글 시트 저장
function saveToSheet(ss, data, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  const isNew = !sheet;

  if (isNew) {
    sheet = ss.insertSheet(sheetName);

    if (sheetName === '상담신청') {
      sheet.appendRow(['접수시간', '상담유형', '성명', '연락처', '연령', '희망지역', '문의내용']);
    } else if (sheetName === '입사지원') {
      sheet.appendRow(['접수시간', '성명', '연락처', '경력', '희망근무지', '자기소개']);
    }

    styleSheet(sheet, sheetName);
  }

  if (sheetName === '상담신청') {
    sheet.appendRow([data.timestamp, data.type, data.name, data.phone, data.age, data.region, data.message]);
    forcePhoneText(sheet, 4);
  } else if (sheetName === '입사지원') {
    sheet.appendRow([data.timestamp, data.name, data.phone, data.exp, data.loc, data.memo]);
    forcePhoneText(sheet, 3);
  }

  applyRowColors(sheet, sheetName);
}

// 전화번호 텍스트 강제
function forcePhoneText(sheet, phoneCol) {
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(lastRow, phoneCol);
  range.setNumberFormat('@');
  range.setValue(String(range.getValue()));
}

// 시트 최초 생성 시 헤더 스타일
function styleSheet(sheet, sheetName) {
  const isConsult = sheetName === '상담신청';

  const headerBg = isConsult ? '#1e3a8a' : '#1c1917';
  const colWidths = isConsult ? [160, 110, 80, 130, 70, 100, 300] : [160, 80, 130, 80, 100, 400];

  colWidths.forEach((w, i) => sheet.setColumnWidth(i + 1, w));

  const headerRow = sheet.getRange(1, 1, 1, colWidths.length);
  headerRow
    .setBackground(headerBg)
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setFontSize(11)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');

  sheet.setRowHeight(1, 36);
  sheet.setTabColor(isConsult ? '#1d4ed8' : '#d97706');
  sheet.setFrozenRows(1);
}

// 데이터 행 교차 색상
function applyRowColors(sheet, sheetName) {
  const evenBg = sheetName === '상담신청' ? '#eff6ff' : '#fffbeb';

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) return;

  for (let r = 2; r <= lastRow; r++) {
    const bg = (r % 2 === 0) ? evenBg : '#ffffff';

    sheet.getRange(r, 1, 1, lastCol)
      .setBackground(bg)
      .setFontSize(10)
      .setVerticalAlignment('middle');

    sheet.setRowHeight(r, 28);
  }
}
