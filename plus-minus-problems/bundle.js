const fs = require('fs');
const path = require('path');

function bundleHTML() {
    // Читаем основной HTML файл
    let html = fs.readFileSync('index.html', 'utf8');
    
    // Находим и заменяем CSS файлы
    html = html.replace(/<link[^>]+href="([^"]+\.css)"[^>]*>/g, (match, cssPath) => {
        const cssContent = fs.readFileSync(cssPath, 'utf8');
        return `<style>${cssContent}</style>`;
    });
    
    // Находим и заменяем JS файлы
    html = html.replace(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/g, (match, jsPath) => {
        const jsContent = fs.readFileSync(jsPath, 'utf8');
        return `<script>${jsContent}</script>`;
    });
    
    // Сохраняем результат
    fs.writeFileSync('dist/index-standalone.html', html);
    console.log('✅ Создан standalone файл: dist/index-standalone.html');
}

bundleHTML();