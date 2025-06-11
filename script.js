document.addEventListener('DOMContentLoaded', () => {
    let cart = []; // Cambiado de const a let
    const cartModal = document.querySelector('.cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalElement = document.getElementById('total');

    // Función para cargar el carrito desde localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) cart = JSON.parse(savedCart);
        cartCount.textContent = cart.length;
    }

    // Función para guardar el carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Función para renderizar el carrito
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <p>${item.name} (${item.design}) - $${item.price.toFixed(2)}</p>
                <button class="remove-item" data-index="${index}">🗑️ Eliminar</button>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price;
        });

        totalElement.textContent = total.toFixed(2);

        // Añadir event listeners a los botones de eliminar
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                cart.splice(index, 1);
                cartCount.textContent = cart.length;
                saveCart();
                renderCart();
            });
        });
    }

    // Cargar el carrito al inicio
    loadCart();

    // Abrir/cerrar carrito
    document.querySelector('.cart-icon').addEventListener('click', () => {
        cartModal.classList.remove('hidden');
        renderCart();
    });

    document.getElementById('close-cart').addEventListener('click', () => {
        cartModal.classList.add('hidden');
    });

    // Añadir productos al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const product = e.target.closest('.product');
            const productId = product.getAttribute('data-id');
            const productName = product.querySelector('h3').textContent;
            const productPrice = parseFloat(product.querySelector('p').textContent.replace('$', ''));
            const design = product.querySelector('.design').value;

            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                design: design
            });

            cartCount.textContent = cart.length;
            saveCart();
        });
    });

    // Enviar pedido a WhatsApp
    document.getElementById('checkout').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('¡El carrito está vacío!');
            return;
        }

        let message = '¡Hola! Quiero hacer este pedido:%0A%0A';
        let total = 0;

        cart.forEach(item => {
            message += `- ${item.name} (${item.design}): $${item.price.toFixed(2)}%0A`;
            total += item.price;
        });

        message += `%0ATotal: $${total.toFixed(2)}`;

        window.open(`https://wa.me/+5358639594?text=${message}`, '_blank');
    });
});
