(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 1100,
    height = 900,

    // ============ player object =====================
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

    // ================ global variables ======================
    keys = [],
    friction = 0.8,
    gravity = 0.4,
    boxes = [],
    platforms = [],
    platformWidth = width / 3,
    score = 0,
    time = 700,
    isPlayingCounter = 0,
    isPlaying = false,
    harold = new Image(),
    platformImg = new Image(),
    song = new Audio(),
    death = new Audio(),
    jump = new Audio();



// ======== static veggir og jörð sett inní array ===================

//pusha nokkrum platforms í byrjun til að hefja leik
platforms.push({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    velY: 0
});

platforms.push({
    x: (Math.random() * ((width - 300) - 20) + 20),
    y: 400,
    width: platformWidth,
    height: 60,
    velY: 0,
});

platforms.push({
    x: (Math.random() * ((width - 300) - 20) + 20),
    y: 600,
    width: platformWidth,
    height: 60,
    velY: 0,
});

platforms.push({
    x: (Math.random() * ((width - 300) - 20) + 20),
    y: 200,
    width: platformWidth,
    height: 60,
    velY: 0,
});

platforms.push({
    x: (Math.random() * ((width - 300) - 20) + 20),
    y: 100,
    width: platformWidth,
    height: 60,
    velY: 0,
});

//vinstri veggur
boxes.push({
    x: -10,
    y: -200,
    width: 10,
    height: height + 200
});

//hægri veggur
//auka hæð svo ekki sé hægt að hoppa yfir vegginn
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
    harold.src = 'img/harold(1).png';


    //=========== sprite management =============

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


    // ================= key inputs, movement ==========================
    if (keys[' '] || keys['ArrowUp']) {
        // up arrow eða space
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false;
            player.velY = -player.speed * 4;// breyta constant hérna til að setja jump hæð
            jump.play();
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

    //friction sér um smooth stop í staðinn fyrir full stop, x er alltaf að breytast eftir fyrstu hreyfingu
    player.velX *= friction;
    player.velY += gravity;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    player.grounded = false;

    // ================ teikna score ======================

    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Score: " + score, 30, 50);

    // ================ TEIKNA VEGGI OG TJÉKKA COLLISION ===============================

    for (var i = 0; i < boxes.length; i++) {//print boxes
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        var dir = colCheck(player, boxes[i]);

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

    for (var i = 0; i < platforms.length; i++) {
        platformImg.src = 'img/platform.png'

        // reyna finna 10 hvern platform og láta hann covera allan skjáinn í width
        if (i % 10 === 0 && i !== 0) {
            platforms[i].width = width;
            platforms[i].x = 0;
        }
        ctx.drawImage(platformImg, platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height)
        if (isPlaying) {
            platforms[i].velY = gravity * 5;
            platforms[i].y += platforms[i].velY * 2;
        }


        var dir = colCheck(player, platforms[i]);

        if (dir === "b") {
            player.grounded = true;
            player.jumping = false;

            // setur player Y velocity í sama og pallurinn sem hann snertir til að líkja eftir
            // að hann sé standandi á honum
            player.velY = platforms[i].velY;
        }
    }

    // ============= ALLAR HREYFINGAR GERAST HÉR ==================
    player.x += player.velX * 5; // constant til að hlaupa hraðar
    player.y += player.velY * 2;

    if (player.y < 0) {
        gravity = 1;
        player.speed = 3.75;
        time = 400;
    } else if (player.y < height / 4) {
        gravity = 0.85;
        player.speed = 3.5;
        time = 500;
    } else if (player.y < height / 2) {
        gravity = 0.65;
        player.speed = 3.25;
        time = 600;
    } else {
        gravity = 0.4;
        time = 700;
    }



    // ================ TEIKNAR PLAYER =====================

    // ctx.fill();
    // ctx.fillStyle = 'red';
    // ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.drawImage(harold, player.x, player.y, player.width, player.height);

    if (isPlayingCounter === 1) {
        periodicall();
        isPlayingCounter = 2;
    }

    song.play();
    if (player.y < height) {
        requestAnimationFrame(update);

    } else {
        song.pause();
        death.play();
        isPlaying = false;
        //gera highscore lista svona
        //þarf að gera restart takka sem resettar hann ekki!!!
        let first = document.getElementById('first');
        first.innerHTML = score;
        alert(`Game Over \n Score: ${score}`);
    }
    // update kallar á sjálft sig fyrir loopu
}


// ============ BÝR TIL PLATFORMS Á 2 SEK FRESTI ========================

//léttara en að setja pásu inní main loop
//eftir að gera þetta að while playing
//hafa fyrstu platforms static og byrjar að hreyfast og generatea eftir fyrsta touch?!!


function periodicall() {
    platforms.push({
        x: (Math.random() * (width - platformWidth)),
        y: 0,
        width: platformWidth,
        height: 60,
        velY: 0,
    });
    setTimeout(periodicall, time);
}

setInterval(() => {
    let overPlatforms = 0;
    let outOfScreen = 0;
    for (let i = 0; i < platforms.length; i++) {
        if ((i !== 0) && (platforms[i].y > player.y)) {
            overPlatforms += 1;
        }
    };
    score = overPlatforms * 10
}, 500)




// setInterval(() => {
//     platforms.push({
//         x: (Math.random() * ((width - 300) - 20) + 20),
//         y: 0,
//         width: platformWidth,
//         height: 60,
//         velY: 0,
//     });
// }, 1100);

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

                //ef við viljum ekki hafa jump í gegnum platforms
                // shapeA.y += oY;

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
                // af einhverjum ástæðum vildi þetta ekki virka fyrir index 0 jafnvel þótt -1 sé minna en fokking 0
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


// ==================== CHARACTER ANIMATION FRÁ SPRITESHEET ===========================
