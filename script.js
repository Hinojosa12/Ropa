document.addEventListener('DOMContentLoaded', function() {
    // Variables del carrito
    let cart = [];
    const cartModal = document.querySelector('.cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout');
    const closeCartBtn = document.getElementById('close-cart');
    
    // Cargar carrito desde localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    }
    
    // Guardar carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
    
    // Actualizar contador del carrito
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
    }
    
    // Renderizar el carrito
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío</p>';
            totalElement.textContent = '0.00';
            return;
        }
        
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div>
                    <p>${item.name} (${item.design})</p>
                    <small>Cantidad: ${item.quantity} | $${item.price.toFixed(2)} c/u</small>
                </div>
                <div>
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                    <button class="remove-item" data-index="${index}">🗑️ Eliminar</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price * item.quantity;
        });
        
        totalElement.textContent = total.toFixed(2);
        
        // Eventos para botones de eliminar
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.splice(index, 1);
                saveCart();
                renderCart();
            });
        });
    }
    
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('real-time-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            const products = document.querySelectorAll('.product');
            let hasResults = false;
            
            products.forEach(product => {
                const img = product.querySelector('img');
                const title = product.querySelector('.product-title').textContent.toLowerCase();
                const altText = img.getAttribute('alt').toLowerCase();
                
                if (altText.includes(searchTerm) || title.includes(searchTerm)) {
                    product.style.display = 'flex';
                    hasResults = true;
                } else {
                    product.style.display = 'none';
                }
            });
            
            // Mostrar mensaje si no hay resultados
            const noResults = document.querySelector('.no-results');
            if (!hasResults && !noResults) {
                const message = document.createElement('div');
                message.className = 'no-results';
                message.textContent = 'No se encontraron productos';
                document.getElementById('products-container').appendChild(message);
            } else if (hasResults && noResults) {
                noResults.remove();
            }
        });
    }
    
    // Añadir al carrito
   // Modifica la parte del evento click para añadir al carrito
   document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('add-to-cart')) {
        const product = e.target.closest('.product');
        const id = product.getAttribute('data-id');
        const name = product.querySelector('.product-title').textContent;
        const price = parseFloat(product.querySelector('.product-price').textContent.replace('$', ''));
        const description = product.querySelector('.product-description').textContent;
        
        // Verificar si ya existe en el carrito
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                description: description, // Añadimos la descripción
                quantity: 1
            });
        }
        
        saveCart();
        
        // Feedback visual
        const button = e.target;
        button.classList.add('added');
        button.textContent = 'Añadido';
        
        setTimeout(() => {
            button.classList.remove('added');
            button.textContent = 'Añadir al carrito';
        }, 1500);
    }
});
    
    // Eventos del carrito
    document.querySelector('.cart-icon').addEventListener('click', function() {
        cartModal.classList.remove('hidden');
        renderCart();
    });
    
    closeCartBtn.addEventListener('click', function() {
        cartModal.classList.add('hidden');
    });
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        let message = '¡Hola! Quiero hacer este pedido:%0A%0A';
        let total = 0;
        
        cart.forEach(item => {
            message += `- ${item.name} (${item.design}) x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}%0A`;
            total += item.price * item.quantity;
        });
        
        message += `%0ATotal: $${total.toFixed(2)}`;
        
        window.open(`https://wa.me/+5358639594?text=${message}`, '_blank');
    });
    
    // Inicializar
    loadCart();
});

