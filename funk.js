document.addEventListener('DOMContentLoaded', () => {
    const loadingOverlay = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    let loadingTimeout;

    // Функция для показа плашки загрузки с задержкой
    function showLoading() {
        loadingOverlay.style.display = 'flex';
    }

    // Скрываем плашку загрузки и ошибки
    function hideLoading() {
        loadingOverlay.style.display = 'none';
        errorMessage.style.display = 'none';
    }

    // Начинаем загрузку данных
    hideLoading(); // Скрываем плашки перед началом загрузки

    loadingTimeout = setTimeout(showLoading, 100); // Устанавливаем задержку в 100 мс

    fetch('http://127.0.0.1:8000/channel/-1002173536398') // Замените URL на ваш
        .then(response => {
            if (!response.ok) {
                throw new Error('Сеть ответила с ошибкой ' + response.status);
            }
            return response.json(); // Преобразуем ответ в JSON
        })
        .then(data => {
            clearTimeout(loadingTimeout); // Если данные загружены быстро, убираем плашку
            hideLoading(); // Скрываем плашку загрузки

            console.log(data); // Здесь вы можете работать с полученными данными

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

            // Дбавление имени канала в плашку создания комментрия   
            //document.getElementById('name-channel-create-comment').innerText = channelName;

            // Извлечение положительных комментариев
            const positiveComments = channelData.reviews.positive;

            // Получаем контейнер для комментариев
            const commentsContainer = document.querySelector('.container-comment');

            function fetchComments(type) {
                const url = `http://127.0.0.1:8000/channel/-1002173536398/${type}`;
                console.log('Fetching comments from:', url);
            
                // Показываем плашку загрузки при загрузке комментариев
                loadingTimeout = setTimeout(showLoading, 100); // Устанавливаем задержку в 100 мс
                errorMessage.style.display = 'none'; // Скрываем плашку с ошибкой
            
                fetch(url)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Сеть ответила с ошибкой');
                        }
                        return response.json();
                    })
                    .then(data => {
                        clearTimeout(loadingTimeout); // Если данные загружены быстро, убираем плашку
                        hideLoading(); // Скрываем плашку загрузки
                        renderComments(Object.values(data), type); // Передаем тип комментариев для рендеринга
                    })
                    .catch(error => {
                        clearTimeout(loadingTimeout); // Убираем таймер, если произошла ошибка
                        hideLoading(); // Скрываем плашку загрузки
                        console.error('Произошла ошибка при загрузке комментариев:', error);
                        errorMessage.style.display = 'flex'; // Показываем плашку с ошибкой
                    });
            }
            

            // Функция для рендеринга комментариев
            function renderComments(comments, type) {
                // Скрываем все контейнеры
                document.querySelectorAll('.container-comment').forEach(container => {
                    container.style.display = 'none';
                });

                const commentsContainer = document.querySelector(`.container-comment.${type}`);
                commentsContainer.innerHTML = ''; // Очищаем контейнер перед добавлением новых комментариев

                if (!comments || comments.length === 0) {
                    commentsContainer.innerHTML = '<p class="not-found-comment">Нет комментариев.</p>';
                } else {
                    comments.forEach(comment => {
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
            }

            // Обработчик событий для кнопок
            document.querySelectorAll('.stat-button').forEach(button => {
                button.addEventListener('click', () => {
                    const type = button.classList.contains('stat-green') ? 'positive' :
                                 button.classList.contains('stat-red') ? 'negative' :
                                 button.classList.contains('stat-orange') ? 'discreet' : null;

                    if (type) {
                        fetchComments(type); // Вызываем функцию для получения комментариев по типу
                    }
                });
            });

            // При загрузке страницы, можно сразу загружать все комментарии
            window.onload = () => {
                fetchComments('all'); // Начальное состояние — все комментарии
            };
        })
        .catch(error => {
            hideLoading(); // Скрываем плашку загрузки в случае ошибки
            errorMessage.style.display = 'flex'; // Показываем плашку с ошибкой
            console.error('Ошибка при загрузке данных:', error);
        });



        /*Эффект с footer*/
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


        
        //ЛОГИКА CREATE COMMENT

        const commentLoading = document.getElementById('create-comment-slide');
        const dragHandle = document.getElementById('drag-handle');
        
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        // Открытие плашки по клику на кнопку
        document.getElementById('create').addEventListener('click', function() {
            // Сбрасываем положение плашки и показываем её
            commentLoading.style.bottom = "-100%"; // Устанавливаем начальное положение
            setTimeout(() => {
                commentLoading.classList.add('show');
                commentLoading.style.bottom = "0"; // Плавный подъем плашки
            }, 50); // Задержка, чтобы плавный переход сработал
        });
        
        // Закрытие плашки при клике на drag-handle
        dragHandle.addEventListener('click', function() {
            commentLoading.classList.remove('show');
            commentLoading.style.bottom = "-100%"; // Убираем плашку вниз
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
        
            // Если свайп вниз, смещаем плашку
            if (diffY > 0) {
                commentLoading.style.bottom = `-${diffY}px`;
            }
        });
        
        // Конец касания
        commentLoading.addEventListener('touchend', function(e) {
            isDragging = false;
        
            // Если плашка протянута вниз на больше чем 100px, скрываем её
            if (currentY - startY > 100) {
                commentLoading.classList.remove('show');
                commentLoading.style.bottom = "-100%";
            } else {
                // Иначе возвращаем плашку на место
                commentLoading.style.bottom = "0";
            }
        });



        const buttonCreateCommentLoad = document.getElementById('button-create-comment-load');
        const createCommentLoading = document.getElementById('create-comment-loading');
        const createCommentContainer = document.getElementById('create-comment-container');
        const svipeContainer = document.getElementById('svipe-container');
        const footerCreateComment = document.getElementById('footer-create-comment');

        buttonCreateCommentLoad.addEventListener('click', function() {
            // Скрываем окно загрузки
            createCommentLoading.style.visibility = 'hidden';
            
            // Показываем контейнер с комментариями, свайп и footer
            createCommentContainer.style.visibility = 'visible';
            svipeContainer.style.visibility = 'visible';
            footerCreateComment.style.visibility = 'visible';
        });
        
        


        let selectedCategory = null; // Переменная для хранения выбранной категории

        // Категория комментария
        const buttons = document.querySelectorAll('#category-create-comment-container .category');
        const slideborder = document.getElementById('create-comment-slide');
        const leftborderchekcom = document.getElementById('checking-the-comment');
        
        // Объект для хранения стилей
        const styles = {
            positive: { backgroundColor: 'green', borderTop: '5px solid green', borderLeft: '0.8vw solid green' },
            negative: { backgroundColor: 'red', borderTop: '5px solid red', borderLeft: '0.8vw solid red' },
            discreet: { backgroundColor: 'orange', borderTop: '5px solid orange', borderLeft: '0.8vw solid orange' },
        };
        
        // Функция для сброса стилей
        function resetStyles() {
            buttons.forEach(btn => {
                btn.style.backgroundColor = ''; // Сбрасываем фон
                btn.style.color = ''; // Сбрасываем цвет текста
            });
            slideborder.style.borderTop = ''; // Сбрасываем верхнюю границу
            leftborderchekcom.style.borderLeft = ''; // Сбрасываем левую границу
        }
        
        // Добавляем обработчик события для каждой кнопки
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                resetStyles(); // Сбрасываем стили
                const style = styles[this.id]; // Получаем стили для нажатой кнопки
                if (style) {
                    this.style.backgroundColor = style.backgroundColor; // Устанавливаем фон
                    this.style.color = 'white'; // Устанавливаем цвет текста
                    slideborder.style.borderTop = style.borderTop; // Устанавливаем верхнюю границу
                    leftborderchekcom.style.borderLeft = style.borderLeft; // Устанавливаем левую границу
                    selectedCategory = this.id; // Сохраняем выбранную категорию
                    console.log(selectedCategory)
                }
            });
        });


        // обновление готового текста в 3 вкладке
        const inputComment = document.getElementById('input-comment');
        const checkingComment = document.getElementById('checking-the-comment');
 


        // footer slide func 
        let currentWindowIndex = 0;
        const windows = document.querySelectorAll('#create-comment-container > div');
        const movementTabs = document.querySelectorAll('.movement-tab');
        const svipemodule = document.getElementById('svipe-module');
        const buttonsmodule = document.getElementById('buttons-module');

        // Функция для отображения окна и смены активной кнопки
        function showWindow(index) {
            // Проверка, какой индекс окна нужно показать
            windows.forEach((window, i) => {
                if (i === index) {
                    window.style.visibility = 'visible'; // Показываем выбранное окно
                    window.style.display = 'flex'; // Пример использования display: flex
                } else {
                    window.style.visibility = 'hidden'; // Скрываем другие окна
                    window.style.display = 'none'; // Или другой способ скрытия
                }
            });

            // Управление видимостью svipe-container и buttons-module
            if (index === 2) {
                // На второй вкладке
                svipemodule.style.visibility = 'hidden'; // Скрываем svipe-module
                svipemodule.style.display = 'none'; // Скрываем svipe-module
                buttonsmodule.style.visibility = 'visible'; // Показываем buttons-module
                buttonsmodule.style.display = 'flex'; // Показываем buttons-module
            } else {
                // На первой или третьей вкладке
                svipemodule.style.visibility = 'visible'; // Показываем svipe-module
                svipemodule.style.display = 'flex'; // Показываем svipe-module
                buttonsmodule.style.visibility = 'hidden'; // Скрываем buttons-module
                buttonsmodule.style.display = 'none'; // Скрываем buttons-module
            }

            // Обновляем цвет кнопок
            movementTabs.forEach((tab, i) => {
                if (i === index) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });

            // Обновляем текущий индекс
            currentWindowIndex = index;
        }

        // Инициализация — показываем первое окно и активируем первую кнопку
        showWindow(currentWindowIndex);

        // Обработка кликов по кнопкам навигации
        document.getElementById('movement-tab-first').addEventListener('click', () => {
            showWindow(0); // Переход на первое окно
        });
        document.getElementById('movement-tab-second').addEventListener('click', () => {
            showWindow(1); // Переход на второе окно
        });
        document.getElementById('movement-tab-third').addEventListener('click', () => {
            showWindow(2); // Переход на третье окно
            const commentText = inputComment.value;
            checkingComment.textContent = commentText;
        });

        
        
        document.getElementById('publish').addEventListener('click', async function() { 
            const comment = checkingComment.textContent; 
            const estimation = selectedCategory;  // убедитесь, что selectedCategory содержит корректное значение
            console.log({ comment, estimation }); // добавьте логи
        
            try {
                const response = await fetch(`http://127.0.0.1:8000/channel/-1002173536398/create/5959964711`, { 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json', 
                    }, 
                    body: JSON.stringify({ "comment": comment, "estimation": estimation}) 
                });
                
                if (!response.ok) { 
                    throw new Error(`Ошибка сервера: ${response.statusText}`); 
                }
                const result = await response.json();
                console.log(result);
            } catch (error) {
                console.error('Error:', error);
            }
        });
        
        
        
});



