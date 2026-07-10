/**
 * Google Apps Script에 붙여 넣어 배포하는 서버 코드 예시입니다.
 * 이 파일은 홈페이지에서 직접 불러오지 않습니다.
 *
 * 보안상 텔레그램 Bot Token은 공개 HTML/JS에 넣지 말고
 * Apps Script의 Script Properties에 저장해서 사용하세요.
 *
 * Script Properties:
 * TELEGRAM_BOT_TOKEN = 8652544241:...
 * TELEGRAM_CHAT_ID   = 8712434989
 * EMAIL_TO           = jw20371035@gmail.com,jinwoo8506@gmail.com,kye1004s7@gmail.com
 */

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
  } catch (err) {
    data = {};
  }

  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("TELEGRAM_BOT_TOKEN");
  var chatId = props.getProperty("TELEGRAM_CHAT_ID");
  var emailTo = props.getProperty("EMAIL_TO") || data.extra_email || "";

  var title = "[현명한 보험] " + (data.formType || "문의") + " 접수";
  var body = [
    title,
    "",
    "신청 페이지: " + (data.pageName || data.requestPage || data.pageTitle || ""),
    "신청 구분: " + (data.formType || data.requestType || ""),
    "담당: " + (data.advisor || data.expert || "배진우"),
    "이름: " + (data.name || ""),
    "연락처: " + (data.phone || ""),
    "선택 보장: " + (data.coverage || ""),
    "메모: " + (data.memo || ""),
    "개인정보 동의: " + (data.privacyConsent || ""),
    "접수 시각: " + (data.timestamp || data.createdAt || new Date()),
    "페이지: " + (data.page_url || "")
  ].join("\n");

  if (emailTo) {
    MailApp.sendEmail({
      to: emailTo,
      subject: title,
      body: body
    });
  }

  if (token && chatId) {
    UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: chatId,
        text: body
      }),
      muteHttpExceptions: true
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
