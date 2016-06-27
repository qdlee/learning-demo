var eventMethod = {};

var gdList = [],
    sList = [],
    isSearch = false,
    site = '';

function getGoods(url) {
    // jajax.doAjax(url, '', function(data) {
    //     gdList = data.goodslist;
    //     $('.site').html(text);
    //     $('.count').html('('+gdList.length+'件)');
    //     showOnPage(gdList);
    //     isSearch = false;
    // });
    $.ajax(url,{
        dataType:'jsonp',
        jsonpCallback:'jsonp'
    });
}

function jsonp(data) {
    gdList = data.goodslist;
    $('.site').html(site);
    $('.count').html('('+gdList.length+'件)');
    showOnPage(gdList);
    isSearch = false;
}

var showOnPage = (function() {
    var template = $('#tmpGoods').html(),
        cont = $('#contGoods');
    return function(goodsList) {
        temp.fillData(goodsList, template, cont,function(p2,data,rv){
            if(p2==='taobao_id'){
                var tlink = data['deal_taobao_link'];
                rv.val = tlink.slice(tlink.indexOf('?')+4);
            }
        });
    };
})();


function sortGoods(field,asc) {
    gdList.sort(function(a, b) {
        var af = parseFloat(a[field]),
            bf = parseFloat(b[field]);
        return asc ? af - bf : bf - af;
    });
}

eventMethod.doSort = function(e) {
    var target = $(e.target),
        field = target.data('field'),
        asc = target.hasClass('sorting_asc') ? false : true,
        sortList = isSearch ? sList : gdList;
    sortList.sort(function(){
        sortGoods(field,asc);
    });
    if(target.hasClass('sorting')){
        target.removeClass('sorting');
        target.addClass('sorting_asc');
    }else{
        target.toggleClass('sorting_asc');
        target.toggleClass('sorting_desc');
    }
    showOnPage(sortList);
};

eventMethod.search = function(e){
    var txt = $.trim($('#searchText').val());
    if(txt===''){
        showOnPage(gdList);
    }else{
        sList=[];
        gdList.forEach(function(value,key){
            if(value['deal_title'].search(txt) !== -1){
                sList.push(value);
            }
        });
        $('.count').html('('+sList.length+'件)');
        showOnPage(sList);
        isSearch = true;
    }
};


eventMethod.togglePage = function(e){
    var target = $(e.target);
    if(target.html()==='卷皮'){
        getGoods('http://api.juanpi.com/open/juanpi');
        site='卷皮';
    }else if(target.html()==='九块邮'){
        getGoods('http://api.juanpi.com/open/jiukuaiyou');
        site='九块邮';
    }
};

function init() {
    $('#contGoods').on('click','tr',function(e){
        if(e.target.nodeName.toLowerCase()==='input') return;
        e.preventDefault();
        var target = $(e.currentTarget);
        window.open(target.data('link'));
    });
    $('#contGoods').on('mouseover','img',function(e){
        var src = $(e.currentTarget).attr('src');
        $('.img_detail img').attr('src',src);
        $('.img_detail').css('display','block');
    });
    $('#contGoods').on('mouseout','img',function(e){
        $('.img_detail').css('display','none');
    });
    //回车搜索
    $(document).on('keydown',function(e){
      if((e.keyCode || e.which)==13){
        var el = document.activeElement;
        if($(el).hasClass('isearch')){
          $('#isearch')[0].click();
        }
      }
    });
    ebind.regEventMethod(eventMethod);
    ebind.bind();
    site='卷皮';
    getGoods('http://api.juanpi.com/open/juanpi');
}


eventMethod.collectIds = function() {
    var ids = [];
    $(':checkbox:checked').each(function(){
        var id = $(this).parent().prev().html();
        ids.push(id);
    });
    console.log(ids);
}

init();
