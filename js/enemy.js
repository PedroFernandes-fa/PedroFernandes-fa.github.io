class Enemy {
    constructor(x, y, size, data, tier) {
        this.x = x;
        this.y = y;
        this.id = Math.random();
        this.size  = size;
        this.shape = data.shape;
        this.health    = data.health * tier.healthMod;
        this.maxHealth = this.health;
        this.speed  = data.speed * tier.speedMod;
        this.damage = data.damage * tier.damageMod;
        this.experienceValue = data.experienceValue * tier.expMod;
        this.gemValue  = data.gemValue;
        this.gemChance = data.gemChance;
        this.color  = tier.color;
        this.isBoss = data.isBoss || false;
        this.isFrozen     = false;
        this.frozenUntil  = 0;
        this.isOnFire     = false;
        this.fireEndsAt   = 0;
        this.isPoisoned   = false;
        this.poisonEndsAt = 0;
        this.poisonDamage = 0;
        this.isWebbed     = false;
        this.webbedUntil  = 0;
        if (this.isBoss) { 
            this.bossState = 'idle';
            this.bossStateTimer = Date.now() + 3000;
            this.bossRotation = 0;
            this.dashTarget   = {x:0, y:0};
            this.isDashing    = false;
            this.dashAngle    = 0; // << NOVO: Armazena o ângulo do dash
            this.moving       = true;
        }
        if (data.shoots) { this.shoots = true;
            this.lastShot = Date.now() + getRandomInt(500, 1500);
            this.shootCooldown  = data.shootCooldown;
            this.projectileData = data.projectileData;
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.isFrozen ? '#ADD8E6' : this.isPoisoned ? '#90ee90' : this.color;
        ctx.strokeStyle = this.isOnFire ? 'orange' : 'black';
        ctx.lineWidth = this.isOnFire ? 4 : 2;
        ctx.beginPath();
        switch(this.shape) {
            case 'triangle': ctx.moveTo(this.x, this.y - this.size / 2);
                ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
                ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
                ctx.closePath();
                break;
            case 'square': 
                ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                break;
            case 'losango': 
                ctx.moveTo(this.x, this.y - this.size / 2);
                ctx.lineTo(this.x + this.size / 2, this.y);
                ctx.lineTo(this.x, this.y + this.size / 2);
                ctx.lineTo(this.x - this.size / 2, this.y);
                ctx.closePath();
                break;
            case 'octagon': 
                const rOct = this.size / 2;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(Math.PI / 8);
                ctx.rect(-rOct, -rOct, this.size, this.size);
                ctx.rotate(Math.PI / 4);
                ctx.rect(-rOct, -rOct, this.size, this.size);
                ctx.restore();
                break;
            case 'star6': 
                const rStar = this.size / 2;
                ctx.save();
                ctx.translate(this.x, this.y);
                for(let i=0; i<2; i++){ 
                    ctx.beginPath();
                    ctx.moveTo(0, -rStar);
                    ctx.lineTo(rStar * 0.866, rStar * 0.5);
                    ctx.lineTo(-rStar * 0.866, rStar * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                    ctx.rotate(Math.PI);
                } 
                ctx.restore();
                break;
            case 'circle': 
                default: ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                break;
        }
        if (this.shape !== 'star6') { 
            ctx.fill();
            ctx.stroke();
        }
        if (this.isWebbed) { 
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x-this.size/2, this.y);
            ctx.lineTo(this.x+this.size/2, this.y);
            ctx.moveTo(this.x, this.y-this.size/2);
            ctx.lineTo(this.x, this.y+this.size/2);
            ctx.stroke();
        }
        if (this.isBoss && this.bossState === 'dash_charge') { 
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.dashTarget.x, this.dashTarget.y, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
        const barWidth = this.isBoss ? canvas.width * 0.8 : this.size * 1.2;
        const barX = this.isBoss ? canvas.width * 0.1 : this.x - barWidth / 2;
        const barY = this.isBoss ? 20 : this.y - this.size / 2 - 10;
        ctx.fillStyle = 'darkred';
        ctx.fillRect(barX, barY, barWidth, this.isBoss ? 20 : 5);
        ctx.fillStyle = 'orangered';
        ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), this.isBoss ? 20 : 5);
    }
    update(player, deltaTime, enemyProjectiles, enemyBombs) {
        if (this.isFrozen && Date.now() > this.frozenUntil) this.isFrozen = false;
        if (this.isWebbed && Date.now() > this.webbedUntil) this.isWebbed = false;
        if (this.isOnFire) { 
            if (Date.now() < this.fireEndsAt) this.takeDamage(15 * (deltaTime / 1000));
            else this.isOnFire = false;
        }
        if (this.isPoisoned) { 
            if (Date.now() < this.poisonEndsAt) this.takeDamage(this.poisonDamage * (deltaTime / 1000));
            else this.isPoisoned = false;
        }
        if (this.isFrozen || this.isWebbed) return;
        if (this.isBoss) this.updateBoss(player, deltaTime, enemyProjectiles, enemyBombs);
        else {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.x += Math.cos(angle) * this.speed * (deltaTime/16.67);
            this.y += Math.sin(angle) * this.speed * (deltaTime/16.67);
            if (this.shoots && Date.now() > this.lastShot) { this.lastShot = Date.now() + this.shootCooldown;
                const projAngle = Math.atan2(player.y - this.y, player.x - this.x);
                const proj = { x: this.x, y: this.y, angle: projAngle, color: this.color, ...this.projectileData };
                if (proj.type === 'exploding') { proj.initialFuse = proj.fuse; } 
                enemyProjectiles.push(proj);
            }
        }
    }
    updateBoss(player, deltaTime, enemyProjectiles, enemyBombs){
        if (this.isDashing) {
            // << CÓDIGO DO DASH CORRIGIDO >>
            const dashSpeed = 12; // Aumentei um pouco a velocidade para ficar mais ameaçador
            this.x += Math.cos(this.dashAngle) * dashSpeed * (deltaTime/16.67);
            this.y += Math.sin(this.dashAngle) * dashSpeed * (deltaTime/16.67);
            
            // Termina o dash se atingir as bordas da tela ou chegar perto do alvo original
            if (distance(this.x, this.y, this.dashTarget.x, this.dashTarget.y) < 20 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) { 
                this.isDashing = false;
                this.bossState = 'idle';
                this.bossStateTimer = Date.now() + 2000;
            } return;
        }
        const angleToPlayer = Math.atan2(player.y - this.y, player.x - this.x);
        if (this.moving){
            this.x += Math.cos(angleToPlayer) * this.speed * (deltaTime/16.67);
            this.y += Math.sin(angleToPlayer) * this.speed * (deltaTime/16.67);
        }
        if (Date.now() > this.bossStateTimer) { const nextAttack = getRandomInt(0, 2);
            if (nextAttack === 0) {
                this.bossState = 'pinwheel';
                this.bossStateTimer = Date.now() + 5000;
            } else if (nextAttack === 1) { 
                this.bossState  = 'dash_charge';
                this.dashTarget = {x: player.x, y: player.y};
                this.bossStateTimer = Date.now() + 1500;
            } else { 
                this.bossState = 'bombs';
                this.bossStateTimer = Date.now() + 4000;
            } 
        }
        switch(this.bossState) {
            case 'pinwheel': 
            this.bossRotation += 0.5 * (deltaTime/16.67);
                if (Date.now() - (this.lastShot || 0) > 500) { 
                    this.moving = false;
                    this.lastShot = Date.now();
                    for(let i=0; i<4; i++){ 
                        const angle = this.bossRotation + (i * Math.PI / 2);
                        enemyProjectiles.push({ x: this.x, y: this.y, angle: angle, size: 8, color: 'magenta', speed: 2.5, damage: 15 });
                    } 
                } 
                break;
            case 'dash_charge': 
                this.moving = false; // Para o boss não se mover enquanto carrega o dash
                if (Date.now() > this.bossStateTimer - 100) { // Inicia o dash um pouco antes do timer para fluidez
                     this.isDashing = true; 
                     this.dashAngle = Math.atan2(this.dashTarget.y - this.y, this.dashTarget.x - this.x); // Calcula o ângulo UMA VEZ
                } 
                break;
            case 'bombs': 
                this.moving = true;
                if (Date.now() - (this.lastShot || 0) > 500) { 
                    this.lastShot = Date.now();
                    const angle = Math.random() * Math.PI * 2;
                    const dist  = getRandomInt(50, 250);
                    enemyBombs.push({ x: this.x + Math.cos(angle) * dist, y: this.y + Math.sin(angle) * dist, timer: 1500, damage: 30, radius: 60, size: 15, fromPlayer: false });
                } 
                break;
        }
    }
    takeDamage(amount) { this.health -= amount; }
    isAlive() { return this.health > 0; }
}