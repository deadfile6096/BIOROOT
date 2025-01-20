document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {


        // Удаляем активный класс у всех кнопок и вкладок
        document
            .querySelectorAll(".tab-button")
            .forEach((btn) => btn.classList.remove("active"));
        document
            .querySelectorAll(".tab-content")
            .forEach((tab) => tab.classList.remove("active"));

        // Добавляем активный класс к текущей кнопке и вкладке
        button.classList.add("active");
        document.getElementById(button.dataset.tab).classList.add("active");
    });
});

const table = document.getElementById('table-info');
const totalCount = document.getElementById('total');

var organismTotal = 222;

const tableRec = () => {

    const record = document.createElement('div');
    record.className = 'table-organism-record';

    organismTotal++;

    totalCount.innerText = `Total organizm: ${organismTotal}`;

    const randomSec = Math.floor(Math.random() * 11);
    record.innerHTML = `
    <p>${organismTotal}</p>
    <p>${randomSec}s ago</p>
    `;

    table.prepend(record);
}

const targetDate = new Date('2025-01-18T01:35:00');

function updateTimer() {
    const now = new Date();
    const diff = targetDate - now; // Разница в миллисекундах

    if (diff <= 0) {
        document.getElementById('timer').textContent = "End";
        clearInterval(timerInterval); // Остановить таймер
        return;
    }

    // Вычисляем дни, часы, минуты и секунды
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Обновляем текст кнопки
    document.getElementById('timer').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Запускаем обновление каждую секунду
const timerInterval = setInterval(updateTimer, 1000);

// Вызываем сразу, чтобы не ждать 1 секунду
updateTimer();

setInterval(() => {
    tableRec();
}, Math.floor(Math.random() * 12000))