// 模拟数据库 - 实际部署时可以用localStorage或GitHub API
let apologiesDB = JSON.parse(localStorage.getItem('apologiesDB')) || [];

// 首页提交表单
if (document.getElementById('submit')) {
    document.getElementById('submit').addEventListener('click', function() {
        const toName = document.getElementById('to-name').value.trim();
        const message = document.getElementById('message').value.trim();
        const isPublic = document.getElementById('is-public').checked;
        
        if (!toName || !message) {
            alert('请填写完整的信息');
            return;
        }
        
        // 创建新卡片
        const newApology = {
            id: Date.now().toString(),
            toName,
            message,
            isPublic,
            createdAt: new Date().toISOString()
        };
        
        // 添加到"数据库"
        apologiesDB.push(newApology);
        localStorage.setItem('apologiesDB', JSON.stringify(apologiesDB));
        
        // 跳转到卡片页
        window.location.href = `card.html?id=${newApology.id}`;
    });
}

// 广场页面加载卡片
if (document.getElementById('apology-list')) {
    function renderApologies(apologies) {
        const listEl = document.getElementById('apology-list');
        
        if (apologies.length === 0) {
            listEl.innerHTML = '<div class="no-results">暂无公开的道歉卡片</div>';
            return;
        }
        
        listEl.innerHTML = apologies
            .filter(apology => apology.isPublic)
            .map(apology => `
                <div class="apology-item" data-id="${apology.id}">
                    <h3>To: ${apology.toName}</h3>
                    <p>${apology.message.substring(0, 50)}${apology.message.length > 50 ? '...' : ''}</p>
                    <small>${new Date(apology.createdAt).toLocaleDateString()}</small>
                </div>
            `).join('');
            
        // 添加点击事件
        document.querySelectorAll('.apology-item').forEach(item => {
            item.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                window.location.href = `card.html?id=${id}`;
            });
        });
    }
    
    // 初始加载
    renderApologies(apologiesDB);
    
    // 搜索功能
    if (document.getElementById('search-btn')) {
        document.getElementById('search-btn').addEventListener('click', function() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const filtered = apologiesDB.filter(apology => 
                apology.isPublic && 
                (apology.toName.toLowerCase().includes(searchTerm) || 
                 apology.message.toLowerCase().includes(searchTerm))
            );
            renderApologies(filtered);
        });
    }
}

// 卡片详情页
if (document.getElementById('apology-card')) {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    
    if (cardId) {
        const apology = apologiesDB.find(a => a.id === cardId);
        
        if (apology) {
            document.getElementById('apology-card').innerHTML = `
                <div class="card-content">
                    <h2>To: ${apology.toName}</h2>
                    <p>${apology.message}</p>
                    <small>${new Date(apology.createdAt).toLocaleString()}</small>
                </div>
            `;
            
            // 复制链接功能
            document.getElementById('copy-link').addEventListener('click', function() {
                const cardUrl = `${window.location.origin}${window.location.pathname}?id=${cardId}`;
                navigator.clipboard.writeText(cardUrl)
                    .then(() => alert('链接已复制到剪贴板'))
                    .catch(() => prompt('请手动复制链接', cardUrl));
            });
        } else {
            document.getElementById('apology-card').innerHTML = `
                <div class="error">找不到这张卡片</div>
            `;
        }
    } else {
        document.getElementById('apology-card').innerHTML = `
            <div class="error">无效的卡片ID</div>
        `;
    }
}
