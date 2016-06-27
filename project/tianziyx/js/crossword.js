/**
 * 填字游戏页面使用
 */
//----------------------------------------------------------//

// 全局变量

var dataAnswer=["牛","上","左","右"];
var dataItem='{}';

/**
 * 加载问题和答案数据并填充备选答案
 */
function loadData () {
	var ansClass;
	switch(dataAnswer.length){
		case 1:
			ansClass = 'text_one';
			break;
		case 2:
			ansClass = 'text_two';
			break;
		case 3:
			ansClass = 'text_three';
			break;
		case 4:
			ansClass = 'text_four';
			break;
	}
	var li  = $('#ianswer li');
	li.css('display','none');
	li.children().attr('class','').empty();
	for(var i in dataAnswer){
		li.eq(i).css('display','block').attr('class',ansClass).children().attr('class','empty');
	}
}




/**
 * 答题过程
 * 给父窗口添加代理事件
 */
function addWord (e) {
	var target = $(e.target);

	// 获取当前应插入内容的元素，插入内容，添加索引数据，并将empty类删除
	var objs = GL.answers.filter('.empty');
	var obj = objs.eq(0);

	if(objs.length==1){
		// 启用提交按钮
		enableSubmit();
	}
	// 当obj为空，也就是答案填满时，进行操作
	if(obj.length==0 || target.val()==''){
		
		return;
	}
	GL.ply.src="resource/1.wav";
	GL.ply.play();
	obj.html(target.val());
	obj.data('pdx',target.data('idx'));
	obj.removeClass('empty');

	// 当前选中项内容置为空
	target.val('');
}

// 从答案元素中删除文字并填充回备选元素
function removeWord (e) {
	var target = $(e.target);
	if(target.hasClass('empty')){
		return;
	}

	GL.options.eq(target.data('pdx')).val(target.html());

	target.addClass('empty');
	target.empty();
}


/**
 * 提交数据
 * 先判断答案对错
 */
function isRight () {
	for(var i in dataAnswer){
		if(dataAnswer[i]!=GL.ps.eq(i).html()){
			GL.right = false;
			break;
		}
	}
}

/**
 * 答案元素抖动
 * 回答错误时，答案元素抖动
 * 使用CSS3transition和transform-translate属性
 * 利用setTimeout函数，将超时时间和transition的过渡时间一致
 * 使用GL.count和GL.dis来控制抖动的时间和方向，达到规定次数时
 * 清除定时器。
 * @return {[type]} [description]
 */
function shuffle () {
	GL.ps.css('transform','translate('+GL.dis+'px,0)');
	GL.dis = GL.dis>0 ? -5:5;
	GL.count++;
	GL.st = setTimeout('shuffle()',40);
	if(GL.count==10){

		clearTimeout(GL.st);
		GL.count=0;
		GL.ps.css('transform','translate(0,0)');
	}
}

function submitResult () {

	shuffle();
	GL.right=true;
	// loadData();
	disableSubmit();
	
}

// 禁用提交按钮
function disableSubmit () {
	GL.sut.attr('disabled','disabled');
}

// 启用提交按钮
function enableSubmit () {
	GL.sut.removeAttr('disabled');
}


$(function(){

	// 初始化数据
	GL = {};							//全局变量容器对象
	GL.answers = $('#ianswer p');		//所有答案
	GL.options = $('#ioption input');	//所有选项
	GL.right = true;					//答案是否正确
	GL.st = null;						//setTimeout的ID值
	GL.count=0;							//回答错误抖动次数统计
	GL.dis = -5;						//回答错误抖动距离
	GL.ps = $('#ianswer p');			//所有的答案元素
	GL.sut = $('#submit');				//提交按钮
	GL.ply = $('#ply')[0];
	GL.options.each(function(i){
		$(this).data('idx',i);
	});

	$('#submit').click(function(){
		isRight();
		submitResult();
	});

	$('#ioption').delegate('input','click',function(e){
		addWord(e);
	});

	$('#ianswer').delegate('p','click',function(e){
		removeWord(e);
	});
	loadData();
});