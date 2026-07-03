/* =====================================================
   ОБЖИГ — script.js
   Общий скрипт, подключается на всех страницах сайта.
   Каждый блок проверяет наличие нужных элементов на
   текущей странице (document.getElementById), поэтому
   один и тот же файл безопасно работает и на index.html,
   и на catalog.html, и на order.html.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  initOrderForm();
  initCatalogSearch();
});

/* =====================================================
   1. ОБРАБОТКА ФОРМЫ ЗАКАЗА (order.html)
   ===================================================== */
function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return; // на этой странице формы нет — выходим

  const fields = {
    fname:   document.getElementById('fname'),
    phone:   document.getElementById('phone'),
    email:   document.getElementById('email'),
    address: document.getElementById('address')
  };

  // Регулярные выражения для проверки email и телефона
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Телефон: допускаем +7XXXXXXXXXX или 8XXXXXXXXXX, пробелы/скобки/дефисы игнорируем
  const PHONE_RE = /^(?:\+7|8)\d{10}$/;

  // Живая проверка email и телефона прямо во время ввода
  fields.email.addEventListener('input', () => validateField(fields.email, EMAIL_RE.test(fields.email.value.trim())));
  fields.phone.addEventListener('input', () => {
    const digits = normalizePhone(fields.phone.value);
    validateField(fields.phone, PHONE_RE.test(digits));
  });

  // Общая проверка обязательных текстовых полей во время ввода (чтобы подсветка исчезала сразу после исправления)
  [fields.fname, fields.address].forEach(input => {
    input.addEventListener('input', () => validateField(input, input.value.trim().length > 0));
  });

  // Обработка отправки формы
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // отключаем стандартный переход/перезагрузку страницы

    let isValid = true;

    // Проверка обязательных полей "Имя" и "Адрес"
    isValid = validateField(fields.fname, fields.fname.value.trim().length > 0) && isValid;
    isValid = validateField(fields.address, fields.address.value.trim().length > 0) && isValid;

    // Проверка телефона по маске
    const phoneDigits = normalizePhone(fields.phone.value);
    isValid = validateField(fields.phone, PHONE_RE.test(phoneDigits)) && isValid;

    // Проверка email по регулярному выражению
    isValid = validateField(fields.email, EMAIL_RE.test(fields.email.value.trim())) && isValid;

    if (!isValid) {
      showResultModal(
        'Проверьте форму',
        'Не все поля заполнены верно. Пожалуйста, исправьте отмеченные красным поля и отправьте форму ещё раз.',
        false
      );
      return;
    }

    // Собираем данные формы в объект
    const selectedGlaze = form.querySelector('input[name="glaze"]:checked');
    const orderData = {
      name: fields.fname.value.trim(),
      phone: fields.phone.value.trim(),
      email: fields.email.value.trim(),
      piece: document.getElementById('piece').value,
      qty: document.getElementById('qty').value,
      glaze: selectedGlaze ? selectedGlaze.nextElementSibling.textContent.trim() : null,
      address: fields.address.value.trim(),
      comment: document.getElementById('comment').value.trim()
    };

    // Требование задания: вывод данных формы в консоль разработчика
    console.log('Новый заказ ОБЖИГ:', orderData);

    showResultModal(
      'Заказ отправлен!',
      'Спасибо, ' + orderData.name + '! Ваш заказ принят в обработку — мы свяжемся с вами по телефону ' + orderData.phone + ' в течение рабочего дня.',
      true
    );

    form.reset();
    Object.values(fields).forEach(f => f.classList.remove('is-valid', 'is-invalid'));
  });

  // Убирает из телефона всё, кроме цифр и ведущего плюса
  function normalizePhone(value) {
    return value.trim().replace(/[\s()\-]/g, '');
  }

  // Проставляет Bootstrap-классы is-valid/is-invalid в зависимости от результата проверки
  function validateField(input, condition) {
    input.classList.toggle('is-invalid', !condition);
    input.classList.toggle('is-valid', condition);
    return condition;
  }

  // Показывает Bootstrap Modal с результатом отправки формы
  function showResultModal(title, message, success) {
    const modalEl = document.getElementById('formResultModal');
    document.getElementById('formResultModalLabel').textContent = title;
    document.getElementById('formResultModalBody').textContent = message;
    modalEl.querySelector('.modal-header').classList.toggle('bg-success-subtle', success);
    modalEl.querySelector('.modal-header').classList.toggle('bg-danger-subtle', !success);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

/* =====================================================
   2. ПОИСК ПО КАТАЛОГУ (catalog.html)
   ===================================================== */
function initCatalogSearch() {
  const searchInput = document.getElementById('catalogSearch');
  const tbody = document.getElementById('catalogBody');
  if (!searchInput || !tbody) return; // на этой странице каталога нет — выходим

  const rows = Array.from(tbody.querySelectorAll('tr'));

  // Строка "ничего не найдено", показывается, когда фильтр не даёт совпадений
  const emptyRow = document.createElement('tr');
  emptyRow.id = 'catalogEmptyRow';
  emptyRow.innerHTML = '<td colspan="8" class="text-center text-muted py-4">Ничего не найдено по вашему запросу</td>';
  emptyRow.style.display = 'none';
  tbody.appendChild(emptyRow);

  searchInput.addEventListener('input', filterCatalog);

  function filterCatalog() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matches = query === '' || text.includes(query);
      row.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    // Если совпадений нет — показываем строку-заглушку, иначе прячем
    emptyRow.style.display = visibleCount === 0 ? '' : 'none';
  }
}
