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
"Mirrors clean and secure",
"Mirrors adjusted correctly"
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
"Heater/demister working"
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
],

"Operational":[
"Fuel card present in van"
]

}

const results = {}

function buildChecklist(){

const container = document.getElementById("checklist")

Object.keys(checklist).forEach(section=>{

let sectionDiv=document.createElement("div")
sectionDiv.className="section"

let title=document.createElement("h3")
title.innerText=section

sectionDiv.appendChild(title)

checklist[section].forEach(item=>{

let row=document.createElement("div")
row.className="item"

let label=document.createElement("span")
label.innerText=item

let pass=document.createElement("button")
pass.innerText="Pass"
pass.className="passBtn"
pass.onclick=()=>record(item,"Pass")

let fail=document.createElement("button")
fail.innerText="Fail"
fail.className="failBtn"
fail.onclick=()=>record(item,"Fail")

let buttons=document.createElement("div")
buttons.appendChild(pass)
buttons.appendChild(fail)

row.appendChild(label)
row.appendChild(buttons)

sectionDiv.appendChild(row)

})

container.appendChild(sectionDiv)

})

}

function record(item,result){
const time=new Date().toLocaleTimeString()
results[item]={result,time}
}

function getExportTimestamp(){

const now=new Date()

const year=now.getFullYear()
const month=String(now.getMonth()+1).padStart(2,'0')
const day=String(now.getDate()).padStart(2,'0')

const hours=String(now.getHours()).padStart(2,'0')
const minutes=String(now.getMinutes()).padStart(2,'0')

return{
display:`${day}/${month}/${year} ${hours}:${minutes}`,
file:`${year}-${month}-${day}_${hours}${minutes}`
}

}

async function exportPDF(){

const { jsPDF } = window.jspdf
const doc=new jsPDF()

const reg=document.getElementById("reg").value
const mileage=document.getElementById("mileage").value
const safe=document.getElementById("safeToDrive").value
const type=document.getElementById("inspectionType").value
const notes=document.getElementById("notes").value
const photos=document.getElementById("photoUpload").files

const timestamp=getExportTimestamp()

let y=15

doc.setFontSize(18)
doc.text("Vehicle Inspection Report",10,y)

y+=10

doc.setFontSize(12)

doc.text(`Inspection Type: ${type}`,10,y); y+=7
doc.text(`Vehicle Registration: ${reg}`,10,y); y+=7
doc.text(`Mileage: ${mileage}`,10,y); y+=7
doc.text(`Safe To Drive: ${safe}`,10,y); y+=7
doc.text(`Exported: ${timestamp.display}`,10,y)

y+=10

Object.keys(results).forEach(item=>{

let symbol=results[item].result==="Pass"?"✔":"✖"

doc.text(`${symbol} ${item} - ${results[item].result} - ${results[item].time}`,10,y)

y+=6

if(y>270){
doc.addPage()
y=15
}

})

if(notes){

doc.addPage()

doc.text("Notes",10,15)
doc.text(notes,10,25)

}

if(photos.length){

doc.addPage()

doc.text("Photos",10,15)

let imgY=25

for(let file of photos){

const reader=new FileReader()

await new Promise(resolve=>{

reader.onload=function(e){

doc.addImage(e.target.result,"JPEG",10,imgY,180,90)

imgY+=100

resolve()

}

reader.readAsDataURL(file)

})

}

}

doc.save(`Inspection_${reg}_${timestamp.file}.pdf`)

}

buildChecklist()