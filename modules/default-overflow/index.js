'use strict';

const Learn = require('../learn/index.js');

module.exports = class LearnOverflowAlises extends BaseModule {
  constructor(bot) {
    super(bot);
    this.learn = new Learn(bot);
  }

  async handle(data) {
    let learns = false;

    if (parseInt(data.user_text)) {
      let index = parseInt(data.user_text);
      if (index > 0) {
        index--;
      }

      learns = await this.learn.getLearns(data.cmd, 1, false, index);
    } else {
      learns = await this.learn.getLearns(data.cmd, 1, true, false);
    }

    if (learns.length) {
      this.bot.postMessage(data.channel, learns.join(''));
    }
  }

  getType() {
    return [BaseModule.TYPES.OVERFLOW_CMD];
  }

  help() {
    return 'This class will handle any cmd that isnt a module. So we can do\n?learn test | funnytext \n?test\nWhich will output `funnytext`';
  }
};
