import * as THREE from 'three';

export class WeatherSystem {
    constructor(scene, renderer, lights) {
        this.scene = scene;
        this.renderer = renderer;
        this.lights = lights;
        this.timeOfDay = 'day';
        this.weather = 'sunny';
        
        // 存储天气效果对象
        this.effects = {
            rain: null,
            snow: null,
            clouds: null,
            fog: null,
            dust: null
        };
        
        this.setupControls();
        this.setupWeatherEffects();
    }

    setupControls() {
        const controls = document.createElement('div');
        controls.className = 'weather-controls';
        
        // 时间控制
        const timeGroup = document.createElement('div');
        timeGroup.className = 'button-group';
        
        const dayButton = this.createButton('day', '白天', 'fas fa-sun');
        const nightButton = this.createButton('night', '黑夜', 'fas fa-moon');
        
        timeGroup.appendChild(dayButton);
        timeGroup.appendChild(nightButton);
        
        // 天气控制
        const weatherGroup = document.createElement('div');
        weatherGroup.className = 'button-group';
        
        const weatherButtons = [
            ['sunny', '晴天', 'fas fa-sun'],
            ['cloudy', '多云', 'fas fa-cloud'],
            ['rainy', '雨天', 'fas fa-cloud-rain'],
            ['snowy', '雪天', 'fas fa-snowflake'],
            ['dusty', '沙尘', 'fas fa-wind'],
            ['foggy', '雾天', 'fas fa-smog']
        ];
        
        weatherButtons.forEach(([type, text, icon]) => {
            weatherGroup.appendChild(this.createButton(type, text, icon));
        });
        
        controls.appendChild(timeGroup);
        controls.appendChild(weatherGroup);
        document.body.appendChild(controls);
    }

    createButton(type, text, iconClass) {
        const button = document.createElement('button');
        button.className = `weather-button ${type} ${
            (type === 'day' || type === 'sunny') ? 'selected' : ''
        }`;
        
        const icon = document.createElement('i');
        icon.className = iconClass;
        
        const span = document.createElement('span');
        span.textContent = text;
        
        button.appendChild(icon);
        button.appendChild(span);
        
        button.addEventListener('click', () => this.handleWeatherChange(type));
        
        return button;
    }

    handleWeatherChange(type) {
        if (type === 'day' || type === 'night') {
            this.setTimeOfDay(type);
        } else {
            this.setWeather(type);
        }
    }

    setTimeOfDay(time) {
        this.timeOfDay = time;
        this.updateButtons('day', 'night', time);
        this.updateEnvironment();
    }

    setWeather(weather) {
        this.weather = weather;
        this.updateButtons('sunny', 'foggy', weather);
        this.updateEnvironment();
    }

    updateButtons(firstType, lastType, selectedType) {
        if (firstType === 'day' || firstType === 'night') {
            document.querySelectorAll('.weather-button.day, .weather-button.night')
                .forEach(button => {
                    button.classList.remove('selected');
                    if (button.classList.contains(selectedType)) {
                        button.classList.add('selected');
                    }
                });
        } else {
            document.querySelectorAll('.weather-button:not(.day):not(.night)')
                .forEach(button => {
                    button.classList.remove('selected');
                    if (button.classList.contains(selectedType)) {
                        button.classList.add('selected');
                    }
                });
        }
    }

    updateEnvironment() {
        // 更新光照
        if (this.timeOfDay === 'day') {
            if (this.weather === 'sunny') {
                // 晴天时增加光照强度
                this.lights.ambient.intensity = 1.0;  // 从 0.7 提高到 1.0
                this.lights.directional.intensity = 2.0;  // 从 1.5 提高到 2.0
                this.renderer.setClearColor(0x87CEEB);  // 保持天空蓝色
            } else {
                // 其他天气保持原有光照
                this.lights.ambient.intensity = 0.7;
                this.lights.directional.intensity = 1.5;
                this.renderer.setClearColor(0x87CEEB);
            }
        } else {
            // 夜晚光照保持不变
            this.lights.ambient.intensity = 0.3;
            this.lights.directional.intensity = 0.5;
            this.renderer.setClearColor(0x000022);
        }

        // 更新天气效果
        this.updateWeatherEffects();
    }

    setupWeatherEffects() {
        // 创建雨
        this.effects.rain = this.createRainEffect();
        
        // 创建雪
        this.effects.snow = this.createSnowEffect();
        
        // 创建云
        this.effects.clouds = this.createClouds();
        
        // 创建雾
        this.effects.fog = new THREE.Fog(0xcccccc, 1, 100);
        
        // 创建沙尘
        this.effects.dust = this.createDustEffect();

        // 初始时隐藏所有效果
        this.hideAllEffects();
    }

    createRainEffect() {
        const rainCount = 15000;
        const rainGeometry = new THREE.BufferGeometry();
        const rainPositions = new Float32Array(rainCount * 3);
        const rainVelocities = new Float32Array(rainCount);

        for (let i = 0; i < rainCount * 3; i += 3) {
            rainPositions[i] = Math.random() * 100 - 50;     // x
            rainPositions[i + 1] = Math.random() * 50;       // y
            rainPositions[i + 2] = Math.random() * 100 - 50; // z
            rainVelocities[i / 3] = 0.1 + Math.random() * 0.3;
        }

        rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        rainGeometry.setAttribute('velocity', new THREE.BufferAttribute(rainVelocities, 1));

        const rainMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        const rain = new THREE.Points(rainGeometry, rainMaterial);
        this.scene.add(rain);
        
        // 添加雨滴更新函数
        rain.update = () => {
            const positions = rain.geometry.attributes.position.array;
            const velocities = rain.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= velocities[i / 3];
                
                if (positions[i + 1] < -2) {
                    positions[i + 1] = 50;
                }
            }
            
            rain.geometry.attributes.position.needsUpdate = true;
        };

        return rain;
    }

    createSnowEffect() {
        const snowCount = 10000;
        const snowGeometry = new THREE.BufferGeometry();
        const snowPositions = new Float32Array(snowCount * 3);
        const snowVelocities = new Float32Array(snowCount);

        for (let i = 0; i < snowCount * 3; i += 3) {
            snowPositions[i] = Math.random() * 100 - 50;
            snowPositions[i + 1] = Math.random() * 50;
            snowPositions[i + 2] = Math.random() * 100 - 50;
            snowVelocities[i / 3] = 0.02 + Math.random() * 0.1;
        }

        snowGeometry.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));
        snowGeometry.setAttribute('velocity', new THREE.BufferAttribute(snowVelocities, 1));

        const snowMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.2,
            transparent: true,
            opacity: 0.8
        });

        const snow = new THREE.Points(snowGeometry, snowMaterial);
        this.scene.add(snow);

        snow.update = () => {
            const positions = snow.geometry.attributes.position.array;
            const velocities = snow.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
                positions[i + 1] -= velocities[i / 3];
                
                if (positions[i + 1] < -2) {
                    positions[i + 1] = 50;
                }
            }
            
            snow.geometry.attributes.position.needsUpdate = true;
        };

        return snow;
    }

    createClouds() {
        const clouds = new THREE.Group();
        
        // 创建更自然的云层
        const createCloudPart = (x, y, z, scale) => {
            const cloudGroup = new THREE.Group();
            const geometries = [
                new THREE.SphereGeometry(1, 16, 16),
                new THREE.SphereGeometry(0.8, 16, 16),
                new THREE.SphereGeometry(0.7, 16, 16),
                new THREE.SphereGeometry(0.6, 16, 16)
            ];

            geometries.forEach((geometry, i) => {
                const cloudMaterial = new THREE.MeshPhongMaterial({
                    color: 0xeeeeee,
                    transparent: true,
                    opacity: 0.8,
                    flatShading: true
                });
                const mesh = new THREE.Mesh(geometry, cloudMaterial);
                mesh.position.set(i * 0.5, Math.sin(i) * 0.2, i * 0.3);
                cloudGroup.add(mesh);
            });

            cloudGroup.position.set(x, y, z);
            cloudGroup.scale.set(scale, scale * 0.6, scale);
            return cloudGroup;
        };

        // 创建多层云
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 100 - 50;
            const y = Math.random() * 5 + 15;
            const z = Math.random() * 100 - 50;
            const scale = Math.random() * 3 + 2;
            
            clouds.add(createCloudPart(x, y, z, scale));
        }

        clouds.update = () => {
            clouds.children.forEach(cloud => {
                cloud.position.x += 0.02;
                cloud.rotation.y += 0.001;
                if (cloud.position.x > 50) cloud.position.x = -50;
            });
        };

        this.scene.add(clouds);
        return clouds;
    }

    createDustEffect() {
        const dustCount = 15000; // 增加粒子数量
        const dustGeometry = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(dustCount * 3);
        const dustVelocities = new Float32Array(dustCount);
        const dustSizes = new Float32Array(dustCount);

        for (let i = 0; i < dustCount * 3; i += 3) {
            dustPositions[i] = Math.random() * 100 - 50;
            dustPositions[i + 1] = Math.random() * 20;
            dustPositions[i + 2] = Math.random() * 100 - 50;
            dustVelocities[i / 3] = 0.1 + Math.random() * 0.2;
            dustSizes[i / 3] = Math.random() * 0.2 + 0.1;
        }

        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        dustGeometry.setAttribute('velocity', new THREE.BufferAttribute(dustVelocities, 1));
        dustGeometry.setAttribute('size', new THREE.BufferAttribute(dustSizes, 1));

        const dustMaterial = new THREE.PointsMaterial({
            color: 0xD2B48C,
            size: 0.2,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true
        });

        const dust = new THREE.Points(dustGeometry, dustMaterial);
        this.scene.add(dust);

        dust.update = () => {
            const positions = dust.geometry.attributes.position.array;
            const velocities = dust.geometry.attributes.velocity.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i / 3];
                positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.02;
                positions[i + 2] += Math.cos(Date.now() * 0.001 + i) * 0.02;
                
                if (positions[i] > 50) positions[i] = -50;
                if (positions[i + 1] > 20) positions[i + 1] = 0;
                if (positions[i + 2] > 50) positions[i + 2] = -50;
            }
            
            dust.geometry.attributes.position.needsUpdate = true;
            dust.rotation.y += 0.001;
        };

        return dust;
    }

    hideAllEffects() {
        Object.values(this.effects).forEach(effect => {
            if (effect && effect.visible !== undefined) {
                effect.visible = false;
            }
        });
        this.scene.fog = null;
    }

    updateWeatherEffects() {
        this.hideAllEffects();

        switch(this.weather) {
            case 'sunny':
                break;
            case 'cloudy':
                this.effects.clouds.visible = true;
                this.effects.clouds.update();
                break;
            case 'rainy':
                this.effects.clouds.visible = true;
                this.effects.rain.visible = true;
                this.effects.rain.update();
                this.effects.clouds.update();
                break;
            case 'snowy':
                this.effects.snow.visible = true;
                this.effects.snow.update();
                break;
            case 'dusty':
                this.effects.dust.visible = true;
                this.effects.dust.update();
                this.renderer.setClearColor(0xD2B48C);
                this.scene.fog = new THREE.Fog(0xD2B48C, 1, 30); // 添加沙尘雾效果
                break;
            case 'foggy':
                this.scene.fog = new THREE.Fog(0xcccccc, 0.1, 20); // 增加雾的浓度
                this.renderer.setClearColor(0xcccccc);
                break;
        }
    }
} 