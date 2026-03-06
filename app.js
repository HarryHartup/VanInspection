
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

let buttonRow=document.createElement("div")
buttonRow.className="buttonRow"

let pass=document.createElement("button")
pass.innerText="PASS"
pass.className="passBtn"

let fail=document.createElement("button")
fail.innerText="FAIL"
fail.className="failBtn"

pass.onclick=()=>{
record(item,"Pass")
pass.classList.add("active")
fail.classList.remove("active")
}

fail.onclick=()=>{
record(item,"Fail")
fail.classList.add("active")
pass.classList.remove("active")
}

buttonRow.appendChild(pass)
buttonRow.appendChild(fail)

row.appendChild(label)
row.appendChild(buttonRow)

sectionDiv.appendChild(row)

})

container.appendChild(sectionDiv)

})

}

function record(item,result){
const time=new Date().toLocaleTimeString()
results[item]={result,time}
}

buildChecklist()
