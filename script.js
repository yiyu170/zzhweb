// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取页面元素
    const searchButton = document.querySelector('.search-box button');
    const searchInput = document.querySelector('.search-box input');
    const prevBtn = document.getElementById('prev-btn');
    const playBtn = document.getElementById('play-btn');
    const nextBtn = document.getElementById('next-btn');
    const progress = document.getElementById('progress');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const progressBar = document.querySelector('.progress-bar');
    const lyricsContainer = document.getElementById('lyrics-container');
    const lyricsBtn = document.getElementById('lyrics-btn');
    const lyricsModal = document.getElementById('lyrics-modal');
    const closeModal = document.querySelector('.close');
    const volumeSlider = document.getElementById('volume-slider'); // 音量滑块

    // 获取音频元素
    const audioPlayer = document.getElementById('audio-player');

    // 歌词数据
    const lyricsData = [
        { time: 2, text: "Ooh" },
        { time: 6, text: "I think I know" },
        { time: 13, text: "I'll touch that fire for you" },
        { time: 14, text: "I do that three four times again I testify for you" },
        { time: 18, text: "I told that lie I'd kill that *****" },
        { time: 19, text: "I do what all of them around you scared to do I'm not" },
        { time: 24, text: "Long as you juggin' out here for me I got it" },
        { time: 27, text: "Mobbin' schemin' lootin' hide your bodies" },
        { time: 30, text: "Long as you dreamin' 'bout me ain't no problem" },
        { time: 34, text: "I don't got nobody just with you right now" },
        { time: 37, text: "Tell the truth I look better under you" },
        { time: 39, text: "I can't lose when I'm with you" },
        { time: 45, text: "How can I snooze and miss the moment" },
        { time: 49, text: "You just too important" },
        { time: 50, text: "Nobody do body like you do" },
        { time: 53, text: "I can't lose when I'm with you" },
        { time: 59, text: "I can't just snooze and miss the moment" },
        { time: 62, text: "You just too important" },
        { time: 64, text: "Nobody do body like you do you do" },
        { time: 68, text: "In a droptop ride with you I feel like Scarface" },
        { time: 71, text: "Like that white ***** with the bob I'll be your main one" },
        { time: 75, text: "Let's take this argument back up to my place" },
        { time: 78, text: "Sex remind you I'm nonviolent I'm your day one" },
        { time: 81, text: "We ain't have **** yet it was magic yeah" },
        { time: 84, text: "Smash and grab **** yeah" },
        { time: 86, text: "Nasty habits take a hold when you not here" },
        { time: 89, text: "Ain't a home when you not here" },
        { time: 90, text: "Hard to grow when you not here I'm sayin'" },
        { time: 93, text: "I can't lose when I'm with you" },
        { time: 99, text: "How can I snooze and miss the moment" },
        { time: 102, text: "You just too important" },
        { time: 104, text: "Nobody do body like you do" },
        { time: 106, text: "I can't lose when I'm with you" },
        { time: 112, text: "How can I snooze and miss the moment" },
        { time: 117, text: "You just too important" },
        { time: 121, text: "Nobody do body like you do you do Main one ridin'" },
        { time: 123, text: "How you frontin' on me and I'm the main one tryin'" },
        { time: 126, text: "How you blame it on me and you the main one lyin'" },
        { time: 129, text: "How you threatenin' to leave and I'm the main one cryin'" },
        { time: 133, text: "Just tryna be your everything" },
        { time: 134, text: "Main one ridin'" },
        { time: 136, text: "How you frontin' on me and I'm the main one tryin'" },
        { time: 139, text: "How you blame it on me and you the main one lyin'" },
        { time: 142, text: "How you threatenin' to leave and I'm the main one cryin'" },
        { time: 146, text: "I can't lose when I'm with you" },
        { time: 151, text: "Like you like you" },
        { time: 153, text: "How can I snooze and miss the moment" },
        { time: 156, text: "You just too important" },
        { time: 158, text: "Nobody do body like you do" },
        { time: 160, text: "I can't lose when I'm with you" },
        { time: 166, text: "How can I snooze and miss the moment" },
        { time: 169, text: "You just too important" },
        { time: 171, text: "Nobody do body like you do you do" },
        { time: 176, text: "Nah nah nah nah" },
        { time: 181, text: "I think I know woah" },
        { time: 187, text: "See no I can't lose oh" },
        { time: 193, text: "" }
    ];

    // 当前高亮的歌词行索引
    let currentLyricIndex = -1;

    // 音量控制
    if (volumeSlider && audioPlayer) {
        volumeSlider.addEventListener('input', function() {
            audioPlayer.volume = this.value / 100;
        });
        
        // 初始化音量
        audioPlayer.volume = volumeSlider.value / 100;
    }

    // 点击歌词按钮弹出歌词框
    if (lyricsBtn && lyricsModal) {
        lyricsBtn.addEventListener('click', function() {
            lyricsModal.style.display = 'block';
        });
    }

    // 关闭弹出框
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            lyricsModal.style.display = 'none';
        });
    }

    // 点击弹出框外部区域关闭
    if (lyricsModal) {
        window.addEventListener('click', function(event) {
            if (event.target === lyricsModal) {
                lyricsModal.style.display = 'none';
            }
        });
    }

    // 播放/暂停功能
    if (playBtn && audioPlayer) {
        playBtn.addEventListener('click', function() {
            if (audioPlayer.paused) {
                audioPlayer.play()
                    .then(() => {
                        playBtn.textContent = '暂停';
                    })
                    .catch(error => {
                        console.error('播放失败:', error);
                        alert('播放失败，请检查音频文件是否存在');
                    });
            } else {
                audioPlayer.pause();
                playBtn.textContent = '播放';
            }
        });
    }

    // 音频播放完毕后重置按钮
    if (audioPlayer && playBtn) {
        audioPlayer.addEventListener('ended', function() {
            playBtn.textContent = '播放';
            resetLyrics();
        });
    }

    // 更新播放进度和歌词
    if (audioPlayer && progress && currentTimeEl) {
        audioPlayer.addEventListener('timeupdate', function() {
            const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progress.style.width = percent + '%';
            
            // 更新时间显示
            currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
            
            // 更新歌词显示
            updateLyrics(audioPlayer.currentTime);
        });
    }

    // 设置总时长
    if (audioPlayer && durationEl) {
        audioPlayer.addEventListener('loadedmetadata', function() {
            durationEl.textContent = formatTime(audioPlayer.duration);
        });
    }

    // 点击进度条跳转
    if (progressBar && audioPlayer) {
        progressBar.addEventListener('click', function(e) {
            const pos = (e.pageX - this.getBoundingClientRect().left) / this.offsetWidth;
            audioPlayer.currentTime = pos * audioPlayer.duration;
        });
    }

    // 格式化时间显示
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return min + ':' + (sec < 10 ? '0' : '') + sec;
    }

    // 更新歌词显示
    function updateLyrics(currentTime) {
        // 查找当前应该显示的歌词行
        let newIndex = -1;
        for (let i = 0; i < lyricsData.length; i++) {
            if (currentTime >= lyricsData[i].time) {
                newIndex = i;
            } else {
                break;
            }
        }

        // 如果当前行发生变化，则更新显示
        if (newIndex !== currentLyricIndex) {
            currentLyricIndex = newIndex;
            renderLyrics();
        }
    }

    // 渲染歌词
    function renderLyrics() {
        // 如果还没有歌词数据，先解析歌词
        if (lyricsContainer && lyricsContainer.querySelector('.lyrics-placeholder')) {
            lyricsContainer.innerHTML = '';
            lyricsData.forEach((line, index) => {
                const lyricElement = document.createElement('div');
                lyricElement.className = 'lyrics-line';
                lyricElement.textContent = line.text;
                lyricElement.dataset.time = line.time;
                lyricsContainer.appendChild(lyricElement);
            });
        }

        // 更新高亮行
        if (lyricsContainer) {
            const lyricLines = lyricsContainer.querySelectorAll('.lyrics-line');
            lyricLines.forEach((line, index) => {
                line.classList.remove('active');
                if (index === currentLyricIndex) {
                    line.classList.add('active');
                    // 滚动到当前歌词行（仅在弹出框显示时滚动）
                    if (lyricsModal && lyricsModal.style.display === 'block') {
                        line.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            });
        }
    }

    // 重置歌词显示
    function resetLyrics() {
        currentLyricIndex = -1;
        if (lyricsContainer) {
            const lyricLines = lyricsContainer.querySelectorAll('.lyrics-line');
            lyricLines.forEach(line => {
                line.classList.remove('active');
            });
        }
    }

    // 搜索功能
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            if (keyword) {
                alert(`搜索关键词: ${keyword}`);
            } else {
                alert('请输入搜索关键词');
            }
        });

        // 回车搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchButton.click();
            }
        });
    }

    // 上一首/下一首
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            alert('上一首');
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            alert('下一首');
        });
    }

    // 导航栏点击效果
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            alert(`切换到: ${this.textContent}`);
        });
    });

    // 歌手点击功能
    const singerItems = document.querySelectorAll('.singer-item');
    singerItems.forEach(item => {
        item.addEventListener('click', function() {
            const singerName = this.querySelector('p').textContent;
            alert(`查看歌手: ${singerName}`);
        });
    });

    // 排行榜点击功能
    const rankingItems = document.querySelectorAll('.ranking-item');
    rankingItems.forEach(item => {
        item.addEventListener('click', function() {
            const songName = this.querySelector('h4').textContent;
            // 点击排行榜项目时播放对应歌曲
            alert(`播放歌曲: ${songName}`);
        });
    });

    // 横幅点击功能
    const bannerItems = document.querySelectorAll('.banner-item');
    bannerItems.forEach(item => {
        item.addEventListener('click', function() {
            const albumName = this.querySelector('p').textContent;
            alert(`查看专辑: ${albumName}`);
        });
    });
});