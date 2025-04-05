"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawTable = void 0;
function drawTable(doc, data, position) {
    const startX = position.x;
    const startY = position.y;
    const header = Object.keys(data[0]);
    const cellWidth = 300;
    const cellPadding = 25;
    doc.font('Helvetica-Bold');
    let currentY = startY;
    header.forEach((headerText, i) => {
        doc.text(headerText, startX + i * cellWidth, currentY);
    });
    doc.font('Helvetica');
    data.forEach((row, i) => {
        currentY += 20;
        Object.values(row).forEach((cell, j) => {
            doc.text(cell, startX + j * cellWidth, currentY);
        });
    });
}
exports.drawTable = drawTable;
