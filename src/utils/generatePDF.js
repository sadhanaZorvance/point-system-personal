/**
 * generatePDF — Generates a printable "StarPoints chart" PDF using jsPDF.
 * Emojis are stripped to text labels since standard PDF fonts don't support them.
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Map common emoji chars to short text labels for PDF
const EMOJI_MAP = {
  '🌞': '[Sun]', '🦷': '[Teeth]', '🚿': '[Shower]', '🥣': '[Bfast]', '🎒': '[Bag]',
  '🛏️': '[Bed]', '📚': '[HW]', '📖': '[Read]', '🧹': '[Chore]', '🤝': '[Help]',
  '🎵': '[Music]', '🥗': '[Lunch]', '🍽️': '[Dinner]', '🧽': '[Clean]', '🛌': '[Sleep]',
  '😊': '[Happy]', '😤': '[Rude]', '📱': '[Screen]', '🚫': '[No]', '🤥': '[Lie]',
  '💥': '[Fight]', '🗑️': '[Mess]', '🎁': '[Gift]', '🎬': '[Movie]', '🎮': '[Game]',
  '🌙': '[Night]', '🍕': '[Pizza]', '🧸': '[Toy]', '🍔': '[Food]', '🎡': '[Outing]',
  '🍿': '[Popcorn]', '🎳': '[Bowling]', '🎢': '[Park]', '⭐': '[Star]', '🏆': '[Trophy]',
}

function stripEmoji(str) {
  if (!str) return ''
  let result = str
  for (const [emoji, label] of Object.entries(EMOJI_MAP)) {
    result = result.split(emoji).join('')
  }
  // Remove any remaining emoji/non-latin chars using regex
  return result.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim()
}

/**
 * Generate and download a printable PDF chart.
 * @param {object} profile - user profile
 * @param {Array} tasks - all tasks
 * @param {Array} rewards - all rewards
 */
export function generatePDF(profile, tasks, rewards) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const colW = (pageW - margin * 2 - 6) / 2

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  // ── HEADER ───────────────────────────────────────────────────────────────
  doc.setFillColor(88, 28, 220) // violet-700
  doc.rect(0, 0, pageW, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text(`${stripEmoji(profile.avatar)} ${stripEmoji(profile.name)}'s StarPoints Chart`, margin, 12)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Balance: ${profile.current_balance} pts  |  Lifetime: ${profile.lifetime_points} pts  |  Printed: ${today}`, margin, 21)

  let y = 34

  // ── TWO-COLUMN SECTION ───────────────────────────────────────────────────

  // --- LEFT: Earn Points ---
  doc.setTextColor(22, 101, 52) // green-800
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Earn Points', margin, y)

  // --- RIGHT: Rewards ---
  doc.setTextColor(146, 64, 14) // amber-800
  doc.text('Rewards', margin + colW + 6, y)

  y += 4

  // Build task rows by category
  const activeTasks = tasks.filter((t) => t.is_active && t.points > 0)
  const morningTasks = activeTasks.filter((t) => t.category === 'morning')
  const afternoonTasks = activeTasks.filter((t) => t.category === 'afternoon')
  const eveningTasks = activeTasks.filter((t) => t.category === 'evening')
  const anyTasks = activeTasks.filter((t) => t.category === 'any')

  const taskSections = [
    { label: 'Morning', tasks: morningTasks },
    { label: 'Afternoon / School', tasks: afternoonTasks },
    { label: 'Evening', tasks: eveningTasks },
    { label: 'Anytime', tasks: anyTasks },
  ].filter((s) => s.tasks.length > 0)

  // Build reward rows by category
  const activeRewards = rewards.filter((r) => r.is_active)
  const dailyRewards = activeRewards.filter((r) => r.category === 'daily')
  const weeklyRewards = activeRewards.filter((r) => r.category === 'weekly')
  const bigRewards = activeRewards.filter((r) => r.category === 'big')

  const rewardSections = [
    { label: 'Daily', items: dailyRewards },
    { label: 'Weekly', items: weeklyRewards },
    { label: 'Big Rewards', items: bigRewards },
  ].filter((s) => s.items.length > 0)

  // Left column: tasks table
  const taskRows = []
  for (const section of taskSections) {
    taskRows.push([{ content: section.label, colSpan: 3, styles: { fillColor: [220, 252, 231], textColor: [22, 101, 52], fontStyle: 'bold', fontSize: 8 } }])
    for (const task of section.tasks) {
      taskRows.push([
        stripEmoji(task.name),
        `+${task.points}`,
        '[ ]',
      ])
    }
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin + colW + 6 },
    head: [['Task', 'Pts', '']],
    body: taskRows,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    columnStyles: {
      0: { cellWidth: colW - 18 },
      1: { cellWidth: 10, halign: 'center', textColor: [21, 128, 61], fontStyle: 'bold' },
      2: { cellWidth: 8, halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.row.raw && data.row.raw[0]?.colSpan === 3) {
        // already handled via colSpan object
      }
    },
  })

  const tasksEndY = doc.lastAutoTable.finalY || y

  // Right column: rewards table
  const rewardRows = []
  for (const section of rewardSections) {
    rewardRows.push([{ content: section.label, colSpan: 2, styles: { fillColor: [254, 243, 199], textColor: [146, 64, 14], fontStyle: 'bold', fontSize: 8 } }])
    for (const r of section.items) {
      rewardRows.push([stripEmoji(r.name), `${r.point_cost} pts`])
    }
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin + colW + 6, right: margin },
    head: [['Reward', 'Cost']],
    body: rewardRows,
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 30, 30] },
    columnStyles: {
      0: { cellWidth: colW - 18 },
      1: { cellWidth: 18, halign: 'right', textColor: [180, 83, 9], fontStyle: 'bold' },
    },
  })

  const rewardsEndY = doc.lastAutoTable.finalY || y
  let nextY = Math.max(tasksEndY, rewardsEndY) + 6

  // ── DEDUCTIONS SECTION ───────────────────────────────────────────────────
  const negativeTasks = tasks.filter((t) => t.is_active && t.points < 0)
  if (negativeTasks.length > 0) {
    doc.setTextColor(153, 27, 27) // red-800
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Point Deductions', margin, nextY)
    nextY += 3

    autoTable(doc, {
      startY: nextY,
      margin: { left: margin, right: margin },
      head: [['Behavior', 'Points']],
      body: negativeTasks.map((t) => [stripEmoji(t.name), `${t.points}`]),
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8, textColor: [80, 20, 20] },
      columnStyles: {
        0: { cellWidth: pageW - margin * 2 - 20 },
        1: { cellWidth: 20, halign: 'right', textColor: [185, 28, 28], fontStyle: 'bold' },
      },
    })

    nextY = doc.lastAutoTable.finalY + 6
  }

  // ── FOOTER ───────────────────────────────────────────────────────────────
  doc.setFillColor(88, 28, 220)
  doc.rect(0, pageH - 14, pageW, 14, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text(
    'Every point counts! Keep up the amazing work!   |   StarPoints App',
    pageW / 2,
    pageH - 5,
    { align: 'center' }
  )

  // ── DOWNLOAD ─────────────────────────────────────────────────────────────
  const filename = `starpoints-chart-${new Date().toLocaleDateString('en-CA')}.pdf`
  doc.save(filename)
}
