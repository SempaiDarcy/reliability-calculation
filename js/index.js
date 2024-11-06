function openTab(event, tabId) {
    document.querySelectorAll('.tab-content').forEach(tabContent => {
        tabContent.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    if (event) {
        event.currentTarget.classList.add('active');
    }

    // Автоматическое заполнение полей для вкладок
    if (tabId === 'qualitative') {
        setQualitativeExampleData();
    }
    if (tabId === 'reliability') {
        setReliabilityExampleData();
    }
    if (tabId === 'corcoran') {
        setCorcoranExampleData();
    }
    if (tabId === 'schumann') {
        setSchumannExampleData();
    }
    if (tabId === 'economic') {
        setEconomicExampleData();
    }
}

// Устанавливаем активную вкладку и заполняем значения при загрузке страницы
window.onload = function() {
    openTab(null, 'qualitative'); // Открываем первую вкладку
};

// Функция для установки данных по умолчанию для вкладки "Оценка надёжности ПО"
function setReliabilityExampleData() {
    document.getElementById("lambda").value = 0.02;
    document.getElementById("time").value = 50;
    document.getElementById("mttf").value = '';  // оставляем пустым, чтобы рассчитать автоматически
    document.getElementById("mttr").value = 5;
}

// Функция для установки данных по умолчанию для вкладки "Метрика качественных показателей"
function setQualitativeExampleData() {
    document.getElementById("metrics").value = "0.8, 0.9, 0.85, 0.7, 0.95";
    document.getElementById("weights").value = "0.2, 0.3, 0.25, 0.15, 0.1";
}

function setCorcoranExampleData() {
    document.getElementById("N").value = 100;
    document.getElementById("N0").value = 70;
    document.getElementById("Y").value = "0.1, 0.05, 0.02, 0.03, 0.04";
}

// Функции расчёта метрики качества
function calculateQualitative() {
    const metrics = document.getElementById("metrics").value.split(',').map(Number);
    const weights = document.getElementById("weights").value.split(',').map(Number);

    if (metrics.length !== weights.length) {
        document.getElementById("resultQualitative").innerText = "Ошибка: количество показателей и весов должно совпадать.";
        return;
    }

    const weightSum = weights.reduce((acc, val) => acc + val, 0);
    if (Math.abs(weightSum - 1) > 0.01) {
        document.getElementById("resultQualitative").innerText = "Ошибка: сумма весов должна быть равна 1.";
        return;
    }

    const qualityMetric = metrics.reduce((acc, val, i) => acc + (val * weights[i]), 0);
    document.getElementById("resultQualitative").innerText = `Метрика качества: ${qualityMetric.toFixed(4)}`;
}

// Функции расчёта надёжности
function calculateReliability() {
    const lambda = parseFloat(document.getElementById("lambda").value);
    const time = parseFloat(document.getElementById("time").value);
    let MTTF = parseFloat(document.getElementById("mttf").value);
    const MTTR = parseFloat(document.getElementById("mttr").value);

    if (!lambda || !time) {
        document.getElementById("resultReliability").innerText = "Введите значения для интенсивности отказов и времени работы.";
        return;
    }

    if (!MTTF && lambda > 0) {
        MTTF = 1 / lambda;
    }

    const P = Math.exp(-lambda * time);
    const Q = 1 - P;

    let availability = null;
    if (MTTF && MTTR) {
        availability = MTTF / (MTTF + MTTR);
    }

    let resultText = `Вероятность безотказной работы: ${(P * 100).toFixed(2)}%\n`;
    resultText += `Вероятность отказа: ${(Q * 100).toFixed(2)}%\n`;
    resultText += `Средняя наработка до отказа (MTTF): ${MTTF.toFixed(2)}\n`;
    resultText += MTTR ? `Среднее время восстановления (MTTR): ${MTTR}\n` : "MTTR не задано.\n";
    resultText += availability !== null ? `Коэффициент готовности: ${(availability * 100).toFixed(2)}%` : "Коэффициент готовности: данные отсутствуют";

    document.getElementById("resultReliability").innerText = resultText;
}

function calculateCorcoran() {
    const N = parseFloat(document.getElementById("N").value);
    const N0 = parseFloat(document.getElementById("N0").value);
    const Y_values = document.getElementById("Y").value.split(',').map(Number);

    // Проверка на корректность введённых значений
    if (isNaN(N) || isNaN(N0) || N <= 0 || N0 < 0 || N0 > N) {
        document.getElementById("resultCorcoran").innerText = "Ошибка: Проверьте введённые значения для N и N0.";
        return;
    }

    // Проверка корректности значений вероятности ошибок
    for (const y of Y_values) {
        if (isNaN(y) || y < 0 || y > 1) {
            document.getElementById("resultCorcoran").innerText = "Ошибка: Все значения вероятностей ошибок должны быть от 0 до 1.";
            return;
        }
    }

    // Расчёт надёжности по модели Коркорэна
    const Y_sum = Y_values.reduce((acc, y) => acc + y, 0);
    const R_corcoran = (N0 / N) + Y_sum;

    // Вывод результатов
    document.getElementById("resultCorcoran").innerText = `Надёжность по модели Коркорэна: ${R_corcoran.toFixed(4)}`;
}
function setSchumannExampleData() {
    document.getElementById("Et").value = 50;
    document.getElementById("It").value = 10000;
    document.getElementById("Ec").value = 5;
}
function calculateSchumann() {
    const Et = parseFloat(document.getElementById("Et").value);
    const It = parseFloat(document.getElementById("It").value);
    const Ec = parseFloat(document.getElementById("Ec").value);
    const C = 1;  // Константа для модели Шумана

    // Проверка на корректность введённых значений
    if (isNaN(Et) || isNaN(It) || isNaN(Ec) || Et < 0 || It <= 0 || Ec < 0) {
        document.getElementById("resultSchumann").innerText = "Ошибка: Проверьте введённые значения для Et, It и Ec.";
        return;
    }

    // Расчёт надёжности по модели Шумана
    const R_schumann = Math.exp(-C * (Et * Ec) / It);

    // Вывод результатов
    document.getElementById("resultSchumann").innerText = `Вероятность безотказной работы по модели Шумана: ${(R_schumann * 100).toFixed(2)}%`;
}
function setEconomicExampleData() {
    document.getElementById("T0").value = 2000;
    document.getElementById("T1").value = 1500;
}
function calculateEconomic() {
    const T0 = parseFloat(document.getElementById("T0").value);
    const T1 = parseFloat(document.getElementById("T1").value);

    // Проверка на корректность введённых значений
    if (isNaN(T0) || isNaN(T1) || T0 <= 0) {
        document.getElementById("resultEconomic").innerText = "Ошибка: Проверьте введённые значения для T0 и T1.";
        return;
    }

    // Расчёт технико-экономических показателей
    const T_A = T0 - T1;
    const K_T = (T_A / T0) * 100;

    // Вывод результатов
    document.getElementById("resultEconomic").innerText =
        `Абсолютное снижение трудозатрат: ${T_A.toFixed(2)}\nКоэффициент относительного снижения: ${K_T.toFixed(2)}%`;
}








// // Переключение вкладок
// function openTab(event, tabId) {
//     document.querySelectorAll('.tab-content').forEach(tabContent => {
//         tabContent.classList.remove('active');
//     });
//     document.querySelectorAll('.tab').forEach(tab => {
//         tab.classList.remove('active');
//     });
//     document.getElementById(tabId).classList.add('active');
//     event.currentTarget.classList.add('active');
// }
//
// window.onload = function() {
//     document.querySelector('.tab').classList.add('active'); // Первая вкладка в списке
//     openTab(null, 'qualitative'); // Открываем содержимое первой вкладки
// };
//
// function calculateReliability() {
//     const lambda = parseFloat(document.getElementById("lambda").value);
//     const time = parseFloat(document.getElementById("time").value);
//     let MTTF = parseFloat(document.getElementById("mttf").value);
//     const MTTR = parseFloat(document.getElementById("mttr").value);
//
//     if (!lambda || !time) {
//         document.getElementById("resultReliability").innerText = "Введите значения для интенсивности отказов и времени работы.";
//         return;
//     }
//
//     // Рассчитываем MTTF, если оно не задано
//     if (!MTTF && lambda > 0) {
//         MTTF = 1 / lambda;
//     }
//
//     // Вероятность безотказной работы P(t)
//     const P = Math.exp(-lambda * time);
//
//     // Вероятность отказа Q(t)
//     const Q = 1 - P;
//
//     // Коэффициент готовности (если известны MTTF и MTTR)
//     let availability = null;
//     if (MTTF && MTTR) {
//         availability = MTTF / (MTTF + MTTR);
//     }
//
//     // Формируем вывод результатов
//     let resultText = `Вероятность безотказной работы: ${(P * 100).toFixed(2)}%\n`;
//     resultText += `Вероятность отказа: ${(Q * 100).toFixed(2)}%\n`;
//     resultText += `Средняя наработка до отказа (MTTF): ${MTTF.toFixed(2)}\n`;
//     resultText += MTTR ? `Среднее время восстановления (MTTR): ${MTTR}\n` : "MTTR не задано.\n";
//     resultText += availability !== null ? `Коэффициент готовности: ${(availability * 100).toFixed(2)}%` : "Коэффициент готовности: данные отсутствуют";
//
//     document.getElementById("resultReliability").innerText = resultText;
// }
