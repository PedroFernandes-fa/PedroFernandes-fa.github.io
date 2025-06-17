// ====================================================================================
// GAME SETUP & GLOBAL VARIABLES
// ====================================================================================
// A variável 'canvas' agora é declarada em resize.js, então a removemos daqui.
let ctx;

const keys = {};
let   gameOver = false;
let   lastEnemySpawnTime = 0;
const enemySpawnInterval = 1000;
let   lastWaveTime = 0;
const waveInterval = 30000;

let gameState = { currentState: 'menu' };
let mouseX = 0, mouseY = 0;
let menuStartButton, menuCatalogButton, menuCreditsButton, menuConfigButton;
let pauseReturnButton, catalogBackButton, creditsBackButton, configBackButton, configResetDataButton, charSelectBackButton;
let pauseRestartButton, pauseCheatsButton, pauseCatalogButton, pauseConfigButton, gameOverRestartButton, gameOverMenuButton;

const weightedEnemyTypes = [];
let   hoveredCatalogWeapon = null;
let   totalGems = 0;
let   selectedCharacter = 'Guerreiro';

// Scroll state
let catalogScrollY = 0, catalogContentHeight = 0, isDraggingCatalogScrollbar = false;
let characterSelectScrollY = 0, characterSelectContentHeight = 0, isDraggingCharSelectScrollbar = false;

// Cheats
let cheatsUnlocked = false;
const konamiCode = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'b', 'a'];
let keySequence = [];
let cheats = { infiniteHealth: false, infiniteRerolls: false, difficultyOverride: -1, opCatalog: false, infiniteGems: false };

// Touch Controls State
let touchActive = false;
let joystickBase = { x: 0, y: 0 };
let joystickHead = { x: 0, y: 0 };
const joystickRadius = 50;

let inputMode = 'TECLADO'; // TECLADO or TOUCH

// ====================================================================================
// GAME LOGIC
// ====================================================================================
function setup() {
    // A linha 'canvas = document.getElementById('gameCanvas');' foi removida
    // pois a variável global 'canvas' de resize.js já contém a referência.
    if (!canvas) return; // Apenas verificamos se ela existe.
    ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Load settings
    loadGems();
    loadSettings();
    // Event Listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('wheel', handleMouseWheel);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    document.getElementById('main-title').innerText = _t('game_title');
    gameLoop();
}

function initGame() {
    lastTime = 0; // CRITICAL: Resets the game timer for the new game
    gameState = {
        player: new Player(canvas.width / 2, canvas.height / 2, 30, 3, 'white', selectedCharacter),
        enemies: [], projectiles: [], enemyProjectiles: [], experienceOrbs: [], bombs: [], explosions: [], fireTrails: [], gems: [], webs: [], temporaryPets: [],
        score: 0, gameTime: 0, difficultyLevel: 0, lastWeaponEffectDraw: {}, currentState: 'playing', selectedUpgradeIndex: 0, bossPhase: 'none', rerollsAvailable: 1
    };
    gameState.player.gems = totalGems;
    
    // Add starting weapon based on character
    let startingWeapon;
    switch(selectedCharacter) {
        case 'Guerreiro': 
            startingWeapon = new Machado();
            break;
        case 'Mago':
            startingWeapon = new ProjetilMagico();
            break;
        case 'Mestre das Feras':
            startingWeapon = new Lobos();
            break;
        case 'Bombadilho':
            startingWeapon = new Bombinhas();
            break;
        default:
            startingWeapon = new ProjetilMagico();
            break;
    }
    gameState.player.addWeapon(startingWeapon);
    
    gameOver = false;
    lastEnemySpawnTime = 0;
    lastWaveTime = 0;
    weightedEnemyTypes.length = 0;
    for (const type in ENEMY_DATA) { if(type !== 'Boss') for (let i = 0; i < ENEMY_DATA[type].spawnWeight; i++) weightedEnemyTypes.push(type); }
    spawnEnemy();
}

function update(deltaTime) {
    if (gameState.currentState !== 'playing' || gameOver) return;
    const timeSinceLastFrame = deltaTime || 16.67; gameState.gameTime += timeSinceLastFrame;
    const difficulty = cheats.difficultyOverride !== -1 ? cheats.difficultyOverride : Math.min(Math.floor(gameState.gameTime / 60000), ENEMY_TIERS.length - 1);
    if (difficulty > gameState.difficultyLevel) gameState.difficultyLevel = difficulty;
    if (gameState.gameTime > 250000 && gameState.bossPhase === 'none') { gameState.bossPhase = 'pending'; }
    if (gameState.bossPhase === 'pending' && gameState.enemies.length === 0) { spawnBoss(); gameState.bossPhase = 'active'; }
    
    // Handle movement
    const isMoving = gameState.player.move(keys, inputMode, { active: touchActive, base: joystickBase, head: joystickHead });

    if (gameState.player.health < gameState.player.maxHealth) { gameState.player.health += gameState.player.healthRegen * (timeSinceLastFrame / 1000); if (gameState.player.health > gameState.player.maxHealth) { gameState.player.health = gameState.player.maxHealth; } }
    
    if (Date.now() - lastEnemySpawnTime > enemySpawnInterval && gameState.bossPhase === 'none') { spawnEnemy(); lastEnemySpawnTime = Date.now(); }
    if (gameState.gameTime - lastWaveTime > waveInterval && gameState.bossPhase === 'none') { spawnWave(); lastWaveTime = gameState.gameTime; }

    gameState.enemies.forEach(e => { e.update(gameState.player, timeSinceLastFrame, gameState.enemyProjectiles, gameState.bombs); if(!e.isDashing && checkCollision(gameState.player, e)) gameState.player.takeDamage(e.damage); });
    
    gameState.player.weapons.forEach(w => {
        const ws = gameState.player.activeWeapons[w.name]; const wi = WEAPON_LEVEL_DATA[w.name][ws.level - 1]; const cd = wi.cooldown / (1 + gameState.player.cooldownReduction);
        if (Date.now() - ws.lastFired > cd) { if (w.attack) { w.attack(gameState.player, gameState.enemies, gameState.projectiles, wi, ws); ws.lastFired = Date.now(); } }
        if (w.name === "Pés Quentes" && isMoving && Date.now() - ws.lastFired > cd) { gameState.fireTrails.push({x: gameState.player.x, y: gameState.player.y, size: 15, damage: wi.damage * gameState.player.geralDamage * gameState.player.fireDamage, duration: wi.duration * gameState.player.durationBonus, createdAt: Date.now() }); ws.lastFired = Date.now(); }
        const orbitalWeapons = ["Esfera Orbitante", "Chamas Orbitais", "Frio Orbital", "Veneno Orbital"];
        if(orbitalWeapons.includes(w.name)){ w.angle += (wi.rotationSpeed * gameState.player.attackSpeed) * (timeSinceLastFrame/1000); for(let i=0; i<wi.numSpheres; i++){ const a = w.angle + (i*(Math.PI*2/wi.numSpheres)); const s = {x: gameState.player.x + Math.cos(a)*wi.orbitRadius, y: gameState.player.y + Math.sin(a)*wi.orbitRadius, size: wi.sphereSize}; gameState.enemies.forEach(e => { if(checkCollision(s, e) && (!e.lastHitByOrbit || Date.now() - e.lastHitByOrbit > 500)){
            if (w.name === 'Esfera Orbitante') { e.takeDamage(wi.damage * gameState.player.geralDamage * gameState.player.physicalDamage); }
            if (w.name === 'Chamas Orbitais')  { 
                e.takeDamage(wi.damage * gameState.player.geralDamage);
                if (!e.isBoss) { 
                    e.isOnFire = true; 
                    e.fireEndsAt = Date.now() + wi.fireDuration * gameState.player.durationBonus;
                }
            }
            if (w.name === 'Frio Orbital')     {
                e.takeDamage(wi.damage * gameState.player.geralDamage);
                if (!e.isBoss) {
                    e.isFrozen = true;
                    e.frozenUntil = Date.now() + wi.freezeDuration * gameState.player.durationBonus;
                }
            }
            if (w.name === 'Veneno Orbital')   {
                e.takeDamage(wi.damage * gameState.player.geralDamage);
                if (!e.isBoss) {
                    e.isPoisoned = true;
                    e.poisonDamage = wi.poisonDamage * gameState.player.poisonDamage; e.poisonEndsAt = Date.now() + wi.poisonDuration * gameState.player.durationBonus;
                }
            }
            e.lastHitByOrbit = Date.now();
        } }); } }
        const spiritWeapons = ["Espirito da Luz", "Espirito das Trevas"];
        if (spiritWeapons.includes(w.name)) { w.angle += (wi.rotationSpeed * gameState.player.attackSpeed) * (timeSinceLastFrame/1000); }
        const petWeapons = ["Aranha", "Lobos", "Touro"];
        if(petWeapons.includes(w.name) && w.updatePet) { w.updatePet(gameState.player, gameState.enemies, wi, timeSinceLastFrame); }
    });
    
    for (let i=gameState.temporaryPets.length-1; i>=0; i--) {
        const pet = gameState.temporaryPets[i];
        if (Date.now() - pet.createdAt > pet.lifespan || pet.shotsLeft <= 0) { gameState.temporaryPets.splice(i,1); continue; }
        if (Date.now() - pet.lastShot > pet.shotCooldown) {
            let targets = [...gameState.enemies].sort((a, b) => distance(pet.x, pet.y, a.x, a.y) - distance(pet.x, pet.y, b.x, b.y));
            if (targets[0]) {
                const angle = Math.atan2(targets[0].y - pet.y, targets[0].x - pet.x);
                gameState.projectiles.push({ type: 'standard', x: pet.x, y: pet.y, angle: angle, size: pet.projectileSize, color: pet.type === 'light' ? 'white' : 'indigo', speed: pet.speed, damage: pet.damage, enemiesHit: new Set() });
                pet.shotsLeft--;
                pet.lastShot = Date.now();
            }
        }
    }

    for (let i=gameState.projectiles.length-1; i>=0; i--) {
        const p = gameState.projectiles[i]; let remove = false;
        if (p.type === 'boomerang') { if (p.state === 'throwing') { p.x += Math.cos(p.angle)*p.speed; p.y += Math.sin(p.angle)*p.speed; p.distanceTraveled += p.speed; if (p.distanceTraveled >= p.range) p.state = 'returning'; } else { const returnAngle = Math.atan2(gameState.player.y - p.y, gameState.player.x - p.x); p.x += Math.cos(returnAngle)*p.speed; p.y += Math.sin(returnAngle)*p.speed; p.angle = returnAngle; if (distance(p.x, p.y, gameState.player.x, gameState.player.y) < 15) remove = true; } }
        else if (p.type === 'lightning') { if(Date.now() - p.createdAt > p.duration) remove = true; }
        else { p.x += Math.cos(p.angle)*p.speed; p.y += Math.sin(p.angle)*p.speed; }
        if(p.type === 'lightning' && p.chainsLeft > 0) {
                const aliveEnemies = gameState.enemies.filter(e => e.isAlive() && !p.enemiesHit.has(e.id));
                if (aliveEnemies.length > 0) {
                let closestEnemy = aliveEnemies.sort((a,b) => distance(p.x, p.y, a.x, a.y) - distance(p.x, p.y, b.x, b.y))[0];
                if(distance(p.x, p.y, closestEnemy.x, closestEnemy.y) < 150) {
                    closestEnemy.takeDamage(p.damage); p.enemiesHit.add(closestEnemy.id); p.chainsLeft--;
                        gameState.projectiles.push({ type: 'lightning_effect', startX: p.x, startY: p.y, endX: closestEnemy.x, endY: closestEnemy.y, duration: 100, createdAt: Date.now() });
                        p.x = closestEnemy.x; p.y = closestEnemy.y;
                        if(p.chainsLeft === 0) remove = true;
                }
                }
        }
        for (let j=gameState.enemies.length-1; j>=0; j--) {
            const e = gameState.enemies[j];
            if (checkCollision(p, e) && p.enemiesHit && !p.enemiesHit.has(e.id)) {
                e.takeDamage(p.damage); p.enemiesHit.add(e.id);
                if (p.type === 'freezing'  && !e.isBoss) { e.isFrozen = true; e.frozenUntil = Date.now() + p.freezeDuration; }
                if (p.type === 'poison'    && !e.isBoss) { e.isPoisoned = true; e.poisonDamage = p.poisonDamage; e.poisonEndsAt = Date.now() + p.poisonDuration; }
                if (p.type === 'standard'  || p.type  === 'freezing' || p.type === 'poison') { remove = true; break; } 
                if((p.type === 'piercing'  || p.type  === 'bull_charge') && p.enemiesHit.size >= p.pierceCount) { remove = true; break; }
                if (p.type === 'boomerang' && p.state === 'throwing') p.state = 'returning';
            }
        }
        if (remove || p.x<-50 || p.x>canvas.width+50 || p.y<-50 || p.y>canvas.height+50) gameState.projectiles.splice(i, 1);
    }
    
    for (let i=gameState.enemyProjectiles.length-1; i>=0; i--) {
            const p = gameState.enemyProjectiles[i]; p.x += Math.cos(p.angle) * p.speed; p.y += Math.sin(p.angle) * p.speed;
            if (p.type === 'exploding' && p.fuse) { p.fuse -= timeSinceLastFrame; if (p.fuse <= 0) { gameState.explosions.push({x: p.x, y: p.y, damage: p.explosionDamage, maxRadius: p.explosionRadius, currentRadius: 0, duration: 500, createdAt: Date.now(), fromPlayer: false }); gameState.enemyProjectiles.splice(i, 1); continue; } }
            if (checkCollision(gameState.player, p)) { gameState.player.takeDamage(p.damage); gameState.enemyProjectiles.splice(i, 1); continue; }
            if (p.x<-50 || p.x>canvas.width+50 || p.y<-50 || p.y>canvas.height+50) gameState.enemyProjectiles.splice(i, 1);
    }

    for (let i = gameState.bombs.length-1; i>=0; i--) { const b = gameState.bombs[i]; b.timer -= timeSinceLastFrame; if (b.timer <= 0) { gameState.explosions.push({x: b.x, y: b.y, damage: b.damage, maxRadius: b.radius, currentRadius: 0, duration: 500 * gameState.player.durationBonus, createdAt: Date.now(), fromPlayer: b.fromPlayer, type: b.type, freezeDuration: b.freezeDuration, fireDuration: b.fireDuration, fireDot: b.fireDot, poisonDuration: b.poisonDuration, poisonDot: b.poisonDot }); gameState.bombs.splice(i, 1); } }
    for (let i = gameState.explosions.length - 1; i >= 0; i--) {
        const e = gameState.explosions[i]; e.currentRadius = (e.maxRadius * ((Date.now() - e.createdAt) / e.duration));
        if (e.fromPlayer) { gameState.enemies.forEach(en => { if (distance(e.x,e.y,en.x,en.y) < e.currentRadius && (!en.hitByExplosion || en.hitByExplosion < e.createdAt)) { en.takeDamage(e.damage); en.hitByExplosion = e.createdAt; if(e.type === 'frozen' && !en.isBoss) { en.isFrozen = true; en.frozenUntil = Date.now() + e.freezeDuration; } if(e.type === 'incendiary' && !en.isBoss) { en.isOnFire = true; en.fireEndsAt = Date.now() + e.fireDuration; } if(e.type === 'poison' && !en.isBoss) { en.isPoisoned = true; en.poisonDamage = e.poisonDot; en.poisonEndsAt = Date.now() + e.poisonDuration; } } }); }
        else { if (distance(e.x, e.y, gameState.player.x, gameState.player.y) < e.currentRadius) { gameState.player.takeDamage(e.damage); } }
        if (Date.now() - e.createdAt > e.duration) gameState.explosions.splice(i, 1);
    }
    
    for (let i = gameState.webs.length - 1; i >= 0; i--) {
        const w = gameState.webs[i]; if (Date.now() - w.createdAt > w.duration) {
            gameState.webs.splice(i, 1);
            continue;
        } gameState.enemies.forEach(e => {
            if (!e.isBoss && !e.isWebbed && checkCollision(w, e)) {
                e.isWebbed = true;
                e.webbedUntil = Date.now() + 2000;
            }
        });
    }
    for (let i = gameState.fireTrails.length - 1; i >= 0; i--) {
        const f = gameState.fireTrails[i];
        if (Date.now() - f.createdAt > f.duration) {
            gameState.fireTrails.splice(i, 1);
            continue;
        } gameState.enemies.forEach(e => {if (checkCollision(f, e) && !e.isBoss) { e.takeDamage(f.damage * (timeSinceLastFrame/1000)); }}); }
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const e = gameState.enemies[i];
        if (!e.isAlive()) {
            if (e.isBoss) { 
                gameState.currentState = 'victory';
            }
            gameState.score += e.experienceValue;
            gameState.experienceOrbs.push({x: e.x, y: e.y, size: 8, value: e.experienceValue});
            if (Math.random() < e.gemChance) gameState.gems.push({x: e.x, y: e.y, size: 12, value: e.gemValue || 1});
            gameState.enemies.splice(i, 1);
        }
    }
    for (let i = gameState.experienceOrbs.length - 1; i >= 0; i--) {
        const o = gameState.experienceOrbs[i];
        const d = distance(gameState.player.x, gameState.player.y, o.x, o.y);
        if (d < gameState.player.collectionRadius) {
            const a = Math.atan2(gameState.player.y-o.y,gameState.player.x-o.x);
            o.x+=Math.cos(a)*3; o.y+=Math.sin(a)*3;
        }
        if (d < gameState.player.size/2+o.size/2) {
            gameState.player.addExperience(o.value);
            gameState.experienceOrbs.splice(i,1);
        }
    }
    for (let i = gameState.gems.length - 1; i >= 0; i--) {
        const c = gameState.gems[i];
        const d = distance(gameState.player.x, gameState.player.y, c.x, c.y);
        if (d < gameState.player.collectionRadius) {
            const a = Math.atan2(gameState.player.y-c.y,gameState.player.x-c.x);
            c.x+=Math.cos(a)*3.5; c.y+=Math.sin(a)*3.5;
        }
        if (d < gameState.player.size/2+c.size/2) {
            gameState.player.gems+=c.value;
            if(!cheats.infiniteGems) {
                totalGems += c.value;
                saveGems();
            }
            gameState.gems.splice(i,1);
        }
    }
    if (gameState.player.health <= 0) {
        gameState.currentState = 'gameOver';
        gameOver = true;
        }
}

// ====================================================================================
// INPUT HANDLING
// ====================================================================================
function handleMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    if(isDraggingCatalogScrollbar) {
        const scrollbar = getScrollbarLayout('catalog');
        const dy = mouseY - scrollbar.dragStartY;
        scrollbar.dragStartY = mouseY;
        const scrollPercent = dy / (scrollbar.trackHeight - scrollbar.thumbHeight);
        catalogScrollY += scrollPercent * scrollbar.maxScroll;
        catalogScrollY = Math.max(0, Math.min(catalogScrollY, scrollbar.maxScroll));
    }
    if(isDraggingCharSelectScrollbar) {
        const scrollbar = getScrollbarLayout('character_selection');
        const dy = mouseY - scrollbar.dragStartY;
        scrollbar.dragStartY = mouseY;
        const scrollPercent = dy / (scrollbar.trackHeight - scrollbar.thumbHeight);
        characterSelectScrollY += scrollPercent * scrollbar.maxScroll;
        characterSelectScrollY = Math.max(0, Math.min(characterSelectScrollY, scrollbar.maxScroll));
    }
}
function handleMouseDown(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    if (gameState.currentState === 'catalog') {
        const scrollbar = getScrollbarLayout('catalog');
        if(checkButtonClick(scrollbar.thumbRect)) {
            isDraggingCatalogScrollbar = true;
            scrollbar.dragStartY = mouseY;
        }
    }
    if (gameState.currentState === 'character_selection') {
        const scrollbar = getScrollbarLayout('character_selection');
        if(checkButtonClick(scrollbar.thumbRect)) {
            isDraggingCharSelectScrollbar = true;
            scrollbar.dragStartY = mouseY;
        }
    }
}
function handleMouseUp(event) {
    isDraggingCatalogScrollbar = false;
    isDraggingCharSelectScrollbar = false;
}

function handleMouseWheel(event) {
    event.preventDefault();
    if(gameState.currentState === 'catalog') {
        catalogScrollY += event.deltaY;
        const maxScroll = Math.max(0, catalogContentHeight - canvas.height + 150);
        catalogScrollY  = Math.max(0, Math.min(catalogScrollY, maxScroll));
    }
    if(gameState.currentState === 'character_selection') {
        characterSelectScrollY += event.deltaY;
        const maxScroll = Math.max(0, characterSelectContentHeight - canvas.height + 150);
        characterSelectScrollY = Math.max(0, Math.min(characterSelectScrollY, maxScroll));
    }
}

function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (gameState.currentState !== 'upgrading') keys[key] = true;
    if (!cheatsUnlocked) {
        keySequence.push(key);
        if (keySequence.length > konamiCode.length) {
            keySequence.shift();
        }
        if (keySequence.length === konamiCode.length) {
            let match = true;
            for(let i = 0; i < konamiCode.length; i++) {
                if(konamiCode[i] !== keySequence[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                cheatsUnlocked = true;
                alert('Cheats Desbloqueados!');
                keySequence = [];
            }
        }
    }
    switch (gameState.currentState) {
        case 'playing':
            if (key === 'escape' || key === ' ') {
                e.preventDefault();
                gameState.currentState = 'paused';
            }
            break;
        case 'paused': 
            if (key === 'escape' || key === ' ') {
                e.preventDefault();
                gameState.currentState = 'playing';
            }
            break;
        case 'upgrading':
            if (key === 'arrowup' || key === 'w') {
                e.preventDefault();
                gameState.selectedUpgradeIndex = Math.max(0, gameState.selectedUpgradeIndex - 1);
            }
            else if (key === 'arrowdown' || key === 's') {
                e.preventDefault();
                gameState.selectedUpgradeIndex = Math.min(gameState.player.upgradeChoices.length - 1, gameState.selectedUpgradeIndex + 1);
            }
            else if (key === 'enter' || key === ' ') {
                e.preventDefault();
                gameState.player.applyUpgrade(gameState.player.upgradeChoices[gameState.selectedUpgradeIndex]);
            }
            break;
    }
}

function handleTouchStart(event) {
    if (inputMode !== 'TOUCH' || gameState.currentState !== 'playing') return;
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    joystickBase.x = touch.clientX - rect.left;
    joystickBase.y = touch.clientY - rect.top;
    joystickHead.x = joystickBase.x;
    joystickHead.y = joystickBase.y;
    touchActive = true;
}

function handleTouchMove(event) {
    if (!touchActive || inputMode !== 'TOUCH') return;
    event.preventDefault();
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    let currentX = touch.clientX - rect.left;
    let currentY = touch.clientY - rect.top;

    const dist = distance(joystickBase.x, joystickBase.y, currentX, currentY);
    if (dist > joystickRadius) {
        const angle = Math.atan2(currentY - joystickBase.y, currentX - joystickBase.x);
        joystickHead.x = joystickBase.x + Math.cos(angle) * joystickRadius;
        joystickHead.y = joystickBase.y + Math.sin(angle) * joystickRadius;
    } else {
        joystickHead.x = currentX;
        joystickHead.y = currentY;
    }
}

function handleTouchEnd(event) {
    if (!touchActive || inputMode !== 'TOUCH') return;
    event.preventDefault();
    touchActive = false;
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    if (gameState.currentState === 'menu') {
        if (checkButtonClick(menuStartButton)) {
            gameState.currentState = 'character_selection';
            characterSelectScrollY = 0;
        }
        if (checkButtonClick(menuCatalogButton)) {
            gameState.currentState = 'catalog';
            catalogScrollY = 0;
            gameState.catalogReturnState = 'menu';
        }
        if (checkButtonClick(menuCreditsButton)) gameState.currentState = 'credits';
        if (checkButtonClick(menuConfigButton)) {
            gameState.currentState = 'configurations';
            gameState.configReturnState = 'menu';
        }
        return;
    }
        if (gameState.currentState === 'character_selection') {
        const { itemLayout } = getCharSelectLayout();
        const virtualMouseY  = mouseY + characterSelectScrollY;

        itemLayout.forEach(item => {
            const box = {x: item.x, y: item.y, width: item.w, height: item.h};
                if (mouseX > box.x && mouseX < box.x + box.width && virtualMouseY > box.y && virtualMouseY < box.y + box.height) {
                    selectedCharacter = item.name;
                    initGame();
                }
        });
        if (checkButtonClick(charSelectBackButton)) gameState.currentState = 'menu';
        return;
    }
    if (gameState.currentState === 'credits') {
        if (checkButtonClick(creditsBackButton)) gameState.currentState = 'menu';
        return;
    }
    if (gameState.currentState === 'configurations') {
        if (checkButtonClick(configBackButton)) gameState.currentState = gameState.configReturnState || 'menu';
        const fullscreenButton = { x: canvas.width / 2 - 150, y: 150, width: 300, height: 50 };
        const langButton       = { x: canvas.width / 2 - 150, y: 220, width: 300, height: 50 };
        const inputButton      = { x: canvas.width / 2 - 150, y: 290, width: 300, height: 50 };
        configResetDataButton  = { x: canvas.width / 2 - 150, y: 360, width: 300, height: 50 };

        if(checkButtonClick(fullscreenButton)) toggleFullScreen();
        if(checkButtonClick(langButton)) {
            currentLanguage = (currentLanguage === 'PORTUGUÊS') ? 'ENGLISH' : 'PORTUGUÊS';
            document.getElementById('main-title').innerText = _t('game_title');
            saveSettings();
        }
        if(checkButtonClick(inputButton)) {
            inputMode = (inputMode === 'TECLADO') ? 'TOUCH' : 'TECLADO';
            saveSettings();
        }
        if(checkButtonClick(configResetDataButton)) {
            if (confirm(_t('reset_data_confirm'))) {
                resetAllData();
            }
        }
        return;
    }
    if (gameState.currentState === 'catalog') {
        if (checkButtonClick(catalogBackButton)) {
            gameState.currentState = gameState.catalogReturnState || 'menu';
            return;
        }
        if (cheats.opCatalog && gameState.player) {
            const { itemLayout } = getCatalogLayout();
            const virtualMouseY = mouseY + catalogScrollY;
            for (const item of itemLayout) {
                if (mouseX > item.x && mouseX < item.x + item.w && virtualMouseY > item.y && virtualMouseY < item.y + item.h) {
                    const name = item.name;
                    const existingWeapon = gameState.player.weapons.find(w => w.name === name);
                    if (existingWeapon) {
                        const weaponState = gameState.player.activeWeapons[name];
                        if (weaponState.level < 5) {
                            weaponState.level++;
                            const weaponInstance = gameState.player.weapons.find(w => w.name === name);
                            const newStats = WEAPON_LEVEL_DATA[name][weaponState.level - 1];
                            Object.assign(weaponInstance, newStats);
                            if(weaponInstance.onLevelUp) weaponInstance.onLevelUp(gameState.player, weaponState.level);
                        }
                    } else if (gameState.player.weapons.length < 6) {
                        gameState.player.addWeapon(new WEAPON_TYPES[name]());
                    }
                    return;
                }
            }
        }
        return;
    }
    if (gameState.currentState === 'cheats') {
        if (checkButtonClick({x: canvas.width/2 - 150, y: canvas.height - 80, width: 300, height: 50})) gameState.currentState = 'paused';
        if (checkButtonClick({x: 50, y: 150, width: 300, height: 40})) cheats.infiniteHealth = !cheats.infiniteHealth;
        if (checkButtonClick({x: 50, y: 200, width: 300, height: 40})) {
            gameState.player.levelUp();
            gameState.currentState = 'upgrading';
        }
        if (checkButtonClick({x: 50,  y: 250, width: 300, height: 40})) cheats.infiniteRerolls = !cheats.infiniteRerolls;
        if (checkButtonClick({x: 50,  y: 300, width: 300, height: 40})) cheats.opCatalog       = !cheats.opCatalog;
        if (checkButtonClick({x: 450, y: 150, width: 300, height: 40})) cheats.difficultyOverride = (cheats.difficultyOverride + 2) % (ENEMY_TIERS.length + 1) -1;
        if (checkButtonClick({x: 450, y: 200, width: 300, height: 40})) {
            gameState.enemies = [];
            spawnBoss();
            gameState.bossPhase    = 'active';
            gameState.currentState = 'playing';
        }
        if (checkButtonClick({x: 450, y: 250, width: 300, height: 40})) cheats.infiniteGems = !cheats.infiniteGems;
        return;
    }
    if (gameOver) {
        if (checkButtonClick(gameOverMenuButton)) gameState = { currentState: 'menu' };
        if (checkButtonClick(gameOverRestartButton)) gameState.currentState = 'character_selection';
        return;
    }
    if (gameState.currentState === 'paused') {
        if (checkButtonClick(pauseReturnButton))  gameState.currentState = 'playing';
        if (checkButtonClick(pauseRestartButton)) gameState.currentState = 'character_selection';
        if (cheatsUnlocked && checkButtonClick(pauseCheatsButton)) gameState.currentState = 'cheats';
        if (checkButtonClick(pauseCatalogButton)) {
            gameState.currentState = 'catalog';
            catalogScrollY = 0;
            gameState.catalogReturnState = 'paused';
        }
        if (checkButtonClick(pauseConfigButton)) {
            gameState.currentState = 'configurations';
            gameState.configReturnState = 'paused';
        }
        if (checkButtonClick({ x: canvas.width / 2 - 100, y: canvas.height / 2 + 125, width: 200, height: 50})) gameState.currentState = 'menu';
        return;
    }
    if (gameState.currentState === 'upgrading') {
        const rerollButton = {x: canvas.width/2 - 75, y: canvas.height/2 + 130, width: 150, height: 40};
        if (checkButtonClick(rerollButton) && (gameState.rerollsAvailable > 0 || cheats.infiniteRerolls)) { if(!cheats.infiniteRerolls) gameState.rerollsAvailable--; gameState.player.generateUpgradeChoices(); }
        const clickX = mouseX;
        const clickY = mouseY;
        const choiceHeight = 80;
        const menuWidth = 450;
        const menuX  = canvas.width / 2 - menuWidth / 2;
        const startY = canvas.height / 2 - 120;
        for (let i = 0; i < gameState.player.upgradeChoices.length; i++) {
            const y = startY + i * choiceHeight;
            if (clickX > menuX && clickX < menuX + menuWidth && clickY > y && clickY < y + choiceHeight - 10) {
                gameState.player.applyUpgrade(gameState.player.upgradeChoices[i]);
                return;
            } 
        }
    }
}
function checkButtonClick(button) {return button && mouseX > button.x && mouseX < button.x + button.width && mouseY > button.y && mouseY < button.y + button.height; }

// ====================================================================================
// SPAWNING
// ====================================================================================
function spawnEnemy(typeOverride = null) {
    const side = getRandomInt(0, 3);
    let x, y;
    const padding = 50;
    switch (side) {
        case 0:
            x = getRandomInt(-padding, canvas.width + padding);
            y = -padding;
            break;
        case 1:
            x = canvas.width + padding;
            y = getRandomInt(-padding, canvas.height + padding);
            break;
        case 2:
            x = getRandomInt(-padding, canvas.width + padding);
            y = canvas.height + padding;
            break;
        case 3:
            x = -padding;
            y = getRandomInt(-padding, canvas.height + padding);
            break;
        }
    const enemyTypeKey = typeOverride || weightedEnemyTypes[getRandomInt(0, weightedEnemyTypes.length - 1)];
    const data = ENEMY_DATA[enemyTypeKey];
    const difficulty = cheats.difficultyOverride !== -1 ? cheats.difficultyOverride : gameState.difficultyLevel;
    const tier = ENEMY_TIERS[Math.min(difficulty, ENEMY_TIERS.length - 1)];
    gameState.enemies.push(new Enemy(x, y, 25, data, tier));
}
function spawnBoss() {
    gameState.enemies = [];
    const data = ENEMY_DATA['Boss'];
    const tier = ENEMY_TIERS[ENEMY_TIERS.length - 1];
    gameState.enemies.push(new Enemy(canvas.width/2, 100, 80, data, tier));
}
function spawnWave() {
    const count = getRandomInt(5, 10);
    for (let i = 0; i < count; i++) { spawnEnemy('Circle'); }
}

// ====================================================================================
// DRAWING (Main Function)
// ====================================================================================
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeTooltip = null;
    switch(gameState.currentState) {
        case 'menu':
            drawMainMenu();
            break;
        case 'character_selection':
            drawCharacterSelectionScreen();
            break;
        case 'credits':
            drawCreditsMenu();
            break;
        case 'configurations':
            drawConfigurationsMenu();
            break;
        case 'catalog':
            activeTooltip = drawCatalog();
            break;
        case 'cheats':
            drawCheatMenu();
            break;
        case 'playing': case 'paused': case 'upgrading':
            if (!gameState.player) return;
            gameState.webs.forEach(w => {
                const l=1-((Date.now()-w.createdAt)/w.duration);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.5*l})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(w.x, w.y, w.size/2, 0, Math.PI*2);
                ctx.stroke();
            });
            gameState.gems.forEach(c => {
                ctx.fillStyle = '#00ffcc';
                ctx.beginPath();
                ctx.moveTo(c.x, c.y - c.size * 0.6);
                ctx.lineTo(c.x - c.size / 2, c.y + c.size / 3);
                ctx.lineTo(c.x + c.size / 2, c.y + c.size / 3);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
            gameState.experienceOrbs.forEach(o => {
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
                ctx.fill();
            });
            gameState.fireTrails.forEach(f => {
                const l=1-((Date.now()-f.createdAt)/f.duration);
                ctx.fillStyle=`rgba(255,${getRandomInt(100,165)},0,${0.6*l})`;
                ctx.beginPath();
                ctx.arc(f.x,f.y,f.size/2,0,Math.PI*2);
                ctx.fill();
            });
            gameState.enemies.forEach(e => e.draw(ctx));
            gameState.enemyProjectiles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                if (p.type === 'exploding') {
                    const fusePercent = p.fuse / p.initialFuse;
                    ctx.fillStyle = `rgba(255, 0, 0, ${1 - fusePercent})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * (1 - fusePercent), 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            gameState.player.draw(ctx);
            gameState.projectiles.forEach(p => {
                if(p.type === 'lightning_effect') {
                    const life = 1 - (Date.now() - p.createdAt) / p.duration;
                    ctx.strokeStyle = `rgba(255, 255, 0, ${life})`;
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(p.startX, p.startY);
                    ctx.lineTo(p.endX, p.endY);
                    ctx.stroke();
                } else if(p.type === 'bull_charge') {
                    ctx.fillStyle = p.color;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle + Math.PI / 2);
                    ctx.beginPath();
                    ctx.moveTo(0, -p.size/2);
                    ctx.lineTo(-p.size/2, p.size/2);
                    ctx.lineTo(p.size/2, p.size/2);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }
                else {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle);
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
            gameState.bombs.forEach(b => {
                ctx.fillStyle= b.type === 'frozen' ? 'darkcyan' : b.type === 'incendiary' ? '#58181F' : b.type === 'poison' ? 'darkgreen' : 'black';
                ctx.beginPath();
                ctx.arc(b.x,b.y,b.size/2,0,Math.PI*2);
                ctx.fill();
                ctx.fillStyle = b.type === 'incendiary' ? 'orange' : b.type === 'poison' ? 'lime' : 'red';
                ctx.beginPath();
                ctx.arc(b.x,b.y,b.size/4,0,Math.PI*2);
                ctx.fill();
            });
            gameState.explosions.forEach(e => {
                const l=1-((Date.now()-e.createdAt)/e.duration);
                let color = e.type === 'frozen' ? `rgba(173, 216, 230, ${0.7*l})` : e.type === 'incendiary' ? `rgba(255, 100, 0, ${0.7*l})` : e.type === 'poison' ? `rgba(144, 238, 144, ${0.7*l})` :`rgba(255,120,0,${0.7*l})`;
                ctx.fillStyle= color;
                ctx.beginPath();
                ctx.arc(e.x,e.y,e.currentRadius,0,Math.PI*2);
                ctx.fill();
            });
            gameState.temporaryPets.forEach(pet => {
                const life = 1 - (Date.now() - pet.createdAt) / pet.lifespan;
                ctx.globalAlpha = life;
                ctx.fillStyle = pet.type === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(75, 0, 130, 0.8)';
                ctx.beginPath();
                ctx.arc(pet.x, pet.y, 8, 0, Math.PI*2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });
            gameState.player.weapons.forEach(w => {
                const e = gameState.lastWeaponEffectDraw[w.name];
                if (e && Date.now() - e.time < e.duration && w.drawEffect) w.drawEffect(ctx, gameState.player, e);
                const ws = gameState.player.activeWeapons[w.name];
                const wi = WEAPON_LEVEL_DATA[w.name][ws.level - 1];
                const orbitalWeapons = ["Esfera Orbitante", "Chamas Orbitais", "Frio Orbital", "Veneno Orbital"];
                if(orbitalWeapons.includes(w.name)){
                    for(let k=0; k<wi.numSpheres; k++){
                        const a = w.angle + (k*(Math.PI*2/wi.numSpheres));
                        if (w.name === "Esfera Orbitante") ctx.fillStyle='purple';
                        if (w.name === "Chamas Orbitais")  ctx.fillStyle='orange';
                        if (w.name === "Frio Orbital")     ctx.fillStyle='cyan';
                        if (w.name === "Veneno Orbital")   ctx.fillStyle='green';
                        ctx.beginPath();
                        ctx.arc(gameState.player.x+Math.cos(a)*wi.orbitRadius, gameState.player.y+Math.sin(a)*wi.orbitRadius, wi.sphereSize/2, 0, Math.PI*2);
                        ctx.fill();
                    } 
                }
                const spiritWeapons = ["Espirito da Luz", "Espirito das Trevas"];
                if(spiritWeapons.includes(w.name)){
                    const isAvatar = ws.level >= 5;
                    const radius = isAvatar ? wi.avatarOrbitRadius : wi.orbitRadius;
                    const spiritX = gameState.player.x + Math.cos(w.angle) * radius;
                    const spiritY = gameState.player.y + Math.sin(w.angle) * radius;
                    ctx.fillStyle = w.name === 'Espirito da Luz' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(75, 0, 130, 0.8)';
                    ctx.beginPath();
                    ctx.arc(spiritX, spiritY, isAvatar ? 15 : 10, 0, Math.PI*2);
                    ctx.fill();
                }
                if(w.name === 'Aranha') { w.spiders.forEach(spider => drawWeaponSymbol('Aranha', spider.x, spider.y)); }
                if(w.name === 'Lobos')  { w.wolves.forEach(wolf => drawWeaponSymbol('Lobos', wolf.x, wolf.y)); }
            });
            drawUI();
             if (touchActive) drawJoystick();
             // A lógica de fim de jogo foi movida para os estados específicos
             if (gameState.currentState === 'upgrading') drawUpgradeMenu();
             else if (gameState.currentState === 'paused') { activeTooltip = drawPauseMenu(); }
             break;
        case 'gameOver':
            drawGameOver();
            break;
        case 'victory':
            drawVictoryScreen();
            break;
    }
    if (activeTooltip) drawTooltip(activeTooltip);
}

// ====================================================================================
// MAIN GAME LOOP
// ====================================================================================
let lastTime = 0;
function gameLoop(currentTime = 0) {
    if (lastTime === 0) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    if (gameState.currentState === 'playing') update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

window.onload = setup;