const path = require('path')
const fs = require('fs')

const rankName = 'average'
const jsonData = require('./data/total.json')
const between = {
  1000: 0,
  2000: 0,
  3000: 0,
  4000: 0,
  5000: 0,
  6000: 0,
  7000: 0,
  8000: 0,
  9000: 0,
  10000: 0,
}
let total = 0
jsonData.forEach(item => {
  total++
  const ave = item.price.average
  if (ave < 2000) {
    between[1000]++
  } else if (ave < 3000) {
    between[2000]++
  } else if (ave < 4000) {
    between[3000]++
  } else if (ave < 5000) {
    between[4000]++
  } else if (ave < 6000) {
    between[5000]++
  } else if (ave < 7000) {
    between[6000]++
  } else if (ave < 8000) {
    between[7000]++
  } else if (ave < 9000) {
    between[8000]++
  } else if (ave < 10000) {
    between[9000]++
  } else {
    between[10000]++
  }
})

let betweenText = '# 房价分布\n\n'

Object.keys(between).forEach(key => {
  between[key] = ((between[key] * 100) / total).toFixed(2)

  betweenText += `- ${key}：${between[key]}%\n`
})

fs.writeFileSync(`./rank/${rankName}-percent.md`, betweenText)

jsonData.sort((a, b) => b.price.average - a.price.average)

fs.writeFileSync(`./rank/${rankName}.json`, JSON.stringify(jsonData))

let mdText = '# 每平价格排序\n'

jsonData.forEach(item => {
  mdText += `- [${item.xiaoquInfo.name}](${item.xiaoquInfo.sameAreaLink})【${item.price.sum}万 - ${item.price.average} 元每平】【${item.houseArea}平】[${item.houseDesc}](${item.houseLink}) \n`
})

fs.writeFileSync(`./rank/${rankName}.md`, mdText)
