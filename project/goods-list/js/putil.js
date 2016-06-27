;(function() {
    function show(param) {
        var type = param.type || alert;
            title = param.title || '提示';
            content=param.content,
            leftBtn = param.leftBtn || '确定',
            leftFun = param.leftFun || null;

        $('#msgWrap').remove();
        var msgWrap = $('<div id="msgWrap" class="modal" tabindex="-1" role="dialog"></div>');
        var str = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">提示</h4></div><div class="modal-body"><p id="msg"></p></div><div class="modal-footer"></div</div</div>';
        msgWrap.html(str);
        var leftBtn = $('<button type="button" class="btn btn-primary" data-dismiss="modal"></button>').html(leftBtn);

        switch (type) {
            case 'confirm':
                var rightFun = param.rightFun || null,
                    rightBtn = param.rightBtn || '取消',
                    rightBtn = $('<button type="button" class="btn btn-primary"></button>').html(rightBtn);
                rightBtn.click(function() {
                    // 关闭弹出窗口
                    closeMsg(rightFun);
                });
                msgWrap.find('.modal-footer:first').append(rightBtn).append(leftBtn);
                break;
            case 'message':
            case 'alert':
            default:
                msgWrap.find('.modal-footer:first').append(leftBtn);
        }

        leftBtn.click(function() {
            // 关闭弹出窗口
            closeMsg(leftFun);
        });
        msgWrap.find('.modal-title').html(title);
        msgWrap.find('#msg').html(content);
        $('body').append(msgWrap);

        $('#msgWrap').modal('show');

        autoClose();

        // 如果消息类型为"message"，就在指定时间内关闭窗口
        function autoClose() {
            if (type == "message") {
                setTimeout(function() {
                    closeMsg();
                }, parseInt(param.timer));
            }
        }

        // 关闭窗口，如果有回调函数，就执行它
        function closeMsg(callback) {
            $('#msgWrap').modal('hide');
            if (typeof callback == 'function'){
                callback();
            }
        }
    }

    window.msg = {
        show: show
    }
})();

(function(){

    //ajax异常处理函数
    var errorFun;

    /**
     * 通过ajax加载数据
     * @param  {[string]} loadUrl [接口]
     * @param  {[type]} info    [发送到服务器信息]
     * @param  {[type]} sucFun  [请求数据符合要求时调用]
     * @param  {[type]} failFun [请求数据不符合要求时调用]
     * @param  {[type]} notMsg  [是否只执行failFun]
     * @param  {[type]} method  [请求方式GET/POST]
     */
    function doAjax (loadUrl,info,sucFun,failFun,notMsg,method) {
        info = typeof info === "string" ? info : JSON.stringify(info);
        if(method == 'get'){
            $.get(loadUrl,info,function(data){
                if(checkResult(data)){
                    sucFun(data);
                }else{
                    //显示错误消息
                    if(notMsg){
                        failFun(data);
                    }else{
                        msg.show({content:data.info,leftFun:failFun});
                    }
                }
            },'json');
        }else{
            $.post(loadUrl,info,function(data){
                sucFun(data);
                // if(checkResult(data)){
                //     sucFun(data);
                // }else{
                //     //显示错误消息
                //     if(notMsg){
                //         failFun(data);
                //     }else{
                //         msg.show({content:data.info,leftFun:failFun});
                //     }
                // }
            },'json');
        }
    }

    /**
     * 注册错误处理函数
     * @param  {[Function]} fun [错误处理函数]
     */
    function regErrorFun (fun) {
        errorFun = fun;
    }

    /**
     * 检查返回的数据是否正常
     * @param  {[type]} data [返回来的数据]
     * @return {[type]}      [数据正常返回true，否则返回false]
     */
    function checkResult (data) {
        if(parseInt(data.status)){
            return true;
        }
        return false;
    }

    /**
     * ajax异常处理
     * 执行注册的错误处理函数
     */
    (function() {
        $(document).ajaxError(function(event,request, settings){
            msg.show({content:'网络异常，请重试！',leftFun:errorFun});
        });
    })();

    window.jajax = {
        doAjax:doAjax,
        regErrorFun:regErrorFun
    }
})();

(function(){
  /**
   * 模板相关
   */
  var regexp = /(?:\{\{)([a-zA-z][^\s\}]+)(?:\}\})/g,
      special = null;

  var render = function(template,data) {
    return template.replace(regexp, function(fullMatch, p2) {
      var rv = {};
      rv.val = data[p2] || '';
      if(typeof special === 'function'){
        special(p2,data,rv);
      }
      return rv.val;
    });
  }

  /**
   * 使用获取的json数据填充模板并插入DOM
   * @param  {[type]} data [json数据]
   */
  function fillData(data,template,container,custom) {
      special = custom;
      var domStr = '';
      //如果是数组就循环，否则直接替换
      if(data instanceof Array || Object.keys(data).length>1){
        for (var i in data) {
            domStr += render(template, data[i]);
        }
      }else{
        domStr += render(template, data);
      }
      container.html(domStr);
      special = null;
  }
  window.temp = {
    fillData:fillData
  }
})();

//自动事件绑定
(function(){
  var eventMethod;//事件方法的集合

  //绑定事件
  function bind(root) {
    root = root || $(document);
    root.find('.event').each(function(){
      var ev = $(this).data('event').split('#');
      if(ev[2]){
        $(this).on(ev[0],ev[2],function(e){
          e.preventDefault();
          eventMethod[ev[1]](e);
        });
      }else{
        $(this).on(ev[0],function(e){
          e.preventDefault();
          eventMethod[ev[1]](e);
        });
      }
    });
  }

  function unbind(root) {
    root.find('.event').each(function(){
      $(this).off();
    });
  }

  //注册事件方法集合
  function regEventMethod(method) {
    eventMethod = method;
  }

  window.ebind={
    bind:bind,
    unbind:unbind,
    regEventMethod:regEventMethod
  }

})();

function paginate(maxPage,root) {
    this.maxPage = maxPage;
    this.root = root;
    this.pageFirst = null;
    this.pageLast = null;
    this.pagePrev = null;
    this.pageNext = null;
    this.loadSpecPage = null;
    this.pages=0;
}

paginate.prototype.init = function(self) {
    this.pageFirst = this.root.find('#page_first');
    this.pageLast = this.root.find('#page_last');
    this.pagePrev = this.root.find('#page_prev');
    this.pageNext = this.root.find('#page_next');

    this.root.find('#pageNums').on('click', {caller:this}, function(e) {

        var num = parseInt(e.target.innerHTML),
            caller = e.data.caller;
        if (this.pages > 5) {
            if (num == 1 || num == this.pages) {
                caller.switchPage(e.target);
            } else if (num == 2) {
                caller.setPages(num - 1, num + 3, num);
            } else if (num == this.pages - 1) {
                caller.setPages(num - 3, num + 1, num);
            } else {
               caller.setPages(num - 2, num + 2, num);
            }
        } else {
            caller.switchPage(e.target);
        }
        caller.loadSpecPage(num);
    });

    this.pageFirst.on('click',{caller:this}, function(e) {
        var caller = e.data.caller;
        if (caller.checkState(e.currentTarget)) {
            var end = caller.pages > caller.maxPage ? caller.maxPage : caller.pages;
            caller.setPages(1, end, 1);
            caller.loadSpecPage(1);
        }
    });

    this.pageLast.on('click',{caller:this}, function(e) {
        var caller = e.data.caller;
        if (caller.checkState(e.currentTarget)) {
            var pages = caller.pages;
            var start = pages > caller.maxPage ? pages - caller.maxPage+1 : 1;
            caller.setPages(start, pages, pages);
            caller.loadSpecPage(pages);
        }
    });

    this.pagePrev.on('click',{caller:this}, function(e) {
        var caller = e.data.caller;
        if (caller.checkState(e.currentTarget)){
            caller.root.find('.paginate_active:first').prev()[0].click();
        }
    });

    this.pageNext.on('click',{caller:this}, function(e) {
        var caller = e.data.caller;
        if (caller.checkState(e.currentTarget)){
            caller.root.find('.paginate_active:first').next()[0].click();
        }
    });
};

/**
 * 注册页面加载函数
 * @param  {[type]} method 页面加载函数
 */
paginate.prototype.regPageMethod = function(method) {
    this.loadSpecPage = method;
};

/**
 * 切换页面
 * 不重新加载页面显示，只在当前切换
 */
paginate.prototype.switchPage = function(target) {
    this.root.find('.page_num').each(function() {
        var item = $(this);
        item.attr('class', 'paginate_button page_num');
    });
    $(target).attr('class', 'paginate_active page_num');
};

/**
 * 检查页面切换按钮是否处于可用状态
 * @param  {[type]} target [要检查的按钮]
 * @return {[type]}        [可用：true;不可用：false;]
 */
 paginate.prototype.checkState = function(target) {
    if ($(target).hasClass('paginate_button_disabled')) {
        return false;
    } else {
        return true;
    }
};

/**
 * 改变页面切换按钮的状态，每次重新加载数据时都执行
 */
paginate.prototype.changePageState = function() {
    this.pageFirst.removeClass('paginate_button_disabled');
    this.pagePrev.removeClass('paginate_button_disabled');
    this.pageLast.removeClass('paginate_button_disabled');
    this.pageNext.removeClass('paginate_button_disabled');
    var num = this.root.find('.paginate_active:first').html();
    if (num == 1 && num == this.pages) {
        this.pageFirst.addClass('paginate_button_disabled');
        this.pagePrev.addClass('paginate_button_disabled');
        this.pageLast.addClass('paginate_button_disabled');
        this.pageNext.addClass('paginate_button_disabled');
    } else if (num == 1) {
        this.pageFirst.addClass('paginate_button_disabled');
        this.pagePrev.addClass('paginate_button_disabled');
    } else if (num == this.pages) {
        this.pageLast.addClass('paginate_button_disabled');
        this.pageNext.addClass('paginate_button_disabled');
    }
};

/**
 * 第一次加载页面时运行
 * 计算页面信息，得出总页数，添加页码项，并显示第一页
 * @param  {[type]} rows  [每页显示行数]
 * @param  {[type]} total [总行数]
 */
paginate.prototype.calPage = function(rows,total) {
    var pages = Math.ceil(total / rows);
    this.pages = pages;
    var len = pages > this.maxPage ? this.maxPage : pages;
    this.setPages(1, len, 1);
};

/**
 * 将页码添加到分页条中
 * @param {[type]} start  [起始页码数]
 * @param {[type]} end    [终止页码数]
 * @param {[type]} active [当前高亮页码数]
 */
paginate.prototype.setPages = function(start,end,active) {
    var domStr = '';
    for (var i = start; i <= end; i++) {
        if (i == active) {
            domStr += '<a class="paginate_active page_num">' + i + '</a>'
        } else {
            domStr += '<a class="paginate_button page_num">' + i + '</a>'
        }
    }
    this.root.find('#pageNums').html(domStr);
};


