fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
        const dessertContainer = document.querySelector(".dessert__wrap");

        data.forEach((item) => {
            const dessertStack = document.createElement("div");
            dessertStack.classList.add("dessert__stack");

            function getResponsiveImg() {
                const screenWidth = window.innerWidth;
                if (screenWidth <= 840) {
                    return item.image.mobile;
                } else if (screenWidth <= 1100) {
                    return item.image.tablet;
                } else {
                    return item.image.desktop;
                }
            }

            dessertStack.innerHTML = `
                <div class="dessert__img-btn-wrap">
                    <img id="responsiveImage-${item.name}" src="${getResponsiveImg()}" alt="">
                    <div class="dessert__add-btn-wrap">
                        <button type="button" class="dessert__add-btn">
                            <img src="assets/images/icon-add-to-cart.svg" alt="">
                            Add to Cart
                        </button>
                    </div>
                </div>
                <div class="dessert__info-stack">
                    <p class="dessert__category">${item.category}</p>
                    <p class="dessert__name">${item.name}</p>
                    <p class="dessert__price">$${item.price.toFixed(2)}</p>
                </div>
            `;
            dessertContainer.appendChild(dessertStack);

            function updateImgSource() {
                const imageElement = document.getElementById(`responsiveImage-${item.name}`);
                if (imageElement) {
                    imageElement.src = getResponsiveImg();
                }
            }
            window.addEventListener("resize", updateImgSource);
        });

        const addToCartBtns = document.querySelectorAll(".dessert__add-btn");

        addToCartBtns.forEach((addToCartBtn) => {
            addToCartBtn.addEventListener("click", () => {
                const dessertStack = addToCartBtn.closest(".dessert__stack");

                if (dessertStack && !dessertStack.querySelector(".quantity-wrap")) {
                    const quantityWrap = document.createElement("div");
                    quantityWrap.classList.add("quantity-wrap");
                    quantityWrap.innerHTML = `
                        <button type="button" class="decrement-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path d="M0 .375h10v1.25H0V.375Z"/></svg>
                        </button>
                        <span class="order-quantity">0</span>
                        <button type="button" class="increment-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
                        </button>
                    `;

                    const parentElement = addToCartBtn.parentElement;
                    if (parentElement) {
                        parentElement.innerHTML = '';
                        parentElement.appendChild(quantityWrap);
                        addQuantityListeners(quantityWrap, dessertStack);

                        updateCart(dessertStack, 0);

                        createCart();
                    } else {
                        console.error("addToCartBtn has no parent element.");
                    }
                }
                confirmBtn()
            });
        });

        function addQuantityListeners(quantityContainer, dessertStack) {
            const decrementBtn = quantityContainer.querySelector(".decrement-btn");
            const incrementBtn = quantityContainer.querySelector(".increment-btn");
            const quantitySpan = quantityContainer.querySelector(".order-quantity");

            decrementBtn.addEventListener("click", () => {
                let newQuantity = parseInt(quantitySpan.textContent);
                if (newQuantity > 0) {
                    newQuantity--;
                    quantitySpan.textContent = newQuantity;
                    updateCart(dessertStack, newQuantity);
                    if (newQuantity === 0) {
                        const imgBorder = decrementBtn.closest(".dessert__img-btn-wrap").firstElementChild;
                        imgBorder.style.borderColor = "";
                    }    
                } else {
                    removeFromCart(dessertStack);
                }
            });

            incrementBtn.addEventListener("click", () => {
                let newQuantity = parseInt(quantitySpan.textContent) + 1;
                quantitySpan.textContent = newQuantity;
                updateCart(dessertStack, newQuantity);
                const imgBorder = incrementBtn.closest(".dessert__img-btn-wrap").firstElementChild;
                imgBorder.style.borderColor = "hsl(14, 86%, 42%)";
            });
        }

        function updateCart(dessertStack, quantity) {
            const dessertName = dessertStack.querySelector(".dessert__name").textContent;
            const dessertPrice = parseFloat(dessertStack.querySelector(".dessert__price").textContent.replace("$", ""));
            const dessertImage = dessertStack.querySelector("img").src;
            const orderList = document.querySelector(".cart__order-list");
            const modalOrderList = document.querySelector(".modal__order-list");
        
            if (!orderList) {
                console.error("Order list element not found.");
                return;
            }
        
            // Update regular cart list
            let existingOrder = Array.from(orderList.children).find(order => order.querySelector(".cart__order-name").textContent === dessertName);
        
            if (existingOrder) {
                existingOrder.querySelector(".cart__order-quantity").textContent = `${quantity}x`;
                existingOrder.querySelector(".order-total").textContent =  (quantity * dessertPrice).toFixed(2);
        
                if (quantity === 0) {
                    orderList.removeChild(existingOrder);
                }
            } else if (quantity > 0) {
                const order = document.createElement("li");
                order.classList.add("li-element");
                order.innerHTML = `
                    <div class="cart__order-info-wrap">
                        <p class="cart__order-name">${dessertName}</p>
                        <div class="cart__order-price-stack">
                            <p class="cart__order-quantity">${quantity}x</p>
                            <p class="cart__order-price">@$${dessertPrice.toFixed(2)}<span class="order-total">$${(quantity * dessertPrice).toFixed(2)}</span></p>
                        </div>
                    </div>
                    <button type="button" class="cart__order-remove-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>
                    </button>
                `;
                orderList.appendChild(order);
                addRemoveButtonListener(order.querySelector(".cart__order-remove-btn"));
            }
            updateTotalPrice();
            updateTotalCartQuantity();
        
            // Update modal order list
            if (modalOrderList) {
                let existingModalOrder = Array.from(modalOrderList.children).find(order => order.querySelector(".cart__order-name").textContent === dessertName);
        
                if (existingModalOrder) {
                    existingModalOrder.querySelector(".cart__order-quantity").textContent = `${quantity}x`;
                    existingModalOrder.querySelector(".order-total").textContent = "$" + (quantity * dessertPrice).toFixed(2);
        
                    if (quantity === 0) {
                        modalOrderList.removeChild(existingModalOrder);
                    }
                } else if (quantity > 0) {
                    const modalOrder = document.createElement("li");
                    modalOrder.classList.add("li-element");
                    modalOrder.innerHTML = `
                        <div class="cart__order-info-wrap modal__order-info-wrap">
                            <img class="cart__order-img" src="${dessertImage}" alt="${dessertName}"> <!-- Add dessert image here -->
                            <div class="modal__order-info">
                                <p class="cart__order-name">${dessertName}</p>
                                <div class="modal__order-stack">
                                    <p class="cart__order-quantity">${quantity}x</p>
                                    <p class="cart__order-price">@$${dessertPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <span class="order-total">$${(quantity * dessertPrice).toFixed(2)}</span>
                    `;
                    modalOrderList.appendChild(modalOrder);
                }
            } else {
                console.error("Modal Order list element not found.");
            }
        
            updateTotalPrice();
            updateTotalCartQuantity();
        }
        
        function addRemoveButtonListener(removeBtn) {
            removeBtn.addEventListener("click", () => {
                const removedDessertName = removeBtn.closest(".li-element").querySelector(".cart__order-name").textContent;
        
                document.querySelectorAll(".dessert__stack").forEach(dessertStack => {
                    const dessertName = dessertStack.querySelector(".dessert__name").textContent;
                    if (removedDessertName === dessertName) {
                        const orderQuantityElement = dessertStack.querySelector(".order-quantity");
                        if (orderQuantityElement) {
                            orderQuantityElement.textContent = 0;
                        }
                        const removeImgBorder = dessertStack.querySelector(".dessert__img-btn-wrap img");
                        if (removeImgBorder) {
                            removeImgBorder.style.borderColor = "";
                        }
                    }
                });
        
                // Remove item from regular cart list
                const removedOrder = removeBtn.closest(".li-element");
                if (removedOrder) {
                    removedOrder.remove();
                }
        
                // Remove item from modal order list
                const modalOrderList = document.querySelector(".modal__order-list");
                if (modalOrderList) {
                    const removedModalOrder = Array.from(modalOrderList.children).find(order => order.querySelector(".cart__order-name").textContent === removedDessertName);
                    if (removedModalOrder) {
                        removedModalOrder.remove();
                    }
                }
        
                // Update total price and quantity
                updateTotalPrice();
                updateTotalCartQuantity();
            });
        }
        
        // Function to remove item from both regular and modal order lists
        function removeFromCart(dessertName) {
            const orderList = document.querySelector(".cart__order-list");
            const modalOrderList = document.querySelector(".modal__order-list");
        
            // Remove from regular cart list
            let removedOrder = Array.from(orderList.children).find(order => order.querySelector(".cart__order-name").textContent === dessertName);
            if (removedOrder) {
                orderList.removeChild(removedOrder);
            }
        
            // Remove from modal order list
            if (modalOrderList) {
                let removedModalOrder = Array.from(modalOrderList.children).find(order => order.querySelector(".cart__order-name").textContent === dessertName);
                if (removedModalOrder) {
                    modalOrderList.removeChild(removedModalOrder);
                }
            } else {
                console.error("Modal Order list element not found.");
            }
        
            updateTotalPrice();
            updateTotalCartQuantity();
        }
        

        function updateTotalPrice() {
            const orderList = document.querySelector(".cart__order-list");
            const modalOrderList = document.querySelector(".modal__order-list");
        
            if (!orderList) {
                console.error("Order list element not found.");
                return;
            }
        
            let totalPrice = 0.00;
        
            // Update regular order list total price
            orderList.querySelectorAll(".order-total").forEach(orderTotal => {
                const totalValue = parseFloat(orderTotal.textContent.replace("$", ""));
                if (!isNaN(totalValue)) {
                    totalPrice += totalValue;
                }
            });
        
            const totalPriceElement = document.querySelector(".cart__order-total-price");
            if (totalPriceElement) {
                totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
            } else {
                console.error("Total price element not found for regular order list.");
            }
        
            // Update modal order list total price
            if (modalOrderList) {
                let modalTotalPriceElement = modalOrderList.parentElement.querySelector(".modal__total-price");
                if (modalTotalPriceElement) {
                    modalTotalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
                } else {
                    console.error("Modal total price element not found.");
                }
            } else {
                console.error("Modal order list element not found.");
            }
        
            return totalPrice.toFixed(2);
        }
               
        function createCart() {
            const emptyCart = document.querySelector(".cart__empty-wrap");
            const cartContainer = document.querySelector(".cart__descr-wrap");

            if (emptyCart) {
                const newOrderCart = document.createElement("div");
                newOrderCart.innerHTML = `
                    <ul class="cart__order-list"></ul>
                    <div class="cart__order-total-stack">
                        <p class="cart__order-total-text">Order Total</p>
                        <p class="cart__order-total-price">$0.00</p>
                    </div>
                    <div class="cart__carbon-info">
                        <img src="assets/images/icon-carbon-neutral.svg" alt="">
                        <p class="cart__carbon-descr">This is a <span class="carbon-text">carbon-neutral</span> delivery</p>
                    </div>
                    <button type="button" class="cart__confirm-btn">Confirm Order</button>
                `;
                cartContainer.replaceChild(newOrderCart, emptyCart);
            } else {
                console.error("emptyCart element not found.");
            }
        }

        function updateTotalCartQuantity() {
            const orderList = document.querySelector(".cart__order-list");
            if (!orderList) {
                console.error("Order list element not found.");
                return;
            }

            let totalQuantity = 0;
            orderList.querySelectorAll(".cart__order-quantity").forEach(totalQ => {
                
                totalQuantity += parseFloat(totalQ.textContent);
            });

            const totalQText = document.querySelector(".quantity");
            if (totalQText) {
                totalQText.textContent = `${totalQuantity}`;
                return totalQText.textContent
            } else {
                console.error("Total q element not found.");
            }
        }

        function confirmBtn() {
            const confirmBtn = document.querySelector(".cart__confirm-btn");
            if(!confirmBtn) {
                console.log("Confirm button does not exist yet.")
            } else {
                confirmBtn.addEventListener("click", () => {
                    console.log(updateTotalCartQuantity())
                    if(updateTotalCartQuantity() <= 0) {
                        alert("Your cart is empty.")
                    } else {
                        const modal = document.querySelector("dialog");
                        const closeModalBtn = document.querySelector(".modal__btn");
                        modal.showModal();
                        closeModalBtn.addEventListener("click", () => {
                            window.location.reload();
                        })
                    }
                })
            }
        }
        
        
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
    });