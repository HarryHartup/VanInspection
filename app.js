const checklist = {

"Lights & Visibility":[
"Headlights (dipped & main)",
"Side lights",
"Brake lights",
"Side Markers",
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

// Store selected photos as an array so multiple selections accumulate
let selectedPhotos = []

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

results[item]={
result:result,
time:time
}

}

function getTimestamp(){

const now=new Date()

const year=now.getFullYear()
const month=String(now.getMonth()+1).padStart(2,'0')
const day=String(now.getDate()).padStart(2,'0')

const hours=String(now.getHours()).padStart(2,'0')
const minutes=String(now.getMinutes()).padStart(2,'0')

return {
display:`${day}/${month}/${year} ${hours}:${minutes}`,
file:`${year}-${month}-${day}_${hours}${minutes}`
}

}

// Attach photo handler after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  buildChecklist()

  const photoInput = document.getElementById("photoUpload")
  const photoCount = document.getElementById("photoCount")

  photoInput.addEventListener("change", () => {
    // Accumulate new files into selectedPhotos, avoiding duplicates by name+size
    const newFiles = Array.from(photoInput.files)
    newFiles.forEach(newFile => {
      const exists = selectedPhotos.some(f => f.name === newFile.name && f.size === newFile.size)
      if (!exists) selectedPhotos.push(newFile)
    })
    // Reset input so same file can be added again if needed, and re-selection works
    photoInput.value = ""
    updatePhotoCount()
  })
})

function updatePhotoCount(){
  const photoCount = document.getElementById("photoCount")
  if(!photoCount) return
  if(selectedPhotos.length === 0){
    photoCount.textContent = ""
  } else {
    photoCount.textContent = `${selectedPhotos.length} photo${selectedPhotos.length > 1 ? "s" : ""} selected`
  }
}

// Helper: load a File as a data URL
function readFileAsDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}

// Helper: get image dimensions from data URL
function getImageDimensions(dataUrl){
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.src = dataUrl
  })
}

async function exportPDF(){

const { jsPDF } = window.jspdf
const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

const pageW = 210
const pageH = 297
const margin = 14
const contentW = pageW - margin * 2

const reg = document.getElementById("reg").value.toUpperCase().trim()
const mileage = document.getElementById("mileage").value
const safe = document.getElementById("safeToDrive").value
const type = document.getElementById("inspectionType").value
const notes = document.getElementById("notes").value
const collection = document.getElementById("collectionLocation").value.trim()
const delivery = document.getElementById("deliveryLocation").value.trim()

const timestamp = getTimestamp()

// ── Colour palette ──────────────────────────────────────────────
const orange   = [255, 122,   0]
const darkBg   = [ 15,  15,  15]
const midGrey  = [ 40,  40,  40]
const lightGrey= [200, 200, 200]
const white    = [255, 255, 255]
const passGreen= [ 39, 174,  96]
const failRed  = [192,  57,  43]
const mutedText= [150, 150, 150]

// ── Helper: draw header bar on any page ─────────────────────────
function drawPageHeader(pageLabel){
  // Dark top bar
  doc.setFillColor(...darkBg)
  doc.rect(0, 0, pageW, 22, "F")

  // Orange left accent
  doc.setFillColor(...orange)
  doc.rect(0, 0, 4, 22, "F")

  // Title
  doc.setTextColor(...white)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.text("VAN INSPECTION REPORT", margin + 2, 13)

  // Right-side label
  doc.setTextColor(...orange)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text(pageLabel, pageW - margin, 9, { align: "right" })

  doc.setTextColor(...mutedText)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text(timestamp.display, pageW - margin, 15, { align: "right" })
}

// ── Helper: draw a small pill badge ─────────────────────────────
function drawBadge(text, color, x, y, w){
  doc.setFillColor(...color)
  doc.roundedRect(x, y - 4, w, 6, 1.5, 1.5, "F")
  doc.setTextColor(...white)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(7)
  doc.text(text, x + w / 2, y, { align: "center" })
}

// ═══════════════════════════════════════════════════════════════
// PAGE 1 — Vehicle details + checklist summary
// ═══════════════════════════════════════════════════════════════
drawPageHeader(type === "PRE" ? "PRE-INSPECTION" : "POST-INSPECTION")

let y = 30

// ── Vehicle detail card ──────────────────────────────────────────
doc.setFillColor(...midGrey)
doc.roundedRect(margin, y, contentW, 54, 3, 3, "F")

// Big reg plate style
doc.setTextColor(...orange)
doc.setFont("helvetica", "bold")
doc.setFontSize(22)
doc.text(reg || "—", margin + 8, y + 12)

// Safe to drive badge
const safeColor = safe === "YES" ? passGreen : failRed
drawBadge(`SAFE TO DRIVE: ${safe}`, safeColor, pageW - margin - 42, y + 5, 42)

// Row 1 — Mileage / Type / Date
doc.setFont("helvetica", "normal")
doc.setFontSize(8)
doc.setTextColor(...lightGrey)
doc.text("MILEAGE", margin + 8, y + 21)
doc.text("TYPE", margin + 70, y + 21)
doc.text("DATE", margin + 120, y + 21)

doc.setTextColor(...white)
doc.setFont("helvetica", "bold")
doc.setFontSize(10)
doc.text(mileage ? `${Number(mileage).toLocaleString()} mi` : "—", margin + 8, y + 28)
doc.text(type === "PRE" ? "Pre-Inspection" : "Post-Inspection", margin + 70, y + 28)
doc.text(timestamp.display, margin + 120, y + 28)

// Divider
doc.setDrawColor(60, 60, 60)
doc.line(margin + 4, y + 33, margin + contentW - 4, y + 33)

// Row 2 — Collection / Delivery
doc.setFont("helvetica", "normal")
doc.setFontSize(8)
doc.setTextColor(...lightGrey)
doc.text("COLLECTION", margin + 8, y + 39)
doc.text("DELIVERY", margin + 100, y + 39)

doc.setTextColor(...white)
doc.setFont("helvetica", "bold")
doc.setFontSize(10)
doc.text(collection || "—", margin + 8, y + 47)
doc.text(delivery || "—", margin + 100, y + 47)

y += 62

// ── Summary counts ───────────────────────────────────────────────
const allItems = Object.values(checklist).flat()
const passCount = Object.values(results).filter(r => r.result === "Pass").length
const failCount = Object.values(results).filter(r => r.result === "Fail").length
const totalChecked = passCount + failCount
const totalItems = allItems.length

// Three stat boxes
const boxW = (contentW - 8) / 3

function statBox(label, value, color, bx){
  doc.setFillColor(...midGrey)
  doc.roundedRect(bx, y, boxW, 18, 2, 2, "F")
  doc.setFillColor(...color)
  doc.roundedRect(bx, y + 13, boxW, 5, 0, 0, "F")
  doc.roundedRect(bx, y + 11, boxW, 7, 2, 2, "F")
  doc.setTextColor(...white)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text(String(value), bx + boxW / 2, y + 10, { align: "center" })
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...white)
  doc.text(label, bx + boxW / 2, y + 16, { align: "center" })
}

statBox("ITEMS CHECKED", `${totalChecked}/${totalItems}`, orange, margin)
statBox("PASSED", passCount, passGreen, margin + boxW + 4)
statBox("FAILED", failCount, failRed, margin + (boxW + 4) * 2)

y += 26

// ── Checklist by section ─────────────────────────────────────────
Object.keys(checklist).forEach(section => {

  const items = checklist[section]
  const sectionFails = items.filter(i => results[i] && results[i].result === "Fail").length
  const sectionChecked = items.filter(i => results[i]).length

  // Section heading
  if (y > pageH - 30) { doc.addPage(); drawPageHeader(type === "PRE" ? "PRE-INSPECTION" : "POST-INSPECTION"); y = 30 }

  doc.setFillColor(...darkBg)
  doc.rect(margin, y, contentW, 8, "F")
  doc.setFillColor(...orange)
  doc.rect(margin, y, 3, 8, "F")

  doc.setTextColor(...orange)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text(section.toUpperCase(), margin + 6, y + 5.5)

  // Section mini stats
  doc.setTextColor(...mutedText)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.text(`${sectionChecked}/${items.length} checked`, pageW - margin, y + 5.5, { align: "right" })

  y += 11

  items.forEach(item => {

    if (y > pageH - 14) { doc.addPage(); drawPageHeader(type === "PRE" ? "PRE-INSPECTION" : "POST-INSPECTION"); y = 30 }

    const itemResult = results[item]
    const isPassed = itemResult && itemResult.result === "Pass"
    const isFailed = itemResult && itemResult.result === "Fail"

    // Row background on fail
    if (isFailed) {
      doc.setFillColor(60, 20, 20)
      doc.rect(margin, y - 3, contentW, 8, "F")
    }

    // Status indicator dot
    if (isPassed) {
      doc.setFillColor(...passGreen)
      doc.circle(margin + 3, y + 1, 1.5, "F")
    } else if (isFailed) {
      doc.setFillColor(...failRed)
      doc.circle(margin + 3, y + 1, 1.5, "F")
    } else {
      doc.setFillColor(...midGrey)
      doc.circle(margin + 3, y + 1, 1.5, "F")
    }

    // Item text
    doc.setFont("helvetica", isFailed ? "bold" : "normal")
    doc.setFontSize(9)
    doc.setTextColor(isFailed ? white : lightGrey)
    doc.text(item, margin + 8, y + 2.5)

    // Result badge
    if (itemResult) {
      const badgeColor = isPassed ? passGreen : failRed
      const badgeText = isPassed ? "PASS" : "FAIL"
      drawBadge(badgeText, badgeColor, pageW - margin - 20, y + 3, 20)

      // Time
      doc.setTextColor(...mutedText)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7)
      doc.text(itemResult.time, pageW - margin - 23, y + 2.5, { align: "right" })
    }

    y += 8

  })

  y += 3

})

// ── Notes ────────────────────────────────────────────────────────
if (notes.trim()) {

  if (y > pageH - 40) { doc.addPage(); drawPageHeader(type === "PRE" ? "PRE-INSPECTION" : "POST-INSPECTION"); y = 30 }

  y += 4

  doc.setFillColor(...darkBg)
  doc.rect(margin, y, contentW, 8, "F")
  doc.setFillColor(...orange)
  doc.rect(margin, y, 3, 8, "F")
  doc.setTextColor(...orange)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.text("NOTES", margin + 6, y + 5.5)
  y += 12

  doc.setFillColor(25, 25, 25)
  const noteLines = doc.splitTextToSize(notes, contentW - 12)
  const noteBoxH = noteLines.length * 5.5 + 10
  doc.roundedRect(margin, y, contentW, noteBoxH, 2, 2, "F")
  doc.setFillColor(...orange)
  doc.rect(margin, y, 2, noteBoxH, "F")

  doc.setTextColor(...lightGrey)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.text(noteLines, margin + 6, y + 7)
  y += noteBoxH + 6

}

// ═══════════════════════════════════════════════════════════════
// PHOTOS — one per page, full-width, with filename caption
// ═══════════════════════════════════════════════════════════════
if (selectedPhotos.length) {

  for (let i = 0; i < selectedPhotos.length; i++) {

    const file = selectedPhotos[i]
    const dataUrl = await readFileAsDataURL(file)
    const dims = await getImageDimensions(dataUrl)

    doc.addPage()
    drawPageHeader(type === "PRE" ? "PRE-INSPECTION" : "POST-INSPECTION")

    // Photo label bar
    let py = 28
    doc.setFillColor(...darkBg)
    doc.rect(margin, py, contentW, 8, "F")
    doc.setFillColor(...orange)
    doc.rect(margin, py, 3, 8, "F")
    doc.setTextColor(...orange)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text(`PHOTO ${i + 1} OF ${selectedPhotos.length}`, margin + 6, py + 5.5)
    doc.setTextColor(...mutedText)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.text(file.name, pageW - margin, py + 5.5, { align: "right" })

    py += 12

    // Fit image to available space, maintaining aspect ratio
    const maxW = contentW
    const maxH = pageH - py - margin - 10
    const imgAspect = dims.width / dims.height
    const boxAspect = maxW / maxH

    let imgW, imgH
    if (imgAspect > boxAspect) {
      imgW = maxW
      imgH = maxW / imgAspect
    } else {
      imgH = maxH
      imgW = maxH * imgAspect
    }

    const imgX = margin + (maxW - imgW) / 2
    doc.addImage(dataUrl, "JPEG", imgX, py, imgW, imgH)

    // Vehicle reg watermark at bottom
    py = pageH - margin - 4
    doc.setTextColor(...midGrey)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.text(`${reg} · ${timestamp.display}`, pageW / 2, py, { align: "center" })

  }

}

// ── Footer on every page ─────────────────────────────────────────
const totalPages = doc.internal.getNumberOfPages()
for (let p = 1; p <= totalPages; p++) {
  doc.setPage(p)
  doc.setDrawColor(...midGrey)
  doc.line(margin, pageH - 10, pageW - margin, pageH - 10)
  doc.setTextColor(...mutedText)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text(`Van Inspection · ${reg}`, margin, pageH - 5)
  doc.text(`Exported: ${timestamp.display}`, pageW / 2, pageH - 5, { align: "center" })
  doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: "right" })
}

doc.save(`Inspection_${reg}_${timestamp.file}.pdf`)

}
