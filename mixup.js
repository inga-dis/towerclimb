(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    width = 1500,
    height = 800,

    // ============ player object =====================
    player = {
        x: width / 2,
        y: 200,
        width: 80,
        height: 100,
        speed: 3,
        velX: 0,
        velY: 0,
        grounded: false,
        jumping: false,
        // isPlaying = false; //setja í true þegar collision við fyrsta platform?
    },

    // ================ global variables ======================
    keys = [],
    friction = 0.8,
    gravity = 0.4,
    boxes = [],
    platforms = [],
    score = 0,
    playerHeight = 1;

// ======== veggir og jörð  ===================

//jörð

boxes.push({
    x: 0,
    y: height - 20,
    width: width,
    height: 20
});



//left veggur
boxes.push({
    x: 0,
    y: 0,
    width: 20,
    height: height
});

//hægri veggur
boxes.push({
    x: width - 20,
    y: 0,
    width: 20,
    height: height
});

//loft
boxes.push({
    x: 0,
    y: 0,
    width: width,
    height: 0.01
})


canvas.width = width;
canvas.height = height;


function update() {
    // ================= key inputs, movement ==========================
    if (keys[' '] || keys['ArrowUp']) {
        // up arrow eða space
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false;
            player.velY = -player.speed * 4;// breyta constant hérna til að setja jump hæð
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


    // ================ TEIKNA VEGGI OG GÓLF ===============================

    for (var i = 0; i < boxes.length; i++) {//print boxes
        ctx.fillStyle = 'blue';
        ctx.rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        var dir = colCheck(player, boxes[i]);

        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velY *= -1;
        }
        if (player.grounded) {
            player.velY = 0;
        }

    }

    // ============= BÚA TIL PLATFORMS OG TJÉKKA COLLISION VIÐ PLAYER =====================

    for (var i = 0; i < platforms.length; i++) {
        ctx.fillStyle = 'green';
        ctx.rect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
        platforms[i].velY = gravity * 5;
        platforms[i].y += platforms[i].velY * 2;

        var dir = colCheck(player, platforms[i]);

        if (dir === "l" || dir === "r") {
            player.velX = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
            // setur player Y velocity í sama og pallurinn sem hann snertir til að líkja eftir
            // að hann sé standandi á honum
            player.velY = platforms[i].velY;
            player.y = platforms[i].y - player.height;
        }
        // else if (dir === "t") {
        //     if (platforms[i].y < platforms[i].height) {
        //         player.velY *= -1;
        //     }
        // }
    }

    // ============= ALLAR HREYFINGAR GERAST HÉR ==================
    player.x += player.velX * 3; // constant til að hlaupa hraðar
    player.y += player.velY * 2;


    // ================ TEIKNAR PLAYER =====================

    ctx.fill();
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);


    // if (player.y > height) {
    //     console.log('game over');
    // }

    if (player.y < height) {
        requestAnimationFrame(update);
    } else {
        alert('GAME OVER DUDE');
    }
    // update kallar á sjálft sig fyrir loopu

}


// ============ BÝR TIL PLATFORMS Á 2 SEK FRESTI ========================

//léttara en að setja pásu inní main loop
//eftir að gera þetta að while playing
//hafa fyrstu platforms static og byrjar að hreyfast og generatea eftir fyrsta touch?!!

setInterval(() => {
    score += 10;
    console.log(score);
    platforms.push({
        x: (Math.random() * ((width - 300) - 20) + 20),
        y: -20,
        y: (Math.random() * -50),
        // return Math.random() * (max - min) + min;
        width: 300,
        height: 40,
        velY: 0,
        score: 10
    }, {
        x: (Math.random() * ((width - 300) - 20) + 20),
        y: (Math.random() * -500),
        width: 300,
        height: 40,
        velY: 0,
        score: 10
    })
}, 1000);
//setja breytu í stað 1500 hérna til að setja gamespeed, þarf þá líka að stilla gravity á platforms í leiðinni!!

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
                shapeA.y += oY;
                //ef við viljum hafa jump í gegnum platforms
                // if (shapeB.height === 0.01) {
                //     shapeA.y += oY;
                //     console.log("You can't go faster than the camera!");
                // }
            } else {
                colDir = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                shapeA.x += oX;
            } else {
                colDir = "r";
                shapeA.x -= oX;
            }
        }
    }
    return colDir;
}

// ==================== HLUSTAR EFTIR KEYDOWN ============================
// og setur þann takka í true inní keys array

document.body.addEventListener("keydown", function (e) {
    keys[e.key] = true;
});

// ================= HLUSTAR EFTIR KEYUP ===============================
// og setur þann takka í false inní keys array

document.body.addEventListener("keyup", function (e) {
    keys[e.key] = false;
});


//hérna mun koma event fyrir spacebar keypress svo það virki ekki að halda honum niðri!!!
// document.body.addEventListener('keypress', () => {

// })

// =============== BYRJAR AÐ KEYRA update() ÞEGAR WINDOW HEFUR LOADAST =============
window.addEventListener("load", function () {
    update();
});