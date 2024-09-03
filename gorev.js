document.addEventListener('DOMContentLoaded', () => {
    // Her görev için ayrı kodları tanımlayın. Kodlar burada görev ID'sine göre belirlenir.
    const taskCodes = {
        'task1': '1234',
        'task2': '5678',
        // Diğer görevler burada tanımlanabilir
    };

    // Daha önce tamamlanmış görevleri almak için LocalStorage'dan veriyi çek
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

    const tasks = document.querySelectorAll('#task-list li');

    tasks.forEach(task => {
        const completeBtn = task.querySelector('.complete-btn');
        const taskLink = task.querySelector('.task-link');
        const manualCodeInput = task.querySelector('.manual-code');
        const taskId = task.getAttribute('data-task-id'); // Görev ID'sini al

        // Görev tamamlanmışsa butonu devre dışı bırak ve görsel olarak tamamlanmış göster
        if (completedTasks.includes(taskId)) {
            markTaskAsCompleted(task);
        }

        // Tamamla butonuna tıklanma işlevi
        completeBtn.addEventListener('click', () => {
            if (taskLink.getAttribute('data-clicked') === 'true') {
                const correctCode = taskCodes[taskId] || ''; // Görev ID'sine göre kodu al
                const manualCode = manualCodeInput.value.trim();

                // Kod gerekmiyorsa veya doğru kod girildiyse görevi tamamla
                if (correctCode === '' || manualCode === correctCode) {
                    markTaskAsCompleted(task);
                    saveCompletedTask(taskId); // Tamamlanan görevi kaydet
                } else {
                    alert('Kod yanlış. Lütfen doğru kodu girin.');
                }
            } else {
                alert('Görev linkine tıklamanız gerekiyor.');
            }
        });

        // Görev linkine tıklanma işlevi
        taskLink.addEventListener('click', () => {
            taskLink.setAttribute('data-clicked', 'true');
        });
    });

    // Görevi tamamla ve skora puanı ekle
    function markTaskAsCompleted(task) {
        const points = parseInt(task.querySelector('.task-points').innerText);
        updateScore(points);
        task.classList.add('completed');
        task.querySelector('.complete-btn').disabled = true; // Tamamlanmış görevi devre dışı bırak
    }

    // Skoru güncellemek için işlev
    function updateScore(points) {
        let score = parseInt(localStorage.getItem('score')) || 0;
        score += points;
        localStorage.setItem('score', score);
    }

    // Tamamlanan görevi kaydet
    function saveCompletedTask(taskId) {
        if (!completedTasks.includes(taskId)) {
            completedTasks.push(taskId);
            localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
        }
    }
});
