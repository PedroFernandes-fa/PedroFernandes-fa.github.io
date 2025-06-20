// ====================================================================================
// RESIZE LOGIC
// ====================================================================================
const canvas = document.getElementById('gameCanvas');
const originalWidth  = 800;
const originalHeight = 600;
const aspectRatio = originalWidth / originalHeight;

function resizeCanvas() {
    const availableHeight = window.innerHeight * 0.95;
    const availableWidth  = window.innerWidth  * 0.95;

    let newWidth, newHeight;

    // Verifica se a janela é mais larga ou mais alta que a proporção do jogo
    if (availableWidth / availableHeight > aspectRatio) {
        // A altura é o fator limitante
        newHeight = availableHeight;
        newWidth  = newHeight * aspectRatio;
    } else {
        // A largura é o fator limitante
        newWidth  = availableWidth;
        newHeight = newWidth / aspectRatio;
    }

    // Aplica o novo tamanho ao estilo do canvas
    canvas.style.width  = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    // Define os atributos width e height do canvas para as novas dimensões
    canvas.width  = newWidth;
    canvas.height = newHeight;
}

// Adiciona os listeners para redimensionar quando a página carregar e quando a janela mudar de tamanho
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);