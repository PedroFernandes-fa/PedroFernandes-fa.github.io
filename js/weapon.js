// ====================================================================================
// WEAPON CLASSES
// ====================================================================================
class Weapon { constructor(name) { this.name = name; } }

// AREA:
class Machado extends Weapon { 
    constructor() { super("Machado"); }
    attack(player, enemies, projectiles, weaponInstance) { 
        gameState.lastWeaponEffectDraw[this.name] = { time: Date.now(), duration: 200, range: weaponInstance.range}; 
        const damage = weaponInstance.damage * player.geralDamage * player.physicalDamage; 
        enemies.forEach( enemy => { if (distance(player.x, player.y, enemy.x, enemy.y) < weaponInstance.range) enemy.takeDamage(damage); });
    } 
    drawEffect(ctx, player, effectData) { 
        ctx.strokeStyle = 'brown'; 
        ctx.lineWidth   = 4; 
        ctx.beginPath(); 
        ctx.arc(player.x, player.y, effectData.range, 0, Math.PI * 2);
        ctx.stroke(); 
    } 
}
class Espada extends Weapon  { 
    constructor() { super("Espada"); }
    attack(player, enemies, projectiles, weaponInstance) { 
        gameState.lastWeaponEffectDraw[this.name] = { time: Date.now(), duration: 150, range: weaponInstance.range, angle: player.lastMoveAngle }; 
        const damage = weaponInstance.damage * player.geralDamage * player.physicalDamage;
        enemies.forEach(enemy => { const angleToEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x); 
            let angleDiff = Math.abs(player.lastMoveAngle - angleToEnemy); 
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff; 
            if (distance(player.x, player.y, enemy.x, enemy.y) < weaponInstance.range && angleDiff < Math.PI / 4) enemy.takeDamage(damage); 
        }); 
    } 
    drawEffect(ctx, player, effectData) { 
        ctx.fillStyle = 'rgba(200, 200, 255, 0.5)'; 
        ctx.beginPath(); ctx.moveTo(player.x, player.y); 
        ctx.arc(player.x, player.y, effectData.range, effectData.angle - Math.PI/4, effectData.angle + Math.PI/4); 
        ctx.closePath(); 
        ctx.fill(); 
    } 
}
class Chicote extends Weapon { 
    constructor() { super("Chicote"); }
    attack(player, enemies, projectiles, weaponInstance) { 
        gameState.lastWeaponEffectDraw[this.name] = { time: Date.now(), duration: 100, range: weaponInstance.range, angle: player.lastMoveAngle }; 
        const damage = weaponInstance.damage * player.geralDamage * player.physicalDamage; 
        enemies.forEach(enemy => { const angleToEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x); 
            let angleDiff = Math.abs(player.lastMoveAngle - angleToEnemy);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff; 
            if (distance(player.x, player.y, enemy.x, enemy.y) < weaponInstance.range && angleDiff < Math.PI / 5) enemy.takeDamage(damage); 
        }); 
    } 
    drawEffect(ctx, player, effectData) { 
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.7)'; 
        ctx.lineWidth = 6; ctx.beginPath(); 
        ctx.arc(player.x, player.y, effectData.range, effectData.angle - Math.PI / 5, effectData.angle + Math.PI / 5); 
        ctx.stroke(); 
    } 
}
class HotFeet extends Weapon { constructor() { super("Pés Quentes"); } }

// ORBITAIS:
class OrbitingSphere extends Weapon { constructor() { super("Esfera Orbitante"); this.angle = 0; } }
class ChamasOrbitais extends Weapon { constructor() { super("Chamas Orbitais");  this.angle = 0; } }
class FrioOrbital extends Weapon    { constructor() { super("Frio Orbital");     this.angle = 0; } }
class VenenoOrbital extends Weapon  { constructor() { super("Veneno Orbital");   this.angle = 0; } }

// BOMBAS:
class Bomb extends Weapon           { 
    constructor() { super("Bomba"); }
    attack(player, enemies, projectiles, weaponInstance) { 
        const angle = Math.random() * Math.PI * 2; 
        const dist  = getRandomInt(50, 150); gameState.bombs.push({ fromPlayer: true, x: player.x + Math.cos(angle) * dist, y: player.y + Math.sin(angle) * dist, timer: 1500, damage: weaponInstance.damage * player.geralDamage * player.explosiveDamage, radius: weaponInstance.radius, size: 15 }); 
    } 
}
class IncendiaryBomb extends Weapon { 
    constructor() { super("Bomba Incendiária"); } 
    attack(player, enemies, projectiles, weaponInstance) { 
        const angle = Math.random() * Math.PI * 2; 
        const dist = getRandomInt(40, 100); 
        gameState.bombs.push({ fromPlayer: true, type: 'incendiary', fireDuration: weaponInstance.fireDuration * player.durationBonus, x: player.x + Math.cos(angle) * dist, y: player.y + Math.sin(angle) * dist, timer: 1500, damage: weaponInstance.damage * player.geralDamage * player.explosiveDamage, fireDot: weaponInstance.fireDot * player.fireDamage, radius: weaponInstance.radius, size: 12 }); 
    } 
}
class FrozenBomb extends Weapon     { 
    constructor() { super("Bomba Congelada"); }   
    attack(player, enemies, projectiles, weaponInstance) { 
        const angle = Math.random() * Math.PI * 2; 
        const dist = getRandomInt(40, 100); 
        gameState.bombs.push({ fromPlayer: true, type: 'frozen', freezeDuration: weaponInstance.freezeDuration * player.durationBonus, x: player.x + Math.cos(angle) * dist, y: player.y + Math.sin(angle) * dist, timer: 1500, damage: weaponInstance.damage * player.geralDamage * player.explosiveDamage * player.iceDamage, radius: weaponInstance.radius, size: 12 }); 
    } 
}
class VenenoBomb extends Weapon     { 
    constructor() { super("Bomba de Veneno"); }   
    attack(player, enemies, projectiles, weaponInstance) { 
        const angle = Math.random() * Math.PI * 2; 
        const dist = getRandomInt(40, 100); 
        gameState.bombs.push({ fromPlayer: true, type: 'poison', poisonDuration: weaponInstance.poisonDuration * player.durationBonus, x: player.x + Math.cos(angle) * dist, y: player.y + Math.sin(angle) * dist, timer: 1500, damage: weaponInstance.damage * player.geralDamage * player.explosiveDamage, poisonDot: weaponInstance.poisonDot * player.poisonDamage, radius: weaponInstance.radius, size: 12 }); 
    } 
}
class Bombinhas extends Weapon      { 
    constructor() { super("Bombinhas"); }         
    attack(player, enemies, projectiles, weaponInstance) { 
        for (let i = 0; i < weaponInstance.numBombs; i++) { 
            const angle = Math.random() * Math.PI * 2; 
            const dist = getRandomInt(40, 200); 
            gameState.bombs.push({ fromPlayer: true, x: player.x + Math.cos(angle) * dist, y: player.y + Math.sin(angle) * dist, timer: 1200, damage: weaponInstance.damage * player.geralDamage * player.explosiveDamage, radius: weaponInstance.radius, size: 8 }); 
        } 
    } 
}

// PROJETEIS:
class ProjetilMagico extends Weapon { 
    constructor() { super("Projetil Mágico"); }   
    attack(player, enemies, projectiles, weaponInstance) { 
        if (enemies.length === 0) return; 
        let targets = [...enemies].sort((a, b) => distance(player.x, player.y, a.x, a.y) - distance(player.x, player.y, b.x, b.y)); 
        for(let i=0; i < weaponInstance.numProjectiles && i < targets.length; i++){ 
            const angle = Math.atan2(targets[i].y - player.y, targets[i].x - player.x); 
            projectiles.push({ type: 'standard', x: player.x, y: player.y, angle: angle, size: weaponInstance.projectileSize, color: 'cyan', speed: weaponInstance.projectileSpeed * player.attackSpeed, damage: weaponInstance.damage * player.geralDamage * player.magicDamage, enemiesHit: new Set() }); 
        } 
    } 
}
class IceShard extends Weapon       { 
    constructor() { super("Fragmento de Gelo"); } 
    attack(player, enemies, projectiles, weaponInstance) { 
        if (enemies.length === 0) return; 
        let targets = [...enemies].sort((a, b) => distance(player.x, player.y, a.x, a.y) - distance(player.x, player.y, b.x, b.y)); 
        for(let i=0; i < weaponInstance.numProjectiles && i < targets.length; i++){ 
            const angle = Math.atan2(targets[i].y - player.y, targets[i].x - player.x); projectiles.push({ type: 'freezing', x: player.x, y: player.y, angle: angle, size: weaponInstance.projectileSize, color: '#ADD8E6', speed: weaponInstance.projectileSpeed * player.attackSpeed, damage: weaponInstance.damage * player.geralDamage * player.iceDamage, freezeDuration: weaponInstance.freezeDuration * player.durationBonus, enemiesHit: new Set() }); 
        } 
    } 
}
class PoisonShot extends Weapon     { 
    constructor() { super("Tiro Envenenado"); }   
    attack(player, enemies, projectiles, weaponInstance) { 
        if (enemies.length === 0) return; 
        let targets = [...enemies].sort((a, b) => distance(player.x, player.y, a.x, a.y) - distance(player.x, player.y, b.x, b.y)); 
        for(let i=0; i < weaponInstance.numProjectiles && i < targets.length; i++){ 
            const angle = Math.atan2(targets[i].y - player.y, targets[i].x - player.x); projectiles.push({ type: 'poison', x: player.x, y: player.y, angle: angle, size: weaponInstance.projectileSize, color: '#90ee90', speed: weaponInstance.projectileSpeed * player.attackSpeed, damage: weaponInstance.damage * player.geralDamage, poisonDamage: weaponInstance.poisonDamage * player.poisonDamage, poisonDuration: weaponInstance.poisonDuration * player.durationBonus, enemiesHit: new Set() }); 
        } 
    } 
}
class Bumerangue extends Weapon     { 
    constructor() { super("Bumerangue"); }        
    attack(player, enemies, projectiles, weaponInstance) { 
        if (enemies.length === 0) return; 
        let targets = [...enemies].sort((a, b) => distance(player.x, player.y, a.x, a.y) - distance(player.x, player.y, b.x, b.y)); 
        for (let i = 0; i < weaponInstance.numProjectiles && i < targets.length; i++) { 
            const angle = Math.atan2(targets[i].y - player.y, targets[i].x - player.x); projectiles.push({ type: 'boomerang', x: player.x, y: player.y, angle: angle, size: weaponInstance.projectileSize, color: 'lightblue', speed: weaponInstance.projectileSpeed * player.attackSpeed, damage: weaponInstance.damage * player.geralDamage * player.physicalDamage, state: 'throwing', range: weaponInstance.range, distanceTraveled: 0, enemiesHit: new Set() }); 
        } 
    } 
}
class Perfuradora extends Weapon    { 
    constructor() { super("Perfuradora"); }       
    attack(player, enemies, projectiles, weaponInstance) { 
        if (enemies.length === 0) return; 
        let targets = [...enemies].sort((a, b) => distance(player.x, player.y, a.x, a.y) - distance(player.x, player.y, b.x, b.y)); 
        for (let i = 0; i < weaponInstance.numProjectiles && i < targets.length; i++) { 
            const angle = Math.atan2(targets[i].y - player.y, targets[i].x - player.x); projectiles.push({ type: 'piercing', x: player.x, y: player.y, angle: angle, size: weaponInstance.projectileSize, color: 'yellow', speed: weaponInstance.projectileSpeed * player.attackSpeed, damage: weaponInstance.damage * player.geralDamage * player.physicalDamage, pierceCount: weaponInstance.pierceCount, enemiesHit: new Set() }); 
        } 
    } 
}
class Raio extends Weapon           { 
    constructor() { super("Raio"); }              
    attack(player, enemies, projectiles, weaponInstance) { 
        if (enemies.length === 0) return; 
        let target  = [...enemies].sort((a, b) => distance(player.x, player.y, a.x, a.y) - distance(player.x, player.y, b.x, b.y))[0]; 
        if(target) projectiles.push({ type: 'lightning', x: target.x, y: target.y, damage: weaponInstance.damage * player.geralDamage * player.magicDamage, chainsLeft: weaponInstance.chains, enemiesHit: new Set([target.id]), lastX: player.x, lastY: player.y, duration: 200, createdAt: Date.now() }); 
    } 
}

// PETS:
class EspiritoDaLuz extends Weapon {
    constructor() {
        super("Espirito da Luz");
        this.angle = 0;
    }

    attack(player, enemies, projectiles, weaponInstance, weaponState) {
        if (enemies.length === 0) return;
        let targets = [...enemies].filter(e => e.isAlive()).sort((a, b) => distance(player.x, player.y, a.x, a.y) - distance(player.x, player.y, b.x, b.y));
        const spiritX = player.x + Math.cos(this.angle) * weaponInstance.orbitRadius;
        const spiritY = player.y + Math.sin(this.angle) * weaponInstance.orbitRadius;
        
        if (targets[0]) {
            const angleToEnemy = Math.atan2(targets[0].y - spiritY, targets[0].x - spiritX);
            const proj = {
                type: 'standard', x: spiritX, y: spiritY, angle: angleToEnemy, size: weaponInstance.projectileSize, 
                color: 'white', speed: weaponInstance.projectileSpeed * player.attackSpeed, 
                damage: weaponInstance.damage * player.geralDamage * player.petDamage, 
                enemiesHit: new Set()
            };

            if (weaponState.level >= 5) {
                proj.type = 'exploding_on_impact';
                proj.explosionRadius = weaponInstance.explosionRadius;
                proj.explosionDamage = weaponInstance.explosionDamage * player.geralDamage * player.petDamage * player.explosiveDamage;
            }

            projectiles.push(proj);
        }
    }
}
class EspiritoDasTrevas extends Weapon {
    constructor() {
        super("Espirito das Trevas");
        this.angle = 0;
    }

    attack(player, enemies, projectiles, weaponInstance, weaponState) {
        if (enemies.length === 0) return;
        let targets = [...enemies].filter(e => e.isAlive()).sort((a, b) => distance(player.x, player.y, a.x, a.y) - distance(player.x, player.y, b.x, b.y));
        const spiritX = player.x + Math.cos(this.angle) * weaponInstance.orbitRadius;
        const spiritY = player.y + Math.sin(this.angle) * weaponInstance.orbitRadius;
        
        if (targets[0]) {
            const angleToEnemy = Math.atan2(targets[0].y - spiritY, targets[0].x - spiritX);
            const proj = {
                type: 'standard', x: spiritX, y: spiritY, angle: angleToEnemy, size: weaponInstance.projectileSize, 
                color: 'indigo', speed: weaponInstance.projectileSpeed * player.attackSpeed, 
                damage: weaponInstance.damage * player.geralDamage * player.petDamage, 
                enemiesHit: new Set()
            };

            if (weaponState.level >= 5) {
                proj.type = 'exploding_on_impact';
                proj.explosionRadius = weaponInstance.explosionRadius;
                proj.explosionDamage = weaponInstance.explosionDamage * player.geralDamage * player.petDamage * player.explosiveDamage;
            }

            projectiles.push(proj);
        }
    }
}
class Aranha extends Weapon {
    constructor() { super("Aranha"); }
    init(player) { this.spiders = []; this.addSpider(player); }
    onLevelUp(player, level) { if (level === 2 || level === 5) this.addSpider(player); }
    addSpider(player) { this.spiders.push({ x: player.x, y: player.y, angle: Math.random() * Math.PI * 2, lastWeb: 0, id: Math.random() }); }
    updatePet(player, enemies, weaponInstance, deltaTime) {
        this.spiders.forEach(spider => {
            const distFromPlayer = distance(spider.x, spider.y, player.x, player.y);
            const leashDistance = 200, personalSpace = 50;  
            if (distFromPlayer > leashDistance) { spider.angle = Math.atan2(player.y - spider.y, player.x - spider.x); }
            else if (distFromPlayer < personalSpace) { spider.angle = Math.atan2(spider.y - player.y, spider.x - player.x); }
            else if (Math.random() < 0.05) { spider.angle += (Math.random() - 0.5) * Math.PI / 2; }
            if (spider.x < 10 || spider.x > canvas.width - 10 || spider.y < 10 || spider.y > canvas.height - 10) { spider.angle = Math.atan2(player.y - spider.y, player.x - spider.x); }
            spider.x += Math.cos(spider.angle) * weaponInstance.speed * (deltaTime / 16.67);
            spider.y += Math.sin(spider.angle) * weaponInstance.speed * (deltaTime / 16.67);
            enemies.forEach(e => {
                if (checkCollision({ ...spider, size: weaponInstance.petSize }, e) && (!e.lastHitBySpider || !e.lastHitBySpider[spider.id] || Date.now() - e.lastHitBySpider[spider.id] > 500)) {
                    e.takeDamage(weaponInstance.damage * player.geralDamage * player.petDamage);
                    if (!e.lastHitBySpider) e.lastHitBySpider = {};
                    e.lastHitBySpider[spider.id] = Date.now();
                }
            });
            if (Date.now() - spider.lastWeb > weaponInstance.webCooldown) {
                gameState.webs.push({ x: spider.x, y: spider.y, size: weaponInstance.webSize, duration: weaponInstance.webDuration, createdAt: Date.now() });
                spider.lastWeb = Date.now();
            }
        });
    }
    drawPet(ctx) { this.spiders.forEach(spider => drawWeaponSymbol('Aranha', spider.x, spider.y)); }
}
class Touro extends Weapon {
    constructor() { super("Touro"); }
    init(player) {
        this.bull = { id: Math.random(), state: 'idle', chargeTimer: 0, x: player.x, y: player.y, chargeAngle: 0, chargeDistance: 0, maxChargeDistance: 600 };
    }
    updatePet(player, enemies, weaponInstance, deltaTime) {
        if (!this.bull) this.init(player);
        const bull = this.bull;
        if (bull.x < 0 || bull.x > canvas.width || bull.y < 0 || bull.y > canvas.height) bull.state = 'returning';
        if (bull.state === 'returning') {
            const angle = Math.atan2(player.y - bull.y, player.x - bull.x);
            bull.x += Math.cos(angle) * weaponInstance.speed * (deltaTime / 16.67);
            bull.y += Math.sin(angle) * weaponInstance.speed * (deltaTime / 16.67);
            if (distance(bull.x, bull.y, player.x, player.y) < player.size + 20) bull.state = 'idle';
            return;
        }
        if (bull.state === 'idle') {
            const distToPlayer = distance(bull.x, bull.y, player.x, player.y);
            if (distToPlayer > 80) {
                const angleToPlayer = Math.atan2(player.y - bull.y, player.x - bull.x);
                bull.x += Math.cos(angleToPlayer) * (player.speed * 0.9) * (deltaTime / 16.67);
                bull.y += Math.sin(angleToPlayer) * (player.speed * 0.9) * (deltaTime / 16.67);
            }
            bull.chargeTimer += deltaTime;
            if (bull.chargeTimer >= weaponInstance.cooldown) {
                if (enemies.length > 0) {
                    const target = [...enemies].filter(e => e.isAlive()).sort((a, b) => distance(bull.x, bull.y, a.x, a.y) - distance(bull.x, bull.y, b.x, b.y))[0];
                    if (target) {
                        bull.state = 'charging';
                        bull.chargeTimer = 0;
                        bull.chargeDistance = 0;
                        bull.chargeAngle = Math.atan2(target.y - bull.y, target.x - bull.x);
                    }
                }
            }
        }
        if (bull.state === 'charging') {
            bull.x += Math.cos(bull.chargeAngle) * weaponInstance.speed * (deltaTime / 16.67);
            bull.y += Math.sin(bull.chargeAngle) * weaponInstance.speed * (deltaTime / 16.67);
            bull.chargeDistance += weaponInstance.speed * (deltaTime / 16.67);
            enemies.forEach(e => {
                if (checkCollision({ ...bull, size: weaponInstance.petSize }, e) && (!e.lastHitByBull || Date.now() - e.lastHitByBull > 500)) {
                    e.takeDamage(weaponInstance.damage * player.geralDamage * player.petDamage);
                    e.lastHitByBull = Date.now();
                }
            });
            if (bull.chargeDistance > bull.maxChargeDistance) bull.state = 'returning';
        }
    }
    drawPet(ctx) { if (this.bull) drawWeaponSymbol('Touro', this.bull.x, this.bull.y); }
}
class Lobos extends Weapon {
    constructor() { super("Lobos"); }
    init(player) { this.wolves = []; this.addWolf(player); }
    onLevelUp(player, level) { if (level === 2 || level === 5) this.addWolf(player); }
    addWolf(player) { this.wolves.push({ x: player.x, y: player.y, id: Math.random() }); }
    updatePet(player, enemies, weaponInstance, deltaTime) {
        if (enemies.length === 0) {
            this.wolves.forEach(wolf => {
                const distToPlayer = distance(wolf.x, wolf.y, player.x, player.y);
                if (distToPlayer > 100) {
                    const angle = Math.atan2(player.y - wolf.y, player.x - wolf.x);
                    wolf.x += Math.cos(angle) * weaponInstance.speed * (deltaTime / 16.67);
                    wolf.y += Math.sin(angle) * weaponInstance.speed * (deltaTime / 16.67);
                }
            });
            return;
        }
        this.wolves.forEach(wolf => {
            let targets = [...enemies].filter(e => e.isAlive()).sort((a, b) => distance(wolf.x, wolf.y, a.x, a.y) - distance(wolf.x, wolf.y, b.x, b.y));
            if (targets.length > 0) {
                const target = targets[0];
                const angle = Math.atan2(target.y - wolf.y, target.x - wolf.x);
                wolf.x += Math.cos(angle) * weaponInstance.speed * (deltaTime / 16.67); wolf.y += Math.sin(angle) * weaponInstance.speed * (deltaTime / 16.67);
                if (checkCollision({ ...wolf, size: weaponInstance.petSize }, target) && (!target.lastHitByWolf || !target.lastHitByWolf[wolf.id] || Date.now() - target.lastHitByWolf[wolf.id] > 500)) {
                    target.takeDamage(weaponInstance.damage * player.geralDamage * player.petDamage);
                    if (!target.lastHitByWolf) target.lastHitByWolf = {}; target.lastHitByWolf[wolf.id] = Date.now();
                }
            }
        });
    }
    drawPet(ctx) { this.wolves.forEach(wolf => drawWeaponSymbol('Lobos', wolf.x, wolf.y)); }
}


const WEAPON_TYPES = { 'Machado': Machado, 'Espada': Espada, 'Chicote': Chicote, 'Projetil Mágico': ProjetilMagico, 'Fragmento de Gelo': IceShard, 'Tiro Envenenado': PoisonShot, 'Bomba': Bomb, 'Bomba Incendiária': IncendiaryBomb, 'Bomba Congelada': FrozenBomb, 'Bomba de Veneno': VenenoBomb, 'Bombinhas': Bombinhas, 'Esfera Orbitante': OrbitingSphere, 'Chamas Orbitais': ChamasOrbitais, 'Frio Orbital': FrioOrbital, 'Veneno Orbital': VenenoOrbital, 'Pés Quentes': HotFeet, 'Bumerangue': Bumerangue, 'Perfuradora': Perfuradora, 'Raio': Raio, 'Espirito da Luz': EspiritoDaLuz, 'Espirito das Trevas': EspiritoDasTrevas, 'Aranha': Aranha, 'Touro': Touro, 'Lobos': Lobos };