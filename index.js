const dump = `[{"key":"x3hFNzhFVGtbeKMGSwX2XyAsQJtOtM34gNZRNDp2Z0A0GXWfR2lWVCQjJxZoYWh2Xwc4Px0APiEdSRcCORAHA2slDkojV2VFVCFOCiQ7KCoaHBlxaUsAcWdFJCgVRT8=","body":"#file:///home/alex/Bureau/test-40mm-macro/DSC_3975.jpg","nick":"ladislas","likes":0,"shares":0,"moderate":false,"type":"post","ptime":1639693852695},{"key":"xTliU1w7cnJDcho4VJkKXzKmWqSfszPRYQJEeEU3M0xyKzWneW9oURskBj4CRCcmHCpkXicUfhcVPF03JkU1MAATICUz","body":"#buugi this is Martins sandbox","nick":"guest","likes":0,"shares":0,"moderate":false,"type":"post","ptime":1639687252695},{"key":"5DhWTWBuW0qzeVM4G4RI43ncMqCdvdJZNQVVs3RVem1yYjlzRVdEJSFvFAJbERkSHVIbNBYpSwY8IQU=","body":"#finhack beep boop","nick":"soup","likes":0,"shares":0,"moderate":false,"type":"post","ptime":1639681093393},{"key":"0G5HWTxhZ14/YI0DkYXeSdGUEBh2RzXW0gBYVDjMa+dVEFpTNKJIvy27NFb81YNvBxBtTVANIgpfFkM3JzE9JiNYJw0bLCYvKhgvBTMhY31qKmklQQtdIGRRGGMWKAdSOCwOOSQXIx0TAWAXESVuDjtWO0U1HyMGJ38SElIVPAYKKj0DC2ktfwMZEg==","body":"#buugi !|LAEpA;ofMd_NivNHxv-;0L%M%M%M  !&QmaasmYziqTnYu3BAKZxZoX6SobQjLYG8WjL9ipKR3u2Ki","nick":"guest","likes":3344,"shares":44734,"moderate":false,"type":"post","ptime":-1},{"key":"5DhWTWBuW0qzeVM4dlIu5Uujbt0AtaetrFdDNmCtcG16YjkzRThFJSFvFAJbERkSHVIbNBYpSwY8IQU=","body":"#finhack beep boop","nick":"guest","likes":0,"shares":0,"moderate":false,"type":"post","ptime":-1},{"key":"5DhWTWBuW0qzeVM4dlJDMy2lXKJcyDql2aPaZHYoZJVwYjEzRXhFJSFvFAJbERkSHVIbNBYpSwY8IQU=","body":"#finhack beep boop","nick":"guest","likes":0,"shares":0,"moderate":false,"type":"post","ptime":-1},{"key":"5DhWTWBuW0qzeVM4dlJDM0BzV3IIsVSnGNYymJqO60JyHy/LR3hNJSFvFAJbERkSHVIbNBYpSwY8IQU=","body":"#finhack beep boop","nick":"guest","likes":0,"shares":0,"moderate":false,"type":"post","ptime":-1},{"key":"xhdUNDh/VUg0WC7bPrwVyTqnFpWIz83mJP5XWDJh0kRlZlX2yY9nuOS7RzeVpL7f4QgnDIb8meFHNS9XWFhKPz4CPSux7BVPFCk6OkxcUCMeAQw4ChM8HzExTFgbWSMDGy8FNT8fGVEsExYnLgZOcHEWH0IqGG4=","body":"käärmeen sylissä !&QmWzj2huqtnhpttgy59X7BNPxKseyU9HUnJjww56SyqaY9","nick":"guest","likes":11278,"shares":49886,"moderate":false,"type":"post","ptime":-1},{"key":"xXJ6ej9sHlZNarwEdz3+SWoXRRHCwDeRpEBjS381eFtLNlXmbH1tSkYnDTdVWi0cS0YcFAcX","body":"suburbian selva","nick":"ladislas","likes":0,"shares":0,"moderate":false,"type":"reply","ptime":-1}]`
const jason = JSON.parse(dump)

const messageUtilMixin = {
  methods: {
    getUsableText(messageContainer) {
      const match = /(#\S+\s)?(.+)/g.exec(messageContainer.body)
      if (!match) return ""
      let message = match[1] ? match[2] : match[0]
      let result = this.separateImageFromBody(message)
      return result[0] 
    },
    separateImageFromBody(message) {
      const separator = "!&Qm"
      let index = message.indexOf(separator)
      let contents = message
      let image = ""
      if (index >= 0) {
        contents = message.slice(0, index).trim()
        image = message.slice(index-separator.length)
      }
      return [contents, image]
    }
  }
}

const channelPattern = /#(\S+)/
Vue.component("channel-view", {
  props: ["channel", "messages"],
  mixins: [messageUtilMixin],
  date() {
    return {}
  },
  mounted() {
  },
  methods: {
    goBack () {
      this.$emit("input", "overview")
    }
  },
  template: `
  <div>
    <button @click="goBack" class="contrast">back</button>
    <h2>{{ channel }}</h2>
    <div class="category-container" v-for="message in messages">
      <span>{{ message.nick }}</span> <span> {{ getUsableText(message) }} </span>
    </div>
  </div>
  `
})
  
Vue.component("base-view", {
  mixins: [messageUtilMixin],
  data() {
    return {
      channels: {},
      messages: [],
      currentView: "overview",
      focusedChannel: "",
    }
  },
  mounted() {
    this.messages = jason
    this.channels = this.populateChannels()
  },
  methods: {
    populateChannels() {
      const channels = {}
      let channelName = ""
      this.messages.forEach(m => {
        const matches = channelPattern.exec(m.body)
        if (matches && matches.length >= 2) {
          channelName = matches[1]
          if (m.body.indexOf("://") >= 0) { return } // filter out channel names with a protocol handler
        } else {
          channelName = "unsorted trash fire"
        }
        if (!channels[channelName]) {
          channels[channelName] = {}
        }
        // store messages per channel using the message's key, thereby deduplicating messages
        channels[channelName][m.key.slice(0,10)] = m
      })
      return channels
    },
    getChannelNames() {
      return Object.keys(this.channels).sort()
    },
    getChannelMessages(channel) {
      // sort by pdate if available
      if (!this.channels[channel]) return []
      return Object.values(this.channels[channel]).sort((a, b) => a.ptime < b.ptime)
    },
    getChannelAuthors(channel) {
      if (!this.channels[channel]) return []
      const authors = {}
      Object.values(this.channels[channel]).forEach(m => {
        if (m.nick == "") {
          authors[m.nick] = "ghost"
          return
        }
        authors[m.nick] = true
      })
      return Object.values(authors).sort()
    },
    // splice out: 
    // * any channel information
    // * ipfs image information at the end
    changeView(viewName, arg) {
      this.currentView = viewName
      this.focusedChannel = arg
    },
    since(messageContainer) {
      if (messageContainer.ptime <= 0) {
        return "some time"
      }
      let d = new Date(messageContainer.ptime)
      const msSince = new Date()-d
      const SECOND = 1 * 1000
      const MINUTE = SECOND * 60
      const HOUR = MINUTE * 60
      const DAY = HOUR * 24
      const WEEK = DAY * 7
      const MONTH = WEEK * 30
      if (msSince < SECOND) return "less than a second"
      if (msSince < WEEK || msSince < MONTH ) return `${Math.ceil(msSince / DAY)} days`
      if (msSince > MONTH)  return "many days"
      return "??? days"
    }
  },
  template: `
  <div>
  <div id="main-wrapper">
    <div id="logo-container">
      <h1 id="logo"> <a href="/">Moderator</a></h1>
      <h2 id="byline">Unsigned, unsafe, no headrests, fast as fuck and It Will Kill You
                      <br>It’s a long way to the top if you wanna rock and roll
      </h2>
    </div>
    <channel-view v-model="currentView" :channel=focusedChannel :messages="getChannelMessages(focusedChannel)" v-if="currentView == 'channel'"></channel-view>
    <template v-if="currentView == 'overview'">
    <h2>Categories</h2>
    <div class="categories-container">
      <div @click="changeView('channel', channel)" class="category-container" v-for="channel in this.getChannelNames()">
        <h3>{{ channel }}</h3>
        <div class="col-2">
          <div>
            <p>{{ getChannelMessages(channel).length }} posts, {{getChannelAuthors(channel).length}} authors</p>
            <p>{{ since(getChannelMessages(channel)[0])}} ago</p>
          </div>
          <span class="category-post"> {{ getUsableText(getChannelMessages(channel)[0]) }}</span>
        </div>
      </div>
      </template>
    <div id="closing-paragraph">moderator is a distributed ephemeral, forgetful forum. it hosts no identities and no data besides admin messages that seed it. you can use it as your personal social network, create threads, have them to display publicly or share them privately to your friends via sms/email/what have you.</div>
  </div>
  <div id="bg"></div>
  </div>
  `
})
new Vue({ el: "#app" })
