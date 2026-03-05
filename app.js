const checklist = {

"Lights & Visibility":[
"Headlights (dipped & main)",
"Side lights",
"Brake lights",
"Indicators",
"Hazard lights",
"Reverse light",
"Number plate lights",
"Lights clean and secure",
"Windscreen clear of cracks",
"Windscreen clean inside",
"Mirrors clean and secure"
],

"Tyres & Wheels":[
"Tread above legal limit",
"No cuts or bulges",
"Correct tyre pressures",
"Wheel nuts present",
"No damaged wheels",
"Spare wheel or repair kit"
],

"Brakes & Steering":[
"Foot brake responsive",
"Handbrake holds vehicle",
"Steering free from play",
"No unusual noises"
],

"Bodywork & Doors":[
"No sharp edges",
"Doors open and close securely",
"Sliding/rear doors latch correctly",
"Vehicle locks correctly",
"No visible fluid leaks"
],

"Cab & Controls":[
"Seat secure",
"Seatbelt working",
"Horn works",
"Wipers working",
"Washers working",
"Heater/demister working",
"No warning lights showing",
"Fuel card present in van"
],

"Safety Equipment":[
"First aid kit",
"Fire extinguisher (if required)",
"Hi-vis vest"
],

"Load Area":[
"Load secure",
"Bulkhead secure",
"No loose items",
"Vehicle not overloaded"
]

}

let results = {}

let totalChecks = Object.values(checklist).flat().length



function setInspection(type){

document.getElementById("inspectionType").value = type

preBtn.classList.remove("active")
postBtn.classList.remove("active")

if(type==="Pre"){
preBtn.classList.add("active")
}else{
postBtn.classList.add("active")
}

}



function setSafe(value){

document.getElementById("safeToDrive").value = value ? "Yes":"No"

safeBtn.classList.remove("active")
unsafeBtn.classList.remove("active")

if(value){
safeBtn.classList.add("active")
}else{
unsafeBtn.classList.add("active")
}

}



function buildChecklist(){

const container = document.getElementById("checklist")

Object.keys(checklist).forEach(section=>{

let sec = document.createElement("div")
sec.className="section"

sec.innerHTML=`<h3>${section}</h3>`

checklist[section].forEach(item=>{

let row=document.createElement("div")
row.className="item"

row.innerHTML=`

<span>${item}</span>

<div class="buttons">

<button class="pass">PASS</button>

<button class="fail">FAIL</button>

</div>
`

const pass=row.querySelector(".pass")
const fail=row.querySelector(".fail")

pass.onclick=()=>record(item,"Pass")
fail.onclick=()=>record(item,"Fail")

sec.appendChild(row)

})

container.appendChild(sec)

})

}



function record(item,result){

if(!results[item]){

results[item]={
result:result,
time:new Date().toLocaleString()
}

}else{

results[item].result=result

}

updateProgress()

checkCriticalFails(item,result)

}



function updateProgress(){

let done=Object.keys(results).length

let percent=Math.round((done/totalChecks)*100)

document.getElementById("progress").innerText=`${percent}% Complete`

}



function checkCriticalFails(item,result){

const critical = [

"Tread above legal limit",
"Foot brake responsive",
"Steering free from play",
"No warning lights showing"

]

if(result==="Fail" && critical.includes(item)){

setSafe(false)

}

}



async function exportPDF(){

const { jsPDF } = window.jspdf
const doc=new jsPDF()

let y=15

const reg=document.getElementById("reg").value
const mileage=document.getElementById("mileage").value
const safe=document.getElementById("safeToDrive").value
const driver=document.getElementById("driver").value
const type=document.getElementById("inspectionType").value
const notes=document.getElementById("notes").value

const files=document.getElementById("photoUpload").files

const date=new Date().toLocaleString()

doc.setFontSize(18)
doc.text("Vehicle Inspection Report",10,y)

y+=10

doc.setFontSize(12)

doc.text(`Date: ${date}`,10,y)
y+=7
doc.text(`Driver: ${driver}`,10,y)
y+=7
doc.text(`Inspection: ${type}`,10,y)
y+=7
doc.text(`Vehicle: ${reg}`,10,y)
y+=7
doc.text(`Mileage: ${mileage}`,10,y)
y+=7
doc.text(`Safe To Drive: ${safe}`,10,y)

y+=10

Object.keys(checklist).forEach(section=>{

doc.setFontSize(14)
doc.text(section.toUpperCase(),10,y)

y+=6

doc.setFontSize(11)

checklist[section].forEach(item=>{

if(results[item]){

let icon = results[item].result==="Pass" ? "✔":"✖"

let line=`${icon} ${item} - ${results[item].result} - ${results[item].time}`

doc.text(line,12,y)

y+=6

if(y>270){
doc.addPage()
y=15
}

}

})

y+=3

})

if(notes){

doc.addPage()

doc.setFontSize(14)
doc.text("NOTES",10,15)

doc.setFontSize(11)
doc.text(notes,10,25)

}

doc.save(`inspection_${reg}.pdf`)

}

buildChecklist()
