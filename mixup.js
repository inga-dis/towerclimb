(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 1100,
    height = 900,

    // ============ PLAYER OBJECT =====================
    player = {
        x: width / 2,
        y: height - 200,
        width: 105,
        height: 150,
        speed: 3,
        velX: 0,
        velY: 0,
        grounded: false,
        jumping: false,
    },

    // ================ GLOBAL VARIABLES ======================
    keys = [],
    friction = 0.8,
    gravity = 0.4,
    boxes = [],
    platforms = [],
    platformWidth = Math.floor(width / 3),
    score = 0,
    time = 700,
    isPlayingCounter = 0,
    isPlaying = false,
    harold = new Image(),
    platformImg = new Image(),
    song = new Audio(),
    death = new Audio(),
    jump = new Audio(),
    yForStaticPlatforms = 0,
    numberOfPlatforms = 0;



// ======== STATIC PLATFORMS OG VEGGIR ===================

//pusha nokkrum static platforms í byrjun til að hefja leik
for (let i = 0; i < 4; i++) {
    numberOfPlatforms += 1;
    if (i === 0) {
        platforms.push({
            x: 0,
            y: height - 100,
            width: width,
            height: 100,
            velY: 0,
        });
    } else {
        platforms.push({
            x: Math.floor((Math.random() * (width - platformWidth))),
            y: yForStaticPlatforms,
            width: platformWidth,
            height: 60,
            velY: 0,
        });
    }
    yForStaticPlatforms += 150;
};

//vinstri veggur
//auka hæð svo ekki sé hægt að hoppa yfir vegginn
boxes.push({
    x: -10,
    y: -200,
    width: 10,
    height: height + 200
});

//hægri veggur
boxes.push({
    x: width,
    y: -200,
    width: 10,
    height: height + 200
});

canvas.width = width;
canvas.height = height;

song.src = "sound/ITTheme.mp3";
song.volume = .05
jump.src = '/sound/Jump2.wav';
jump.volume = .2
death.src = '/sound/death_7_ian.wav'
death.volume = .1


function update() {

    //=========== PLAYER IMAGE MANAGEMENT =============
    harold.src = 'img/harold(1).png';

    if (player.jumping && keys['ArrowRight']) {
        if (player.velY < 0) {
            harold.src = 'img/haroldJumpRight.png';
        } else if (player.velY > 0) {
            harold.src = 'img/haroldDownRight.png';
        }
    }
    else if (player.jumping && keys['ArrowLeft']) {
        if (player.velY < 0) {
            harold.src = 'img/haroldJumpLeft.png';
        } else if (player.velY > 0) {
            harold.src = 'img/haroldDownLeft.png';
        }
    }
    else if (player.velY < 0 || player.jumping) {
        harold.src = 'img/haroldJump.png';
    } else if (keys['ArrowRight']) {
        harold.src = 'img/haroldRight.png';
    } else if (keys['ArrowLeft']) {
        harold.src = 'img/haroldLeft.png';
    }


    // ================= KEY INPUTS ==========================
    if (keys[' '] || keys['ArrowUp']) {
        // up arrow eða space
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false;
            player.velY = -player.speed * 4;// breyta constant hérna til að setja jump hæð
            // jump.play();
        }
    }
    if (keys['ArrowRight']) {
        // right arrow
        if (player.velX < player.speed) {
            player.velX++;
        }
    }
    if (keys['ArrowLeft']) {
        // left arrow
        if (player.velX > -player.speed) {
            player.velX--;
        }
    }

    // friction sér um smooth stop í staðinn fyrir full stop, x er alltaf að breytast eftir fyrstu hreyfingu
    player.velX *= friction;
    player.velY += gravity;

    // ============= ALLAR HREYFINGAR GERAST SVO HÉR ==================
    player.x += player.velX * 5; // constant til að hlaupa hraðar
    player.y += player.velY * 2;

    ctx.clearRect(0, 0, width, height);
    player.grounded = false;

    // ================ TEIKNA VEGGI OG TJÉKKA COLLISION VIÐ PLAYER ===============================

    for (let i = 0; i < boxes.length; i++) {//print boxes
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        let dir = colCheck(player, boxes[i]);

        if (dir === "l") {
            player.velX = 9;
            player.velY -= 4;
            keys["ArrowLeft"] = false;
        } else if (dir === 'r') {
            player.velX = -9;
            player.velY -= 4;
            keys['ArrowRight'] = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        }
    }

    // ============= BÚA TIL PLATFORMS OG TJÉKKA COLLISION VIÐ PLAYER =====================

    for (let i = 0; i < platforms.length; i++) {
        platformImg.src = 'img/platform.png'

        ctx.drawImage(platformImg, platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height)
        if (isPlaying) {
            platforms[i].velY = gravity * 5;
            platforms[i].y += platforms[i].velY * 2;
        }

        let dir = colCheck(player, platforms[i]);

        if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
            // setur player Y velocity í sama og pallurinn sem hann snertir til að líkja eftir
            // að hann sé standandi á honum
            player.velY = platforms[i].velY;
        }
    }

    // ======================== CAMERA OG GAMESPEED MAGIC ========================

    if (player.y < 0) {
        gravity = 1 + numberOfPlatforms / 500;
        player.speed = 3.75 + numberOfPlatforms / 400;
        time = 400 - numberOfPlatforms;
    } else if (player.y < height / 4) {
        gravity = 0.85 + numberOfPlatforms / 500;
        player.speed = 3.5 + numberOfPlatforms / 400;
        time = 500 - numberOfPlatforms;
    } else if (player.y < height / 2) {
        gravity = 0.65 + numberOfPlatforms / 500;
        player.speed = 3.25 + numberOfPlatforms / 400;
        time = 600 - numberOfPlatforms;
    } else {
        gravity = 0.4 + numberOfPlatforms / 500;
        time = 700 - numberOfPlatforms;
    }

    // ================ TEIKNAR PLAYER =====================

    ctx.drawImage(harold, player.x, player.y, player.width, player.height);

    // ================ TEIKNA SCORE ======================

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Score: " + score, 30, 50);


    if (isPlayingCounter === 1) {
        periodicall();
        isPlayingCounter = 2;
    }

    // song.play();
    if (player.y < height) {
        requestAnimationFrame(update);

    } else {
        // song.pause();
        // death.play();
        isPlaying = false;
        //gera highscore lista svona
        //þarf að gera restart takka sem resettar hann ekki!!!
        // let first = document.getElementById('first');
        // first.innerHTML = score;
        alert(`Game Over \n Score: ${score}`);
    }
    // update kallar á sjálft sig fyrir loopu
}


// ============ PLATFORM SPAWN OG DELETE ========================

// pushar nýjum platform á (time) fresti
// telur líka hversu margir platforms hafa orðið til fyrir score
function periodicall() {
    numberOfPlatforms += 1;
    platforms.push({
        x: (Math.random() * (width - platformWidth)),
        y: 0,
        width: platformWidth,
        height: 60,
        velY: 0,
    });
    setTimeout(periodicall, time);
}

// tjékkar hvort ehv platforms séu útaf skjánum á hálfsek. fresti og deletar þeim fyrir performance
setInterval(() => {
    let outOfScreen = 0;
    for (let i = 0; i < platforms.length; i++) {
        if (platforms[i].y - 60 > height) {
            outOfScreen += 1;
        }
    };
    platforms.splice(0, outOfScreen);
    score = (numberOfPlatforms - 4) * 10;
}, 500)

// ===================== COLLISION CHECK ÚTREIKNINGUR =====================

function colCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;

    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";

                if (boxes.indexOf(shapeB) > 0) {
                    shapeA.y += oY;
                }
            } else {
                if (shapeA.velY > 0) {
                    colDir = "b";
                    shapeA.y -= oY;
                }

            }
        } else {
            if (vX > 0) {
                //indexOf skilar -1 ef hlutur finnst ekki í array
                // þetta tjékkar þá bara veggi ekki platforms
                // af eitthverjum ástæðum vildi þetta ekki virka fyrir index 0 jafnvel þótt -1 sé minna en fokking 0
                if (boxes.indexOf(shapeB) !== -1) {
                    colDir = "l";
                    shapeA.x += oX;
                }
            } else {
                if (boxes.indexOf(shapeB) > 0) {
                    colDir = "r";
                    shapeA.x -= oX;
                }

            }
        }
    }
    return colDir;
}

// ==================== HLUSTAR EFTIR KEYDOWN ============================
// og setur þann takka í true inní keys array
// tjékkar líka á space til að byrja leikinn

document.body.addEventListener("keydown", function (e) {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'ArrowUp') {
        isPlaying = true;
        isPlayingCounter += 1;
    }
});

// ================= HLUSTAR EFTIR KEYUP ===============================
// og setur þann takka í false inní keys array

document.body.addEventListener("keyup", function (e) {

    keys[e.key] = false;
});

// =============== BYRJAR AÐ KEYRA update() ÞEGAR WINDOW HEFUR LOADAST =============
window.addEventListener("load", function () {
    update();
});
