const { createApp, ref, reactive, computed, onMounted, watch } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// 音乐管理器 - 基础层组件
const MusicManager = {
    name: 'MusicManager',
    template: `
        <div class="music-controls">
            <button 
                class="music-btn" 
                :class="{ active: isPlaying }"
                @click="toggleMusic"
                title="点击开始/暂停音乐">
                ♪
            </button>
            <button class="music-btn" @click="decreaseVolume" title="减少音量">-</button>
            <button class="music-btn" @click="increaseVolume" title="增加音量">+</button>
        </div>
    `,
    setup() {
        const isPlaying = ref(false);
        const volume = ref(0.5);
        const currentMusic = ref(null);
        
        const audioElements = {
            background: null,
            library: null,
            temple: null,
            cave: null,
            valley: null
        };
        
        onMounted(() => {
            // 初始化音频元素
            audioElements.background = document.getElementById('backgroundMusic');
            audioElements.library = document.getElementById('libraryMusic');
            audioElements.temple = document.getElementById('templeMusic');
            audioElements.cave = document.getElementById('caveMusic');
            audioElements.valley = document.getElementById('valleyMusic');
            
            // 设置初始音量
            Object.values(audioElements).forEach(audio => {
                if (audio) {
                    audio.volume = volume.value;
                }
            });
            
            // 自动播放背景音乐
            playMusic('background');
        });
        
        const stopAllMusic = () => {
            Object.values(audioElements).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
        };
        
        const playMusic = (type) => {
            stopAllMusic();
            
            const audio = audioElements[type];
            if (audio) {
                currentMusic.value = audio;
                audio.volume = volume.value;
                
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        isPlaying.value = true;
                    }).catch(error => {
                        console.log('自动播放被阻止:', error);
                        isPlaying.value = false;
                    });
                }
            }
        };
        
        const toggleMusic = () => {
            if (isPlaying.value) {
                if (currentMusic.value) {
                    currentMusic.value.pause();
                }
                isPlaying.value = false;
            } else {
                if (currentMusic.value) {
                    currentMusic.value.play();
                    isPlaying.value = true;
                } else {
                    playMusic('background');
                }
            }
        };
        
        const increaseVolume = () => {
            if (volume.value < 1) {
                volume.value = Math.min(1, volume.value + 0.1);
                if (currentMusic.value) {
                    currentMusic.value.volume = volume.value;
                }
            }
        };
        
        const decreaseVolume = () => {
            if (volume.value > 0) {
                volume.value = Math.max(0, volume.value - 0.1);
                if (currentMusic.value) {
                    currentMusic.value.volume = volume.value;
                }
            }
        };
        
        // 暴露给全局使用
        window.musicManager = {
            playMusic,
            stopAllMusic,
            toggleMusic,
            increaseVolume,
            decreaseVolume
        };
        
        return {
            isPlaying,
            volume,
            toggleMusic,
            increaseVolume,
            decreaseVolume
        };
    }
};

// 导航栏组件 - 基础层组件
const Navbar = {
    name: 'Navbar',
    template: `
        <nav class="navbar">
            <router-link to="/" class="navbar-brand">神秘宝藏探险</router-link>
            <ul class="navbar-nav">
                <li><router-link to="/" class="nav-link">首页</router-link></li>
                <li><router-link to="/game" class="nav-link">寻宝游戏</router-link></li>
                <li><router-link to="/users" class="nav-link">用户管理</router-link></li>
                <li><router-link to="/leaderboard" class="nav-link">排行榜</router-link></li>
            </ul>
        </nav>
    `
};

// 游戏进度组件 - 功能层组件
const GameProgress = {
    name: 'GameProgress',
    props: {
        currentStep: {
            type: Number,
            default: 0
        },
        progress: {
            type: Number,
            default: 0
        }
    },
    template: `
        <div>
            <div class="step-indicator">
                <div 
                    v-for="(step, index) in steps" 
                    :key="index"
                    class="step"
                    :class="{ 
                        active: index === currentStep, 
                        completed: index < currentStep 
                    }">
                    <div class="step-icon">{{ step.icon }}</div>
                    <div>{{ step.name }}</div>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar" :style="{ width: progress + '%' }"></div>
            </div>
        </div>
    `,
    setup() {
        const steps = [
            { icon: '🔍', name: '火眼金睛' },
            { icon: '📜', name: '智慧谜题' },
            { icon: '🗝️', name: '钥匙藏身' },
            { icon: '🏛️', name: '神庙闯关' },
            { icon: '🔓', name: '破解密码' },
            { icon: '🏆', name: '宝藏现身' }
        ];
        
        return { steps };
    }
};

// 游戏日志组件 - 功能层组件
const GameLog = {
    name: 'GameLog',
    props: {
        logs: {
            type: Array,
            default: () => []
        }
    },
    template: `
        <div class="log-container">
            <div 
                v-for="(log, index) in logs" 
                :key="index"
                class="log-entry"
                :class="{ error: log.type === 'error' }">
                {{ log.message }}
            </div>
        </div>
    `
};

// 用户卡片组件 - 功能层组件
const UserCard = {
    name: 'UserCard',
    props: {
        user: {
            type: Object,
            required: true
        }
    },
    emits: ['edit', 'delete'],
    template: `
        <div class="card">
            <h3>{{ user.username }}</h3>
            <p><strong>邮箱:</strong> {{ user.email }}</p>
            <p><strong>最高分:</strong> {{ user.highScore }}</p>
            <p><strong>完成次数:</strong> {{ user.completedGames }}</p>
            <p><strong>注册时间:</strong> {{ formatDate(user.createdAt) }}</p>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary" @click="$emit('edit', user)">编辑</button>
                <button class="btn" @click="$emit('delete', user.id)" style="background: #ff6b6b;">删除</button>
            </div>
        </div>
    `,
    setup() {
        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('zh-CN');
        };
        
        return { formatDate };
    }
};

// 排行榜条目组件 - 功能层组件
const LeaderboardItem = {
    name: 'LeaderboardItem',
    props: {
        user: {
            type: Object,
            required: true
        },
        rank: {
            type: Number,
            required: true
        }
    },
    template: `
        <tr>
            <td>
                <span v-if="rank === 1">🥇</span>
                <span v-else-if="rank === 2">🥈</span>
                <span v-else-if="rank === 3">🥉</span>
                <span v-else>{{ rank }}</span>
            </td>
            <td>{{ user.username }}</td>
            <td>{{ user.highScore }}</td>
            <td>{{ user.completedGames }}</td>
            <td>{{ formatDate(user.lastPlayedAt) }}</td>
        </tr>
    `,
    setup() {
        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('zh-CN');
        };
        
        return { formatDate };
    }
};

// 首页组件 - 页面层组件
const HomePage = {
    name: 'HomePage',
    template: `
        <div class="content-wrapper">
            <h1 class="page-title">神秘宝藏探险</h1>
            <div class="grid grid-2">
                <div class="card">
                    <h3>🎮 开始游戏</h3>
                    <p>踏上寻宝之旅，探索神秘的古老遗迹，解开谜题，寻找传说中的宝藏！</p>
                    <router-link to="/game" class="btn" style="margin-top: 1rem;">开始冒险</router-link>
                </div>
                <div class="card">
                    <h3>👥 用户管理</h3>
                    <p>管理用户账户，查看游戏统计数据，编辑用户信息。</p>
                    <router-link to="/users" class="btn btn-secondary" style="margin-top: 1rem;">管理用户</router-link>
                </div>
                <div class="card">
                    <h3>🏆 排行榜</h3>
                    <p>查看最佳玩家排名，挑战高分记录，成为寻宝大师！</p>
                    <router-link to="/leaderboard" class="btn" style="margin-top: 1rem;">查看排行</router-link>
                </div>
                <div class="card">
                    <h3>🎵 游戏特色</h3>
                    <p>沉浸式音效体验，精美的视觉效果，多样化的游戏场景。</p>
                    <button class="btn btn-secondary" style="margin-top: 1rem;" @click="playDemo">试听音乐</button>
                </div>
            </div>
            
            <div class="card" style="margin-top: 2rem;">
                <h3>🎯 游戏说明</h3>
                <div class="grid grid-3" style="margin-top: 1rem;">
                    <div>
                        <h4>🔍 探索阶段</h4>
                        <p>在古老的图书馆中寻找初始线索</p>
                    </div>
                    <div>
                        <h4>🧩 解谜阶段</h4>
                        <p>破解神秘神庙中的古老谜题</p>
                    </div>
                    <div>
                        <h4>🏆 寻宝阶段</h4>
                        <p>在隐藏洞穴和遗忘山谷中找到宝藏</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const playDemo = () => {
            if (window.musicManager) {
                window.musicManager.playMusic('background');
            }
        };
        
        return { playDemo };
    }
};

// 寻宝游戏组件 - 页面层组件
const TreasureGame = {
    name: 'TreasureGame',
    components: {
        GameProgress,
        GameLog
    },
    template: `
        <div class="content-wrapper">
            <h1 class="page-title">寻宝游戏</h1>
            
            <div class="card">
                <h3>当前位置: {{ currentLocation.name }}</h3>
                <p>{{ currentLocation.description }}</p>
            </div>
            
            <GameProgress :currentStep="currentStep" :progress="progress" />
            
            <div class="treasure-map">
                <div class="character" :style="characterStyle"></div>
                <div class="treasure" :style="treasureStyle"></div>
            </div>
            
            <GameLog :logs="gameLogs" />
            
            <div class="grid grid-2" style="margin-top: 2rem;">
                <div class="card">
                    <h4>选择探索地点</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button 
                            v-for="location in locations" 
                            :key="location.id"
                            class="btn"
                            :class="{ 'btn-secondary': location.id === currentLocationId }"
                            @click="changeLocation(location.id)"
                            :disabled="!location.unlocked">
                            {{ location.name }} {{ location.completed ? '✅' : '' }}
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <h4>游戏控制</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <button class="btn" @click="startGame" :disabled="gameRunning">
                            {{ gameRunning ? '游戏进行中...' : '开始寻宝' }}
                        </button>
                        <button class="btn btn-secondary" @click="resetGame">重新开始</button>
                        <button class="btn" @click="saveProgress">保存进度</button>
                    </div>
                </div>
            </div>
            
            <div v-if="gameCompleted" class="card" style="background: rgba(46, 204, 113, 0.2); border-color: #2ecc71; margin-top: 2rem;">
                <h3 style="color: #2ecc71; text-align: center;">🎉 恭喜！你找到了传说中的宝藏！ 🎉</h3>
                <p style="text-align: center; margin-top: 1rem;">
                    最终得分: {{ finalScore }} 分 | 用时: {{ gameTime }} 秒
                </p>
            </div>
        </div>
    `,
    setup() {
        const currentStep = ref(0);
        const progress = ref(0);
        const currentLocationId = ref('library');
        const gameRunning = ref(false);
        const gameCompleted = ref(false);
        const finalScore = ref(0);
        const gameTime = ref(0);
        const startTime = ref(0);
        
        const gameLogs = ref([
            { message: '欢迎来到神秘宝藏探险！', type: 'info' },
            { message: '选择一个地点开始你的冒险之旅...', type: 'info' }
        ]);
        
        const locations = ref([
            {
                id: 'library',
                name: '古老图书馆',
                description: '寻找初始线索的地方，这里藏着古老的秘密...',
                unlocked: true,
                completed: false,
                music: 'library'
            },
            {
                id: 'temple',
                name: '神秘神庙',
                description: '解开谜题，寻找宝藏的关键所在...',
                unlocked: false,
                completed: false,
                music: 'temple'
            },
            {
                id: 'cave',
                name: '隐藏洞穴',
                description: '寻找隐藏的钥匙，深入地下的秘密...',
                unlocked: false,
                completed: false,
                music: 'cave'
            },
            {
                id: 'valley',
                name: '遗忘山谷',
                description: '破解最后的密码，宝藏就在眼前...',
                unlocked: false,
                completed: false,
                music: 'valley'
            }
        ]);
        
        const currentLocation = computed(() => {
            return locations.value.find(loc => loc.id === currentLocationId.value);
        });
        
        const characterStyle = computed(() => {
            const positions = {
                library: { left: '10%', bottom: '20px' },
                temple: { left: '30%', bottom: '20px' },
                cave: { left: '60%', bottom: '20px' },
                valley: { left: '80%', bottom: '20px' }
            };
            return positions[currentLocationId.value] || positions.library;
        });
        
        const treasureStyle = computed(() => {
            return {
                opacity: gameCompleted.value ? 1 : 0,
                right: '50px',
                bottom: '20px'
            };
        });
        
        const changeLocation = (locationId) => {
            const location = locations.value.find(loc => loc.id === locationId);
            if (location && location.unlocked) {
                currentLocationId.value = locationId;
                addLog(`进入了${location.name}`, 'info');
                
                // 播放对应的音乐
                if (window.musicManager) {
                    window.musicManager.playMusic(location.music);
                }
            }
        };
        
        const addLog = (message, type = 'info') => {
            gameLogs.value.push({ message, type });
            // 保持日志数量在合理范围内
            if (gameLogs.value.length > 20) {
                gameLogs.value.shift();
            }
        };
        
        const startGame = async () => {
            if (gameRunning.value) return;
            
            gameRunning.value = true;
            startTime.value = Date.now();
            currentStep.value = 0;
            progress.value = 0;
            gameCompleted.value = false;
            
            addLog('开始寻宝冒险！', 'info');
            
            // 模拟游戏进程
            const steps = [
                { message: '仔细搜索，寻找线索...', duration: 2000 },
                { message: '发现了古老的文字！', duration: 1500 },
                { message: '解读文字中的秘密...', duration: 2500 },
                { message: '找到了通往下一个地点的线索！', duration: 1500 },
                { message: '继续探索，寻找更多秘密...', duration: 2000 },
                { message: '恭喜！成功完成了这个地点的探索！', duration: 1000 }
            ];
            
            for (let i = 0; i < steps.length; i++) {
                await new Promise(resolve => setTimeout(resolve, steps[i].duration));
                currentStep.value = i + 1;
                progress.value = ((i + 1) / steps.length) * 100;
                addLog(steps[i].message, 'info');
            }
            
            // 完成当前地点
            const currentLoc = locations.value.find(loc => loc.id === currentLocationId.value);
            if (currentLoc) {
                currentLoc.completed = true;
                
                // 解锁下一个地点
                const currentIndex = locations.value.findIndex(loc => loc.id === currentLocationId.value);
                if (currentIndex < locations.value.length - 1) {
                    locations.value[currentIndex + 1].unlocked = true;
                    addLog(`解锁了新地点：${locations.value[currentIndex + 1].name}`, 'info');
                }
            }
            
            // 检查是否完成所有地点
            if (locations.value.every(loc => loc.completed)) {
                gameCompleted.value = true;
                gameTime.value = Math.floor((Date.now() - startTime.value) / 1000);
                finalScore.value = Math.max(1000 - gameTime.value * 2, 100);
                addLog('🎉 恭喜！你找到了所有的宝藏！', 'info');
                
                // 保存成绩到排行榜
                saveScore();
            }
            
            gameRunning.value = false;
        };
        
        const resetGame = () => {
            currentStep.value = 0;
            progress.value = 0;
            gameRunning.value = false;
            gameCompleted.value = false;
            currentLocationId.value = 'library';
            
            // 重置地点状态
            locations.value.forEach((loc, index) => {
                loc.completed = false;
                loc.unlocked = index === 0;
            });
            
            gameLogs.value = [
                { message: '游戏已重置', type: 'info' },
                { message: '选择一个地点开始你的冒险之旅...', type: 'info' }
            ];
            
            // 播放背景音乐
            if (window.musicManager) {
                window.musicManager.playMusic('background');
            }
        };
        
        const saveProgress = () => {
            const gameState = {
                currentLocationId: currentLocationId.value,
                locations: locations.value,
                currentStep: currentStep.value,
                progress: progress.value,
                gameCompleted: gameCompleted.value,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('treasureGameState', JSON.stringify(gameState));
            addLog('游戏进度已保存', 'info');
        };
        
        const loadProgress = () => {
            const savedState = localStorage.getItem('treasureGameState');
            if (savedState) {
                try {
                    const gameState = JSON.parse(savedState);
                    currentLocationId.value = gameState.currentLocationId;
                    locations.value = gameState.locations;
                    currentStep.value = gameState.currentStep;
                    progress.value = gameState.progress;
                    gameCompleted.value = gameState.gameCompleted;
                    addLog('游戏进度已加载', 'info');
                } catch (e) {
                    addLog('加载游戏进度失败', 'error');
                }
            }
        };
        
        const saveScore = () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{"username": "匿名玩家", "id": "anonymous"}');
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].highScore = Math.max(users[userIndex].highScore || 0, finalScore.value);
                users[userIndex].completedGames = (users[userIndex].completedGames || 0) + 1;
                users[userIndex].lastPlayedAt = new Date().toISOString();
                localStorage.setItem('users', JSON.stringify(users));
            }
        };
        
        onMounted(() => {
            loadProgress();
        });
        
        return {
            currentStep,
            progress,
            currentLocationId,
            currentLocation,
            gameRunning,
            gameCompleted,
            finalScore,
            gameTime,
            gameLogs,
            locations,
            characterStyle,
            treasureStyle,
            changeLocation,
            startGame,
            resetGame,
            saveProgress
        };
    }
};

// 用户管理组件 - 页面层组件
const UserManagement = {
    name: 'UserManagement',
    components: {
        UserCard
    },
    template: `
        <div class="content-wrapper">
            <h1 class="page-title">用户管理</h1>
            
            <div class="card">
                <h3>添加新用户</h3>
                <form @submit.prevent="addUser" class="grid grid-2">
                    <div class="form-group">
                        <label class="form-label">用户名</label>
                        <input v-model="newUser.username" type="text" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">邮箱</label>
                        <input v-model="newUser.email" type="email" class="form-input" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">添加用户</button>
                    </div>
                </form>
            </div>
            
            <div class="card">
                <h3>用户列表 ({{ users.length }} 个用户)</h3>
                <div class="grid grid-2">
                    <UserCard 
                        v-for="user in users" 
                        :key="user.id"
                        :user="user"
                        @edit="editUser"
                        @delete="deleteUser" />
                </div>
            </div>
            
            <!-- 编辑用户模态框 -->
            <div v-if="editingUser" class="modal-overlay" @click="cancelEdit">
                <div class="modal-content" @click.stop>
                    <h3>编辑用户</h3>
                    <form @submit.prevent="updateUser">
                        <div class="form-group">
                            <label class="form-label">用户名</label>
                            <input v-model="editingUser.username" type="text" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">邮箱</label>
                            <input v-model="editingUser.email" type="email" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">最高分</label>
                            <input v-model.number="editingUser.highScore" type="number" class="form-input">
                        </div>
                        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                            <button type="submit" class="btn">保存</button>
                            <button type="button" class="btn btn-secondary" @click="cancelEdit">取消</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    setup() {
        const users = ref([]);
        const newUser = reactive({
            username: '',
            email: ''
        });
        const editingUser = ref(null);
        
        const loadUsers = () => {
            const savedUsers = localStorage.getItem('users');
            if (savedUsers) {
                users.value = JSON.parse(savedUsers);
            } else {
                // 初始化一些示例用户
                users.value = [
                    {
                        id: '1',
                        username: '寻宝大师',
                        email: 'master@treasure.com',
                        highScore: 950,
                        completedGames: 15,
                        createdAt: '2024-01-15T10:30:00Z',
                        lastPlayedAt: '2024-01-20T15:45:00Z'
                    },
                    {
                        id: '2',
                        username: '冒险家小王',
                        email: 'wang@adventure.com',
                        highScore: 1020,
                        completedGames: 8,
                        createdAt: '2024-01-18T14:20:00Z',
                        lastPlayedAt: '2024-01-19T09:15:00Z'
                    }
                ];
                saveUsers();
            }
        };
        
        const saveUsers = () => {
            localStorage.setItem('users', JSON.stringify(users.value));
        };
        
        const addUser = () => {
            if (newUser.username && newUser.email) {
                const user = {
                    id: Date.now().toString(),
                    username: newUser.username,
                    email: newUser.email,
                    highScore: 0,
                    completedGames: 0,
                    createdAt: new Date().toISOString(),
                    lastPlayedAt: null
                };
                
                users.value.push(user);
                saveUsers();
                
                // 重置表单
                newUser.username = '';
                newUser.email = '';
            }
        };
        
        const editUser = (user) => {
            editingUser.value = { ...user };
        };
        
        const updateUser = () => {
            const index = users.value.findIndex(u => u.id === editingUser.value.id);
            if (index !== -1) {
                users.value[index] = { ...editingUser.value };
                saveUsers();
                editingUser.value = null;
            }
        };
        
        const cancelEdit = () => {
            editingUser.value = null;
        };
        
        const deleteUser = (userId) => {
            if (confirm('确定要删除这个用户吗？')) {
                users.value = users.value.filter(u => u.id !== userId);
                saveUsers();
            }
        };
        
        onMounted(() => {
            loadUsers();
        });
        
        return {
            users,
            newUser,
            editingUser,
            addUser,
            editUser,
            updateUser,
            cancelEdit,
            deleteUser
        };
    }
};

// 排行榜组件 - 页面层组件
const Leaderboard = {
    name: 'Leaderboard',
    components: {
        LeaderboardItem
    },
    template: `
        <div class="content-wrapper">
            <h1 class="page-title">排行榜</h1>
            
            <div class="card">
                <h3>🏆 寻宝大师排行榜</h3>
                <p>展示最优秀的寻宝冒险家们的成就</p>
                
                <div style="margin: 1rem 0;">
                    <label class="form-label">排序方式:</label>
                    <select v-model="sortBy" class="form-input" style="width: auto; display: inline-block; margin-left: 0.5rem;">
                        <option value="highScore">最高分</option>
                        <option value="completedGames">完成次数</option>
                        <option value="lastPlayedAt">最近游戏</option>
                    </select>
                </div>
                
                <table class="table">
                    <thead>
                        <tr>
                            <th>排名</th>
                            <th>用户名</th>
                            <th>最高分</th>
                            <th>完成次数</th>
                            <th>最近游戏</th>
                        </tr>
                    </thead>
                    <tbody>
                        <LeaderboardItem 
                            v-for="(user, index) in sortedUsers" 
                            :key="user.id"
                            :user="user"
                            :rank="index + 1" />
                    </tbody>
                </table>
                
                <div v-if="sortedUsers.length === 0" style="text-align: center; padding: 2rem; color: #8be9fd;">
                    暂无排行数据，快去游戏中创造记录吧！
                </div>
            </div>
            
            <div class="grid grid-3" style="margin-top: 2rem;">
                <div class="card">
                    <h4>📊 统计信息</h4>
                    <p><strong>总用户数:</strong> {{ totalUsers }}</p>
                    <p><strong>总游戏次数:</strong> {{ totalGames }}</p>
                    <p><strong>平均分数:</strong> {{ averageScore }}</p>
                </div>
                
                <div class="card">
                    <h4>🎯 今日之星</h4>
                    <div v-if="todaysBest">
                        <p><strong>{{ todaysBest.username }}</strong></p>
                        <p>最高分: {{ todaysBest.highScore }}</p>
                    </div>
                    <div v-else>
                        <p>暂无今日记录</p>
                    </div>
                </div>
                
                <div class="card">
                    <h4>🏅 成就徽章</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                        <span v-for="achievement in achievements" :key="achievement.name" 
                              :title="achievement.description"
                              style="background: rgba(255, 215, 0, 0.2); padding: 0.25rem 0.5rem; border-radius: 15px; font-size: 0.8rem;">
                            {{ achievement.icon }} {{ achievement.name }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `,
    setup() {
        const users = ref([]);
        const sortBy = ref('highScore');
        
        const sortedUsers = computed(() => {
            const filtered = users.value.filter(user => user.highScore > 0);
            
            return filtered.sort((a, b) => {
                switch (sortBy.value) {
                    case 'highScore':
                        return b.highScore - a.highScore;
                    case 'completedGames':
                        return b.completedGames - a.completedGames;
                    case 'lastPlayedAt':
                        return new Date(b.lastPlayedAt || 0) - new Date(a.lastPlayedAt || 0);
                    default:
                        return 0;
                }
            });
        });
        
        const totalUsers = computed(() => users.value.length);
        const totalGames = computed(() => users.value.reduce((sum, user) => sum + (user.completedGames || 0), 0));
        const averageScore = computed(() => {
            const validScores = users.value.filter(user => user.highScore > 0);
            if (validScores.length === 0) return 0;
            return Math.round(validScores.reduce((sum, user) => sum + user.highScore, 0) / validScores.length);
        });
        
        const todaysBest = computed(() => {
            const today = new Date().toDateString();
            const todayPlayers = users.value.filter(user => {
                return user.lastPlayedAt && new Date(user.lastPlayedAt).toDateString() === today;
            });
            
            if (todayPlayers.length === 0) return null;
            return todayPlayers.reduce((best, user) => {
                return user.highScore > (best.highScore || 0) ? user : best;
            });
        });
        
        const achievements = computed(() => {
            const result = [];
            
            if (totalUsers.value >= 10) {
                result.push({ icon: '👥', name: '人气王', description: '用户数达到10人' });
            }
            
            if (totalGames.value >= 50) {
                result.push({ icon: '🎮', name: '游戏达人', description: '总游戏次数达到50次' });
            }
            
            if (averageScore.value >= 800) {
                result.push({ icon: '⭐', name: '高手云集', description: '平均分数达到800分' });
            }
            
            const maxScore = Math.max(...users.value.map(u => u.highScore || 0));
            if (maxScore >= 900) {
                result.push({ icon: '🏆', name: '传奇大师', description: '有玩家达到900分以上' });
            }
            
            return result;
        });
        
        const loadUsers = () => {
            const savedUsers = localStorage.getItem('users');
            if (savedUsers) {
                users.value = JSON.parse(savedUsers);
            }
        };
        
        onMounted(() => {
            loadUsers();
        });
        
        return {
            users,
            sortBy,
            sortedUsers,
            totalUsers,
            totalGames,
            averageScore,
            todaysBest,
            achievements
        };
    }
};

// 路由配置
const routes = [
    { path: '/', component: HomePage },
    { path: '/game', component: TreasureGame },
    { path: '/users', component: UserManagement },
    { path: '/leaderboard', component: Leaderboard }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// 主应用组件
const App = {
    name: 'App',
    components: {
        Navbar,
        MusicManager
    },
    template: `
        <div id="app">
            <Navbar />
            <main class="main-container">
                <router-view />
            </main>
            <MusicManager />
        </div>
    `
};

// 创建并挂载应用
const app = createApp(App);
app.use(router);
app.mount('#app');
