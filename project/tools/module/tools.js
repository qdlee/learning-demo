const { dialog } = require('electron').remote;
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const jsonParse = require('./module/json');

const $ = function(selector) {
  return document.querySelectorAll(selector);
};

function getEventTarget(node) {
  if (node.nodeType !== 1) {
    return false;
  }
  if (node.hasAttribute('data-action')) {
    return node;
  }
  if (node.parentNode) {
    return getEventTarget(node.parentNode);
  }
  return false;
}

function doAction(e) {
  const target = getEventTarget(e.target);
  if (!target) {
    return;
  }
  e.currentTarget = target;
  const action = target.getAttribute('data-action');
  typeof actionList[action] === 'function' && actionList[action](e);
}

const actionList = {
  sourceFile() {
    const url = dialog.showOpenDialog({ properties: ['openFile'] }) || '';
    $('#source-file')[0].value = url;
  },
  sourceFolder() {
    const url = dialog.showOpenDialog({ properties: ['openDirectory'] }) || '';
    $('#source-file')[0].value = url;
  },
  dist() {
    const url = dialog.showOpenDialog({ properties: ['openDirectory'] }) || '';
    $('#dist-folder')[0].value = url;
  },
  startCompress() {
    let src = $('#source-file')[0].value;
    let base = null;
    let dist = $('#dist-folder')[0].value;

    if (!src) {
      dialog.showMessageBox({ message: '请选择要压缩的文件', buttons: [] });
      return;
    }
    fs.stat(src, (err, stats) => {
      if (err) throw err;
      if (stats.isDirectory()) {
        base = src;
        dist = dist || src;
        src = path.resolve(src, '**\\*');
        dist = path.resolve(dist, '..\\dist\\');
      } else {
        const ed = /\//.test(src)
          ? src.lastIndexOf('/')
          : src.lastIndexOf('\\');
        base = src.slice(0, ed);
        dist = dist || src.slice(0, ed + 1);
      }

      const plugins = [imageminMozjpeg(), imageminPngquant()];

      glob(src, (err, files) => {
        if (err) throw err;
        let totalOptimizedSize = 0;
        let totalSize = 0;
        files &&
          files.forEach((item, i) => {
            fs.readFile(item, (err, data) => {
              if (err) throw err;
              const originalSize = data.length;
              totalSize += originalSize;
              imagemin.buffer(data, { plugins }).then(file => {
                const fl = path.resolve(dist, item.slice(base.length + 1));
                fs.writeFile(fl, file, err => {
                  if (err) {
                    const end = /\//.test(fl)
                      ? fl.lastIndexOf('/')
                      : fl.lastIndexOf('\\');
                    const path = fl.slice(0, end);
                    fs.mkdir(path, err => {
                      if (err) throw err;
                      fs.writeFileSync(fl, file);
                    });
                  }
                });
                const optimizedSize = file.length;
                totalOptimizedSize += optimizedSize;
                console.log(item, '压缩前：', originalSize, '压缩后：', optimizedSize);
                i === files.length - 1 &&
                  console.log(
                    '所有文件。压缩前：',
                    totalSize,
                    '压缩后：',
                    totalOptimizedSize,
                    '压缩率：',
                    ((totalSize - totalOptimizedSize) /
                      totalSize *
                      100).toFixed(2) + '%'
                  );
              });
            });
          });
      });
    });
  },
  jsonFormat() {
    const obj = jsonParse('[1,2,3]');
    console.log(obj);
  }
};

document.addEventListener('click', doAction, false);

document.addEventListener('change', doAction, false);
