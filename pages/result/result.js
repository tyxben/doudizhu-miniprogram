// result.js
const app = getApp()

Page({
  data: {
    isWin: false,
    isLandlord: false,
    isLandlordWin: false,
    reward: 0,
    totalCoins: 0,
    animationFinished: false
  },
  
  onLoad: function (options) {
    const result = JSON.parse(options.result)
    
    this.setData({
      isWin: result.isPlayerWin,
      isLandlord: app.globalData.gameData.isLandlord,
      isLandlordWin: result.isLandlordWin,
      reward: result.reward,
      totalCoins: app.globalData.coins
    })
    
    // 播放结算动画
    setTimeout(() => {
      this.setData({
        animationFinished: true
      })
    }, 2000)
  },
  
  // 再来一局
  playAgain: function() {
    wx.redirectTo({
      url: '../room/room'
    })
  },
  
  // 返回主页
  backToHome: function() {
    wx.reLaunch({
      url: '../index/index'
    })
  },
  
  // 分享战绩
  shareResult: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }
})