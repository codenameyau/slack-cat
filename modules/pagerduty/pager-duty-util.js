const request = require('request-promise');
const ICON = 'http://emojis.slackmojis.com/emojis/images/1467306358/628/pagerduty.png';
const USER_NAME = 'PagerDutyCat';
const ERRORS = {
  badInput: {
    code: "badInput",
    text: "Looks like you forgot your team name! Try `?oncall --help` to know more."
  }
};

const HEADER = {
  Authorization: 'Token token=' + config.getKey('pager_duty_api').key,
  'Content-Type': 'application/json',
  Accept: 'application/vnd.pagerduty+json;version=2',
  From: "nkonecny@stashinvest.com"
}


module.exports = class PagerDutyUtil {

  async getData(escalationPolicyId) {
    const scheduleGroups = await this.getScheduleGroups(escalationPolicyId);
    return scheduleGroups;
  }

  async getPdUser(id) {
    const options = {
      url: `https://api.pagerduty.com/users/${id}`,
      headers: {
        Authorization: 'Token token=' + config.getKey('pager_duty_api').key,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.pagerduty+json;version=2',
      },
      json: true
    };

    return await request(options);
  }

  async getScheduleGroups(escalationPolicyId) {
    const options = {
      url: `https://api.pagerduty.com/oncalls?include[]=escalation_policies&escalation_policy_ids[]=${escalationPolicyId}`,
      headers: HEADER,
      json: true
    };

    const { oncalls } = await request(options);
    return oncalls;
  }

  postFieldsToChannel(bot, channel, title, fields) {
    bot.postRawMessage(channel, {
      icon_url: ICON,
      username: USER_NAME,
      attachments: [
        {
          color: '#048A24',
          author_icon: 'https://i.imgur.com/HKOY97q.png',
          title: title,
          fields: Object.values(fields).sort((a, b) => { return b.level - a.level }),
          footer: ':fire: lets hope nothings on fire :fire:',
        },
      ],
    });
  }

  postBadInputError(bot, data) {
    bot.postMessageWithParams(data.channel, ERRORS.badInput.text, {
      icon_url: ICON,
      username: USER_NAME,
    });
  }


  async listServices() {
    const options = {
      url: `https://api.pagerduty.com/services?include[]=teams`,
      headers: HEADER,
      json: true
    };

    const { services } = await request(options);
    return services;
  }

  async createIncident(service_id, email, incident_description) {
    let emailHeader = HEADER
    emailHeader['email'] = email
    const incident = {
      "incident": {
        "type": "incident",
        "title": "Slackcat Invoked Incident",
        "service": {
          "type": "service_reference",
          "id": service_id
        },
        "urgency": "high",
        "body": {
          "type": "incident_body",
          "details": incident_description
        }
      }
    }

    const options = {
      url: "https://api.pagerduty.com/incidents",
      headers: emailHeader,
      body: incident,
      method: "POST",
      json: true
    };

    try {
      return await request(options);
    } catch (e) {
      console.error(e);
      return null
    }
  }
}