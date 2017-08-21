const {ipcRenderer} = require('electron');
const {dialog} = require('electron').remote;
const fs = require('fs');
const vinylFs = require('vinyl-fs');
const ftp = require('vinyl-ftp');
const uuidV4 = require('uuid/v4');

const store = {};


// 工具方法
const $ = function (selector) {
  return document.querySelectorAll(selector);
};

function getClassIndex (node, className) {
  const classNames = node.className.split(/\s+/);
  return { index:classNames.indexOf(className), classNames };
}

function hasClass (node, className) {
  return getClassIndex(node, className).index !== -1;
}

function toggleClass (node, className) {
  const { index, classNames } = getClassIndex(node, className);
  if (index !== -1) {
    delete classNames[index];
    node.className = classNames.join(' ');
  } else {
    node.className = classNames.join(' ') + ' ' + className; 
  }
}

function registerEvent () {
  actionList.forEach(item => {
    const { ele, type, action } = item;
    $(ele)[0] && $(ele)[0].addEventListener(type, action, false);
  });
}

function log (logs, log2) {
  if (logs.indexOf('UP') !== -1) {
    const logCon = $('#js-log')[0];
    logCon.innerHTML = logCon.innerHTML + log2 + '<br>';
    // console.log(logs, log2);
  }
  // console.log(logs, log2);
}


const actionList = [
  {
    ele: '#site',
    type: 'submit',
    action(e) {
      e.preventDefault();
      const site = {};
      const elements = Array.from(e.target.elements);
      elements.forEach(item => {
        if (item.type === 'text') {
          Object.defineProperty(site, item.id, { value: item.value, enumerable: true });
        }
      });
      

      fs.readFile('data/site.json', (err, data) => {
        let sites = null;
        if (err) {
          sites = [];
          sites.push(site);
        } else {
          sites = JSON.parse(data) || [];
          sites.forEach(item => {
            if (item.name === site.name) {
              dialog.showMessageBox({ message: '已有同名站点', buttons: [] });
              return;
            }
          });
          sites.push(site);
        }
        fs.writeFile('data/site.json', JSON.stringify(sites), (err) => {
          if (err) { throw err };
          dialog.showMessageBox({ message: '新建站点成功', buttons: [] });
        });
      });
    }
  },
  {
    ele: '#taskList',
    type: 'click',
    action(e) {
      const nodeState = e.target.parentNode.parentNode.querySelector('.state');
      if (hasClass(e.target, 'start')) {
        const i = store.watchList[e.target.dataset.key].index;
        const { locale, base, server, siteName } = store.taskList[i];
        const site = store.siteList.find(item => item.name === siteName);
        const {host, user, pass} = site;
        const conn = new ftp({ host, user, pass, log });
        vinylFs.src(locale, {base, buffer: false})
          .pipe(conn.dest(server));
        const watcher = fs.watch(base, (eventType, filename) => {
          console.log(eventType);
          vinylFs.src(base + '\\' + filename, {base, buffer: false})
            .pipe(conn.dest(server));
        });
        store.watchList[e.target.dataset.key]['watcher'] = watcher;
        toggleClass(nodeState, 'state_start');
        toggleClass(nodeState, 'state_stop');
        nodeState.textContent='运行中';
      } else if (hasClass(e.target, 'stop')) {
        const key = e.target.dataset.key;
        store.watchList[key].watcher.close();
        toggleClass(nodeState, 'state_start');
        toggleClass(nodeState, 'state_stop');
        nodeState.textContent='未运行';
      }
    }
  },
  {
    ele: '#js-locale',
    type: 'click',
    action() {
      const url = dialog.showOpenDialog({properties: ['openFile', 'openDirectory', 'multiSelections']});
      $('input[name=locale]').value = url + '\\**\\*';
      $('input[name=base]').value = url;
    }
  },
  {
    ele: '#js-new-task',
    type: 'click',
    action() {
      const siteName = $('#sites').value;
      if (!siteName) {
        dialog.showMessageBox({ message: '请选择站点', buttons: [] });
        return;
      }
      const task = {
        name: $('input[name=name]').value,
        locale: $('input[name=locale]').value,
        base: $('input[name=base]').value,
        server: $('input[name=server]').value,
        siteName, 
      };
      fs.readFile('data/task.json', (err, data) => {
        let tasks = null;
        if (err) {
          tasks = [];
          tasks.push(task);
        } else {
          tasks = JSON.parse(data) || [];
          if (tasks.find(element => element.name === task.name)) {
            dialog.showMessageBox({ message: '已有同名任务', buttons: [] });
            return;
          }
          tasks.push(task);
        }
        fs.writeFile('data/task.json', JSON.stringify(tasks), (err) => {
          if (err) { throw err };
          dialog.showMessageBox({ message: '新建任务成功', buttons: [] });
        });
      });
    }
  }
];

const pageList = {
  index() {
    store.watchList = {};
    fs.readFile('data/task.json', (err, data) => {
      if (err) throw err;
      if (data) {
        let html = '';
        store.taskList = JSON.parse(data);
        Array.isArray(store.taskList) && store.taskList.forEach((task, i) => {
          const { name, locale, server, siteName } = task;
          const key = uuidV4();
          store.watchList[key] = { index: i };
          html += `<tr><td>${name}</td><td>${locale}</td><td>${server}</td><td>${siteName}</td><td class="state state_stop">未运行</td><td><button data-key="${key}" type="button" class="start btn btn-success">开始</button><button type="button" class="stop btn btn-primary" data-key="${key}">停止</button></td></tr>`;

        });
        $('#taskList')[0].innerHTML = html;
      }    
    });

    fs.readFile('data/site.json', (err, data) => {
      if (err) throw err;
      if (data) {
        store.siteList = JSON.parse(data);
      }
    });
  },
  task() {
    fs.readFile('./data/site.json', (err, data) => {
      if (err) throw err;
      let html = '<option value="">选择站点</option>';
      try {
        const sites = JSON.parse(data);
        if (Array.isArray(sites)) {
          sites.forEach(site => {
            html += `<option value="${site.name}">${site.name}</option>`;
          });
          $('#sites')[0].innerHTML = html;
        }
      } catch(error) {}
    });
  }
};

function init () {
  const page = $('body')[0].dataset.page;
  typeof pageList[page] === 'function' && pageList[page]();
  registerEvent();
}

init();

