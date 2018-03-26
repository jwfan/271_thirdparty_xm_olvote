// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var fs = require('fs');
var holder = document.getElementById('holder');
holder.ondragover = function () {
   return false;
};
holder.ondragleave = holder.ondragend = function () {
 return false;
};

code_img = document.getElementById('codeimg');
code_img.onclick = function () {
  getCaptcha();
}

code_input = document.getElementById('codeinput');
code_input.addEventListener("keydown", function(event) {
  if (event.which == 13 || event.keyCode == 13) {
    if (mission_left == 0) {
      document.getElementById('captcha').style = 'display:none';
      alert('Done!');
      return;
    }
    if (code_input.value.length > 0 && current_data != null && ick != null) {
      capt = code_input.value;
      code_img.src = 'lxk2.jpg';
      code_input.value = '';
      getCaptcha();
      data_to_submit = current_data;
      current_data = null;
      ick_to_submit = ick;
      ick = null;
      next_data();
      submit(data_to_submit, capt, ick_to_submit);
    }
  }
});

all_data = new Array();
current_data = {};
mission_left = 0;

holder.ondrop = function (e) {
  document.getElementById('captcha').style = '';
  e.preventDefault();
  var file = e.dataTransfer.files[0];
  var lineReader = require('readline').createInterface({
   input: require('fs').createReadStream(file.path)
  });
  lineReader.on('line', function (line) {
    all_data.push(preprocess(line));
  });
  lineReader.on('close', function() {
    mission_left = all_data.length;
    getCaptcha();
    next_data();
  });
  return false;
};

function preprocess(line){
  return {username: line.split(' ')[0].split('.')[1], password: line.split(' ')[1]};
}

function next_data() {
  if (all_data.length > 0) {
    current_data = all_data.pop();
  }
}

function retry_data(data) {
  all_data.push(data);
}

CAPTCODE_URL = 'https://account.xiaomi.com/pass/getCode?icodeType=login&';
FIRST_URL = 'https://passport.iqiyi.com/apis/thirdparty/login.action?type=30&isiframe=1&ppsNew=1&agenttype=39&isapp=0&pps_use_https_redirect=true&use_https_redirect=true&url=https://game.iqiyi.com/weblogin/login?preurl=http://www.iqiyi.com/common/idol_vote.html';
LOGIN_URL = 'https://account.xiaomi.com/pass/serviceLoginAuth2?_dc=';
VOTE_URL = 'http://vote.i.iqiyi.com/eagle/outer/join_common_vote?vid=1251575812010177&options=%7B%221218905683020731%22%3A%5B1487907121030964%5D%7D&appid=6&authCookie=';

var ick = null;

function getCaptcha(){
  code_input.value = '';
  var code_request = require('request').defaults({ encoding: null });
  var code_jar = code_request.jar();
  var timestamp = (new Date).getTime();
  var code_url = CAPTCODE_URL + timestamp;
  code_request.get({url: code_url, jar: code_jar, followRedirect: false}, function(err, res, body) {
    ick = code_jar.getCookies(code_url)[0].value;
    document.getElementById('codeimg').src = 'data:' + res.headers['content-type'] + ';base64,' + new Buffer(body).toString('base64');
  });
}

function submit(data, captcha, ick) {
  var request = require('request');
  var un = data.username;
  var pw = data.password;
  var jar = request.jar();
  request.get({url: FIRST_URL, jar: jar, followRedirect: false}, function(err, res, body) {
    url_2 = res.headers.location;
    request.get({url: url_2, jar: jar, followRedirect: false}, function(err, res, body) {
      url_3 = res.headers.location;
      request.get({url: url_3, jar: jar, followRedirect: false}, function(err, res, body) {
        callback = extract(body,'callback', 'JSP_VAR');
        sid = extract(body,'sid:', 'JSP_VAR');
        qs = extract(body,'qs', 'JSP_VAR');
        _sign = extract(body,'"_sign"', 'JSP_VAR');
        serviceParam = extract(body,'serviceParam', 'JSP_VAR', '\'');
        post_param = {_json: true, callback: callback, sid: sid, qs: qs, _sign: _sign, serviceParam: serviceParam, captCode: captcha, user: '+86' + un, hash: hash(pw)};
        jar.setCookie(request.cookie('ick=' + ick), LOGIN_URL);
        request.post({url:LOGIN_URL + (new Date).getTime(), form: post_param, jar: jar, followRedirect: false}, function(err, res, body){
          body_json = JSON.parse(body.substring(body.indexOf('{')));
          if (body_json.location == null) {
            console.log(body_json.desc);
            retry_data(data);
            return;
          }
          url_4 = body_json.location;
          request.get({url: url_4, jar: jar, followRedirect: false}, function(err, res, body) {
            url_5 = res.headers.location;
            request.get({url: url_5, jar: jar, followRedirect: false}, function(err, res, body) {
              url_6 = res.headers.location;
              request.get({url: url_6, jar: jar, followRedirect: false}, function(err, res, body) {
                final_url = res.headers.location;
                ac_name = 'authcookie=';
                ac_start = final_url.indexOf(ac_name) + ac_name.length;
                ac_end = final_url.indexOf('&', ac_start);
                authcookie = final_url.substring(ac_start, ac_end);
                request.get({url: VOTE_URL + authcookie, jar: jar, followRedirect: false}, function(err, res, body) {
                  console.log(un + ':' + JSON.parse(body).msg);
                  mission_left--;
                });
              });
            });
          });
        });
      });
    });
  });
}

function hash(pw) {
  var md5 = require('md5');
  return md5(pw).toUpperCase();
}

function extract(text, key, pre_key, sep='"') {
  pre_index = text.indexOf(pre_key);
  start_index =  text.indexOf(key, pre_index) + key.length;
  end_index = text.indexOf('\n', start_index);
  raw =  text.substring(start_index, end_index);
  return raw.substring(raw.indexOf(sep) + 1, raw.lastIndexOf(sep));
}
