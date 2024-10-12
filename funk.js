document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    let loadingTimeout;

    // Функция для скрытия плашки загрузки и ошибки
    function hideLoading() {
        loadingOverlay.style.display = 'none';
        errorMessage.style.display = 'none'; // Отключаем отображение ошибки
    }

    // Функция для отправки запроса с таймаутом
    function fetchWithTimeout(url, options = {}, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Таймаут запроса'));
            }, timeout);

            fetch(url, options)
                .then(response => {
                    clearTimeout(timer);
                    resolve(response);
                })
                .catch(err => {
                    clearTimeout(timer);
                    reject(err);
                });
        });
    }

    // Пример вызова функции fetch с таймаутом
    fetchWithTimeout('http://127.0.0.1:8000/channel/-1002173536398', {}, 5000) // 5 секунд таймаут
        .then(response => {
            if (!response.ok) {
                throw new Error('Сеть ответила с ошибкой ' + response.status);
            }
            return response.json(); // Преобразуем ответ в JSON
        })
        .then(data => {
            clearTimeout(loadingTimeout); // Если данные загружены быстро, убираем плашку
            hideLoading(); // Скрываем плашку загрузки

            console.log(data); // Здесь можно обрабатывать данные

            // Извлечение данных
            const channelData = data["-1002173536398"];
            const channelName = channelData.name;
            const positiveCount = channelData.positive_reviews_count;
            const negativeCount = channelData.negative_reviews_count;
            const discreetCount = channelData.discreet_review;

            // Рассчитываем сумму
            const totalCount = positiveCount + negativeCount + discreetCount;

            // Обновление текста элементов на странице
            document.getElementById('name-channel').textContent = channelName; // Название канала
            document.querySelector('.stat-grey').textContent = totalCount; // Сумма
            document.querySelector('.stat-green').textContent = positiveCount; // Положительные
            document.querySelector('.stat-red').textContent = negativeCount; // Отрицательные
            document.querySelector('.stat-orange').textContent = discreetCount; // Дискретные

            // Извлечение положительных комментариев
            const positiveComments = channelData.reviews.positive;

            // Получаем контейнер для комментариев
            const commentsContainer = document.querySelector('.container-comment');

            // Очищаем контейнер перед добавлением новых комментариев
            commentsContainer.innerHTML = '';

            // Если нет комментариев
            if (positiveComments.length === 0) {
                commentsContainer.innerHTML = '<p class="not-found-comment">Нет комментариев.</p>';
            } else {
                positiveComments.forEach(comment => {
                    const commentHTML = `
                        <div class="comment">
                            <div class="comment-header">
                                <div class="user-info">
                                    <div class="user-avatar"></div>
                                    <div class="username">${comment.first_name} ${comment.last_name}</div>
                                    <button class="more-options">
                                        <img src="img/more.png" alt="More options"/>
                                    </button>
                                </div>
                            </div>
                            <div class="comment-body">
                                <p class="comment-content">${comment.review}</p>
                            </div>
                            <div class="comment-button">
                                <p class="timestamp">${new Date(comment.date).toLocaleString()}</p>
                            </div>
                        </div>
                    `;
                    commentsContainer.innerHTML += commentHTML; // Добавляем новый комментарий в контейнер
                });
            }

            commentsContainer.style.display = 'block'; // Показываем контейнер, если там есть комментарии
        })
        .catch(error => {
            // Отключаем показ ошибки пользователю
            hideLoading(); // Скрываем плашку загрузки в случае ошибки
            console.error('Ошибка при загрузке данных:', error); // Логируем ошибку
        });

    // При загрузке страницы можно сразу загружать данные
    window.onload = () => {
        // Скрываем ошибку при старте
        hideLoading();
    };

    /* Эффект с footer */
    let lastScrollTop = 0;
    const footerNavigation = document.querySelector('.sticky-footer-navigation');

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop) {
            // Прокрутка вниз - показываем панель
            footerNavigation.classList.remove('hide');
        } else {
            // Прокрутка вверх - скрываем панель
            footerNavigation.classList.add('hide');
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Не позволяем отрицательному значению
    });

    // Логика для создания комментария
    const commentLoading = document.getElementById('create-comment-slide');
    const dragHandle = document.getElementById('drag-handle');
    
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    // Открытие плашки по клику на кнопку
    document.getElementById('create').addEventListener('click', function() {
        commentLoading.style.bottom = "-100%";
        setTimeout(() => {
            commentLoading.classList.add('show');
            commentLoading.style.bottom = "0";
        }, 50);
    });

    // Закрытие плашки при клике на drag-handle
    dragHandle.addEventListener('click', function() {
        commentLoading.classList.remove('show');
        commentLoading.style.bottom = "-100%";
    });

    // Начало касания
    commentLoading.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        isDragging = true;
    });

    // Движение касания
    commentLoading.addEventListener('touchmove', function(e) {
        if (!isDragging) return;

        currentY = e.touches[0].clientY;
        let diffY = currentY - startY;

        if (diffY > 0) {
            commentLoading.style.bottom = `-${diffY}px`;
        }
    });

    // Конец касания
    commentLoading.addEventListener('touchend', function() {
        isDragging = false;

        if (currentY - startY > 100) {
            commentLoading.classList.remove('show');
            commentLoading.style.bottom = "-100%";
        } else {
            commentLoading.style.bottom = "0";
        }
    });
});




