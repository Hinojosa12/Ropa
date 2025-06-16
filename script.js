document.addEventListener('DOMContentLoaded', function() {
    // Variables del carrito
    let cart = [];
    const cartModal = document.querySelector('.cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout');
    const closeCartBtn = document.getElementById('close-cart');
    const customerForm = document.getElementById('customer-form');
    
    // ========== FUNCIONES DEL CARRITO ==========
    
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
            document.querySelector('.customer-data-form').style.display = 'none';
            return;
        } else {
            document.querySelector('.customer-data-form').style.display = 'block';
        }
        
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div>
                    <p>${item.name}</p>
                    <small>${item.description}</small>
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
    
    // ========== FUNCIONALIDAD DE BÚSQUEDA ==========
    
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
    
    // ========== FUNCIONALIDAD DE AÑADIR AL CARRITO ==========
    
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
                    description: description,
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
    
    // ========== EVENTOS DEL CARRITO ==========
    
    document.querySelector('.cart-icon').addEventListener('click', function() {
        cartModal.classList.remove('hidden');
        renderCart();
    });
    
    closeCartBtn.addEventListener('click', function() {
        cartModal.classList.add('hidden');
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.classList.add('hidden');
        }
    });
    
    // ========== FUNCIONALIDAD DE CHECKOUT ==========
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
    
        // Validar formulario
        if (!customerForm.checkValidity()) {
            // Validación manual adicional para mejor feedback
            const name = document.getElementById('customer-name');
            const lastname = document.getElementById('customer-lastname');
            const phone = document.getElementById('customer-phone');
            const address = document.getElementById('customer-address');
            
            // Validar nombres y apellidos (solo letras)
            const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/;
            if (!nameRegex.test(name.value)) {
                alert('El nombre solo puede contener letras y espacios');
                name.focus();
                return;
            }
            
            if (!nameRegex.test(lastname.value)) {
                alert('Los apellidos solo pueden contener letras y espacios');
                lastname.focus();
                return;
            }
            
            // Validar teléfono (solo números)
            const phoneRegex = /^[0-9]+$/;
            if (!phoneRegex.test(phone.value)) {
                alert('El teléfono solo puede contener números');
                phone.focus();
                return;
            }
            
            if (phone.value.length < 8 || phone.value.length > 15) {
                alert('El teléfono debe tener entre 8 y 15 dígitos');
                phone.focus();
                return;
            }
            
            if (address.value.trim() === '') {
                alert('Por favor ingrese una dirección válida');
                address.focus();
                return;
            }
            
            return;
        }
        
// Eventos para validación en tiempo real
document.getElementById('customer-name').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, '');
});

document.getElementById('customer-lastname').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúñÑ ]/g, '');
});

document.getElementById('customer-phone').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '');
});

        // Obtener datos del formulario
        const name = document.getElementById('customer-name').value;
        const lastname = document.getElementById('customer-lastname').value;
        const phone = document.getElementById('customer-phone').value;
        const address = document.getElementById('customer-address').value;
        const notes = document.getElementById('customer-notes').value;
        
        // Crear mensaje para WhatsApp con formato mejorado
        let message = `¡Hola! Quiero hacer un pedido:%0A%0A`;
        message += `=== PRODUCTOS ===%0A`;
        
        // Agregar productos al mensaje
        cart.forEach(item => {
            message += `➤ ${item.name}%0A`;
            message += `   Descripción: ${item.description}%0A`;
            message += `   Precio: $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}%0A%0A`;
        });
        
        // Calcular total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        message += `💵 *Total:* $${total.toFixed(2)}%0A%0A`;
        message += `=== MIS DATOS ===%0A`;
        message += `👤 *Nombre:* ${name} ${lastname}%0A`;
        message += `📱 *Teléfono:* ${phone}%0A`;
        message += `🏠 *Dirección:* ${address}%0A`;
        
        // Agregar notas si existen
        if (notes) {
            message += `📝 *Notas:* ${notes}%0A`;
        }
        
        message += `%0APor favor confirmen mi pedido. ¡Gracias!`;
        
        // Abrir WhatsApp con el número específico y mensaje formateado
        window.open(`https://wa.me/+5358639594?text=${message}`, '_blank');
        
        // Limpiar el carrito después del pedido
        localStorage.removeItem('cart');
        cart = [];
        updateCartCount();
        renderCart();
        cartModal.classList.add('hidden');
        
        // Limpiar el formulario
        customerForm.reset();
    });
    
    // ========== INICIALIZACIÓN ==========
    loadCart();
});
