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

      var payload = {
        name: name,
        birthdate: birthdate,
        category: category,
        dinner: dinner,
        message: message
      };

      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/registrations');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        closeModal();
        form.reset();
        if (xhr.status >= 200 && xhr.status < 300) {
          alert('접수가 완료되었습니다!');
        } else {
          alert('접수 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
      };
      xhr.onerror = function () {
        alert('접수 중 오류가 발생했습니다. 서버 연결을 확인해 주세요.');
      };
      xhr.send(JSON.stringify(payload));
    });
  }
})();
