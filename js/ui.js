function drawUI(){
        ctx.fillStyle = 'white';
        ctx.font      = '20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${_t('score_label')}: ${gameState.score}`, 10, 30);
        ctx.fillStyle = '#00ffcc';
        ctx.fillText(`Gemas: ${cheats.infiniteGems ? '∞' : gameState.player.gems}`, 10, 60);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'right';
        ctx.fillText(`Time: ${Math.floor(gameState.gameTime/1000)}s`, canvas.width - 10, 30);
        if (gameState.bossPhase === 'active') { ctx.textAlign='center';
            ctx.font='bold 30px Arial';
            ctx.fillStyle='red';
            ctx.fillText(_t('final_boss_alert'), canvas.width/2, 60);
        }
        drawXpBar();
        drawWeaponUI();
}

function drawXpBar() {
    const p = gameState.player;
    const barW = canvas.width * 0.6;
    const barH = 18;
    const barX = (canvas.width-barW)/2;
    const barY = canvas.height-barH-15;
    ctx.fillStyle='rgba(0,0,0,0.7)';
    ctx.fillRect(barX,barY,barW,barH);
    ctx.fillStyle='#32cd32';
    ctx.fillRect(barX,barY,barW*(p.experience/p.nextLevelExp),barH);
    ctx.strokeStyle='#555';
    ctx.lineWidth=2;
    ctx.strokeRect(barX,barY,barW,barH);
    ctx.font='bold 14px Arial';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.strokeStyle='black';
    ctx.lineWidth=4;
    ctx.strokeText(p.level, barX+barW/2, barY+barH/2);
    ctx.fillStyle='white';
    ctx.fillText(p.level, barX+barW/2, barY+barH/2);
    ctx.textBaseline = 'alphabetic';
}

function drawWeaponUI() {
    const iconSize=40, padding=10, startX=15, startY=canvas.height-iconSize-padding-35;
    gameState.player.weapons.forEach((weapon, i) => {
        const x = startX + i * (iconSize + padding);
        const y = startY;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(x, y, iconSize, iconSize);
        ctx.strokeStyle = '#888';
        ctx.strokeRect(x, y, iconSize, iconSize);
        drawWeaponSymbol(weapon.name, x + iconSize / 2, y + iconSize / 2);
        const level = gameState.player.activeWeapons[weapon.name].level;
        ctx.fillStyle = 'aqua';
        for (let j = 0; j < level; j++) { 
            const dX = x+5+j*7, dY = y+iconSize-8;
            ctx.beginPath();
            ctx.moveTo(dX,dY-4);
            ctx.lineTo(dX+3,dY);
            ctx.lineTo(dX,dY+4);
            ctx.lineTo(dX-3,dY);
            ctx.closePath();
            ctx.fill();
        }
    });
}

function drawWeaponSymbol(name, x, y) {
    ctx.save();
    ctx.translate(x, y);
    switch (name) {
        case 'Machado': ctx.fillStyle = '#8B4513';
            ctx.fillRect(-2, -10, 4, 20);
            ctx.fillStyle = 'grey';
            ctx.beginPath();
            ctx.moveTo(-12, -12);
            ctx.lineTo(12, -12);
            ctx.lineTo(8, -6);
            ctx.lineTo(-8, -6);
            ctx.closePath();
            ctx.fill();
            break;
        case 'Espada': ctx.fillStyle = 'silver';
            ctx.fillRect(-1, -12, 2, 18);
            ctx.fillStyle = 'gold';
            ctx.fillRect(-4, 6, 8, 2);
            break;
        case 'Chicote': ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-10, -10);
            ctx.quadraticCurveTo(10, 0, -5, 10);
            ctx.stroke();
            break;
        case 'Projetil Mágico': ctx.fillStyle = 'cyan';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'Fragmento de Gelo': ctx.fillStyle = '#ADD8E6';
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(5,0);
            ctx.lineTo(0,12);
            ctx.lineTo(-5,0);
            ctx.closePath();
            ctx.fill();
            break;
        case 'Tiro Envenenado': ctx.fillStyle = '#90ee90';
            ctx.beginPath();
            ctx.arc(0,0,8,0,Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'darkgreen';
            ctx.beginPath();
            ctx.arc(0,2,2,0,Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-3,-3,2,0,Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(3,-3,2,0,Math.PI*2);
            ctx.fill();
            break;
        case 'Esfera Orbitante': ctx.fillStyle = 'purple';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'Chamas Orbitais': ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'Frio Orbital': ctx.fillStyle = 'cyan';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'Veneno Orbital': ctx.fillStyle = 'green';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'Bomba': ctx.fillStyle='black';
            ctx.beginPath();
            ctx.arc(0,0,12,0,Math.PI*2);
            ctx.fill();
            ctx.fillStyle='red';
            ctx.beginPath();
            ctx.arc(0,0,4,0,Math.PI*2);
            ctx.fill();
            break;
        case 'Bomba Incendiária': ctx.fillStyle='#58181F';
            ctx.beginPath();
            ctx.arc(0,0,12,0,Math.PI*2);
            ctx.fill();
            ctx.fillStyle='orange';
            ctx.beginPath();
            ctx.arc(0,0,4,0,Math.PI*2);
            ctx.fill();
            break;
        case 'Bomba Congelada': ctx.fillStyle='darkcyan';
            ctx.beginPath();
            ctx.arc(0,0,12,0,Math.PI*2);
            ctx.fill();
            ctx.fillStyle='white';
            ctx.beginPath();
            ctx.arc(0,0,4,0,Math.PI*2);
            ctx.fill();
            break;
        case 'Bomba de Veneno': ctx.fillStyle='darkgreen';
            ctx.beginPath();
            ctx.arc(0,0,12,0,Math.PI*2);
            ctx.fill();
            ctx.fillStyle='lime';
            ctx.beginPath();
            ctx.arc(0,0,4,0,Math.PI*2);
            ctx.fill();
            break;
        case 'Bombinhas': const pos = [{x:0, y:-6}, {x:-6, y:6}, {x:6, y:6}];
            pos.forEach(p => { 
                ctx.fillStyle='black';
                ctx.beginPath();
                ctx.arc(p.x,p.y,6,0,Math.PI*2);
                ctx.fill();
                ctx.fillStyle='red';
                ctx.beginPath();
                ctx.arc(p.x,p.y,2,0,Math.PI*2);
                ctx.fill();
            });
            break;
        case 'Pés Quentes': ctx.fillStyle = '#D2691E';
            ctx.beginPath();
            ctx.ellipse(-7, 0, 4, 8, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(7, 0, 4, 8, 0, 0, Math.PI*2);
            ctx.fill();
            break;
        case 'Bumerangue': ctx.strokeStyle='lightblue';
            ctx.lineWidth=4;
            ctx.beginPath();
            ctx.moveTo(-10,10);
            ctx.lineTo(0,0);
            ctx.lineTo(10,10);
            ctx.stroke();
            break;
        case 'Perfuradora': ctx.fillStyle='yellow';
            ctx.beginPath();
            ctx.moveTo(0,-15);
            ctx.lineTo(5,15);
            ctx.lineTo(-5,15);
            ctx.closePath();
            ctx.fill();
            break;
        case 'Raio': ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(5, 0);
            ctx.lineTo(-5, 0);
            ctx.lineTo(0, 12);
            ctx.closePath();
            ctx.fill();
            break;
        case 'Espirito da Luz': ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(0,0,8,0,Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(0,0,4,0,Math.PI*2);
            ctx.fill();
            break;
        case 'Espirito das Trevas': ctx.fillStyle = 'indigo';
            ctx.beginPath();
            ctx.arc(0,0,8,0,Math.PI*2);
            ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(0,0,4,0,Math.PI*2);
            ctx.fill();
            break;
        case 'Aranha':
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1.5;
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            for(let i = 0; i < 8; i++) { 
                const a = i * Math.PI/4;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a)*6, Math.sin(a)*6);
                ctx.lineTo(Math.cos(a)*12, Math.sin(a)*12);
                ctx.stroke();
            }
            break;
        case 'Touro':
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.lineTo(-12, -10);
            ctx.lineTo(12, -10);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'ivory';
            ctx.beginPath();
            ctx.moveTo(-12, -10);
            ctx.quadraticCurveTo(-10, -20, -20, -15);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(12, -10);
            ctx.quadraticCurveTo(10, -20, 20, -15);
            ctx.fill();
            break;
        case 'Lobos':
            ctx.fillStyle = 'grey';
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-8, 10);
            ctx.lineTo(8, 10);
            ctx.closePath();
            ctx.fill();
            break;
    }
    ctx.restore();
}

function drawStatIcon(stat, x, y) {
    ctx.save();
    ctx.translate(x, y);
    switch(stat) {
        case 'speed': ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(-2, -12);
            ctx.lineTo(4, 0);
            ctx.lineTo(0, 0);
            ctx.lineTo(6, 12);
            ctx.lineTo(0, 2);
            ctx.lineTo(4, 2);
            ctx.lineTo(-2, -12);
            ctx.fill();
            break;
        case 'maxHealth': ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.bezierCurveTo(8, -15, 15, -5, 0, 12);
            ctx.moveTo(0, -5);
            ctx.bezierCurveTo(-8, -15, -15, -5, 0, 12);
            ctx.fill();
            break;
        case 'healthRegen': ctx.fillStyle = 'green';
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.bezierCurveTo(8, -15, 15, -5, 0, 12);
            ctx.moveTo(0, -5);
            ctx.bezierCurveTo(-8, -15, -15, -5, 0, 12);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.fillRect(-2, -4, 4, 8);
            ctx.fillRect(-5, -1, 10, 2);
            break;
        case 'collectionRadius': ctx.fillStyle = 'gold';
            ctx.beginPath();
            ctx.arc(0,0,10,0,Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0,0,5,0,Math.PI*2);
            ctx.fill();
            break;
        case 'geralDamage': ctx.fillStyle = 'white';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('D',-6,7);
            break;
        case 'physicalDamage': ctx.fillStyle = 'brown';
            ctx.fillRect(-8, -8, 16, 16);
            break;
        case 'magicDamage': ctx.fillStyle = 'fuchsia';
            ctx.beginPath();
            ctx.moveTo(0,-10);
            ctx.lineTo(10,0);
            ctx.lineTo(0,10);
            ctx.lineTo(-10,0);
            ctx.closePath();
            ctx.fill();
            break;
        case 'explosiveDamage': ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(0,0,10,0,Math.PI*2);
            ctx.fill();
            break;
        case 'fireDamage': ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.moveTo(0,10);
            ctx.bezierCurveTo(-15,0, 15,0, 0,-10);
            ctx.fill();
            break;
        case 'iceDamage': ctx.fillStyle = 'cyan';
            ctx.beginPath();
            for(let i=0; i<6; i++){ 
                const a=i*Math.PI/3;
                ctx.moveTo(0,0);
                ctx.lineTo(Math.cos(a)*10, Math.sin(a)*10);
            } 
            ctx.stroke();
            break;
        case 'poisonDamage': ctx.fillStyle = 'lime';
            ctx.beginPath();
            ctx.arc(0,0,5,0,Math.PI*2);
            ctx.fill();
            break;
        case 'petDamage': ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(-5,0,4,0,Math.PI*2);
            ctx.arc(5,0,4,0,Math.PI*2);
            ctx.fill();
            break;
        case 'durationBonus': ctx.fillStyle = 'lightblue';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('T',-6,7);
            break;
        case 'cooldownReduction': ctx.fillStyle = 'lightgreen';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('R',-6,7);
            break;
        case 'attackSpeed': ctx.fillStyle = 'yellow';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('V',-6,7);
            break;
    }
    ctx.restore();
}

function drawUpgradeMenu() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(_t('upgrade_choice_title'), canvas.width/2, 50);
    const choices = gameState.player.upgradeChoices;
    const choiceHeight = 80;
    const menuWidth    = 450;
    const menuX  = canvas.width/2-menuWidth/2;
    const startY = canvas.height/2 - 120;
    choices.forEach((choice, index) => {
        const y = startY + index*choiceHeight;
        const boxHeight = choiceHeight-10;
        ctx.strokeStyle = index === gameState.selectedUpgradeIndex ? 'white' : '#555';
        ctx.fillStyle   = index === gameState.selectedUpgradeIndex ? 'rgba(0,150,255,0.8)' : 'rgba(40,40,40,0.8)';
        ctx.fillRect(menuX,y,menuWidth,boxHeight);
        ctx.strokeRect(menuX,y,menuWidth,boxHeight);
        const iconX = menuX + 35;
        const iconY = y + boxHeight / 2;
        const textX = menuX + 70;
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        if (choice.type.startsWith('weapon')) {
                ctx.strokeRect(iconX - 20, iconY - 20, 40, 40);
                drawWeaponSymbol(choice.weaponName, iconX, iconY);
        } else if (choice.type === 'stat') {
            ctx.beginPath();
            ctx.moveTo(iconX, iconY - 22);
            ctx.lineTo(iconX + 22, iconY);
            ctx.lineTo(iconX, iconY + 22);
            ctx.lineTo(iconX - 22, iconY);
            ctx.closePath();
            ctx.stroke();
            drawStatIcon(choice.stat, iconX, iconY);
        }
        ctx.fillStyle='white';
        ctx.textAlign='left';
        ctx.font='22px Arial';
        ctx.fillText(choice.name, textX, y+30);
        ctx.font='14px Arial';
        ctx.fillStyle='#ccc';
        const description = choice.type === 'weapon_level' ? _t(choice.description_key) : choice.description;
        ctx.fillText(description, textX, y+55);
    });
    ctx.textAlign = 'center';
    if (gameState.rerollsAvailable > 0 || cheats.infiniteRerolls) {
        const rerollButton = {x: canvas.width/2 - 75, y: startY + 3*choiceHeight + 10, width: 150, height: 40};
        ctx.fillStyle = checkButtonClick(rerollButton) ? '#666' : '#444';
        ctx.fillRect(rerollButton.x, rerollButton.y, rerollButton.width, rerollButton.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${_t('reroll_button')} (${cheats.infiniteRerolls ? '∞' : gameState.rerollsAvailable})`, canvas.width/2, rerollButton.y + rerollButton.height/2);
        ctx.textBaseline = 'alphabetic';
    }
}

function drawPauseMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const titleY = canvas.height / 2 - 210;
    const titleBgWidth = 300;
    const titleBgHeight = 70;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);


    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(_t('paused_title'), canvas.width / 2, canvas.height / 2 - 200);
    
    const btnY_Start = canvas.height / 2 - 150;
    const btnSpacing = 75;

    pauseReturnButton   = { x: canvas.width / 2 - 150, y: btnY_Start, width: 300, height: 50 };
    pauseRestartButton  = { x: canvas.width / 2 - 150, y: btnY_Start + btnSpacing, width: 300, height: 50 };
    pauseCatalogButton  = { x: canvas.width / 2 - 150, y: btnY_Start + (btnSpacing * 2), width: 300, height: 50 };
    pauseConfigButton   = { x: canvas.width / 2 - 150, y: btnY_Start + (btnSpacing * 3), width: 300, height: 50 };
    const menuButton    = { x: canvas.width / 2 - 150, y: btnY_Start + (btnSpacing * 4), width: 300, height: 50 };

    ctx.fillStyle = checkButtonClick(pauseReturnButton) ? '#666' : '#444';
    ctx.fillRect(pauseReturnButton.x, pauseReturnButton.y, pauseReturnButton.width, pauseReturnButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(_t('return_button'), canvas.width / 2, pauseReturnButton.y + pauseReturnButton.height / 2);
        
    ctx.fillStyle = checkButtonClick(pauseRestartButton) ? '#666' : '#444';
    ctx.fillRect(pauseRestartButton.x, pauseRestartButton.y, pauseRestartButton.width, pauseRestartButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(_t('restart_button'), canvas.width / 2, pauseRestartButton.y + pauseRestartButton.height / 2);

    ctx.fillStyle = checkButtonClick(pauseCatalogButton) ? '#666' : '#444';
    ctx.fillRect(pauseCatalogButton.x, pauseCatalogButton.y, pauseCatalogButton.width, pauseCatalogButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText(_t('catalog_button'), canvas.width / 2, pauseCatalogButton.y + pauseCatalogButton.height / 2);
    
    ctx.fillStyle = checkButtonClick(pauseConfigButton) ? '#666' : '#444';
    ctx.fillRect(pauseConfigButton.x, pauseConfigButton.y, pauseConfigButton.width, pauseConfigButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText(_t('options_button'), canvas.width / 2, pauseConfigButton.y + pauseConfigButton.height / 2);

    if(cheatsUnlocked) {
        pauseCheatsButton = { x: canvas.width / 2 - 150, y: canvas.height - 100, width: 300, height: 50 };
        ctx.fillStyle = checkButtonClick(pauseCheatsButton) ? '#800' : '#400';
        ctx.fillRect(pauseCheatsButton.x, pauseCheatsButton.y, pauseCheatsButton.width, pauseCheatsButton.height);
        ctx.fillStyle = 'white';
        ctx.fillText(_t('cheat_menu_button'), canvas.width / 2, pauseCheatsButton.y + pauseCheatsButton.height / 2);
    }
    
    ctx.fillStyle = checkButtonClick(menuButton) ? '#666' : '#444';
    ctx.fillRect(menuButton.x, menuButton.y, menuButton.width, menuButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText(_t('main_menu_button'), canvas.width / 2, menuButton.y + menuButton.height / 2);
    
    let tooltipData = null;
    if(gameState.player) {
        const iconSize=40, padding=10, startX=15, startY=canvas.height-iconSize-padding-35;
        gameState.player.weapons.forEach((weapon, i) => {
            const x = startX + i * (iconSize + padding);
            const y = startY;
            if (mouseX > x && mouseX < x + iconSize && mouseY > y && mouseY < y + iconSize) {
                tooltipData = { name: weapon.name, level: gameState.player.activeWeapons[weapon.name].level, x: x, y: y };
            } 
        });
    }
    ctx.textBaseline = 'alphabetic';
    return tooltipData;
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(_t('game_over_title'), canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = '30px Arial';
    ctx.fillText(`${_t('score_label')}: ${gameState.score}`, canvas.width / 2, canvas.height / 2 - 40);

    gameOverRestartButton = { x: canvas.width / 2 - 125, y: canvas.height / 2 + 20, width: 250, height: 50 };
    gameOverMenuButton = { x: canvas.width / 2 - 125, y: canvas.height / 2 + 90, width: 250, height: 50 };

    ctx.fillStyle = checkButtonClick(gameOverRestartButton) ? '#666' : '#444';
    ctx.fillRect(gameOverRestartButton.x, gameOverRestartButton.y, gameOverRestartButton.width, gameOverRestartButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(_t('restart_button'), canvas.width / 2, gameOverRestartButton.y + gameOverRestartButton.height / 2);

    ctx.fillStyle = checkButtonClick(gameOverMenuButton) ? '#666' : '#444';
    ctx.fillRect(gameOverMenuButton.x, gameOverMenuButton.y, gameOverMenuButton.width, gameOverMenuButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(_t('main_menu_button'), canvas.width / 2, gameOverMenuButton.y + gameOverMenuButton.height / 2);
    ctx.textBaseline = 'alphabetic';
}

function drawVictoryScreen() {
    ctx.fillStyle = 'rgba(0, 20, 50, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'gold';
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(_t('victory_title'), canvas.width / 2, canvas.height / 2 - 100);
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`${_t('score_label')}: ${gameState.score}`, canvas.width / 2, canvas.height / 2 - 40);

    gameOverRestartButton = { x: canvas.width / 2 - 125, y: canvas.height / 2 + 20, width: 250, height: 50 };
    gameOverMenuButton = { x: canvas.width / 2 - 125, y: canvas.height / 2 + 90, width: 250, height: 50 };

    ctx.fillStyle = checkButtonClick(gameOverRestartButton) ? '#666' : '#444';
    ctx.fillRect(gameOverRestartButton.x, gameOverRestartButton.y, gameOverRestartButton.width, gameOverRestartButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(_t('restart_button'), canvas.width / 2, gameOverRestartButton.y + gameOverRestartButton.height / 2);

    ctx.fillStyle = checkButtonClick(gameOverMenuButton) ? '#666' : '#444';
    ctx.fillRect(gameOverMenuButton.x, gameOverMenuButton.y, gameOverMenuButton.width, gameOverMenuButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(_t('main_menu_button'), canvas.width / 2, gameOverMenuButton.y + gameOverMenuButton.height / 2);
    ctx.textBaseline = 'alphabetic';
}

function drawMainMenu() {
    ctx.textAlign = 'center';

    const titleY = canvas.height / 2 - 165;
    const titleBgWidth = 200;
    const titleBgHeight = 80;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);

    ctx.fillStyle = 'white';
    ctx.font = '60px Arial';
    ctx.fillText(_t('main_title_header'), canvas.width / 2, canvas.height / 2 - 150);
    const btnWidth = 300;
    menuStartButton = { x: canvas.width/2 - btnWidth/2, y: canvas.height/2 - 50, width: btnWidth, height: 50 };
    menuCatalogButton = { x: canvas.width/2 - btnWidth/2, y: canvas.height/2 + 20, width: btnWidth, height: 50 };
    menuConfigButton = { x: canvas.width/2 - btnWidth/2, y: canvas.height/2 + 90, width: btnWidth, height: 50 };
    menuCreditsButton = { x: canvas.width/2 - btnWidth/2, y: canvas.height/2 + 160, width: btnWidth, height: 50 };

    ctx.fillStyle = checkButtonClick(menuStartButton) ? '#666' : '#444';
    ctx.fillRect(menuStartButton.x, menuStartButton.y, menuStartButton.width, menuStartButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(_t('start_button'), canvas.width/2, menuStartButton.y + menuStartButton.height/2);
    
    ctx.fillStyle = checkButtonClick(menuCatalogButton) ? '#666' : '#444';
    ctx.fillRect(menuCatalogButton.x, menuCatalogButton.y, menuCatalogButton.width, menuCatalogButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(_t('catalog_button'), canvas.width/2, menuCatalogButton.y + menuCatalogButton.height/2);

    ctx.fillStyle = checkButtonClick(menuConfigButton) ? '#666' : '#444';
    ctx.fillRect(menuConfigButton.x, menuConfigButton.y, menuConfigButton.width, menuConfigButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(_t('config_button'), canvas.width/2, menuConfigButton.y + menuConfigButton.height/2);

    ctx.fillStyle = checkButtonClick(menuCreditsButton) ? '#666' : '#444';
    ctx.fillRect(menuCreditsButton.x, menuCreditsButton.y, menuCreditsButton.width, menuCreditsButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(_t('credits_button'), canvas.width/2, menuCreditsButton.y + menuCreditsButton.height/2);

    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('v0.5.2', canvas.width - 15, canvas.height - 15);

    ctx.textBaseline = 'alphabetic';
}

function getCharSelectLayout() {
    const characters = ['Guerreiro', 'Mago', 'Mestre das Feras', 'Bombadilho'];
    const cols    = 3;
    const boxSize = 180;
    const padding = 30;
    const itemWidth = boxSize + padding;
    const startX  = (canvas.width - (cols * itemWidth - padding)) / 2;
    let   yCursor = 150;
    const itemLayout = [];

    characters.forEach((name, index) => {
        const col  = index % cols;
        const row  = Math.floor(index / cols);
        const item = { name: name, x: startX + col * itemWidth, y: yCursor + row * (boxSize + padding), w: boxSize, h: boxSize };
        itemLayout.push(item);
    });
    const numRows = Math.ceil(characters.length / cols);
    characterSelectContentHeight = yCursor + (numRows * (boxSize + padding));
    return { itemLayout, characters };
}


function drawCharacterSelectionScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; ctx.fillRect(0,0,canvas.width, canvas.height);

    const { itemLayout, characters } = getCharSelectLayout();
    const virtualMouseY = mouseY + characterSelectScrollY;

    ctx.save();
    ctx.translate(0, -characterSelectScrollY);

    itemLayout.forEach(item => {
        const isHovered = (mouseX > item.x && mouseX < item.x + item.w && virtualMouseY > item.y && virtualMouseY < item.y + item.h);
        ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(item.x, item.y, item.w, item.h);
        ctx.strokeStyle = 'white'; ctx.strokeRect(item.x, item.y, item.w, item.h);

        ctx.fillStyle = 'white'; ctx.font = '24px Arial'; ctx.textAlign = 'center';
        ctx.fillText(_t(`char_${item.name}`), item.x + item.w / 2, item.y + 30);
        
        const tempPlayer = { character: item.name };
        ctx.save(); ctx.translate(item.x + item.w/2, item.y + 80); ctx.scale(2,2);
        drawCharacterSprite(tempPlayer);
        ctx.restore();
        
        ctx.font = '14px Arial'; ctx.fillStyle = '#ccc';
        const descLines = _t(`char_desc_${item.name}`).split('. ');
        descLines.forEach((line, i) => {
            ctx.fillText(line, item.x + item.w / 2, item.y + 140 + (i*18));
        });
    });

    ctx.restore();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - 270, 40, 540, 70);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(canvas.width / 2 - 270, 40, 540, 70);

    ctx.textAlign = 'center'; ctx.fillStyle = 'white'; ctx.font = '50px Arial';
    ctx.fillText(_t('char_select_title'), canvas.width / 2, 90);
    
    const btnWidth = 250;
    charSelectBackButton = { x: canvas.width/2 - btnWidth/2, y: canvas.height - 80, width: btnWidth, height: 50 };
    ctx.fillStyle = checkButtonClick(charSelectBackButton) ? '#666' : '#444';
    ctx.fillRect(charSelectBackButton.x, charSelectBackButton.y, charSelectBackButton.width, charSelectBackButton.height);
    ctx.fillStyle = 'white';

    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_t('back_button'), canvas.width/2, charSelectBackButton.y + charSelectBackButton.height/2);
    ctx.textBaseline = 'alphabetic';

    drawScrollbar('character_selection');
}

function drawCharacterSprite(player) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    switch(player.character) {
        case 'Guerreiro':
            ctx.fillStyle = '#C0C0C0';
            ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-15, -10); ctx.lineTo(15, -10); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#FFD700';
            ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(-20, -18); ctx.lineTo(-12, -12); ctx.fill();
            ctx.moveTo(15, -10); ctx.lineTo(20, -18); ctx.lineTo(12, -12); ctx.fill();
            break;
        case 'Mago':
            ctx.fillStyle = 'blue';
            ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(-15, -10); ctx.lineTo(15, -10); ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'yellow';
            ctx.beginPath(); ctx.arc(0, -25, 3, 0, Math.PI * 2); ctx.fill();
            break;
        case 'Mestre das Feras':
            ctx.fillStyle = '#8B4513';
            ctx.beginPath(); ctx.arc(-10, -15, 8, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(10, -15, 8, 0, Math.PI * 2); ctx.fill();
            break;
        case 'Bombadilho':
            ctx.fillStyle = 'black';
            ctx.fillRect(-15, -10, 30, 12);
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(-7, -4, 3, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(7, -4, 3, 0, Math.PI*2); ctx.fill();
            break;
        }
        ctx.restore();
}

function drawCreditsMenu() {
    ctx.textAlign = 'center';
    const titleY = 140;
    const titleBgWidth  = 300;
    const titleBgHeight = 70;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);

    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText(_t('credits_title'), canvas.width / 2, 150);
    ctx.font = '30px Arial';
    ctx.fillText(_t('credits_developed_by'), canvas.width / 2, 250);
    ctx.font = '40px Arial';
    ctx.fillStyle = 'gold';
    ctx.fillText("Pedro Fernandes", canvas.width / 2, 320);

    creditsBackButton = { x: canvas.width/2 - 100, y: canvas.height - 120, width: 200, height: 50 };
    ctx.fillStyle = checkButtonClick(creditsBackButton) ? '#666' : '#444';
    ctx.fillRect(creditsBackButton.x, creditsBackButton.y, creditsBackButton.width, creditsBackButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillText(_t('back_button'), canvas.width/2, creditsBackButton.y + creditsBackButton.height/2);
    ctx.textBaseline = 'alphabetic';
}

function getCategoryMap() {
    return { 'Machado': 'category_area', 'Espada': 'category_area', 'Chicote': 'category_area', 'Pés Quentes': 'category_area', 'Bomba': 'category_bombs', 'Bombinhas': 'category_bombs', 'Bomba Incendiária': 'category_bombs', 'Bomba Congelada': 'category_bombs', 'Bomba de Veneno': 'category_bombs', 'Esfera Orbitante': 'category_orbitals', 'Chamas Orbitais': 'category_orbitals', 'Frio Orbital': 'category_orbitals', 'Veneno Orbital': 'category_orbitals', 'Espirito da Luz': 'category_pets', 'Espirito das Trevas': 'category_pets', 'Aranha': 'category_pets', 'Touro': 'category_pets', 'Lobos': 'category_pets', 'Projetil Mágico': 'category_projectiles', 'Fragmento de Gelo': 'category_projectiles', 'Tiro Envenenado': 'category_projectiles', 'Bumerangue': 'category_projectiles', 'Perfuradora': 'category_projectiles', 'Raio': 'category_projectiles' };
}

function getSortedCategorizedWeapons() {
    const categories = { 'category_area': [], 'category_projectiles': [], 'category_bombs': [], 'category_orbitals': [], 'category_pets': [] };
    const categoryMap = getCategoryMap();
    for(const weapon in WEAPON_TYPES) {
        const cat = categoryMap[weapon] || 'category_projectiles';
        if(categories[cat]) categories[cat].push(weapon);
    }
    for(const cat in categories) { categories[cat].sort((a,b) => _t(a).localeCompare(_t(b)));}
    return categories;
}

function getCatalogLayout() {
    const categorizedWeapons = getSortedCategorizedWeapons();
    const cols = 6, boxSize = 80, padding = 20, itemWidth = boxSize + padding;
    const startX = (canvas.width - (cols * itemWidth - padding)) / 2;
    let yCursor = 120;
    const itemLayout = [];
    for (const categoryKey in categorizedWeapons) {
        const weaponsInCategory = categorizedWeapons[categoryKey];
        if (weaponsInCategory.length === 0) continue;
        yCursor += 40;
        weaponsInCategory.forEach((name, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const item = { name: name, x: startX + col * itemWidth, y: yCursor + row * (boxSize + padding), w: boxSize, h: boxSize };
            itemLayout.push(item);
        });
        const numRows = Math.ceil(weaponsInCategory.length / cols);
        yCursor += numRows * (boxSize + padding);
    }
    catalogContentHeight = yCursor;
    return { itemLayout, categorizedWeapons };
}

function drawCatalog() {
    const { itemLayout, categorizedWeapons } = getCatalogLayout();
    const virtualMouseY = mouseY + catalogScrollY;
    let tooltipData = null;

    ctx.save();
    ctx.translate(0, -catalogScrollY);

    let yCursor = 120;
    const cols = 6, boxSize = 80, padding = 20, itemWidth = boxSize + padding;
    const startX = (canvas.width - (cols * itemWidth - padding)) / 2;

    for (const categoryKey in categorizedWeapons) {
        const weaponsInCategory = categorizedWeapons[categoryKey];
        if (weaponsInCategory.length === 0) continue;
        yCursor += 40;
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'gold';
        ctx.fillText(_t(categoryKey), startX, yCursor - 10);
        const numRows = Math.ceil(weaponsInCategory.length / cols);
        yCursor += numRows * (boxSize + padding);
    }
    
    itemLayout.forEach(item => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        if (cheats.opCatalog && gameState.player) {
            const wpn = gameState.player.weapons.find(w => w.name === item.name);
            if (wpn) {
                const level = gameState.player.activeWeapons[item.name].level;
                ctx.fillStyle = level >= 5 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 0, 0.3)';
            }
        }
        ctx.fillRect(item.x, item.y, item.w, item.h);
        drawWeaponSymbol(item.name, item.x + item.w/2, item.y + item.h/2);

        if (mouseX > item.x && mouseX < item.x + item.w && virtualMouseY > item.y && virtualMouseY < item.y + item.h) {
            tooltipData = { name: item.name, level: 0, x: item.x, y: item.y - catalogScrollY };
        }
    });
    ctx.restore();

    const titleWidth = 500;
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width/2 - titleWidth/2, 30, titleWidth, 50);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width/2 - titleWidth/2, 30, titleWidth, 50);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText(_t('catalog_title'), canvas.width / 2, 70);
    
    catalogBackButton = { x: canvas.width/2 - 100, y: canvas.height - 80, width: 200, height: 50 };
    ctx.fillStyle = checkButtonClick(catalogBackButton) ? '#666' : '#444';
    ctx.fillRect(catalogBackButton.x, catalogBackButton.y, catalogBackButton.width, catalogBackButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(_t('back_button'), canvas.width/2, catalogBackButton.y + catalogBackButton.height/2);
    ctx.textBaseline = 'alphabetic';
    
    drawScrollbar('catalog');

    return tooltipData;
}

function drawTooltip(data) {
    ctx.save();
    const allLevelsData = WEAPON_LEVEL_DATA[data.name];
    if (!allLevelsData) { ctx.restore(); return; }
    const lineHeight = 18;
    ctx.font = '14px Arial';
    let maxWidth = 0;
    allLevelsData.forEach((levelData, index) => { 
        const text = `Level ${index + 1}: ${_t(levelData.description_key)}`;
        const w = ctx.measureText(text).width;
        if (w > maxWidth) maxWidth = w;
    });
    const tooltipWidth = Math.max(350, maxWidth + 20);
    const tooltipHeight = 40 + (allLevelsData.length * lineHeight);
    let tooltipX = data.x - tooltipWidth/2 + 40;
    let tooltipY = data.y + 85;
    if (tooltipX < 10) tooltipX = 10;
    if (tooltipX + tooltipWidth > canvas.width - 10) tooltipX = canvas.width - 10 - tooltipWidth;
    if (tooltipY + tooltipHeight > canvas.height - 10) tooltipY = data.y - tooltipHeight - 5;
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(_t(data.name), tooltipX + 10, tooltipY + 10);
    allLevelsData.forEach((levelData, index) => {
        const levelNum = index + 1;
        let currentLevel = data.level;
        if(gameState.player && gameState.player.activeWeapons[data.name]) currentLevel = gameState.player.activeWeapons[data.name].level;
        ctx.font = '14px Arial';
        ctx.fillStyle = (currentLevel > 0 && levelNum <= currentLevel) ? 'white' : '#888';
        const text = `Level ${levelNum}: ${_t(levelData.description_key)}`;
        ctx.fillText(text, tooltipX + 10, tooltipY + 35 + (index * lineHeight));
    });
    ctx.restore();
}

function drawCheatMenu(){
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.textAlign = 'center';

    const titleY = 70;
    const titleBgWidth = 500, titleBgHeight = 80;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);

    ctx.fillStyle = 'red';
    ctx.font = '50px Arial';
    ctx.fillText(_t('cheat_title'), canvas.width / 2, 80);

    const buttons = [
        { y: 150, text: `${_t('cheat_infinite_health')}: ${cheats.infiniteHealth ? _t('state_on') : _t('state_off')}`}, { y: 200, text: _t('cheat_level_up')},
        { y: 250, text: `${_t('cheat_infinite_rerolls')}: ${cheats.infiniteRerolls ? _t('state_on') : _t('state_off')}`},
        { y: 300, text: `${_t('cheat_op_catalog')}: ${cheats.opCatalog ? _t('state_on') : _t('state_off')}`},
        { y: 150, x: 450, text: `${_t('cheat_difficulty')}: ${cheats.difficultyOverride === -1 ? _t('difficulty_normal') : cheats.difficultyOverride}` },
        { y: 200, x: 450, text: _t('cheat_spawn_boss')},
        { y: 250, x: 450, text: `${_t('cheat_infinite_gems')}: ${cheats.infiniteGems ? _t('state_on') : _t('state_off')}`},
    ];
    buttons.forEach(btn => {
        const buttonRect = {x: btn.x || 50, y:btn.y, width:300, height: 40};
        ctx.fillStyle = checkButtonClick(buttonRect) ? '#800' : '#400';
        ctx.fillRect(buttonRect.x, buttonRect.y, buttonRect.width, buttonRect.height);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(btn.text, buttonRect.x + buttonRect.width/2, buttonRect.y + buttonRect.height/2);
    });
    const backButton = {x: canvas.width/2 - 150, y: canvas.height - 80, width: 300, height: 50};
    ctx.fillStyle = checkButtonClick(backButton) ? '#666' : '#444';
    ctx.fillRect(backButton.x, backButton.y, backButton.width, backButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(_t('back_button'), backButton.x + backButton.width/2, backButton.y + backButton.height/2);
    ctx.textBaseline = 'alphabetic';
}

function drawConfigurationsMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';

    const titleY = 70;
    const titleBgWidth  = 500;
    const titleBgHeight = 70;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(canvas.width / 2 - titleBgWidth / 2, titleY - titleBgHeight / 2 - 5, titleBgWidth, titleBgHeight);

    ctx.fillStyle = 'white';
    ctx.font      = '50px Arial';
    ctx.fillText(_t('config_title'), canvas.width / 2, 80);
    
    const btnWidth = 400;
    const fullscreenButton = { x: canvas.width / 2 - btnWidth/2, y: 150, width: btnWidth, height: 50 };
    const langButton       = { x: canvas.width / 2 - btnWidth/2, y: 220, width: btnWidth, height: 50 };
    const inputButton      = { x: canvas.width / 2 - btnWidth/2, y: 290, width: btnWidth, height: 50 };
    configResetDataButton  = { x: canvas.width / 2 - btnWidth/2, y: 360, width: btnWidth, height: 50 };
    configBackButton       = { x: canvas.width / 2 - btnWidth/2, y: canvas.height - 120, width: btnWidth, height: 50 };

    ctx.fillStyle = checkButtonClick(fullscreenButton) ? '#666' : '#444';
    ctx.fillRect(fullscreenButton.x, fullscreenButton.y, fullscreenButton.width, fullscreenButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '22px Arial';
    ctx.textBaseline = 'middle';
    const fullscreenText = document.fullscreenElement ? _t('fullscreen_off') : _t('fullscreen_on');
    ctx.fillText(fullscreenText, fullscreenButton.x + fullscreenButton.width / 2, fullscreenButton.y + fullscreenButton.height / 2);
    
    ctx.fillStyle = checkButtonClick(langButton) ? '#666' : '#444';
    ctx.fillRect(langButton.x, langButton.y, langButton.width, langButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText(`${_t('language_label')}: ${currentLanguage}`, langButton.x + langButton.width / 2, langButton.y + langButton.height / 2);

    ctx.fillStyle = checkButtonClick(inputButton) ? '#666' : '#444';
    ctx.fillRect(inputButton.x, inputButton.y, inputButton.width, inputButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText(`${_t('input_mode_label')}: ${_t(inputMode)}`, inputButton.x + inputButton.width / 2, inputButton.y + inputButton.height / 2);
    
    ctx.fillStyle = checkButtonClick(configResetDataButton) ? '#a11' : '#611';
    ctx.fillRect(configResetDataButton.x, configResetDataButton.y, configResetDataButton.width, configResetDataButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText(_t('reset_data_button'), configResetDataButton.x + configResetDataButton.width / 2, configResetDataButton.y + configResetDataButton.height / 2);

    ctx.fillStyle = checkButtonClick(configBackButton) ? '#666' : '#444';
    ctx.fillRect(configBackButton.x, configBackButton.y, configBackButton.width, configBackButton.height);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(_t('back_button'), configBackButton.x + configBackButton.width / 2, configBackButton.y + configBackButton.height / 2);
    ctx.textBaseline = 'alphabetic';
}

function drawJoystick() {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.arc(joystickBase.x, joystickBase.y, joystickRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'darkgrey';
    ctx.beginPath();
    ctx.arc(joystickHead.x, joystickHead.y, joystickRadius / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

function getScrollbarLayout(screen) {
    const margin  = 20, trackWidth = 15;
    const contentHeight = screen === 'catalog' ? catalogContentHeight : characterSelectContentHeight;
    const scrollY = screen === 'catalog' ? catalogScrollY : characterSelectScrollY;
    
    const trackX = canvas.width - trackWidth - margin;
    const trackY = margin * 2;
    const trackHeight = canvas.height - margin * 4;
    const contentRatio = canvas.height / contentHeight;

    if (contentRatio >= 1) return { visible: false };

    const thumbHeight = Math.max(20, trackHeight * contentRatio);
    const maxScroll   = Math.max(0, contentHeight - canvas.height + 150);
    const thumbY      = trackY + (scrollY / maxScroll) * (trackHeight - thumbHeight);
    
    return {
        visible: true,
        trackX: trackX, trackY: trackY, trackWidth: trackWidth, trackHeight: trackHeight,
        thumbRect: { x: trackX, y: thumbY, width: trackWidth, height: thumbHeight },
        maxScroll: maxScroll,
        dragStartY: 0
    };
}

function drawScrollbar(screen) {
    const scrollbar = getScrollbarLayout(screen);
    if (!scrollbar.visible) return;

    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.fillRect(scrollbar.trackX, scrollbar.trackY, scrollbar.trackWidth, scrollbar.trackHeight);

    ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.fillRect(scrollbar.thumbRect.x, scrollbar.thumbRect.y, scrollbar.thumbRect.width, scrollbar.thumbRect.height);
}