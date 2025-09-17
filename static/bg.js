const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
for(let i=0;i<120;i++){
    particles.push({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: Math.random()*2+1,
        dx: (Math.random()-0.5)*0.5,
        dy: (Math.random()-0.5)*0.5,
        color: `hsl(${Math.random()*360}, 70%, 40%)`
    });
}

let mouse = {x:null, y:null};
window.addEventListener("mousemove",(e)=>{
    mouse.x = e.x;
    mouse.y = e.y;
});

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let p of particles){
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.fill();
        if(mouse.x && mouse.y){
            let dx = p.x - mouse.x;
            let dy = p.y - mouse.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist<100){
                p.x += dx*0.01;
                p.y += dy*0.01;
            }
        }
        p.x += p.dx;
        p.y += p.dy;
        if(p.x<0||p.x>canvas.width) p.dx*=-1;
        if(p.y<0||p.y>canvas.height) p.dy*=-1;
    }
    requestAnimationFrame(animate);
}
animate();
