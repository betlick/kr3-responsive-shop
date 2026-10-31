// Одна логика обслуживает форму на странице и форму внутри dialog.
const orderDialog = document.getElementById("order-dialog");
const orderForm = document.getElementById("order-form");
const selectedProduct = document.getElementById("selected-product");
const successMessage = document.getElementById("success-message");

function clearErrors() {
  orderForm?.querySelectorAll("[aria-invalid]").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

// data-атрибут отделяет поведение от классов, отвечающих за оформление.
if (orderDialog && orderForm && selectedProduct) {
  document.querySelectorAll("[data-order-product]").forEach((button) => {
    button.addEventListener("click", () => {
      orderForm.reset();
      clearErrors();
      selectedProduct.value = button.dataset.orderProduct;
      successMessage.hidden = true;
      orderDialog.showModal();
    });
  });
  document
    .getElementById("close-order-dialog")
    ?.addEventListener("click", () => {
      orderDialog.close();
    });
}

if (orderForm && selectedProduct && successMessage) {
  // На отдельную страницу можно прийти со ссылкой order.html?product=keyboard.
  const productCode = new URLSearchParams(window.location.search).get(
    "product",
  );
  if (
    productCode &&
    Array.from(selectedProduct.options).some(
      (option) => option.value === productCode,
    )
  ) {
    selectedProduct.value = productCode;
  }

  orderForm.addEventListener("reset", () => {
    clearErrors();
    successMessage.hidden = true;
  });

  // При отключённом JS работают встроенные required, type и pattern.
  // С JS добавляем к ним подсветку и сообщение без перезагрузки страницы.
  orderForm.noValidate = true;
  orderForm.addEventListener("input", (event) => {
    const field = event.target;
    if (field.willValidate && field.validity.valid) {
      field.removeAttribute("aria-invalid");
    }
    successMessage.hidden = true;
  });
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();
    if (!orderForm.checkValidity()) {
      Array.from(orderForm.elements).forEach((field) => {
        if (field.willValidate && !field.validity.valid) {
          field.setAttribute("aria-invalid", "true");
        }
      });
      orderForm.reportValidity();
      return;
    }

    const productName = selectedProduct.selectedOptions[0].textContent;
    orderForm.reset();
    orderDialog?.close();
    // Учебная демонстрация: сервер не подключён, данные никуда не отправляются.
    successMessage.textContent = `Заявка на «${productName}» заполнена корректно.`;
    successMessage.hidden = false;
    successMessage.focus();
  });
}

// GIF можно остановить; при reduced-motion картинка сразу неподвижная.
const recordToggle = document.querySelector(".record-art__toggle");
const recordImage = document.querySelector(".record-art__disc");
if (recordToggle && recordImage) {
  recordToggle.addEventListener("click", () => {
    const paused = recordToggle.getAttribute("aria-pressed") !== "true";
    recordImage.src = paused
      ? "images/vinyl-still.png"
      : "images/vinyl-spin.gif";
    recordToggle.setAttribute("aria-pressed", String(paused));
    recordToggle.textContent = paused
      ? "Включить вращение"
      : "Остановить вращение";
  });
}

// На странице одновременно играет только один встроенный YouTube-плеер.
const beatFrames = Array.from(document.querySelectorAll(".beat-player"));
if (beatFrames.length > 1) {
  const beatPlayers = [];

  beatFrames.forEach((frame) => {
    const url = new URL(frame.src);
    url.searchParams.set("enablejsapi", "1");
    if (window.location.origin !== "null") {
      url.searchParams.set("origin", window.location.origin);
    }
    frame.src = url.toString();
  });

  window.onYouTubeIframeAPIReady = () => {
    beatFrames.forEach((frame) => {
      const player = new YT.Player(frame, {
        events: {
          onStateChange(event) {
            if (event.data !== YT.PlayerState.PLAYING) return;
            beatPlayers.forEach((other) => {
              if (
                other !== event.target &&
                other.getPlayerState() === YT.PlayerState.PLAYING
              ) {
                other.pauseVideo();
              }
            });
          },
        },
      });
      beatPlayers.push(player);
    });
  };

  const youtubeApi = document.createElement("script");
  youtubeApi.src = "https://www.youtube.com/iframe_api";
  document.head.append(youtubeApi);
}
