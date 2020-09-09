if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  var cartRemoveButtons = document.getElementsByClassName("btn-danger");

  for (var i = 0; i < cartRemoveButtons.length; i++) {
    var removeButtons = cartRemoveButtons[i];
    removeButtons.addEventListener("click", removeCartitem);
  }
  var cartQuantityInput = document.getElementsByClassName(
    "cart-quantity-input"
  );
  for (var i = 0; i < cartQuantityInput.length; i++) {
    var input = cartQuantityInput[i];
    input.addEventListener("change", quantityChanged);
  }
  var shoptItemBtn = document.getElementsByClassName("shop-item-button");
  for (var i = 0; i < shoptItemBtn.length; i++) {
    var addBtn = shoptItemBtn[i];
    addBtn.addEventListener("click", addToCartClicked);
  }
  var btnPurchased = document.getElementsByClassName("btn-purchase");
  for (var i = 0; i < btnPurchased.length; i++) {
    var button = btnPurchased[i];
    button.addEventListener("click", buttonPurchaseItemClicked);
  }
}

function removeCartitem(e) {
  var buttonRemove = e.target;
  buttonRemove.parentElement.parentElement.remove();
  updateCartTotal();
}

function updateCartTotal() {
  var cartItems = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItems.getElementsByClassName("cart-row");
  var total = 0;
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var priceElement = cartRow.getElementsByClassName("cart-price")[0];
    var price = parseFloat(priceElement.innerText.replace("$", ""));
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    var quantity = quantityElement.value;
    total = total + price * quantity;
  }
  total = total.toFixed(2);
  document.getElementsByClassName("cart-total-price")[0].innerText =
    "$" + total;
}

function quantityChanged(e) {
  var input = e.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
    return;
  }
  updateCartTotal();
}
function addCartItem(title, price, imgSrc, id) {
  var cartContainers = document.getElementsByClassName("cart-items")[0];
  var cartRowElement = document.createElement("div");
  cartRowElement.classList.add("cart-row");
  cartRowElement.dataset.itemId = id;
  var cartNames = document.getElementsByClassName("cart-item-title");
  for (var i = 0; i < cartNames.length; i++) {
    if (cartNames[i].innerText === title) {
      alert("item is already in cart");
      return;
    }
  }
  var html = ` <div class="cart-item cart-column">
    <img
      class="cart-item-image"
      src="${imgSrc}"
      alt=""
      width="100"
      height="100"
    />
    <span class="cart-item-title">${title}</span>
  </div>
  <span class="cart-price cart-column">${price}</span>
  <div class="cart-quantity cart-column">
    <input class="cart-quantity-input" type="number" value="1" />
    <button class="btn btn-danger">REMOVE</button>
  </div>`;
  cartContainers.append(cartRowElement);
  cartRowElement.innerHTML = html;
  cartRowElement
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartitem);
  cartRowElement
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged);
}

function addToCartClicked(e) {
  var shopItem = e.target.parentElement.parentElement;
  var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  var imgSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
  var id = shopItem.dataset.itemId;
  addCartItem(title, price, imgSrc, id);
  updateCartTotal();
}

var stripeHandler = StripeCheckout.configure({
  key: stripePublicKey,
  locale: "auto",
  token: function (token) {
    var items = [];
    var cartItemContainer = document.getElementsByClassName("cart-items")[0];
    var cartRows = cartItemContainer.getElementsByClassName("cart-row");
    for (var i = 0; i < cartRows.length; i++) {
      var cartRow = cartRows[i];
      var quantityElement = cartRow.getElementsByClassName(
        "cart-quantity-input"
      )[0];
      var quantity = quantityElement.value;
      var id = cartRow.dataset.itemId;
      items.push({
        id: id,
        quantity: quantity,
      });
    }
    fetch("/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        stripeTokenId: token.id,
        items: items,
      }),
    })
      .then((res) => {
        res.json();
      })
      .then((data) => {
        alert(data.message);
        var cartItems = document.getElementsByClassName("cart-items")[0];
        while (cartItems.hasChildNodes()) {
          cartItems.removeChild(cartItems.firstChild);
        }
        updateCartTotal();
      })
      .catch((err) => {
        console.error(err);
      });
  },
});

function buttonPurchaseItemClicked(e) {
  var priceElement = document.getElementsByClassName("cart-total-price")[0];
  var price = parseFloat(priceElement.innerText.replace("$", "")) * 100;
  stripeHandler.open({
    amount: price,
  });
}
