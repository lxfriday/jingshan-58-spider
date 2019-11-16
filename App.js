const cheerio = require('cheerio')
const async = require('async')
const fs = require('fs')
const path = require('path')
const request = require('request-promise')

const baseUrl = 'https://jingshanxian.58.com'

const getTargetUrl = page => `https://jingshanxian.58.com/ershoufang/pn${page}/?PGTID=0d30000c-0239-d6fe-2290-189fe3940976&ClickID=1`

const requestHeaders = {}
const endP = 30

async function getPageData(p, cb, res) {
  const currentPageHouses = []
  try {
    const html = await request(getTargetUrl(p), {
      headers: requestHeaders,
    })
    const $ = cheerio.load(html)
    $('.sendsoj').each(function() {
      const houseImg =
        $(this)
          .find('.pic')
          .find('img')
          .attr('data-src') || ''
      const houseInfo = $(this).find('.list-info')
      const houseDesc =
        houseInfo
          .find('.title')
          .children('a')
          .text()
          .trim() || ''
      const houseLink =
        houseInfo
          .find('.title')
          .children('a')
          .attr('href') || ''
      // <p class="baseinfo">
      //     <span>3室2厅2卫</span>
      //     <span>112.0㎡&nbsp;</span>
      //     <span>南</span>
      //     <span>低层(共18层)</span>
      // </p>
      const baseInfo1 = houseInfo.children('.baseinfo').eq(0)
      const baseInfo2 = houseInfo.children('.baseinfo').eq(1)
      // 3室2厅2卫
      const houseLayout =
        baseInfo1
          .children('span')
          .eq(0)
          .text()
          .trim() || ''

      // 面积，平米
      const houseArea = parseInt(
        baseInfo1
          .children('span')
          .eq(1)
          .text()
          .trim() || '',
        10
      )

      // 房子朝向
      const houseToward =
        baseInfo1
          .children('span')
          .eq(2)
          .text()
          .trim() || ''
      // 楼层
      const houseFloor =
        baseInfo1
          .children('span')
          .eq(3)
          .text()
          .trim() || ''

      const xiaoquInfo = {
        // 小区名
        name:
          baseInfo2
            .children('span')
            .children('a')
            .eq(0)
            .text()
            .trim() || '',
        // 小区内的房子链接
        sameAreaLink:
          baseUrl +
            baseInfo2
              .children('span')
              .children('a')
              .eq(0)
              .attr('href') || '',
        street:
          baseInfo2
            .children('span')
            .children('a')
            .eq(2)
            .text()
            .trim() || '',
      }
      const priceArea = $(this).find('.price')
      const price = {
        // 万元
        sum: parseInt(
          priceArea
            .children('.sum')
            .children('b')
            .text()
            .trim() || '',
          10
        ),
        // 元 / 平
        average: parseInt(
          priceArea
            .children('.unit')
            .text()
            .trim() || '',
          10
        ),
      }

      const house = { houseImg, houseDesc, houseLink, houseLayout, houseArea, houseFloor, houseToward, xiaoquInfo, price }
      currentPageHouses.push(house)
    })
    res.push(currentPageHouses)
    console.log('---> currentPageHouses.length', currentPageHouses.length)

    fs.writeFileSync(path.resolve(__dirname, 'data', `${p}.json`), JSON.stringify(currentPageHouses))
  } catch (e) {
    console.log(e)
  } finally {
    cb()
  }
}

const pageArr = []

for (let i = 1; i <= endP; i++) {
  pageArr.push(i)
}

const res = []
;(async () => {
  await async.eachLimit(
    pageArr,
    1,
    (p, cb) => {
      getPageData(p, cb, res)
    },
    err => {
      if (err) throw err
      let total = []
      for (let index = 0; index < res.length; index++) {
        total = total.concat(res[index])
      }
      console.log('---> total.length', total.length)

      fs.writeFileSync(path.resolve(__dirname, 'data', `total.json`), JSON.stringify(total))
      console.log('finished')
    }
  )
})()
