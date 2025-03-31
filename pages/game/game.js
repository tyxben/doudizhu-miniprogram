// game.js
const app = getApp()

// 扑克牌数据
const CARD_TYPES = {
  SPADE: '黑桃',
  HEART: '红桃',
  CLUB: '梅花',
  DIAMOND: '方块',
  JOKER: '王'
}

const CARD_VALUES = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2']

// 创建一副牌
function createDeck() {
  const deck = []
  
  // 常规牌
  for (const type in CARD_TYPES) {
    if (type !== 'JOKER') {
      for (const value of CARD_VALUES) {
        deck.push({
          type: CARD_TYPES[type],
          value: value,
          display: CARD_TYPES[type] + value,
          selected: false
        })
      }
    }
  }
  
  // 大小王
  deck.push({
    type: CARD_TYPES.JOKER,
    value: 'BLACK',
    display: '小王',
    selected: false
  })
  
  deck.push({
    type: CARD_TYPES.JOKER,
    value: 'RED',
    display: '大王',
    selected: false
  })
  
  return deck
}

// 洗牌函数
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

Page({
  data: {
    roomType: '',
    isPrivate: false,
    gameStarted: false,
    isDealing: false,
    isLandlord: false,
    currentPlayer: '', // 'player', 'left', 'right'
    playerCards: [],
    leftPlayerCards: 17,
    rightPlayerCards: 17,
    bottomCards: [], // 底牌
    lastPlayedCards: {
      player: [],
      left: [],
      right: []
    },
    selectedCards: [], // 当前选中的牌
    timer: 20, // 出牌倒计时
    timerInterval: null,
    gameMessages: []
  },
  
  onLoad: function (options) {
    const isPrivate = options.mode === 'private'
    const roomType = app.globalData.gameData.roomType
    
    this.setData({
      roomType,
      isPrivate
    })
    
    // 开始游戏
    this.startGame()
  },
  
  startGame: function() {
    this.setData({
      gameStarted: true,
      isDealing: true,
      gameMessages: [...this.data.gameMessages, '游戏开始，发牌中...']
    })
    
    // 创建并洗牌
    const deck = shuffleDeck(createDeck())
    
    // 模拟发牌动画
    setTimeout(() => {
      // 玩家牌
      const playerCards = deck.slice(0, 17)
      // 左边玩家牌
      const leftPlayerCards = deck.slice(17, 34)
      // 右边玩家牌
      const rightPlayerCards = deck.slice(34, 51)
      // 底牌
      const bottomCards = deck.slice(51)
      
      // 排序玩家牌（简单排序，实际游戏中需要更复杂的排序逻辑）
      playerCards.sort((a, b) => {
        const valueA = CARD_VALUES.indexOf(a.value)
        const valueB = CARD_VALUES.indexOf(b.value)
        
        if (a.type === CARD_TYPES.JOKER && b.type === CARD_TYPES.JOKER) {
          return a.value === 'RED' ? 1 : -1
        } else if (a.type === CARD_TYPES.JOKER) {
          return 1
        } else if (b.type === CARD_TYPES.JOKER) {
          return -1
        } else {
          return valueB - valueA
        }
      })
      
      this.setData({
        playerCards,
        leftPlayerCards: 17,
        rightPlayerCards: 17,
        bottomCards,
        isDealing: false,
        gameMessages: [...this.data.gameMessages, '发牌完成，正在叫地主...']
      })
      
      // 随机决定地主
      this.decideLandlord()
    }, 2000)
  },
  
  decideLandlord: function() {
    // 随机决定地主
    const players = ['player', 'left', 'right']
    const landlord = players[Math.floor(Math.random() * 3)]
    
    // 更新状态
    this.setData({
      isLandlord: landlord === 'player',
      currentPlayer: landlord,
      gameMessages: [...this.data.gameMessages, landlord === 'player' ? '你是地主！' : `${landlord === 'left' ? '左边玩家' : '右边玩家'}是地主！`]
    })
    
    // 如果玩家是地主，将底牌加入玩家手牌
    if (landlord === 'player') {
      const newPlayerCards = [...this.data.playerCards, ...this.data.bottomCards]
      
      // 重新排序
      newPlayerCards.sort((a, b) => {
        const valueA = CARD_VALUES.indexOf(a.value)
        const valueB = CARD_VALUES.indexOf(b.value)
        
        if (a.type === CARD_TYPES.JOKER && b.type === CARD_TYPES.JOKER) {
          return a.value === 'RED' ? 1 : -1
        } else if (a.type === CARD_TYPES.JOKER) {
          return 1
        } else if (b.type === CARD_TYPES.JOKER) {
          return -1
        } else {
          return valueB - valueA
        }
      })
      
      this.setData({
        playerCards: newPlayerCards,
        bottomCards: []
      })
    } else if (landlord === 'left') {
      this.setData({
        leftPlayerCards: 20,
        bottomCards: []
      })
    } else {
      this.setData({
        rightPlayerCards: 20,
        bottomCards: []
      })
    }
    
    // 开始游戏回合
    this.startTurn()
  },
  
  startTurn: function() {
    // 开始回合计时器
    this.setData({
      timer: 20
    })
    
    clearInterval(this.data.timerInterval)
    
    const timerInterval = setInterval(() => {
      if (this.data.timer > 0) {
        this.setData({
          timer: this.data.timer - 1
        })
      } else {
        // 时间到，如果是玩家的回合，自动不出
        if (this.data.currentPlayer === 'player') {
          this.pass()
        }
        clearInterval(timerInterval)
      }
    }, 1000)
    
    this.setData({
      timerInterval
    })
    
    // 如果是AI回合，模拟AI出牌
    if (this.data.currentPlayer !== 'player') {
      this.simulateAIPlay()
    }
  },
  
  simulateAIPlay: function() {
    // 模拟AI思考时间
    setTimeout(() => {
      const currentPlayer = this.data.currentPlayer
      const cardsCount = currentPlayer === 'left' ? this.data.leftPlayerCards : this.data.rightPlayerCards
      
      // 随机决定是否出牌（70%概率出牌）
      const willPlay = Math.random() < 0.7
      
      if (willPlay && cardsCount > 0) {
        // 随机出1-3张牌
        const cardCount = Math.min(Math.floor(Math.random() * 3) + 1, cardsCount)
        
        // 更新剩余牌数
        if (currentPlayer === 'left') {
          this.setData({
            leftPlayerCards: this.data.leftPlayerCards - cardCount,
            lastPlayedCards: {
              ...this.data.lastPlayedCards,
              left: Array(cardCount).fill({ display: '?' }) // 用问号表示未知牌
            },
            gameMessages: [...this.data.gameMessages, `左边玩家出了${cardCount}张牌`]
          })
          
          // 检查是否获胜
          if (this.data.leftPlayerCards === 0) {
            this.gameOver('left')
            return
          }
        } else {
          this.setData({
            rightPlayerCards: this.data.rightPlayerCards - cardCount,
            lastPlayedCards: {
              ...this.data.lastPlayedCards,
              right: Array(cardCount).fill({ display: '?' }) // 用问号表示未知牌
            },
            gameMessages: [...this.data.gameMessages, `右边玩家出了${cardCount}张牌`]
          })
          
          // 检查是否获胜
          if (this.data.rightPlayerCards === 0) {
            this.gameOver('right')
            return
          }
        }
      } else {
        // AI选择不出
        this.setData({
          gameMessages: [...this.data.gameMessages, `${currentPlayer === 'left' ? '左边玩家' : '右边玩家'}选择不出`]
        })
      }
      
      // 更新当前玩家
      const nextPlayer = this.getNextPlayer(currentPlayer)
      this.setData({
        currentPlayer: nextPlayer
      })
      
      // 开始下一个回合
      this.startTurn()
    }, 1000 + Math.random() * 1000) // 随机1-2秒的思考时间
  },
  
  getNextPlayer: function(currentPlayer) {
    const players = ['left', 'player', 'right']
    const currentIndex = players.indexOf(currentPlayer)
    return players[(currentIndex + 1) % 3]
  },
  
  // 玩家选牌
  selectCard: function(e) {
    const index = e.currentTarget.dataset.index
    const playerCards = this.data.playerCards
    
    // 切换选中状态
    playerCards[index].selected = !playerCards[index].selected
    
    // 更新选中的牌
    const selectedCards = playerCards.filter(card => card.selected)
    
    this.setData({
      playerCards,
      selectedCards
    })
  },
  
  // 玩家出牌
  playCards: function() {
    if (this.data.currentPlayer !== 'player') {
      return
    }
    
    const selectedCards = this.data.playerCards.filter(card => card.selected)
    
    if (selectedCards.length === 0) {
      wx.showToast({
        title: '请选择要出的牌',
        icon: 'none'
      })
      return
    }
    
    // 这里应该有牌型判断逻辑，简化版本直接出牌
    
    // 从玩家手牌中移除已出的牌
    const newPlayerCards = this.data.playerCards.filter(card => !card.selected)
    
    this.setData({
      playerCards: newPlayerCards,
      lastPlayedCards: {
        ...this.data.lastPlayedCards,
        player: selectedCards
      },
      selectedCards: [],
      gameMessages: [...this.data.gameMessages, `你出了${selectedCards.length}张牌`]
    })
    
    // 检查玩家是否获胜
    if (newPlayerCards.length === 0) {
      this.gameOver('player')
      return
    }
    
    // 更新当前玩家
    const nextPlayer = this.getNextPlayer('player')
    this.setData({
      currentPlayer: nextPlayer
    })
    
    // 开始下一个回合
    this.startTurn()
  },
  
  // 玩家不出
  pass: function() {
    if (this.data.currentPlayer !== 'player') {
      return
    }
    
    // 取消所有选中的牌
    const playerCards = this.data.playerCards.map(card => {
      card.selected = false
      return card
    })
    
    this.setData({
      playerCards,
      selectedCards: [],
      gameMessages: [...this.data.gameMessages, '你选择不出']
    })
    
    // 更新当前玩家
    const nextPlayer = this.getNextPlayer('player')
    this.setData({
      currentPlayer: nextPlayer
    })
    
    // 开始下一个回合
    this.startTurn()
  },
  
  // 游戏结束
  gameOver: function(winner) {
    clearInterval(this.data.timerInterval)
    
    const isPlayerWin = winner === 'player'
    const isLandlordWin = (winner === 'player' && this.data.isLandlord) || 
                          (winner === 'left' && this.data.currentPlayer === 'left') ||
                          (winner === 'right' && this.data.currentPlayer === 'right')
    
    // 计算奖励
    let reward = 0
    if (isPlayerWin) {
      reward = this.data.isLandlord ? 300 : 100
    } else {
      reward = -100
    }
    
    // 更新全局金币
    app.globalData.coins += reward
    
    // 保存游戏结果
    const gameResult = {
      winner,
      isPlayerWin,
      isLandlordWin,
      reward
    }
    
    // 跳转到结果页面
    wx.navigateTo({
      url: `../result/result?result=${JSON.stringify(gameResult)}`
    })
  },
  
  // 提示按钮
  hint: function() {
    if (this.data.currentPlayer !== 'player') {
      return
    }
    
    // 简单提示：随机选择1-3张牌
    const playerCards = this.data.playerCards.map(card => {
      card.selected = false
      return card
    })
    
    if (playerCards.length > 0) {
      const hintCount = Math.min(Math.floor(Math.random() * 3) + 1, playerCards.length)
      
      for (let i = 0; i < hintCount; i++) {
        playerCards[i].selected = true
      }
      
      this.setData({
        playerCards,
        selectedCards: playerCards.filter(card => card.selected)
      })
    }
  },
  
  onUnload: function() {
    // 清除计时器
    clearInterval(this.data.timerInterval)
  }
})