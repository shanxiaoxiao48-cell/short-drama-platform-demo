// 模拟localStorage的行为
const fs = require('fs');
const path = require('path');

// 存储文件路径
const STORAGE_FILE = path.join(__dirname, 'localStorage.json');

// 默认演示项目数据
const defaultProjects = [
    {
        id: "DJ24010101",
        title: "霸道总裁爱上我",
        episodes: 80,
        languageCount: 4,
        remark: "优先处理，客户催促",
        createdAt: "2024-01-01",
        originalLanguage: "中文",
        videoType: "subtitle"
    },
    {
        id: "DJ23120101",
        title: "穿越之锦绣良缘",
        episodes: 60,
        languageCount: 1,
        remark: "已完成翻译",
        createdAt: "2023-12-01",
        originalLanguage: "中文",
        videoType: "subtitle"
    },
    {
        id: "DJ24011001",
        title: "重生之商业帝国",
        episodes: 100,
        languageCount: 1,
        remark: "",
        createdAt: "2024-01-10",
        originalLanguage: "中文",
        videoType: "subtitle"
    },
    {
        id: "DJ24011401",
        title: "豪门逆袭记",
        episodes: 50,
        languageCount: 0,
        remark: "新项目，待启动",
        createdAt: "2024-01-14",
        originalLanguage: "中文",
        videoType: "subtitle"
    },
    {
        id: "DJ24010501",
        title: "甜蜜复仇",
        episodes: 70,
        languageCount: 1,
        remark: "翻译进度正常",
        createdAt: "2024-01-05",
        originalLanguage: "中文",
        videoType: "subtitle"
    },
    {
        id: "DJ23110101",
        title: "都市修仙传",
        episodes: 120,
        languageCount: 1,
        remark: "全部完成",
        createdAt: "2023-11-01",
        originalLanguage: "中文",
        videoType: "subtitle"
    }
];

// 模拟localStorage
class MockLocalStorage {
    constructor() {
        this.data = {};
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(STORAGE_FILE)) {
                const content = fs.readFileSync(STORAGE_FILE, 'utf8');
                this.data = JSON.parse(content);
            }
        } catch (error) {
            console.error('Error loading storage:', error);
            this.data = {};
        }
    }

    save() {
        try {
            fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('Error saving storage:', error);
        }
    }

    getItem(key) {
        return this.data[key] || null;
    }

    setItem(key, value) {
        this.data[key] = value;
        this.save();
    }

    removeItem(key) {
        delete this.data[key];
        this.save();
    }

    clear() {
        this.data = {};
        this.save();
    }
}

// 创建模拟localStorage实例
const localStorage = new MockLocalStorage();

// 检查当前数据
function checkCurrentData() {
    console.log('检查当前项目数据...');
    
    try {
        const dramaProjects = localStorage.getItem('drama-projects');
        
        if (dramaProjects) {
            const projects = JSON.parse(dramaProjects);
            console.log(`当前项目数量: ${projects.length}`);
            
            // 检查默认项目是否存在
            defaultProjects.forEach(defaultProject => {
                const existingProject = projects.find(p => p.id === defaultProject.id);
                if (existingProject) {
                    console.log(`✓ 默认项目 ${defaultProject.id} - ${defaultProject.title} 存在`);
                } else {
                    console.log(`✗ 默认项目 ${defaultProject.id} - ${defaultProject.title} 缺失`);
                }
            });
            
            // 检查新创建的项目
            const newProject = projects.find(p => p.id === 'DJ26021201');
            if (newProject) {
                console.log(`✓ 新创建的项目 ${newProject.id} - ${newProject.title} 存在`);
                // 检查必要属性
                if (!newProject.originalLanguage) {
                    console.log(`✗ 新创建的项目缺少 originalLanguage 属性`);
                }
                if (!newProject.videoType) {
                    console.log(`✗ 新创建的项目缺少 videoType 属性`);
                }
            } else {
                console.log(`✗ 新创建的项目 DJ26021201 不存在`);
            }
            
            return projects;
        } else {
            console.log('localStorage 中没有 drama-projects 数据');
            return [];
        }
    } catch (error) {
        console.error(`错误: ${error.message}`);
        return [];
    }
}

// 修复项目数据
function fixProjectData() {
    console.log('\n开始修复项目数据...');
    
    try {
        // 获取当前项目数据
        let currentProjects = [];
        const savedProjects = localStorage.getItem('drama-projects');
        
        if (savedProjects) {
            currentProjects = JSON.parse(savedProjects);
            console.log(`当前有 ${currentProjects.length} 个项目`);
        } else {
            console.log('localStorage 中没有项目数据，将创建新数据');
        }
        
        // 确保所有默认项目存在
        defaultProjects.forEach(defaultProject => {
            const existingProject = currentProjects.find(p => p.id === defaultProject.id);
            if (!existingProject) {
                console.log(`添加缺失的默认项目: ${defaultProject.id} - ${defaultProject.title}`);
                currentProjects.push(defaultProject);
            } else {
                // 确保默认项目属性完整
                let updated = false;
                Object.keys(defaultProject).forEach(key => {
                    if (existingProject[key] === undefined || existingProject[key] === null) {
                        existingProject[key] = defaultProject[key];
                        updated = true;
                    }
                });
                if (updated) {
                    console.log(`更新默认项目属性: ${defaultProject.id} - ${defaultProject.title}`);
                }
            }
        });
        
        // 确保新创建的项目属性完整
        let newProject = currentProjects.find(p => p.id === 'DJ26021201');
        if (newProject) {
            let updated = false;
            if (!newProject.originalLanguage) {
                newProject.originalLanguage = '中文';
                updated = true;
            }
            if (!newProject.videoType) {
                newProject.videoType = 'subtitle';
                updated = true;
            }
            if (updated) {
                console.log(`更新新创建项目的属性: ${newProject.id} - ${newProject.title}`);
            }
        } else {
            // 添加新创建的项目
            newProject = {
                id: 'DJ26021201',
                title: '123',
                episodes: 2,
                languageCount: 0,
                remark: '-',
                createdAt: new Date().toISOString().split('T')[0],
                originalLanguage: '中文',
                videoType: 'subtitle'
            };
            currentProjects.unshift(newProject); // 添加到数组开头
            console.log(`添加新创建的项目: ${newProject.id} - ${newProject.title}`);
        }
        
        // 保存修复后的数据
        localStorage.setItem('drama-projects', JSON.stringify(currentProjects));
        console.log(`\n修复完成，保存了 ${currentProjects.length} 个项目`);
        
        // 显示修复后的数据
        console.log('\n修复后的数据:');
        console.log(JSON.stringify(currentProjects, null, 2));
        
        return currentProjects;
    } catch (error) {
        console.error(`修复过程中出错: ${error.message}`);
        return [];
    }
}

// 主函数
function main() {
    console.log('=== 项目数据修复工具 ===\n');
    
    // 检查当前数据
    checkCurrentData();
    
    // 修复数据
    const fixedProjects = fixProjectData();
    
    console.log('\n=== 修复完成 ===');
    
    // 验证修复结果
    console.log('\n验证修复结果:');
    checkCurrentData();
}

// 运行主函数
main();
