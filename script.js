(function () {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const modal = document.getElementById('form-modal');
  const openFormBtn = document.querySelector('.btn-open-form');
  const closeModalBtn = document.querySelector('.modal-close');
  const backdrop = document.querySelector('.modal-backdrop');
  const form = document.getElementById('registration-form');

  if (!nav || !toggle) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('is-open');
    toggle.setAttribute('aria-label', nav.classList.contains('is-open') ? '메뉴 닫기' : '메뉴 열기');
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('is-open');
    });
  });

  function openModal() {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openFormBtn) {
    openFormBtn.addEventListener('click', openModal);
  }
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  modal.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var birthdate = document.getElementById('birthdate').value.trim();
      var category = document.getElementById('category').value;
      var dinner = document.getElementById('dinner').value;
      var message = document.getElementById('message').value.trim();

      if (!name || !birthdate || !category || !dinner || !message) {
        alert('모든 필수 항목을 입력해 주세요.');
        return;
      }

      var dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthdate)) {
        alert('생년월일은 yyyy-MM-dd 형식으로 입력해 주세요. (예: 1990-01-01)');
        document.getElementById('birthdate').focus();
        return;
      }
      var parts = birthdate.split('-');
      var y = parseInt(parts[0], 10);
      var m = parseInt(parts[1], 10);
      var d = parseInt(parts[2], 10);
      var dateObj = new Date(y, m - 1, d);
      if (dateObj.getFullYear() !== y || dateObj.getMonth() !== m - 1 || dateObj.getDate() !== d) {
        alert('올바른 날짜를 입력해 주세요.');
        document.getElementById('birthdate').focus();
        return;
      }
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj > today) {
        alert('생년월일은 오늘 이전 날짜로 입력해 주세요.');
        document.getElementById('birthdate').focus();
        return;
      }
      if (y < 1900) {
        alert('생년월일 연도가 올바르지 않습니다.');
        document.getElementById('birthdate').focus();
        return;
      }

      var payload = {
        name: name,
        birthdate: birthdate,
        category: category,
        dinner: dinner,
        message: message
      };

      function onSuccess() {
        closeModal();
        form.reset();
        alert('접수가 완료되었습니다!');
      }
      function onError(msg) {
        alert(msg || '접수 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }

      if (!window.firestoreDb) {
        onError('Firebase 설정을 확인해 주세요.');
        return;
      }
      firestoreDb.collection('registrations').add({
        name: payload.name,
        birthdate: payload.birthdate,
        category: payload.category,
        dinner: payload.dinner,
        message: payload.message,
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      }).then(onSuccess).catch(function () { onError('접수 중 오류가 발생했습니다.'); });
    });
  }

  /* ----- 이벤트(10K 5등 예측) 팝업 ----- */
  var eventModal = document.getElementById('event-modal');
  var eventBackdrop = document.querySelector('.event-modal-backdrop');
  var eventCloseBtn = document.querySelector('.event-modal-close');
  var eventCancelBtn = document.querySelector('.event-modal-cancel');
  var openEventBtn = document.querySelector('.btn-open-event-modal');
  var eventCandidatesEl = document.getElementById('event-candidates');
  var eventApplicantInput = document.getElementById('event-applicant-name');
  var eventSubmitBtn = document.getElementById('event-submit-btn');
  var eventConfirmLayer = document.getElementById('event-confirm-layer');
  var eventConfirmMessage = document.getElementById('event-confirm-message');
  var eventConfirmOk = document.getElementById('event-confirm-ok');
  var eventConfirmCancel = document.getElementById('event-confirm-cancel');

  var selectedPredictedName = null;

  function openEventModal() {
    if (!eventModal) return;
    if (eventConfirmLayer) {
      eventConfirmLayer.hidden = true;
      eventConfirmLayer.style.display = 'none';
    }
    eventModal.classList.add('is-open');
    eventModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    selectedPredictedName = null;
    if (eventApplicantInput) eventApplicantInput.value = '';
    loadEventCandidates();
  }

  function closeEventModal() {
    if (!eventModal) return;
    eventModal.classList.remove('is-open');
    eventModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderEventCandidates(rows) {
    var names = (rows || []).map(function (r) { return (r.name || '').trim(); }).filter(Boolean);
    names.sort(function (a, b) { return a.localeCompare(b, 'ko'); });
    eventCandidatesEl.innerHTML = '';
    names.forEach(function (name) {
      var span = document.createElement('span');
      span.className = 'event-candidate';
      span.textContent = name;
      span.setAttribute('data-name', name);
      span.addEventListener('click', function () {
        document.querySelectorAll('.event-candidate.selected').forEach(function (el) { el.classList.remove('selected'); });
        span.classList.add('selected');
        selectedPredictedName = name;
      });
      eventCandidatesEl.appendChild(span);
    });
    if (names.length === 0) eventCandidatesEl.innerHTML = '<p class="event-candidates-empty">10K 경쟁 부문 참가자가 아직 없습니다.</p>';
  }

  function loadEventCandidates() {
    if (!eventCandidatesEl) return;
    eventCandidatesEl.innerHTML = '<p class="event-candidates-loading">참가 후보를 불러오는 중…</p>';
    if (!window.firestoreDb) {
      eventCandidatesEl.innerHTML = '<p class="event-candidates-error">Firebase 설정을 확인해 주세요.</p>';
      return;
    }
    firestoreDb.collection('registrations')
      .where('category', '==', '10K-competition')
      .get()
      .then(function (snap) {
        var rows = snap.docs.map(function (d) { return d.data(); });
        renderEventCandidates(rows);
      })
      .catch(function () {
        eventCandidatesEl.innerHTML = '<p class="event-candidates-error">목록을 불러오지 못했습니다.</p>';
      });
  }

  function showEventConfirmDialog(predictedName) {
    if (!eventConfirmLayer || !eventConfirmMessage) return;
    eventConfirmMessage.textContent = predictedName + ' 님이 10K 5등이라고 생각하시나요?';
    eventConfirmLayer.hidden = false;
    eventConfirmLayer.style.display = 'flex';
  }

  function hideEventConfirmDialog() {
    if (eventConfirmLayer) {
      eventConfirmLayer.hidden = true;
      eventConfirmLayer.style.display = 'none';
    }
  }

  function submitEventPrediction() {
    var applicantName = (eventApplicantInput && eventApplicantInput.value) ? eventApplicantInput.value.trim() : '';
    if (!applicantName) {
      alert('본인 이름을 입력해 주세요.');
      if (eventApplicantInput) eventApplicantInput.focus();
      return;
    }
    if (!selectedPredictedName) {
      alert('참가 후보 중 한 명을 선택해 주세요.');
      return;
    }
    showEventConfirmDialog(selectedPredictedName);
  }

  function doSubmitEventPrediction() {
    var applicantName = (eventApplicantInput && eventApplicantInput.value) ? eventApplicantInput.value.trim() : '';
    if (!applicantName || !selectedPredictedName) return;
    hideEventConfirmDialog();

    function onSuccess() {
      closeEventModal();
      alert('응모가 완료되었습니다!');
    }
    function onError(msg) {
      alert(msg || '저장 중 오류가 발생했습니다.');
    }

    if (!window.firestoreDb) {
      onError('Firebase 설정을 확인해 주세요.');
      return;
    }
    firestoreDb.collection('event_predictions').where('applicant_name', '==', applicantName).get()
      .then(function (snap) {
        if (snap && !snap.empty) {
          onError('이미 응모하신 이름입니다. 한 번만 응모 가능합니다.');
          return;
        }
        return firestoreDb.collection('event_predictions').add({
          applicant_name: applicantName,
          predicted_name: selectedPredictedName,
          created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
      })
      .then(function (ref) { if (ref) onSuccess(); })
      .catch(function () { onError('저장 중 오류가 발생했습니다.'); });
  }

  if (openEventBtn) openEventBtn.addEventListener('click', openEventModal);
  if (eventCloseBtn) eventCloseBtn.addEventListener('click', closeEventModal);
  if (eventBackdrop) eventBackdrop.addEventListener('click', closeEventModal);
  if (eventCancelBtn) eventCancelBtn.addEventListener('click', closeEventModal);
  if (eventSubmitBtn) eventSubmitBtn.addEventListener('click', submitEventPrediction);
  if (eventConfirmOk) eventConfirmOk.addEventListener('click', doSubmitEventPrediction);
  if (eventConfirmCancel) eventConfirmCancel.addEventListener('click', hideEventConfirmDialog);
})();
