class Player {
    constructor(x, y, size, speed, color, character) {
        this.x = x;
        this.y = y;
        this.size  = size;
        this.speed = speed;
        this.color = color;
        this.health       = 100;
        this.maxHealth    = 100;
        this.healthRegen  = 0.25;
        this.experience   = 0;
        this.level        = 1;
        this.nextLevelExp = 100;
        this.collectionRadius = 100;
        this.gems = 0;
        this.weapons = [];
        this.activeWeapons  = {};
        this.upgradeChoices = [];
        this.lastMoveAngle  = 0;
        this.lastDamageTime = 0;
        this.invincibilityDuration = 500; // 0.5 seconds
        this.character = character;

        // Base Stats & Character Boosts
        this.geralDamage       = 1.0;
        this.physicalDamage    = 1.0;
        this.magicDamage       = 1.0;
        this.explosiveDamage   = 1.0;
        this.fireDamage        = 1.0;
        this.iceDamage         = 1.0;
        this.poisonDamage      = 1.0;
        this.petDamage         = 1.0;
        this.durationBonus     = 1.0;
        this.cooldownReduction = 1.0;
        this.attackSpeed       = 1.0;

        // Apply character boosts
        switch(this.character) {
            case 'Guerreiro':
                this.physicalDamage  += 0.2;
                break;
            case 'Mago':
                this.magicDamage     += 0.2;
                break;
            case 'Mestre das Feras':
                this.petDamage       += 0.2;
                break;
            case 'Bombadilho':
                this.explosiveDamage += 0.2;
                break;
        }
    }
    draw(ctx) {
        const isInvincible = Date.now() - this.lastDamageTime < this.invincibilityDuration;
        if (isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {return;} // Flicker effect by skipping draw calls
        
        // Draw Character Sprite
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(this.x, this.y);
        switch(this.character) {
            case 'Guerreiro':
                ctx.fillStyle = '#C0C0C0'; // Silver
                ctx.beginPath();
                ctx.moveTo(0,   -20);
                ctx.lineTo(-15, -10);
                ctx.lineTo(15,  -10);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#FFD700'; // Gold horns
                ctx.beginPath();
                ctx.moveTo(-15, -10);
                ctx.lineTo(-20, -18);
                ctx.lineTo(-12, -12);
                ctx.fill();
                ctx.moveTo(15, -10);
                ctx.lineTo(20, -18);
                ctx.lineTo(12, -12);
                ctx.fill();
                break;
            case 'Mago':
                ctx.fillStyle = 'blue';
                ctx.beginPath();
                ctx.moveTo(0,   -30);
                ctx.lineTo(-15, -10);
                ctx.lineTo(15,  -10);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(0, -25, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'Mestre das Feras':
                ctx.fillStyle = '#8B4513'; // Brown
                ctx.beginPath();
                ctx.arc(-10, -15, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(10, -15, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'Bombadilho':
                ctx.fillStyle = 'black';
                ctx.fillRect(-15, -10, 30, 12);
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(-7, -4, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(7, -4, 3, 0, Math.PI*2);
                ctx.fill();
                break;
        }
        ctx.restore();


        const barWidth = this.size * 1.5;
        const barX = this.x - barWidth  / 2;
        const barY = this.y - this.size / 2 - 15;
        const barHeight = 7;
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = 'lime';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);
        const healthText = `${Math.ceil(this.health)}/${this.maxHealth}`;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(healthText, this.x, barY + barHeight / 2);
        ctx.fillStyle = 'white';
        ctx.fillText(healthText, this.x, barY + barHeight / 2);
        ctx.textBaseline = 'alphabetic';
    }
    move(keys, inputMode, touchState) {
        let dx = 0;
        let dy = 0;
        if (inputMode === 'TECLADO') {
            if (keys['w'] || keys['arrowup'])    dy -= 1;
            if (keys['s'] || keys['arrowdown'])  dy += 1;
            if (keys['a'] || keys['arrowleft'])  dx -= 1;
            if (keys['d'] || keys['arrowright']) dx += 1;
        } else if (inputMode === 'TOUCH' && touchState.active) {
            const angle = Math.atan2(touchState.head.y - touchState.base.y, touchState.head.x - touchState.base.x);
            const dist  = distance(touchState.base.x,    touchState.base.y, touchState.head.x,  touchState.head.y);
            if (dist > 5) { // Dead zone
                dx = Math.cos(angle);
                dy = Math.sin(angle);
            }
        }

        if (dx !== 0 || dy !== 0) {
            this.lastMoveAngle = Math.atan2(dy, dx);
            const magnitude    = Math.sqrt(dx * dx + dy * dy);
            this.x += (dx / magnitude) * this.speed;
            this.y += (dy / magnitude) * this.speed;
            this.x = Math.max(this.size / 2, Math.min(canvas.width  - this.size / 2, this.x));
            this.y = Math.max(this.size / 2, Math.min(canvas.height - this.size / 2, this.y));
            return true;
        }
        return false;
    }
    addWeapon(weapon) { 
        this.weapons.push(weapon);
        this.activeWeapons[weapon.name] = { lastFired: 0, level: 1 };
        const level1Stats = WEAPON_LEVEL_DATA[weapon.name][0];
        Object.assign(weapon, level1Stats);
        if(weapon.init) weapon.init(this);
    }
    takeDamage(amount) {
        if (cheats.infiniteHealth || Date.now() - this.lastDamageTime < this.invincibilityDuration) return;
        
        if (typeof amount === 'number' && !isNaN(amount)) {
            this.health -= amount;
            this.lastDamageTime = Date.now();
        }
        if (this.health < 0 || isNaN(this.health)) {
            this.health = 0;
        }
    }
    addExperience(amount) { 
        this.experience += amount;
        while (this.experience >= this.nextLevelExp) this.levelUp();
    }
    levelUp() { 
        this.level++;
        this.experience  -= this.nextLevelExp;
        this.nextLevelExp = Math.floor(this.nextLevelExp * 1.5);
        this.maxHealth += 10;
        this.health    += 10;
        this.generateUpgradeChoices();
        gameState.currentState = 'upgrading';
    }
    generateUpgradeChoices() {
        this.upgradeChoices = [];
        const potentialUpgrades = [];
        const ownedWeapons = this.weapons.map(w => w.name);
        this.weapons.forEach(weapon => {
            const weaponState = this.activeWeapons[weapon.name];
            if (weaponState.level < 5) potentialUpgrades.push({ name: `Melhorar ${_t(weapon.name)} (Nível ${weaponState.level + 1})`, description_key: WEAPON_LEVEL_DATA[weapon.name][weaponState.level].description_key, type: 'weapon_level', weaponName: weapon.name });
        });
        if (ownedWeapons.length < 6) {
            Object.keys(WEAPON_TYPES).forEach(weaponName => {
                if (!ownedWeapons.includes(weaponName)) potentialUpgrades.push({ name: `Nova Arma: ${_t(weaponName)}`, description: `Adquire a arma ${_t(weaponName)}.`, type: 'weapon_new', weaponName: weaponName });
            });
        }
        BASE_STAT_UPGRADES.forEach(upgrade => potentialUpgrades.push({ ...upgrade, name: _t(upgrade.name_key), description: _t(upgrade.desc_key) }));
        const shuffled = potentialUpgrades.sort(() => 0.5 - Math.random());
        this.upgradeChoices = shuffled.slice(0, 3);
    }
    applyUpgrade(upgrade) {
        switch (upgrade.type) {
            case 'weapon_new': 
                if (WEAPON_TYPES[upgrade.weaponName]) { 
                    this.addWeapon(new WEAPON_TYPES[upgrade.weaponName]());
                } break;
            case 'weapon_level': const weaponState = this.activeWeapons[upgrade.weaponName];
                if (weaponState && weaponState.level < 5) { 
                    weaponState.level++;
                    const weaponInstance = this.weapons.find(w => w.name === upgrade.weaponName);
                    const newStats = WEAPON_LEVEL_DATA[upgrade.weaponName][weaponState.level - 1];
                    Object.assign(weaponInstance, newStats);
                    if (weaponInstance.onLevelUp) weaponInstance.onLevelUp(this, weaponState.level);
                } break;
            case 'stat':
                if (upgrade.stat === 'speed') this.speed += upgrade.value;
                else if (upgrade.stat === 'maxHealth')        { this.maxHealth        += upgrade.value; this.health += upgrade.value; }
                else if (upgrade.stat === 'collectionRadius') { this.collectionRadius += upgrade.value; }
                else if (upgrade.stat === 'healthRegen')      { this.healthRegen      += upgrade.value; }
                else if (this.hasOwnProperty(upgrade.stat))   { this[upgrade.stat]    += upgrade.value; }
                break;
        }
        this.upgradeChoices = [];
        gameState.currentState = 'playing';
    }
}