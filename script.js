const canvas=document.getElementById("graphCanvas");
const ctx=canvas.getContext("2d");

const mstCanvas=document.getElementById("mstCanvas");
const mstCtx=mstCanvas.getContext("2d");

let nodes=[];
let edges=[];
let animating=false;

/* ---------- UTIL ---------- */
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function out(t){document.getElementById("output").innerText=t;}

/* ---------- GRAPH GENERATOR ---------- */
function randomGraph(n=7,density=0.5){

nodes=[];
edges=[];

/* ---------- NODE GENERATION ---------- */
const MIN_DIST=70;

function valid(x,y){
for(let p of nodes){
let dx=p.x-x;
let dy=p.y-y;
if(Math.sqrt(dx*dx+dy*dy)<MIN_DIST) return false;
}
return true;
}

for(let i=0;i<n;i++){
let x,y,tries=0;
do{
x=Math.random()*550+50;
y=Math.random()*300+50;
tries++;
}while(!valid(x,y)&&tries<500);

nodes.push({x,y});
}


/* ---------- GEOMETRY HELPERS ---------- */

function lineIntersectsNode(x1,y1,x2,y2,cx,cy,r){
let dx=x2-x1;
let dy=y2-y1;
let t=((cx-x1)*dx+(cy-y1)*dy)/(dx*dx+dy*dy);
t=Math.max(0,Math.min(1,t));
let px=x1+t*dx;
let py=y1+t*dy;
return Math.hypot(px-cx,py-cy)<r+6;
}

function linesIntersect(a,b,c,d,p,q,r,s){
function ccw(x1,y1,x2,y2,x3,y3){
return (y3-y1)*(x2-x1)>(y2-y1)*(x3-x1);
}
return(
ccw(a,b,p,q,r,s)!=ccw(c,d,p,q,r,s) &&
ccw(a,b,c,d,p,q)!=ccw(a,b,c,d,r,s)
);
}

function validEdge(i,j){
let A=nodes[i];
let B=nodes[j];

/* no passing through nodes */
for(let k=0;k<n;k++){
if(k===i||k===j) continue;
let C=nodes[k];
if(lineIntersectsNode(A.x,A.y,B.x,B.y,C.x,C.y,18))
return false;
}

/* no edge intersections */
for(let e of edges){
let C=nodes[e.from];
let D=nodes[e.to];
if(linesIntersect(A.x,A.y,B.x,B.y,C.x,C.y,D.x,D.y))
return false;
}

return true;
}


/* ---------- STEP 1: CREATE RANDOM SPANNING TREE ---------- */

let unused=[...Array(n).keys()];
let used=[unused.shift()];

while(unused.length){

let u=used[Math.floor(Math.random()*used.length)];
let v=unused[Math.floor(Math.random()*unused.length)];

if(validEdge(u,v)){
edges.push({
from:u,
to:v,
weight:Math.floor(Math.random()*9)+1,
active:false,
mst:false
});

used.push(v);
unused.splice(unused.indexOf(v),1);
}
}


/* ---------- STEP 2: ADD EXTRA EDGES ---------- */

for(let i=0;i<n;i++){
for(let j=i+1;j<n;j++){

if(Math.random()>density) continue;
if(edges.some(e=>(e.from===i&&e.to===j)||(e.from===j&&e.to===i)))
continue;

if(!validEdge(i,j)) continue;

edges.push({
from:i,
to:j,
weight:Math.floor(Math.random()*9)+1,
active:false,
mst:false
});
}
}


/* ---------- DRAW ---------- */
draw();
mstCtx.clearRect(0,0,mstCanvas.width,mstCanvas.height);
}



/* ---------- GEOMETRY HELPERS ---------- */

function lineIntersectsNode(x1,y1,x2,y2,cx,cy,r){
let dx=x2-x1;
let dy=y2-y1;

let t=((cx-x1)*dx+(cy-y1)*dy)/(dx*dx+dy*dy);
t=Math.max(0,Math.min(1,t));

let px=x1+t*dx;
let py=y1+t*dy;

return Math.hypot(px-cx,py-cy)<r+6;
}

function linesIntersect(a,b,c,d,p,q,r,s){
function ccw(x1,y1,x2,y2,x3,y3){
return (y3-y1)*(x2-x1)>(y2-y1)*(x3-x1);
}

return(
ccw(a,b,p,q,r,s)!=ccw(c,d,p,q,r,s) &&
ccw(a,b,c,d,p,q)!=ccw(a,b,c,d,r,s)
);
}


/* ---------- EDGE GENERATION (SMART) ---------- */

for(let i=0;i<n;i++){
for(let j=i+1;j<n;j++){

if(Math.random()>density) continue;

let A=nodes[i];
let B=nodes[j];
let validEdge=true;

/* check passes through node */
for(let k=0;k<n;k++){
if(k===i||k===j) continue;

let C=nodes[k];

if(lineIntersectsNode(A.x,A.y,B.x,B.y,C.x,C.y,18)){
validEdge=false;
break;
}
}

if(!validEdge) continue;

/* check intersection with existing edges */
for(let e of edges){
let C=nodes[e.from];
let D=nodes[e.to];

if(linesIntersect(A.x,A.y,B.x,B.y,C.x,C.y,D.x,D.y)){
validEdge=false;
break;
}
}

if(!validEdge) continue;

/* add edge */
edges.push({
from:i,
to:j,
weight:Math.floor(Math.random()*9)+1,
active:false,
mst:false
});

}
}

/* ---------- DRAW ---------- */
draw();
mstCtx.clearRect(0,0,mstCanvas.width,mstCanvas.height);



/* ---------- DRAW ---------- */
function draw(highlight=null){

ctx.clearRect(0,0,canvas.width,canvas.height);

edges.forEach(e=>{
let a=nodes[e.from];
let b=nodes[e.to];

ctx.beginPath();
ctx.moveTo(a.x,a.y);
ctx.lineTo(b.x,b.y);

if(e.mst) ctx.strokeStyle="#00ff88";
else if(e.active) ctx.strokeStyle="#ffd166";
else ctx.strokeStyle="#aaa";

ctx.lineWidth=e.mst?4:2;
ctx.stroke();

ctx.fillStyle="white";
ctx.fillText(e.weight,(a.x+b.x)/2,(a.y+b.y)/2);
});

nodes.forEach((n,i)=>{
ctx.beginPath();
ctx.arc(n.x,n.y,18,0,Math.PI*2);
ctx.fillStyle=i===highlight?"#ff4d6d":"#00eaff";
ctx.fill();

ctx.fillStyle="black";
ctx.fillText(i,n.x-5,n.y+5);
});
}

/* ---------- DIJKSTRA ---------- */
async function runDijkstra(){
if(animating)return;
animating=true;

let dist=Array(nodes.length).fill(Infinity);
let vis=new Set();
dist[0]=0;

while(vis.size<nodes.length){

let u=-1,min=Infinity;
for(let i=0;i<dist.length;i++)
if(!vis.has(i)&&dist[i]<min){min=dist[i];u=i;}

if(u==-1)break;
vis.add(u);

draw(u);
await sleep(600);

for(let e of edges){

if(e.from===u||e.to===u){

let v=e.from===u?e.to:e.from;

e.active=true;
draw(u);
await sleep(400);

if(dist[u]+e.weight<dist[v])
dist[v]=dist[u]+e.weight;

e.active=false;
}
}
}

out("Dijkstra → "+dist.join(" , "));
animating=false;
}

/* ---------- BELLMAN ---------- */
async function runBellman(){
if(animating)return;
animating=true;

let dist=Array(nodes.length).fill(Infinity);
dist[0]=0;

for(let i=0;i<nodes.length-1;i++){
for(let e of edges){

e.active=true;
draw(e.from);
await sleep(200);

if(dist[e.from]+e.weight<dist[e.to])
dist[e.to]=dist[e.from]+e.weight;

if(dist[e.to]+e.weight<dist[e.from])
dist[e.from]=dist[e.to]+e.weight;

e.active=false;
}
}

out("Bellman → "+dist.join(" , "));
animating=false;
}

/* ---------- PRIM MST ---------- */
async function runPrim(){

if(animating) return;
animating=true;

/* reset states */
edges.forEach(e=>{
    e.mst=false;
    e.active=false;
});

/* clear MST panel */
mstCtx.clearRect(0,0,mstCanvas.width,mstCanvas.height);

let visited=new Set([0]);

while(visited.size < nodes.length){

let best=null;

/* find minimum valid edge */
for(let e of edges){
if(
(visited.has(e.from)&&!visited.has(e.to)) ||
(visited.has(e.to)&&!visited.has(e.from))
){
if(!best || e.weight < best.weight)
best=e;
}
}

if(!best) break;

/* highlight edge in main graph */
best.active=true;
draw();
await sleep(600);

/* mark chosen */
best.active=false;
best.mst=true;
visited.add(best.from);
visited.add(best.to);

/* draw instantly in MST panel */
drawMST();

/* show chosen */
draw();
await sleep(600);
}

/* reset main graph colors */
edges.forEach(e=>{
e.active=false;
e.mst=false;
});
draw();

out("MST Completed");
animating=false;
}


/* ---------- DRAW MST PANEL ---------- */
function drawMST(){

mstCtx.clearRect(0,0,mstCanvas.width,mstCanvas.height);

/* draw mst edges */
edges.filter(e=>e.mst).forEach(e=>{
let a=nodes[e.from];
let b=nodes[e.to];

mstCtx.beginPath();
mstCtx.moveTo(a.x,a.y);
mstCtx.lineTo(b.x,b.y);
mstCtx.strokeStyle="#00ff88";
mstCtx.lineWidth=4;
mstCtx.stroke();
});

/* draw nodes */
nodes.forEach(n=>{
mstCtx.beginPath();
mstCtx.arc(n.x,n.y,18,0,Math.PI*2);
mstCtx.fillStyle="#00ffd5";
mstCtx.fill();
});
}


/* ---------- START ---------- */
randomGraph();
