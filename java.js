document.addEventListener('DOMContentLoaded', () => {
    // 1. Efecto de partículas (configuración minimalista)
    particlesJS('particles-js', {
        particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: false },
            move: { enable: true, speed: 2 }
        }
    });

    // 2. Texto autotipeado (frases más simples)
    const phrases = [
        "Bienvenido al Paraíso Otaku",
        "Tu destino anime favorito",
        "Disfruta de nuestro contenido"
    ];
    let currentPhrase = 0;
    const typingElement = document.getElementById('typing-text');
    
    function typeWriter(text, i = 0) {
        if (i < text.length) {
            typingElement.innerHTML += text.charAt(i);
            setTimeout(() => typeWriter(text, i + 1), 70);
        } else {
            setTimeout(eraseText, 2500);
        }
    }
    
    function eraseText() {
        typingElement.innerHTML = '';
        currentPhrase = (currentPhrase + 1) % phrases.length;
        setTimeout(() => typeWriter(phrases[currentPhrase]), 500);
    }
    
    typeWriter(phrases[0]);
});
