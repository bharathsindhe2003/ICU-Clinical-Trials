
export  function showToast(message) {
    Toastify({
      text: message,
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top",
      position: "center",
      style: {
        background:"#2F89B3",
      },
      closeIcon: '<i class="material-icons" style="margin-left: auto;">close</i>',
    }).showToast();
    }

    