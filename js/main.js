// Одна логика обслуживает форму на странице и форму внутри dialog.
const orderDialog = document.getElementById('order-dialog');
const orderForm = document.getElementById('order-form');
const selectedProduct = document.getElementById('selected-product');
const successMessage = document.getElementById('success-message');

function clearErrors() {
  orderForm?.querySelectorAll('[aria-invalid]').forEach((field) => {
    field.removeAttribute('aria-invalid');
  });
}

// data-атрибут отделяет поведение от классов, отвечающих за оформление.
if (orderDialog && orderForm && selectedProduct) {
  document.querySelectorAll('[data-order-product]').forEach((button) => {
    button.addEventListener('click', () => {
      orderForm.reset();
      clearErrors();
      selectedProduct.value = button.dataset.orderProduct;
      successMessage.hidden = true;
      orderDialog.showModal();
    });
  });
  document.getElementById('close-order-dialog')?.addEventListener('click', () => {
    orderDialog.close();
  });
}

if (orderForm && selectedProduct && successMessage) {
  // На отдельную страницу можно прийти со ссылкой order.html?product=keyboard.
  const productCode = new URLSearchParams(window.location.search).get('product');
  if (productCode && Array.from(selectedProduct.options).some((option) => option.value === productCode)) {
    selectedProduct.value = productCode;
  }

  // При отключённом JS работают встроенные required, type и pattern.
  // С JS добавляем к ним подсветку и сообщение без перезагрузки страницы.
  orderForm.noValidate = true;
  orderForm.addEventListener('input', (event) => {
    const field = event.target;
    if (field.willValidate && field.validity.valid) {
      field.removeAttribute('aria-invalid');
    }
    successMessage.hidden = true;
  });
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    if (!orderForm.checkValidity()) {
      Array.from(orderForm.elements).forEach((field) => {
        if (field.willValidate && !field.validity.valid) {
          field.setAttribute('aria-invalid', 'true');
        }
      });
      orderForm.reportValidity();
      return;
    }

    const productName = selectedProduct.selectedOptions[0].textContent;
    orderForm.reset();
    orderDialog?.close();
    // Учебная демонстрация: сервер не подключён, данные никуда не отправляются.
    successMessage.textContent = `Заявка на «${productName}» заполнена корректно. Это учебная демонстрация: данные не отправлены.`;
    successMessage.hidden = false;
    successMessage.focus();
  });
}
