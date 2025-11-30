const fs = require('fs');
const path = require('path');

function getVersion() {
    // Читаем version.js и извлекаем версию
    const versionContent = fs.readFileSync('version.js', 'utf8');
    const versionMatch = versionContent.match(/const\s+APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (versionMatch && versionMatch[1]) {
        return versionMatch[1];
    }
    throw new Error('Не удалось извлечь версию из version.js');
}

function bundleHTML() {
    // Получаем версию
    const version = getVersion();
    console.log(`📦 Версия приложения: ${version}`);
    
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
    
    // Формируем имя файла с версией
    const outputFileName = `dist/math-problems-${version}.html`;
    
    // Сохраняем результат
    fs.writeFileSync(outputFileName, html);
    console.log(`✅ Создан standalone файл: ${outputFileName}`);
}

bundleHTML();

// Для запуска выполнить команду: node bundle.js