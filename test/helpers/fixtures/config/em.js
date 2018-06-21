module.exports = {
  templates: {
    "adv-em-1": '<div class="adv-container">\n adv-em-1 <a data-adv-renderer-link>click here</a>\n  <div>{{message}}</div>\n</div>',
    "adv-em-3": '<div class="adv-container">\n adv-em-3 <a data-adv-renderer-link>click here</a>\n  <div>{{message}}</div>\n</div>',
    "adv-em-5": '<div class="adv-container">\n adv-em-5 <a data-adv-renderer-link>click here</a>\n  <div>{{message}}</div>\n</div>',
    "adv-em-4-template-0": '<div class="adv-container">\n  adv-em-4-template-0 <a data-adv-renderer-link>click here</a>\n  <div>{{message}}</div>\n</div>',
    "adv-em-4-template-1": '<div class="adv-container">\n  adv-em-4-template-1 <a data-adv-renderer-link>click here</a>\n  <div>{{message}}</div>\n</div>'
  },
  options: {
    "adv-em-3": {
      preRender: true
    },
    "adv-em-5": {
      preRender: false
    }
  }
};