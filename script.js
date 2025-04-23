// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();

// Инициализация TON Connect
const tonConnect = new TonConnect({
    manifestUrl: 'https://your-app-url/tonconnect-manifest.json' // Замените на ваш URL
});

// Начальные значения
let score = 0;
let energy = 100;
const maxEnergy = 100;
let energyCostPerTap = 10;
let tapMultiplier = 1;
let energyRecoveryRate = 1; // Базовая скорость восстановления энергии (1 ед./сек)

// Элементы DOM
const scoreElement = document.getElementById('score');
const scoreBoostersElement = document.getElementById('score-boosters');
const scoreFriendsElement = document.getElementById('score-friends');
const energyFillElement = document.getElementById('energy-fill');
const spiritElement = document.getElementById('spirit');
const friendsContainer = document.getElementById('friends-container');

// Функция обновления UI
function updateUI() {
    scoreElement.textContent = score;
    scoreBoostersElement.textContent = score;
    scoreFriendsElement.textContent = score;
    energyFillElement.style.width = `${(energy / maxEnergy) * 100}%`;
}

// Переключение экранов
function showScreen(screenId) {
    document.querySelectorAll('.container').forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'flex';
}

// Обработчик тапа
spiritElement.addEventListener('click', () => {
    if (energy >= energyCostPerTap) {
        score += tapMultiplier; // Учитываем множитель от бустера
        energy -= energyCostPerTap;
        updateUI();

        // Эффект анимации при тапе
        spiritElement.style.transform = 'scale(1.1)';
        spiritElement.style.filter = 'drop-shadow(0 0 15px rgba(244, 228, 188, 1))';
        setTimeout(() => {
            spiritElement.style.transform = 'scale(1)';
            spiritElement.style.filter = 'drop-shadow(0 0 10px rgba(244, 228, 188, 0.5))';
        }, 100);

        // Показ очков над элементом
        const points = document.createElement('div');
        points.textContent = `+${tapMultiplier}`;
        points.className = 'points-animation';
        points.style.left = `${spiritElement.offsetLeft + 60}px`;
        points.style.top = `${spiritElement.offsetTop - 20}px`;
        document.body.appendChild(points);

        setTimeout(() => {
            points.style.opacity = '0';
            points.style.top = `${spiritElement.offsetTop - 50}px`;
            setTimeout(() => points.remove(), 1000);
        }, 100);

        // Искорки
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'points-animation';
            sparkle.style.width = '5px';
            sparkle.style.height = '5px';
            sparkle.style.background = i % 2 === 0 ? '#F4E4BC' : '#8BA888';
            sparkle.style.borderRadius = '50%';
            sparkle.style.left = `${spiritElement.offsetLeft + 60 + (Math.random() * 40 - 20)}px`;
            sparkle.style.top = `${spiritElement.offsetTop + 60 + (Math.random() * 40 - 20)}px`;
            document.body.appendChild(sparkle);

            setTimeout(() => {
                sparkle.style.opacity = '0';
                sparkle.style.transform = `translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px)`;
                setTimeout(() => sparkle.remove(), 1000);
            }, 100);
        }
    } else {
        tg.showAlert('Недостаточно энергии! Подождите, пока она восстановится.');
    }
});

// Восстановление энергии
setInterval(() => {
    if (energy < maxEnergy) {
        energy = Math.min(maxEnergy, energy + energyRecoveryRate);
        updateUI();
    }
}, 1000);

// Покупка бустеров
function buyBooster(type) {
    const tapBoosterCost = 100;
    const energyBoosterCost = 50;

    if (type === 'tap' && score >= tapBoosterCost) {
        score -= tapBoosterCost;
        tapMultiplier = 2; // Увеличиваем множитель тапа
        tg.showAlert('Благословение Леса активировано! Теперь вы получаете x2 очков за тап.');
    } else if (type === 'energy' && score >= energyBoosterCost) {
        score -= energyBoosterCost;
        energyRecoveryRate = 2; // Увеличиваем скорость восстановления энергии
        tg.showAlert('Солнечный Чай активирован! Энергия восстанавливается быстрее.');
    } else {
        tg.showAlert('Недостаточно очков для покупки бустера!');
    }
    updateUI();
}

// Подключение TON кошелька
async function connectWallet() {
    try {
        const wallets = await tonConnect.getWallets();
        const tonkeeper = wallets.find(wallet => wallet.appName === 'tonkeeper');
        if (!tonkeeper) {
            tg.showAlert('Tonkeeper не найден. Установите кошелек и попробуйте снова.');
            return;
        }

        const link = tonConnect.connect({
            bridgeUrl: tonkeeper.bridgeUrl,
            universalLink: tonkeeper.universalLink
        });

        tg.showPopup({
            title: 'Подключение кошелька',
            message: 'Откройте Tonkeeper, чтобы подключить кошелек.',
            buttons: [{ id: 'open', type: 'default', text: 'Открыть Tonkeeper' }]
        }, (buttonId) => {
            if (buttonId === 'open') {
                window.location.href = link;
            }
        });

        tonConnect.onStatusChange(wallet => {
            if (wallet) {
                tg.showAlert(`${wallet.device.appName} кошелек подключен!`);
                document.getElementById('connect-wallet-btn').textContent = 'Кошелек подключен';
                document.getElementById('connect-wallet-btn').disabled = true;
            }
        });
    } catch (error) {
        tg.showAlert('Ошибка при подключении кошелька: ' + error.message);
    }
}

// Приглашение друзей
function inviteFriends() {
    const inviteLink = `https://t.me/yourBotName?start=${tg.initDataUnsafe.user.id}`;
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=Присоединяйся к TapSpirit и зарабатывай очки!`);
}

// Загрузка списка друзей (имитация)
function loadFriends() {
    const mockFriends = [
        { name: 'Лесной Дух', score: 150, avatar: 'https://img.icons8.com/color/40/000000/user.png' },
        { name: 'Волшебница', score: 200, avatar: 'https://img.icons8.com/color/40/000000/user-female.png' }
    ];

    mockFriends.forEach(friend => {
        const friendItem = document.createElement('div');
        friendItem.className = 'friend-item';
        friendItem.innerHTML = `
            <img src="${friend.avatar}" alt="${friend.name}">
            <div>
                <p>${friend.name}</p>
                <p>${friend.score} очков</p>
            </div>
        `;
        friendsContainer.appendChild(friendItem);
    });
}

// Инициализация UI и друзей
updateUI();
loadFriends();
