// room.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    coins: 0,
    rooms: [
      {
        id: 'beginner',
        name: '初级房',
        entryFee: 100,
        minCoins: 500,
        onlinePlayers: 328,
        color: '#2A9D8F'
      },
      {
        id: 'intermediate',
        name: '中级房',
        entryFee: 500,
        minCoins: 2000,
        onlinePlayers: 156,
        color: '#457B9D'
      },
      {
        id: 'expert',
        name: '高级房',
        entryFee: 1000,
        minCoins: 5000,
        onlinePlayers: 89,
        color: '#E63946'
      }
    ]
  },
  
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        coins: app.globalData.coins
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          coins: app.globalData.coins
        })
      }
    }
    
    // 随机更新在线人数
    this.updateOnlinePlayers()
  },
  
  updateOnlinePlayers: function() {
    const rooms = this.data.rooms.map(room => {
      // 随机增减一些玩家数量，使其看起来更真实
      const change = Math.floor(Math.random() * 10) - 5
      room.onlinePlayers = Math.max(10, room.onlinePlayers + change)
      return room
    })
    
    this.setData({ rooms })
    
    // 每30秒更新一次
    setTimeout(this.updateOnlinePlayers.bind(this), 30000)
  },
  
  enterRoom: function(e) {
    const roomId = e.currentTarget.dataset.id
    const room = this.data.rooms.find(r => r.id === roomId)
    
    if (this.data.coins < room.entryFee) {
      wx.showToast({
        title: '金币不足',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    // 设置全局游戏数据
    app.globalData.gameData.roomType = room.name
    
    // 扣除入场费
    app.globalData.coins -= room.entryFee
    
    // 跳转到游戏页面
    wx.navigateTo({
      url: '../game/game'
    })
  },
  
  createPrivateRoom: function() {
    wx.showModal({
      title: '创建私人房间',
      content: '创建私人房间需要消耗200金币，是否继续？',
      success: (res) => {
        if (res.confirm) {
          if (this.data.coins < 200) {
            wx.showToast({
              title: '金币不足',
              icon: 'none',
              duration: 2000
            })
            return
          }
          
          // 扣除创建费用
          app.globalData.coins -= 200
          
          // 设置全局游戏数据
          app.globalData.gameData.roomType = '私人房'
          
          // 跳转到游戏页面
          wx.navigateTo({
            url: '../game/game?mode=private'
          })
        }
      }
    })
  }
})