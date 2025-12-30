// ============================================
// 캠핑 예약 정보 관리 JavaScript
// ============================================

// Google Apps Script 웹앱 URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw32Tv6eHm7cWvzW0bp_skKwW3dCblCqRbhDJzInN4KVqDd5NEA8PCT39Yh7pNF5VBHDw/exec';

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeParsing();
    initializeFormSubmission();
});

// ============================================
// 정보 추출(파싱) 기능 초기화
// ============================================
function initializeParsing() {
    const parseButton = document.getElementById('parseButton');
    const reservationText = document.getElementById('reservationText');

    parseButton.addEventListener('click', function() {
        const text = reservationText.value;
        if (!text) {
            alert('먼저 예약 내용을 붙여넣어 주세요.');
            return;
        }
        parseReservationText(text);
    });
}

// ============================================
// 예약 텍스트를 파싱하여 폼 필드에 채우기
// ============================================
function parseReservationText(text) {
    // 각 항목에 대한 정규식
    const patterns = {
        reservationDate: /예약일자\s*:\s*(.*)/,
        siteName: /사이트명\s*:\s*(.*)/,
        paymentAmount: /결제금액\s*:\s*([\d,]+)원/,
        paymentMethod: /결제수단\s*:\s*(.*)/,
        adults: /성인:(\d+)/,
        children: /소인:(\d+)/,
        reservationNumber: /예약번호\s*:\s*(\d+)/,
        name: /예약자명\s*:\s*(.*)/,
        phone: /전화번호\s*:\s*([\d-]+)/,
    };

    // 정규식을 사용하여 정보 추출 및 필드 채우기
    for (const key in patterns) {
        const match = text.match(patterns[key]);
        const element = document.getElementById(key);
        if (element) {
            // 'name' 필드의 경우, 이름 뒤에 오는 추가 정보를 제거
            if (key === 'name' && match && match[1]) {
                element.value = match[1].split('-')[0].trim();
            } 
            // 다른 필드는 정규식의 첫 번째 캡처 그룹을 사용
            else if (match && match[1]) {
                element.value = match[1].trim();
            } 
            // 정보가 없는 경우 필드를 비움
            else {
                element.value = '';
            }
        }
    }
    
    // 파싱 후 사용자에게 알림
    showMessage('success', '정보 추출이 완료되었습니다. 내용을 확인하고 시트에 저장하세요.');
}


// ============================================
// 폼 제출 처리
// ============================================
function initializeFormSubmission() {
    const form = document.getElementById('reservationForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // 폼 데이터 수집
        const formData = {
            reservationNumber: document.getElementById('reservationNumber').value,
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            reservationDate: document.getElementById('reservationDate').value,
            siteName: document.getElementById('siteName').value,
            paymentAmount: document.getElementById('paymentAmount').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            adults: document.getElementById('adults').value,
            children: document.getElementById('children').value,
            timestamp: new Date().toISOString()
        };

        // 필수 데이터 확인
        if (!formData.reservationNumber || !formData.name) {
            showMessage('error', '추출된 정보가 올바르지 않습니다. 예약 번호와 이름이 있는지 확인해주세요.');
            return;
        }

        // 제출 버튼 비활성화 및 로딩 표시
        const submitBtn = form.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = '저장 중...';
        showMessage('loading', 'Google Sheet에 정보를 저장하고 있습니다...');

        try {
            // Google Apps Script로 데이터 전송
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // no-cors 모드 사용
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            // no-cors 모드에서는 응답을 직접 읽을 수 없으므로, 요청이 보내진 것으로 간주하고 성공 처리
            showMessage('success', '예약 정보가 Google Sheet에 성공적으로 저장되었습니다!');
            form.reset(); // 폼 초기화
            document.getElementById('reservationText').value = ''; // 텍스트 영역도 초기화

        } catch (error) {
            console.error('저장 오류:', error);
            showMessage('error', '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            // 제출 버튼 다시 활성화
            submitBtn.disabled = false;
            submitBtn.textContent = 'Google Sheet에 저장';
        }
    });
}

// ============================================
// 메시지 표시 함수
// ============================================
function showMessage(type, text) {
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.className = 'result-message ' + type;
    resultMessage.textContent = text;
    resultMessage.style.display = 'block';

    // 5초 후 메시지 자동으로 숨김
    setTimeout(() => {
        resultMessage.style.display = 'none';
        resultMessage.className = 'result-message';
        resultMessage.textContent = '';
    }, 5000);
}