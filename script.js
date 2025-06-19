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
    
    // Variables para el modal de producto
    let selectedSize = 'L';
    let selectedColor = 'Negro';
    let currentProduct = null;
    
    // ========== FUNCIONES DEL CARRITO ==========
    
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartCount();
        }
    }
    
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }
    
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = count;
    }
    
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
            
            // Mostrar detalles adicionales si existen (talla, color)
            let detailsHtml = '';
            if (item.size || item.color) {
                detailsHtml = '<div class="product-details">';
                if (item.size) detailsHtml += `<small>Talla: ${item.size}</small>`;
                if (item.color) detailsHtml += `<small>Color: ${item.color}</small>`;
                detailsHtml += '</div>';
            }
            
            itemElement.innerHTML = `
                <div>
                    <p>${item.name}</p>
                    <small>${item.description}</small>
                    ${detailsHtml}
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
    
    // ========== MODAL DE SELECCIÓN DE PRODUCTO ==========
    
    // Mostrar modal de producto
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('add-to-cart')) {
            e.preventDefault();
            const product = e.target.closest('.product');
            currentProduct = {
                id: product.getAttribute('data-id'),
                name: product.querySelector('.product-title').textContent,
                price: parseFloat(product.querySelector('.product-price').textContent.replace('$', '')),
                description: product.querySelector('.product-description').textContent,
                image: product.querySelector('.product-img').src
            };
            
            openProductModal(currentProduct);
        }
    });
    
    function openProductModal(product) {
        // Llenar el modal con la información del producto
        document.getElementById('modal-product-title').textContent = product.name;
        document.getElementById('modal-product-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('modal-product-description').textContent = product.description;
        document.getElementById('modal-product-image').src = product.image;
        
        // Resetear selecciones
        selectedSize = 'L';
        selectedColor = 'Negro';
        
        // Resetear UI
        document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector('.size-option[data-size="L"]').classList.add('selected');
        
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector('.color-option[data-color="Negro"]').classList.add('selected');
        
        // Mostrar el modal
        document.getElementById('product-modal').style.display = 'block';
    }
    
    // Cerrar modal
    document.querySelector('.close-modal').addEventListener('click', closeProductModal);
    document.querySelector('.cancel-modal').addEventListener('click', closeProductModal);
    
    function closeProductModal() {
        document.getElementById('product-modal').style.display = 'none';
    }
    
    // Selección de talla
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedSize = this.getAttribute('data-size');
        });
    });
    
    // Selección de color
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remover selección previa
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('selected');
                opt.style.border = '2px solid #ccc'; // Borde gris para no seleccionados
                opt.style.boxShadow = 'none';
            });
            
            // Aplicar nuevo estilo al seleccionado
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
            
            // Estilo especial para colores difíciles
            if (selectedColor === 'Negro') {
                this.style.border = '2px solid #fff'; // Borde blanco
                this.style.boxShadow = '0 0 0 2px #333'; // Sombra exterior oscura
            } else if (selectedColor === 'Blanco') {
                this.style.border = '2px solid #333'; // Borde negro
                this.style.boxShadow = '0 0 0 2px #ccc'; // Sombra exterior clara
            } else {
                // Para otros colores
                this.style.border = '2px solid #333'; // Borde oscuro
                this.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';
            }
        });
    });
    
    // Añadir al carrito desde el modal
    document.querySelector('.add-to-cart-modal').addEventListener('click', function() {
        if (!currentProduct) return;
        
        // Crear objeto con las opciones seleccionadas
        const productToAdd = {
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            description: currentProduct.description,
            quantity: 1,
            size: selectedSize,
            color: selectedColor
        };
        
        // Verificar si ya existe un producto igual en el carrito
        const existingItemIndex = cart.findIndex(item => 
            item.id === productToAdd.id &&
            item.size === productToAdd.size &&
            item.color === productToAdd.color
        );
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push(productToAdd);
        }
        
        saveCart();
        closeProductModal();
        
        // Feedback visual
        const addToCartButtons = document.querySelectorAll(`.product[data-id="${currentProduct.id}"] .add-to-cart`);
        addToCartButtons.forEach(button => {
            button.classList.add('added');
            button.textContent = 'Añadido';
            
            setTimeout(() => {
                button.classList.remove('added');
                button.textContent = 'Añadir al carrito';
            }, 1500);
        });
    });
    
    // ========== EVENTOS DEL CARRITO ==========
    
    document.querySelector('.cart-icon').addEventListener('click', function() {
        cartModal.classList.remove('hidden');
        renderCart();
        document.querySelector('.cart-content').scrollTo(0, 0);
    });
    
    closeCartBtn.addEventListener('click', function() {
        cartModal.classList.add('hidden');
    });
    
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
    
        if (!customerForm.checkValidity()) {
            const name = document.getElementById('customer-name');
            const lastname = document.getElementById('customer-lastname');
            const phone = document.getElementById('customer-phone');
            const address = document.getElementById('customer-address');
            
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
        
        // Validación en tiempo real
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
        
        // Crear mensaje para WhatsApp con todos los detalles
        let message = `¡Hola! Quiero hacer un pedido:%0A%0A`;
        message += `=== PRODUCTOS ===%0A`;
        
        cart.forEach(item => {
            message += `➤ ${item.name}%0A`;
            message += `   Descripción: ${item.description}%0A`;
            
            // Agregar detalles específicos si existen
            if (item.size) message += `   Talla: ${item.size}%0A`;
            if (item.color) message += `   Color: ${item.color}%0A`;
            
            message += `   Precio: $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}%0A%0A`;
        });
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        message += `💵 *Total:* $${total.toFixed(2)}%0A%0A`;
        message += `=== MIS DATOS ===%0A`;
        message += `👤 *Nombre:* ${name} ${lastname}%0A`;
        message += `📱 *Teléfono:* ${phone}%0A`;
        message += `🏠 *Dirección:* ${address}%0A`;
        
        if (notes) {
            message += `📝 *Notas:* ${notes}%0A`;
        }
        
        message += `%0APor favor confirmen mi pedido. ¡Gracias!`;
        
        window.open(`https://wa.me/+5358639594?text=${message}`, '_blank');
        
        // Limpiar después del pedido
        localStorage.removeItem('cart');
        cart = [];
        updateCartCount();
        renderCart();
        cartModal.classList.add('hidden');
        customerForm.reset();
    });
    
    // ========== INICIALIZACIÓN ==========
    loadCart();
});
