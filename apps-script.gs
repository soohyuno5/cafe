// ============================================
// 캠핑 예약 관리 시스템 - Google Apps Script
// 이 코드를 Google Sheets의 Apps Script 편집기에 붙여넣으세요.
// ============================================ 

/**
 * @description 스프레드시트 초기 설정을 위한 함수입니다.
 * 메뉴에서 이 함수를 한 번 실행하여 시트 헤더를 설정하세요.
 */
function setupSpreadsheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 시트 이름 설정
  sheet.setName('캠핑예약목록');

  // 헤더 정의
  const headers = [
    '예약번호', '예약자명', '전화번호', '예약일자', '사이트명', 
    '결제금액', '결제수단', '성인', '소인', '저장일시'
  ];

  // 헤더 쓰기
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);

  // 헤더 스타일링
  headerRange.setBackground('#2E7D32') // Green
             .setFontColor('#FFFFFF')
             .setFontWeight('bold')
             .setHorizontalAlignment('center');

  // 열 너비 자동 조정
  headers.forEach((_, i) => {
    sheet.autoResizeColumn(i + 1);
  });
  
  // 첫 행 고정
  sheet.setFrozenRows(1);

  Logger.log('캠핑 예약목록 시트 설정이 완료되었습니다.');
}

/**
 * @description 웹 앱으로 POST 요청을 받았을 때 실행되는 메인 함수입니다.
 * @param {object} e - 이벤트 객체 (요청 데이터 포함)
 * @returns {ContentService.TextOutput} - JSON 형식의 응답
 */
function doPost(e) {
  try {
    // 요청 본문에서 JSON 데이터 파싱
    const data = JSON.parse(e.postData.contents);

    // 데이터 저장 함수 호출
    const recordId = saveReservation(data);

    // 성공 응답 반환
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, recordId: recordId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 오류 로깅 및 오류 응답 반환
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * @description 수신된 예약 데이터를 스프레드시트에 저장합니다.
 * @param {object} data - 파싱된 예약 정보 객체
 * @returns {string} - 저장된 행의 예약번호
 */
function saveReservation(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('캠핑예약목록');
  if (!sheet) {
    // 시트가 존재하지 않을 경우 오류 발생
    throw new Error('\'캠핑예약목록\' 시트를 찾을 수 없습니다. 먼저 setupSpreadsheet() 함수를 실행해주세요.');
  }

  // 데이터 저장 시간 기록
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  // 시트에 추가할 행 데이터 구성
  const newRow = [
    data.reservationNumber || '',
    data.name || '',
    data.phone || '',
    data.reservationDate || '',
    data.siteName || '',
    data.paymentAmount || '',
    data.paymentMethod || '',
    data.adults || '',
    data.children || '',
    timestamp
  ];

  // 시트 마지막에 행 추가
  sheet.appendRow(newRow);

  Logger.log('예약 저장 완료: ' + data.reservationNumber);
  return data.reservationNumber;
}

/**
 * @description 웹 앱의 상태를 확인하기 위한 GET 요청 핸들러입니다.
 * @returns {ContentService.TextOutput} - API 상태 메시지
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'OK', message: 'Camping Reservation API is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * @description 테스트용 함수입니다. Apps Script 편집기에서 직접 실행하여 테스트할 수 있습니다.
 */
function testSaveReservation() {
  const testData = {
    reservationNumber: '9999999',
    name: '테스트',
    phone: '010-0000-0000',
    reservationDate: '2025-12-31',
    siteName: '테스트 사이트',
    paymentAmount: '50,000',
    paymentMethod: '신용카드',
    adults: '2',
    children: '1'
  };
  
  try {
    const recordId = saveReservation(testData);
    Logger.log('테스트 예약 저장 성공. 예약번호: ' + recordId);
  } catch (error) {
    Logger.log('테스트 예약 저장 실패: ' + error.toString());
  }
}